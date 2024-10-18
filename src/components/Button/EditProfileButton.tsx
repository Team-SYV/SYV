import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const EditProfileButton = () => {
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToEditProfile = () => {
    if (!isNavigating) {
      setIsNavigating(true);
      router.push("/profile/edit-profile");
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  return (
    <View>
      <View className="h-[1px] bg-gray-300 mt-12" />

      <Pressable
        onPress={navigateToEditProfile}
        className="flex-row items-center justify-between p-4 rounded-lg mx-4 mt-4"
        disabled={isNavigating}
      >
        <View className="flex-row items-center">
          <AntDesign name="edit" size={17} className="mr-2" />
          <Text className="text-[13px]"> Edit Profile </Text>
        </View>
        <AntDesign name="right" size={17} />
      </Pressable>
    </View>
  );
};

export default EditProfileButton;
