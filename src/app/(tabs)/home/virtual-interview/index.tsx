import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState, Suspense } from "react";
import uuid from "react-native-uuid";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Message, Role } from "@/types/chat";
import { Camera, CameraView } from "expo-camera";
import { Audio } from "expo-av";
import { LoadingDots } from "@mrakesh0608/react-native-loading-dots";
import NextModal from "@/components/Modal/NextModal";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { Model } from "@/components/Avatar/Model";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
  ImageBackground,
} from "react-native";
import { getQuestions } from "@/api/question";
import { createFeedbackVirtual, generateResponse } from "@/api/feedback";
import { createRatings } from "@/api/ratings";
import { transcribeAudio } from "@/api/transcription";
import { eyeContact } from "@/api/eyeContact";
import { createAnswer } from "@/api/answer";
import { createSpeech } from "@/api/text_to_speech";

const VirtualInterview = () => {
  const { user } = useUser();
  const { interviewId } = useLocalSearchParams();
  const { getToken } = useAuth();

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

  const [isQuestionLoading, setIsQuestionLoading] = useState<boolean>(false);
  const isStartButtonDisabled = isQuestionLoading || answers.length >= 10;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [paceOfSpeech, setPaceOfSpeech] = useState([]);
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
  const exitPage = useRef(false);

  const [speechData, setSpeechData] = useState<{
    audio: string;
    visemes: [
      {
        time: number;
        type: string;
        value: string;
      }
    ];
    length?: number;
  }>({
    audio: "",
    visemes: [
      {
        time: 0,
        type: "",
        value: "",
      },
    ],
    length: 0,
  });

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
        setIsQuestionLoading(true);
        const token = await getToken();
        const response = await getQuestions(interviewId, token);
        const questionIds = response.question_id;

        setQuestionIds(questionIds);
        setQuestions(response.questions);

        if (response.questions.length > 0) {
          const firsQuestionId = uuid.v4() as string;
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: firsQuestionId,
              role: Role.Bot,
              content: "",
              question: true,
            },
          ]);

          const cleanedQuestion = response.questions[0].replace(
            /^\d+\.\s*/,
            ""
          );

          const viseme = await createSpeech(cleanedQuestion, token);
          setSpeechData(viseme);

          setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message.id === firsQuestionId
                ? {
                    ...message,
                    content: response.questions[0],
                    question: false,
                  }
                : message
            )
          );
        }
      } catch (error) {
        console.error("Error", error.message);
      } finally {
        setIsQuestionLoading(false);
      }
    };

    fetchQuestions();
  }, [interviewId]);

  // Triggers feedback generation and stores ratings when 10 eye contact data points are collected.
  useEffect(() => {
    const handleFeedbackRatings = async () => {
      try {
        const token = await getToken({ template: "supabase" });

        const feedbackResponse = await createFeedbackVirtual(
          {
            interview_id: interviewId,
            answers,
            questions,
            pace_of_speech: paceOfSpeech,
            eye_contact: eyeContacts,
          },
          token
        );

        if (feedbackResponse?.ratings_data) {
          await createRatings(
            {
              interview_id: interviewId,
              answer_relevance:
                feedbackResponse.ratings_data.answer_relevance_rating,
              eye_contact: feedbackResponse.ratings_data.eye_contact_rating,
              grammar: feedbackResponse.ratings_data.grammar_rating,
              pace_of_speech:
                feedbackResponse.ratings_data.pace_of_speech_rating,
              filler_words: feedbackResponse.ratings_data.filler_words_rating,
            },
            token
          );
          hasGeneratedFeedback.current = true;
        }
      } catch (error) {
        console.error("Error during feedback creation:", error);
      } finally {
        setTimeout(() => setIsModalVisible(true), 12000);
      }
    };

    // Guard condition to ensure it runs once
    if (eyeContacts.length === 10 && !hasGeneratedFeedback.current) {
      hasGeneratedFeedback.current = true;
      handleFeedbackRatings();
    }
  }, [eyeContacts, answers, paceOfSpeech, questions, interviewId, getToken]);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

    const userMessage = {
      id: uuid.v4() as string,
      role: Role.User,
      content: "",
      loading: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsQuestionLoading(true);

    try {
      const token = await getToken({ template: "supabase" });
      const transcription = await transcribeAudio(audioFile, token);

      if (transcription) {
        setAnswers((prevAnswers) => [...prevAnswers, transcription.transcript]);
        setPaceOfSpeech((prevWpms) => [
          ...prevWpms,
          transcription.words_per_minute,
        ]);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === userMessage.id
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
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  // Handles the feedback for the answer
  const handleAnswerFeedback = async (answer, question) => {
    const newBotMessage = {
      id: uuid.v4() as string,
      role: Role.Bot,
      content: "",
      feedback: true,
    };

    setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    setIsQuestionLoading(true);

    const form = new FormData();
    form.append("previous_question", question);
    form.append("previous_answer", answer);

    try {
      const token = await getToken({ template: "supabase" });
      const feedback = await generateResponse(form, token);
      const viseme = await createSpeech(feedback, token);
      setSpeechData(viseme);

      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === newBotMessage.id
            ? { ...message, content: feedback, feedback: false }
            : message
        )
      );
    } catch (error) {
      console.error("Error generating feedback or speech:", error);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  // Process the eye contact
  const processEyeContact = async (videoUri: string): Promise<void> => {
    const videoFile = {
      uri: videoUri,
      type: "video/mp4",
      name: videoUri.split("/").pop(),
    } as unknown as File;

    const token = await getToken({ template: "supabase" });
    const eyeContactData = await eyeContact(videoFile, token);

    if (eyeContactData) {
      setEyeContacts((prevEyeContacts) => [
        ...prevEyeContacts,
        eyeContactData.eye_contact,
      ]);
    }
  };

  // Submits the current answer for the selected question to the server.
  const handleAnswer = async () => {
    const token = await getToken({ template: "supabase" });

    await createAnswer(
      {
        question_id: questionIds[currentQuestionIndex],
        answer: answers[currentQuestionIndex],
      },
      token
    );
  };

  // Advances to the next question or ends the interview with a thank you message if it's the last question.
  const handleEnd = async () => {
    const isLastMessage = currentQuestionIndex === questions.length - 1;
    const nextQuestionId = uuid.v4() as string;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: nextQuestionId,
        role: Role.Bot,
        content: "",
        question: true,
      },
    ]);

    setIsQuestionLoading(true);

    try {
      if (isLastMessage) {
        const lastMessage =
          "Thank you for your time and participation. This concludes your virtual interview.";

        const token = await getToken({ template: "supabase" });

        const viseme = await createSpeech(lastMessage, token);
        setSpeechData(viseme);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === nextQuestionId
              ? {
                  ...message,
                  content: lastMessage,
                  question: false,
                }
              : message
          )
        );
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        const cleanedQuestion = questions[currentQuestionIndex + 1].replace(
          /^\d+\.\s*/,
          ""
        );
        const token = await getToken({ template: "supabase" });
        const viseme = await createSpeech(cleanedQuestion, token);
        setSpeechData(viseme);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === nextQuestionId
              ? {
                  ...message,
                  content: questions[currentQuestionIndex + 1],
                  question: false,
                }
              : message
          )
        );
      }
    } catch (error) {
      console.error("Error generating speech:", error);
    } finally {
      setIsQuestionLoading(false);
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
      setTimeout(
        () => {
          handleEnd();
        },
        speechData.length != 0 ? speechData.length + 2000 : 0
      );
    } catch (error) {
      console.error("Error handling API flow:", error);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (permissionResponse.status !== "granted") {
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
    setIsLoading(true);
    if (hasGeneratedFeedback.current) {
      setExit(false);
      setIsLoading(false);
      setIsModalVisible(false);
      setSpeechData({
        audio: "",
        visemes: [
          {
            time: 0,
            type: "",
            value: "",
          },
        ],
        length: 0,
      });

      router.push({
        pathname: `/home/virtual-interview/feedback?interviewId=${interviewId}`,
      });
    }
  };

  const handleExitPage = () => {
    exitPage.current = true;
    setQuestions([]);
    setQuestionIds([]);
    setAnswers([]);
    setMessages([]);
    setPaceOfSpeech([]);
    setEyeContacts([]);
    setSpeechData({
      audio: "",
      visemes: [
        {
          time: 0,
          type: "",
          value: "",
        },
      ],
      length: 0,
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

          {item.feedback || item.question ? (
            <View className="flex items-end">
              <LoadingDots
                animation="pulse"
                color="#8c8c8c"
                containerStyle={{
                  marginLeft: 22,
                  marginTop: 8,
                  marginBottom: 40,
                }}
                dots={3}
                size={8}
                spacing={4}
              />
            </View>
          ) : (
            <View className="bg-[#CDF1F8] p-4 rounded-lg max-w-[315px] border border-[#ADE3ED]">
              <Text className="text-sm">{item.content}</Text>
            </View>
          )}
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
                  marginTop: 8,
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

      <ImageBackground
        source={require("@/assets/images/background.png")}
        className="w-[96%] h-56 rounded-xl mx-auto my-2 overflow-hidden"
      >
        <Suspense fallback={null}>
          <View className="absolute bottom-0 right-0 left-0 top-0">
            <Canvas
              gl={{ localClippingEnabled: true }}
              onCreated={(state) => {
                const _gl = state.gl.getContext();
                const pixelStorei = _gl.pixelStorei.bind(_gl);
                _gl.pixelStorei = function (...args) {
                  const [parameter] = args;
                  switch (parameter) {
                    case _gl.UNPACK_FLIP_Y_WEBGL:
                      return pixelStorei(...args);
                  }
                };
              }}
            >
              <PerspectiveCamera makeDefault position={[0, 0.8, 4]} fov={50} />
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} />
              <Model
                audio={exitPage.current ? "" : speechData.audio}
                visemes={speechData.visemes}
              />
            </Canvas>
          </View>
        </Suspense>
      </ImageBackground>

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
              className={`w-14 h-14 rounded-full ${
                isStartButtonDisabled ? "opacity-40" : ""
              }`}
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
          handleExitPage();
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
