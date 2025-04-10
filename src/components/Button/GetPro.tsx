import { Text, View } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";

const GetPro = ({ subscribed }: { subscribed: boolean }) => {
  return (
    <LinearGradient
      colors={["#fbbf24", "#f59e0b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ borderRadius: 8 }}
    >
      <View className="flex-row items-center py-2 px-2">
        {subscribed ? (
          <Text className="text-white text-sm"> Subscribed </Text>
        ) : (
          <Text className="text-white text-sm"> Get Pro </Text>
        )}
        {!subscribed && <AntDesign name="right" size={12} color="white" />}
      </View>
    </LinearGradient>
  );
};

export default GetPro;
