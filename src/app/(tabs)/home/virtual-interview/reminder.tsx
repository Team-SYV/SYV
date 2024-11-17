import CustomButton from "@/components/Button/CustomButton";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Spinner from "react-native-loading-spinner-overlay";
import { useRouter } from "expo-router"; // Import useRouter

const Reminder = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Initialize router

  const screenHeight = Dimensions.get("window").height;
  const cameraHeight = screenHeight / 2;

  // Ask for permission when component mounts
  useEffect(() => {
    const checkPermission = async () => {
      if (permission?.status !== "granted") {
        await requestPermission();
      }
    };

    checkPermission();
  }, [permission, requestPermission]);

  const handleProceed = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/home/virtual-interview");
    }, 2000);
  };

  return (
    <View className="flex-1 items-center bg-white">
      <Spinner visible={loading} color="#00AACE" />

      <CameraView
        style={[styles.camera, { height: cameraHeight }]}
        facing="front"
      />

      <View className="mt-7">
        <Text className="text-[14px] mb-2 font-bold text-gray-800 px-4">
          For best AI feedback results, please read the following instructions
          below:
        </Text>

        <View className="flex-row items-center mt-3 px-4">
          <AntDesign name="checkcircleo" size={15} color="black" />
          <Text className="ml-2 text-sm">
            Record in a quiet environment, without any distractions.
          </Text>
        </View>

        <View className="flex-row items-center mt-4 px-4">
          <AntDesign name="checkcircleo" size={15} color="black" />
          <Text className="ml-2 text-sm">
            Ensure that there is enough light in the room.
          </Text>
        </View>

        <View className="flex-row mt-4 px-4">
          <AntDesign
            name="checkcircleo"
            size={15}
            color="black"
            className="mt-0.5"
          />
          <Text className="ml-2 text-sm">
            Check your posture and aim for natural, consistent{"\n"}
            eye contact.
          </Text>
        </View>

        <Text className="mt-5 px-4 text-[13px]">
          <Text className="font-bold text-[#23626d] ">Please Note: </Text>
          Only recordings of 10 seconds or more can be analyzed.
        </Text>
      </View>

      <CustomButton
        onPress={handleProceed}
        containerStyles="bg-[#00AACE] h-14 rounded-xl mx-2 absolute bottom-5 right-2 left-2"
        textStyles="text-white text-[16px] font-semibold text-base"
        isLoading={loading}
        disabled={loading}
        title="Proceed"
      />
    </View>
  );
};

export default Reminder;

const styles = StyleSheet.create({
  camera: {
    marginVertical: 5,
    width: "92%",
  },
});