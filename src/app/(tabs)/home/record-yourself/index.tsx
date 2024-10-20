import React, { useEffect, useState, useRef } from "react";
import { Camera, CameraView } from "expo-camera";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  BackHandler,
} from "react-native";
import NextModal from "@/components/Modal/NextModal";

const Record: React.FC = () => {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState(60);
  const [recordedVideos, setRecordedVideos] = useState<string[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsRecorded, setAllQuestionsRecorded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const [questions, setQuestions] = useState<string[]>([]);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<
    boolean | null
  >(null);

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

        if (videoDuration < 10) {
          Alert.alert(
            "Recording Too Short",
            "Please record for at least 10 seconds."
          );
        } else {
          setRecordedVideos((prev) => [...prev, recordedVideo.uri]);
          setIsModalVisible(true);
        }
      } catch (error) {
        console.error("Error recording video:", error);
      } finally {
        setIsRecording(false);
      }
    } else {
      console.error("Camera reference is null or undefined.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  // Going to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsModalVisible(false);
    } else {
      setAllQuestionsRecorded(true);
      setIsModalVisible(false);
      console.log("Recorded-videos:", recordedVideos);
    }
  };

  // Format for countdown timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Sample function to show the recorded videos
  const renderVideoItem = ({ item }: { item: string }) => (
    <View className="pb-6">
      <Video
        source={{ uri: item }}
        style={styles.video}
        useNativeControls
        isLooping={false}
        resizeMode={ResizeMode.CONTAIN}
      />
    </View>
  );

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
      {allQuestionsRecorded ? (
        <FlatList
          data={recordedVideos}
          keyExtractor={(item) => item}
          renderItem={renderVideoItem}
          className="p-4"
        />
      ) : (
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

            <TouchableOpacity
              onPress={isRecording ? stopRecording : recordVideo}
            >
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
      )}

      <NextModal
        isVisible={isModalVisible}
        onNext={handleNext}
        onClose={() => setIsModalVisible(false)}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
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
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default Record;

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: 680,
  },
});
