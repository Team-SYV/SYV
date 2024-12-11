import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Message, Role } from "@/types/chat";
import { Camera, CameraView } from "expo-camera";
import { Audio } from "expo-av";
import { LoadingDots } from "@mrakesh0608/react-native-loading-dots";
import NextModal from "@/components/Modal/NextModal";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
} from "react-native";
import {
  createAnswer,
  createRatings,
  eyeContact,
  generateAnswerFeedback,
  generateVirtualFeedback,
  getQuestions,
  transcribeAudio,
} from "@/api";

const VirtualInterview = () => {
  const { user } = useUser();
  const { interviewId } = useLocalSearchParams();
  const {getToken} = useAuth();

  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exit, setExit] = useState(true);

  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);
  const [answers, setAnswers] = useState([]);
  const isStartButtonDisabled = answers.length >= 10;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wpms, setWpms] = useState([]);
  const [eyeContacts, setEyeContacts] = useState([]);

  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<
    boolean | null
  >(null);

  const hasFetchedQuestions = useRef(false);
  const hasGeneratedFeedback = useRef(false);

  // Requests camera and microphone permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Audio recording permission is required.");
        return;
      }

      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();

      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMicrophonePermission(microphonePermission.status === "granted");
    })();
  }, []);

  // Fetches interview questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (hasFetchedQuestions.current) return;
      hasFetchedQuestions.current = true;

      try {
        const token = await getToken();
        const response = await getQuestions(interviewId, token);
        const questionIds = response.question_id;
        const questions = response.questions.map(
          (question: string, index: number) => `${index + 1}. ${question}`
        );
        setQuestionIds(questionIds);
        setQuestions(questions);

        if (questions.length > 0) {
          // Adds the first question as a bot message if questions are available.
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: uuid.v4() as string,
              role: Role.Bot,
              content: questions[0],
            },
          ]);
        }
      } catch (error) {
        console.error("Error", error.message);
      }
    };
    fetchQuestions();
  }, [interviewId]);

  // Triggers feedback generation and stores ratings when 10 eye contact data points are collected.
  useEffect(() => {
    if (eyeContacts.length === 10 && !hasGeneratedFeedback.current) {
      const handleFeedbackRatings = async () => {
        try {
          const token = await getToken();

          const feedbackResponse = await generateVirtualFeedback({
            interview_id: interviewId,
            answers,
            questions,
            wpm: wpms,
            eye_contact: eyeContacts,
          }, token);

          if (feedbackResponse.ratings_data) {
            await createRatings({
              interview_id: interviewId,
              answer_relevance:
                feedbackResponse.ratings_data.answer_relevance_rating,
              eye_contact: feedbackResponse.ratings_data.eye_contact_rating,
              grammar: feedbackResponse.ratings_data.grammar_rating,
              pace_of_speech:
                feedbackResponse.ratings_data.pace_of_speech_rating,
              filler_words: feedbackResponse.ratings_data.filler_words_rating,
            }, token);
            hasGeneratedFeedback.current = true;
          }
        } catch (error) {
          console.error("Error during feedback creation:", error);
        }
      };
      handleFeedbackRatings();

      setTimeout(() => {
        setIsModalVisible(true);
      }, 12000);
    }
  });

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Automatically read the bot's message when it gets added to the chat
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === Role.Bot) {
      speak(lastMessage.content);
    }
  }, [messages]);

  // Speaks a message after removing numeric prefixes.
  const speak = (message: string) => {
    const sanitizedMessage = message.replace(/^\d+\.\s*/, "");
    Speech.speak(sanitizedMessage, {
      rate: 1.0,
    });
  };

  // Handle hardware back button press
  const handleBackButtonPress = () => {
    if (exit) {
      setIsConfirmationVisible(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonPress
    );

    return () => {
      backHandler.remove();
    };
  }, [isConfirmationVisible, exit]);

  // Check if permission has been granted
  useEffect(() => {
    (async () => {
      if (!permissionResponse?.granted) {
        await requestPermission();
      }
    })();
  }, [permissionResponse]);

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

  // Processes audio transcription, updates answers, WPM, messages, and triggers feedback for the current question.
  const handleTranscription = async (audioUri: string): Promise<void> => {
    const audioFile = {
      uri: audioUri,
      name: "recording.mp3",
      type: "audio/mp3",
    } as unknown as File;

    // Add the new message with loading flag
    const newMessage = {
      id: uuid.v4() as string,
      role: Role.User,
      content: "",
      loading: true,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    const transcription = await transcribeAudio(audioFile);

    if (transcription) {
      setAnswers((prevAnswers) => [...prevAnswers, transcription.transcript]);
      setWpms((prevWpms) => [...prevWpms, transcription.words_per_minute]);
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === newMessage.id
            ? {
                ...message,
                content: transcription.transcript,
                loading: false,
              }
            : message
        )
      );

      await handleAnswerFeedback(
        transcription.transcript,
        questions[currentQuestionIndex]
      );
    }
  };

  // Handles the feedback for the answer
  const handleAnswerFeedback = async (answer, question) => {
    const form = new FormData();
    form.append("previous_question", question);
    form.append("previous_answer", answer);

    const feedback = await generateAnswerFeedback(form);

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: uuid.v4() as string, role: Role.Bot, content: feedback },
    ]);
  };

  // Process the eye contact
  const processEyeContact = async (videoUri: string): Promise<void> => {
    const videoFile = {
      uri: videoUri,
      type: "video/mp4",
      name: videoUri.split("/").pop(),
    } as unknown as File;

    const eyeContactData = await eyeContact(videoFile);

    if (eyeContactData) {
      setEyeContacts((prevEyeContacts) => [
        ...prevEyeContacts,
        eyeContactData.eye_contact,
      ]);
    }
  };

  // Submits the current answer for the selected question to the server.
  const handleAnswer = async () => {
    const token = await getToken();

    await createAnswer({
      question_id: questionIds[currentQuestionIndex],
      answer: answers[currentQuestionIndex],
    }, token);
  };

  // Advances to the next question or ends the interview with a thank you message if it's the last question.
  const handleEnd = async () => {
    const isLastMessage = currentQuestionIndex === questions.length - 1;

    if (isLastMessage) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid.v4() as string,
          role: Role.Bot,
          content:
            "Thank you for your time and participation. This concludes your virtual interview.",
        },
      ]);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid.v4() as string,
          role: Role.Bot,
          content: questions[currentQuestionIndex + 1],
        },
      ]);
    }
  };

  // Manages transcription, answer submission, eye contact, and ends the interview.
  const handleAPI = async (videoUri: string, audioUri: string) => {
    try {
      await handleTranscription(audioUri);

      if (answers.length === currentQuestionIndex + 1) {
        await handleAnswer();
      }
      processEyeContact(videoUri);
      await handleEnd();
    } catch (error) {
      console.error("Error handling API flow:", error);
    }
  };

  // Start recording
  const startRecording = async () => {
    Speech.stop();

    if (permissionResponse.status !== "granted") {
      console.log("Requesting permission...");
      await requestPermission();
    }

    if (!hasMicrophonePermission) {
      alert("Microphone permission is required.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      if (cameraRef.current && hasCameraPermission) {
        setIsRecording(true);

        const startTime = Date.now();
        const recordedVideo = await cameraRef.current.recordAsync();
        const duration = (Date.now() - startTime) / 1000;

        if (duration < 3) {
          Alert.alert(
            "Recording Too Short",
            "Please record for at least 3 seconds."
          );
          await recording.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          return;
        }

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri) {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          handleAPI(recordedVideo.uri, uri);
        } else {
          console.error("No valid audio URI found.");
        }
      }
    } catch (err) {
      console.error("Failed to start recording:", err);
    } finally {
      setIsRecording(false);
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

  // Navigates to the feedback page
  const handleNext = () => {
    if (hasGeneratedFeedback.current) {
      Speech.stop();
      setExit(false);
      setIsLoading(false);
      setIsModalVisible(false);

      router.push({
        pathname: `/home/virtual-interview/feedback?interviewId=${interviewId}`,
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`flex-row my-2 mx-4 ${
        item.role === Role.Bot ? "justify-start" : "justify-end"
      }`}
    >
      {item.role === Role.Bot && (
        <View className="flex items-start">
          <View className="flex-row items-center mb-1">
            <Image
              source={require("@/assets/images/savy.png")}
              className="w-5 h-5 rounded-full mr-1"
            />
            <Text className="text-sm"> Savy </Text>
          </View>
          <View className="bg-[#CDF1F8] p-4 rounded-lg max-w-[315px] border border-[#ADE3ED]">
            <Text className="text-sm">{item.content}</Text>
          </View>
        </View>
      )}

      {item.role === Role.User && (
        <View className="flex items-end">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm"> {user.firstName} </Text>
            <Image
              source={{
                uri: user.imageUrl || "https://via.placeholder.com/150",
              }}
              className="w-5 h-5 rounded-full ml-2"
            />
          </View>

          {item.loading ? (
            <View className="flex items-end">
              <LoadingDots
                animation="pulse"
                color="#8c8c8c"
                containerStyle={{
                  marginRight: 25,
                  marginTop: 12,
                  marginBottom: 40,
                }}
                dots={3}
                size={8}
                spacing={4}
              />
            </View>
          ) : (
            <View className="bg-[#efefef] p-4 rounded-lg max-w-[315px] border border-[#DDD]">
              <Text className="text-sm">{item.content}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 justify-between bg-white">
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackButtonPress}>
              <Ionicons name="arrow-back" size={24} color="#2a2a2a" />
            </TouchableOpacity>
          ),
        }}
      />
      <Image
        source={require("@/assets/images/avatar.png")}
        className="w-[96%] h-56 rounded-xl mx-auto mt-1 mb-2"
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
      />

      <View className="flex-row p-2 bg-white shadow-md justify-center border-gray-300 border">
        {isRecording ? (
          <TouchableOpacity className="p-3" onPress={stopRecording}>
            <Image
              source={require("@/assets/icons/stop-mic.png")}
              className="w-14 h-14 rounded-full"
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="p-3"
            onPress={startRecording}
            disabled={isStartButtonDisabled}
          >
            <Image
              source={require("@/assets/icons/mic.png")}
              className="w-14 h-14 rounded-full"
            />
          </TouchableOpacity>
        )}
      </View>

      <CameraView
        mode="video"
        style={{ display: "none" }}
        facing="front"
        ref={cameraRef}
      />
      <NextModal
        isVisible={isModalVisible}
        onNext={handleNext}
        onClose={() => setIsModalVisible(false)}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
        isLoading={isLoading}
      />
      <ConfirmationModal
        isVisible={isConfirmationVisible}
        title="Discard Interview?"
        message={
          <Text>
            Exiting now will discard your progress.{"\n"}
            Are you sure you want to leave?
          </Text>
        }
        onConfirm={() => {
          Speech.stop();
          setIsConfirmationVisible(false);
          setExit(false);
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default VirtualInterview;
