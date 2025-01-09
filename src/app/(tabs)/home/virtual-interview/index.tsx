import { useAuth, useUser } from "@clerk/clerk-expo";
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
  StatusBar,
} from "react-native";
import { getQuestions } from "@/api/question";
import { createFeedback, generateResponse } from "@/api/feedback";
import { createRatings } from "@/api/ratings";
import { transcribeAudio } from "@/api/transcription";
import { eyeContact } from "@/api/eyeContact";
import { createAnswer } from "@/api/answer";
import { createSpeech } from "@/api/text_to_speech";
import { SpeechData } from "@/types/speechData";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";

const VirtualInterview = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { interviewId } = useLocalSearchParams();

  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [exit, setExit] = useState(true);

  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [questionIds, setQuestionIds] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answerIds, setAnswerIds] = useState([]);
  const [recordedVideos, setRecordedVideos] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isQuestionLoading, setIsQuestionLoading] = useState<boolean>(false);
  const isStartButtonDisabled = useRef(isQuestionLoading || answers.length >= 6);

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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasFetchedQuestions = useRef(false);
  const hasGeneratedFeedback = useRef(false);
  const exitPage = useRef(false);
  const isSatisfied = useRef(false);
  const isFinished = useRef(false);

  const counter = useRef(0);

  const defaultSpeechData = (): SpeechData => ({
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

  const [speechData, setSpeechData] = useState<SpeechData>(defaultSpeechData);

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
        for (let i = 0; i < 5; i++) {
          const token = await getToken({ template: "supabase" });

          const feedbackResponse = await createFeedback(
            {
              interview_id: interviewId,
              answer: answers[i],
              question: questions[i],
              pace_of_speech: paceOfSpeech[i],
              eye_contact: eyeContacts[i],
              answer_id: answerIds[i],
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
        }
      } catch (error) {
        console.error("Error during feedback creation:", error);
      } finally {
        setTimeout(() => setIsModalVisible(true), 8000);
      }
    };
    if (
      answers.length === answerIds.length &&
      answerIds.length === 5 &&
      !hasGeneratedFeedback.current &&
      isFinished.current &&
      eyeContacts.length >= 5
    ) {
      hasGeneratedFeedback.current = true;
      setIsLastQuestion(true);
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
  const handleAnswer = async (audioUri: string): Promise<void> => {
    const audioFile = {
      uri: audioUri,
      name: "recording.mp3",
      type: "audio/mp3",
    } as unknown as File;

    const userMessageId = uuid.v4();
    const userMessage = {
      id: userMessageId,
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
        const response = await createAnswer(
          {
            question_id: questionIds[currentQuestionIndex],
            answer: transcription.transcript,
          },
          token
        );

        if (counter.current === 0) {
          setAnswers((prevAnswers) => [
            ...prevAnswers,
            transcription.transcript,
          ]);
          setAnswerIds((prevAnswerIds) => [
            ...prevAnswerIds,
            response.answer_id,
          ]);
          setPaceOfSpeech((prevWpms) => [
            ...prevWpms,
            transcription.words_per_minute,
          ]);
        }

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === userMessageId
              ? {
                  ...message,
                  content: transcription.transcript,
                  loading: false,
                }
              : message
          )
        );

        // Pass the transcription and current question to handle feedback
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
    const feedbackMessageId = uuid.v4();
    const feedbackMessage = {
      id: feedbackMessageId,
      role: Role.Bot,
      content: "",
      feedback: true,
    };

    setMessages((prevMessages) => [...prevMessages, feedbackMessage]);
    setIsQuestionLoading(true);

    const form = new FormData();
    form.append("previous_question", question);
    form.append("previous_answer", answer);
    form.append("next_question", questions[currentQuestionIndex + 1]);

    try {
      const token = await getToken({ template: "supabase" });

      // Handle feedback generation
      if (counter.current === 2 && currentQuestionIndex < 5) {
        isSatisfied.current = true;
        form.append("type", "1");
        const feedback = await generateResponse(form, token);
        const cleanedQuestion = feedback.replace(/^\d+\.\s*/, "");
        const viseme = await createSpeech(
          `${cleanedQuestion}                     ${questions[
            currentQuestionIndex + 1
          ].replace(/^\d+\.\s*/, "")}`,
          token
        );
        setSpeechData(viseme);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === feedbackMessageId
              ? { ...message, content: cleanedQuestion, feedback: false }
              : message
          )
        );
      } else if (!isSatisfied.current) {
        counter.current++;
        form.append("type", "0");
        const feedback = await generateResponse(form, token);
        const cleanedQuestion = feedback.replace(/^\d+\.\s*/, "");
        const viseme = await createSpeech(cleanedQuestion, token);
        setSpeechData(viseme);

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === feedbackMessageId
              ? { ...message, content: cleanedQuestion, feedback: false }
              : message
          )
        );
      }

      // Handle next question
      if (isSatisfied.current && counter.current === 2) {
        counter.current = 0;
        isSatisfied.current = false;

        setCurrentQuestionIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          handleNextQuestion(nextIndex, token);
          return nextIndex;
        });
      }
    } catch (error) {
      console.error("Error generating feedback or speech:", error);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const handleNextQuestion = async (nextIndex: number, token: string) => {
    if (nextIndex < 6) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid.v4(),
          role: Role.Bot,
          content: questions[nextIndex],
          feedback: false,
        },
      ]);
    } else if (nextIndex === 5) {
      const lastMessage =
        "Thank you for your time and participation. This concludes your virtual interview.";
      const viseme = await createSpeech(lastMessage, token);
      setSpeechData(viseme);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid.v4(),
          role: Role.Bot,
          content: lastMessage,
          feedback: false,
        },
      ]);
      isFinished.current = true;
      isStartButtonDisabled.current = true;
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
        isFinished.current = true;
        isStartButtonDisabled.current = true;

      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
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
      if (counter.current === 0) {
        processEyeContact(videoUri);
      }

      await handleAnswer(audioUri);

      if (isSatisfied.current === true) {
        await handleEnd();
      }
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
      setSpeechData(defaultSpeechData);
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
        if (counter.current === 0) {
          setRecordedVideos((prevVideos) => [...prevVideos, recordedVideo.uri]);
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
      setSpeechData(defaultSpeechData);

      router.push({
        pathname: `/home/virtual-interview/feedback`,
        params: {
          videoURIs: encodeURIComponent(JSON.stringify(recordedVideos)),
          interviewId: interviewId,
        },
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
    setSpeechData(defaultSpeechData);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <View className="flex-1 justify-between bg-white">
      <StatusBar hidden={true} />
      <Stack.Screen
        options={{
          headerShown: !isFullscreen,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBackButtonPress}>
              <Ionicons name="arrow-back" size={24} color="#2a2a2a" />
            </TouchableOpacity>
          ),
        }}
      />

      <ImageBackground
        source={require("@/assets/images/background.png")}
        className={`${
          isFullscreen
            ? "w-[100%] h-[100%] absolute top-0 left-0 z-10"
            : "w-[96%] h-56 rounded-xl my-2"
        } mx-auto overflow-hidden`}
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
              <PerspectiveCamera
                makeDefault
                position={[0, 0.8, 4]}
                fov={isFullscreen ? 73 : 50}
              />
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} />
              <Model
                audio={exitPage.current ? "" : speechData.audio}
                visemes={speechData.visemes}
                setIsQuestionLoading={setIsQuestionLoading}
              />
            </Canvas>
          </View>
        </Suspense>

        {isFullscreen && (
          <View className="absolute top-5 right-2 rounded-full bg-white">
            <TouchableOpacity onPress={toggleFullscreen} activeOpacity={0.8}>
              <AntDesign
                name="closecircle"
                size={38}
                color="#A92703"
                className="bg-white rounded-full"
              />
            </TouchableOpacity>
          </View>
        )}

        {!isFullscreen && (
          <View className="absolute bottom-3 right-3">
            <TouchableOpacity onPress={toggleFullscreen}>
              <MaterialIcons name="fullscreen" size={28} color="#4B4B4B" />
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>

      {!isFullscreen && (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
        />
      )}

      <View
        className={`flex-row p-2 justify-center z-20 ${
          !isFullscreen
            ? "shadow-md border-gray-300 border bg-white"
            : "absolute bottom-3 left-0 right-0 mx-auto"
        }`}
      >
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
            disabled={isStartButtonDisabled.current}
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
        isLastQuestion={isLastQuestion}
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
