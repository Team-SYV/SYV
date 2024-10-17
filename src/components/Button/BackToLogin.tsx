import { Text, View } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BackToLogin = () => {
  return (
    <View className="flex-1 justify-center items-center mt-12 mb-10">
      <Link href="/(auth)/login">
        <View className="flex-row items-center">
          <Ionicons name="arrow-back" size={18} color="black" />
          <Text className="text-[16px] text-gray-700 ml-2">Back to login</Text>
        </View>
      </Link>
    </View>
  );
};

export default BackToLogin;

