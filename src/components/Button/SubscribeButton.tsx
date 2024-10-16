import React from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import GetPro from "./GetPro";

const SubscribeButton = () => {
  return (
    <View>
      <Pressable className="flex-row items-center justify-between px-2 py-2 border border-gray-200 rounded-lg mx-6 mt-5">
        <View className="flex-row items-center">
          <MaterialIcons name="subscriptions" size={17} className="mr-2" />
          <Text className="text-[13px]">Subscribe to pro plan</Text>
        </View>
        <GetPro />
      </Pressable>
    </View>
  );
};

export default SubscribeButton;
