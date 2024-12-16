import React, { useEffect, useState, useRef } from "react";
import { Camera, CameraView } from "expo-camera";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from "react-native";
import NextModal from "@/components/Modal/NextModal";
import { useAuth } from "@clerk/clerk-expo";
import { getQuestions } from "@/api/question";
import { createRatings } from "@/api/ratings";
import { transcribeVideo } from "@/api/transcription";
import { createAnswer } from "@/api/answer";
import { createFeedbackRecord } from "@/api/feedback";

const RecordYourself: React.FC = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const { interviewId } = useLocalSearchParams();

  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState(60);
  const [recordedVideos, setRecordedVideos] = useState<string[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsRecorded, setAllQuestionsRecorded] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIds, setQuestionIds] = useState<string[]>([]);

  const [feedbackRatings, setFeedbackRatings] = useState<any[]>([]);
  const hasFetchedQuestions = useRef(false);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<
    boolean | null
  >(null);

  // Requests camera and microphone permissions when the component loads.
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
    })();
  }, []);

  // Retrieves interview questions from an API
  useEffect(() => {
    const fetchQuestions = async () => {
      if (hasFetchedQuestions.current) return;
      hasFetchedQuestions.current = true;
      try {
        const token = await getToken({template:"supabase"});
        setIsLoading(true);
        const fetchedQuestions = await getQuestions(interviewId, token);

        setQuestions(fetchedQuestions.questions);
        setQuestionIds(fetchedQuestions.question_id);
      } catch (error) {
        console.error("Error", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [interviewId]);

  // A countdown timer that decreases every second if recoding is active.
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording && recordingTime > 0) {
      timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timer);
      if (!isRecording) {
        setRecordingTime(60);
      }
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Handles the android back button
  useEffect(() => {
    const backAction = () => {
      if (!allQuestionsRecorded) {
        setIsConfirmationVisible(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [allQuestionsRecorded]);

  useEffect(() => {
    const handleFeedbackAndRatings = async () => {
      if (feedbackRatings.length > 0) {
        if (feedbackRatings.length === 5) {
          const averageRatings = calculateAverageRatings();
          const token = await getToken({template:"supabase"});

          await createRatings(
            {
              interview_id: interviewId,
              answer_relevance: averageRatings.answer_relevance_rating,
              eye_contact: averageRatings.eye_contact_rating,
              grammar: averageRatings.grammar_rating,
              pace_of_speech: averageRatings.pace_of_speech_rating,
              filler_words: averageRatings.filler_words_rating,
            },
            token
          );
          setAllQuestionsRecorded(true);
          setIsModalVisible(false);
          setIsLoading(false);

          handleNextPage();
        }
      }
    };

    handleFeedbackAndRatings();
  }, [feedbackRatings]);

  // Check if permission has been granted
  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return null;
  } else if (!hasCameraPermission) {
    return (
      <Text className="text-center">Permission for camera not granted.</Text>
    );
  } else if (!hasMicrophonePermission) {
    return (
      <Text className="text-center">
        Permission for microphone not granted.
      </Text>
    );
  }
  // Record a video
  const recordVideo = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      setRecordingTime(60);
      const startTime = Date.now();

      try {
        const recordedVideo = await cameraRef.current.recordAsync();
        const endTime = Date.now();
        const videoDuration = (endTime - startTime) / 1000;

        if (videoDuration < 5) {
          Alert.alert(
            "Recording Too Short",
            "Please record for at least 5 seconds."
          );
        } else {
          setRecordedVideos((prev) => [...prev, recordedVideo.uri]);
          setIsModalVisible(true);
          await handleVideoAnswerFeedback(
            recordedVideo.uri,
            currentQuestionIndex
          );
        }
      } catch (error) {
        console.error("Error recording video:", error);
      }
    } else {
      console.error("Camera reference is null or undefined.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    setTimeout(() => {
      if (cameraRef.current) {
        cameraRef.current.stopRecording();
        setIsRecording(false);
      }
    }, 500);
  };

  // Handle the process of transcribing video, saving answers, and generating feedback
  const handleVideoAnswerFeedback = async (videoUri: string, index: number) => {
    try {
      const videoFile = {
        uri: videoUri,
        type: "video/mp4",
        name: videoUri.split("/").pop(),
      } as unknown as File;

      const token = await getToken({template:"supabase"});

      const transcription = await transcribeVideo(videoFile);

      if (transcription?.transcription) {
        const answerResponse = await createAnswer(
          {
            question_id: questionIds[index],
            answer: transcription.transcription,
          },
          token
        );

        if (answerResponse?.answer_id) {
          const feedbackResponse = await createFeedbackRecord(
            {
              answer_id: answerResponse.answer_id,
              interview_id: interviewId,
              answer: transcription.transcription,
              question: questions[index],
              pace_of_speech: transcription.wpm.toString(),
              eye_contact: transcription.eye_contact.toString(),
            },
            token
          );

          if (feedbackResponse?.ratings_data) {
            setFeedbackRatings((prevRatings) => [
              ...prevRatings,
              feedbackResponse.ratings_data,
            ]);
          }
        }
      } else {
        console.error("Transcription failed.");
      }
    } catch (error) {
      console.error("Error during API call:", error.message || error);
    }
  };

  // Calculates the average ratings for each feedback
  const calculateAverageRatings = () => {
    const totals = feedbackRatings.reduce(
      (acc, rating) => {
        acc.grammar_rating += parseInt(rating.grammar_rating) || 0;
        acc.answer_relevance_rating +=
          parseInt(rating.answer_relevance_rating) || 0;
        acc.filler_words_rating += parseInt(rating.filler_words_rating) || 0;
        acc.pace_of_speech_rating +=
          parseInt(rating.pace_of_speech_rating) || 0;
        acc.eye_contact_rating += parseInt(rating.eye_contact_rating) || 0;
        return acc;
      },
      {
        grammar_rating: 0,
        answer_relevance_rating: 0,
        filler_words_rating: 0,
        pace_of_speech_rating: 0,
        eye_contact_rating: 0,
      }
    );

    const averages = {
      grammar_rating: totals.grammar_rating / feedbackRatings.length,
      answer_relevance_rating:
        totals.answer_relevance_rating / feedbackRatings.length,
      filler_words_rating: totals.filler_words_rating / feedbackRatings.length,
      pace_of_speech_rating:
        totals.pace_of_speech_rating / feedbackRatings.length,
      eye_contact_rating: totals.eye_contact_rating / feedbackRatings.length,
    };

    return averages;
  };

  const handleNextPage = () => {
    router.push({
      pathname: `/home/record-yourself/feedback`,
      params: {
        videoURIs: encodeURIComponent(JSON.stringify(recordedVideos)),
        interviewId: interviewId,
      },
    });
  };

  // Going to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsModalVisible(false);
    } else {
      setIsLoading(true);
    }
  };

  // Format for countdown timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <View className="flex-1 justify-center">
      <Stack.Screen
        options={{
          headerShown: allQuestionsRecorded,
          headerStyle: {
            backgroundColor: "white",
          },
          headerLeft: () =>
            allQuestionsRecorded && (
              <TouchableOpacity onPress={() => router.push("/home")}>
                <AntDesign name="arrowleft" size={24} color="#2a2a2a" />
              </TouchableOpacity>
            ),
        }}
      />
      <CameraView
        mode="video"
        style={styles.camera}
        facing="front"
        ref={cameraRef}
      >
        <View className="absolute top-14 right-4 items-center mx-2">
          <TouchableOpacity onPress={() => setIsConfirmationVisible(true)}>
            <AntDesign
              name="closecircle"
              size={33}
              color="#A92703"
              className="bg-white rounded-full"
            />
          </TouchableOpacity>
        </View>

        <View className="absolute bottom-10 left-0 right-0 items-center mx-2">
          <Text
            className={`text-center mb-4 px-4 py-4 rounded-xl ${
              isRecording
                ? "text-red-600 font-medium text-2xl"
                : "bg-black/80 text-white text-base font-light"
            }`}
          >
            {isRecording
              ? formatTime(recordingTime)
              : ` ${questions[currentQuestionIndex] || ""}`}
          </Text>

          <TouchableOpacity onPress={isRecording ? stopRecording : recordVideo}>
            <Image
              source={
                isRecording
                  ? require("@/assets/icons/stop.png")
                  : require("@/assets/icons/record.png")
              }
              className="w-24 h-24"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </CameraView>

      <NextModal
        isVisible={isModalVisible}
        onNext={handleNext}
        onClose={() => setIsModalVisible(false)}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isVisible={isConfirmationVisible}
        title="Discard Recording?"
        message={
          <Text>
            Exiting now will discard your progress.{"\n"}
            Are you sure you want to leave?
          </Text>
        }
        onConfirm={() => {
          setIsConfirmationVisible(false);
          setAllQuestionsRecorded(true);
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default RecordYourself;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
