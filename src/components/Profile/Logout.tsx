import React, { useState } from "react";
import { Pressable, Text, View, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "@clerk/clerk-expo";
import CustomButton from "../Button/CustomButton";
import Spinner from "react-native-loading-spinner-overlay";

const Logout = () => {
  const { signOut } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Logout confirmation
  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    } finally {
      setIsLoading(false);
      setIsModalVisible(false);
    }
  };

  const handleLogout = () => {
    setIsModalVisible(true);
  };

  const cancelLogout = () => {
    setIsModalVisible(false);
  };

  return (
    <View>
      <Spinner visible={isLoading} color="#00AACE" />

      <Pressable
        onPress={handleLogout}
        className="flex-row items-center justify-between p-4 rounded-lg mx-4 mt-3"
      >
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={18} className="mr-2" />
          <Text className="text-[13px]">Sign out</Text>
        </View>
        <AntDesign name="right" size={17} />
      </Pressable>

      <Modal
        transparent={true}
        animationType="none"
        visible={isModalVisible}
        onRequestClose={cancelLogout}
      >
        <View className="flex-1 justify-center items-center bg-black/30">
          <View className="w-4/5 p-5 bg-white rounded-lg">
            <Text className="text-[15px] mb-4">Sign out of your account?</Text>
            <View className="flex-row justify-end">
              <CustomButton
                title="Cancel"
                onPress={cancelLogout}
                containerStyles="mr-5 py-2 px-3"
                textStyles="text-black text-[15px]"
              />
              <CustomButton
                title="Sign out"
                onPress={confirmLogout}
                containerStyles="bg-red-500 py-2 px-3 rounded-lg"
                textStyles="text-white text-[15px]"
                testID="signout-button"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Logout;
