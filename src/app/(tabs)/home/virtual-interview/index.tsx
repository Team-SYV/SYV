import { useUser } from "@clerk/clerk-expo";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Message, Role } from "@/types/chat";
import { Camera, CameraView } from "expo-camera";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import {
  createAnswer,
  createRatings,
  eyeContact,
  generateAnswerFeedback,
  generateVirtualFeedback,
  getQuestions,
  transcribeVideo,
  virtualTranscribeVideo,
} from "@/api";
import NextModal from "@/components/Modal/NextModal";

const VirtualInterview = () => {
  const { user } = useUser();
  const { interviewId } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [wpms, setWpms] = useState([]);
  const [eyeContacts, setEyeContacts] = useState([]);

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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestions(interviewId);
        const questions = response.questions;
        const questionIds = response.question_id;
        setQuestions(questions);
        setQuestionIds(questionIds);

        if (questions.length > 0) {
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

  const speak = (message: string) => {
    Speech.speak(message, {
      rate: 1.0,
    });
  };

  // Handle hardware back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBackButtonPress();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

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

  const handleTranscription = async (videoUri: string): Promise<void> => {
    const videoFile = {
      uri: videoUri,
      type: "video/mp4",
      name: videoUri.split("/").pop(),
    } as unknown as File;

    const transcription = await virtualTranscribeVideo(videoFile);

    if (transcription) {
      const updatedAnswers = [...answers, transcription.transcription];
      const updatedWpms = [...wpms, transcription.wpm];

      setAnswers(updatedAnswers);
      setWpms(updatedWpms);
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: uuid.v4() as string,
        role: Role.User,
        content: transcription.transcription,
      },
    ]);
  };

  const handleAnswerFeedback = async () => {
    const form = new FormData();
    form.append("previous_question", questions[currentQuestionIndex]);
    form.append("previous_answer", answers[currentQuestionIndex]);

    const feedback = await generateAnswerFeedback(form);

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: uuid.v4() as string, role: Role.Bot, content: feedback },
    ]);
  };

  const processEyeContact = async (videoUri: string): Promise<void> => {
    const videoFile = {
      uri: videoUri,
      type: "video/mp4",
      name: videoUri.split("/").pop(),
    } as unknown as File;

    const eye_contact = await eyeContact(videoFile);
    if (eyeContact) {
      const updatedEyeContacts = [...eyeContacts, eye_contact.eye_contact];
      setEyeContacts(updatedEyeContacts);
    }
  };

  const handleAnswer = async () => {
    await createAnswer({
      question_id: questionIds[currentQuestionIndex],
      answer: answers[currentQuestionIndex],
    });
  };

  const handleEnd = async () => {
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    if (isLastQuestion) {
      if (
        answers.length === questions.length &&
        wpms.length === questions.length &&
        eyeContacts.length === questions.length
      ) {
        const feedbackResponse = await generateVirtualFeedback({
          interview_id: interviewId,
          answers: answers,
          questions,
          wpm: wpms,
          eye_contact: eyeContacts,
        });

        if (feedbackResponse && feedbackResponse.ratings_data) {
          console.log(feedbackResponse.ratings_data);
          await createRatings({
            interview_id: interviewId,
            answer_relevance:
              feedbackResponse.ratings_data.answer_relevance_rating,
            eye_contact: feedbackResponse.ratings_data.eye_contact_rating,
            grammar: feedbackResponse.ratings_data.grammar_rating,
            pace_of_speech: feedbackResponse.ratings_data.pace_of_speech_rating,
            filler_words: feedbackResponse.ratings_data.filler_words_rating,
          });
        }

        setIsModalVisible(true); // Trigger the modal to navigate to feedback
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid.v4() as string,
          role: Role.Bot,
          content: "Thank you! This concludes your virtual interview.",
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

  const handleAPI = async (videoUri: string) => {
    try {
      processEyeContact(videoUri);

      await handleTranscription(videoUri);

      await handleAnswerFeedback();
      if (answers.length === currentQuestionIndex + 1) {
        await handleAnswer();
      }

      handleEnd();
    } catch (error) {
      console.error("Error handling API flow:", error.error);
    }
  };
  // Start recording
  const startRecording = async () => {
    Speech.stop();
    if (cameraRef.current && hasCameraPermission && hasMicrophonePermission) {
      try {
        setIsRecording(true);

        const startTime = Date.now();
        const recordedVideo = await cameraRef.current.recordAsync();

        const duration = (Date.now() - startTime) / 1000;

        // Check if the recording is less than 10 seconds
        if (duration < 1) {
          alert("Recording must be at least 10 seconds.");
          cameraRef.current.stopRecording();
          setIsRecording(false);
          return;
        } else {
          handleAPI(recordedVideo.uri);
          setIsRecording(false);
        }
      } catch (err) {
        console.error("Failed to start recording:", err);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleNext = async () => {
    setIsLoading(false);
    setIsModalVisible(false);
    router.push({
      pathname: `/home/virtual-interview/feedback?interviewId=${interviewId}`,
    });
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
          <View className="bg-[#efefef] p-4 rounded-lg max-w-[315px] border border-[#e9e9e9]">
            <Text className="text-sm">{item.content}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const handleBackButtonPress = () => {
    setIsConfirmationVisible(true);
  };

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
          <TouchableOpacity className="p-3" onPress={startRecording}>
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
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default VirtualInterview;
