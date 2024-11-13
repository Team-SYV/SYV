import { useUser } from "@clerk/clerk-expo";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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

const mockMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! Welcome to your virtual interview session. I’m Savy, your assistant.",
    role: Role.Bot,
  },
  {
    id: "2",
    content: "Hi Savy, thank you for assisting me.",
    role: Role.User,
  },
  {
    id: "3",
    content:
      "You're very welcome! Let’s start with an easy question: Can you tell me about yourself?",
    role: Role.Bot,
  },
  {
    id: "4",
    content:
      "Sure! I am a software engineer with a passion for developing interactive applications.",
    role: Role.User,
  },
  {
    id: "5",
    content: "That's great! What makes you interested in this particular role?",
    role: Role.Bot,
  },
];

const VirtualInterview = () => {
  const { user } = useUser();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

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
        if (duration < 10) {
          alert("Recording must be at least 10 seconds.");
          cameraRef.current.stopRecording();
          setIsRecording(false);
          return;
        }
        console.log(recordedVideo.uri);
        setIsRecording(false);
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
