import { Text, View, Pressable, Image } from "react-native";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AntDesign from "@expo/vector-icons/AntDesign";

const Subscription = () => {
  const [selectedOption, setSelectedOption] = useState("monthly");

  return (
    <LinearGradient
      colors={["#FFFFFF", "#E0F7FA"]}
      style={{ flex: 1, justifyContent: "flex-end" }}
    >
      <View className="absolute top-0 w-full items-center">
        <Image
          source={require("@/assets/images/subscription.png")}
          className="ml-1 w-48 h-48"
        />
        <Text className="mt-3 text-[26px] font-bold mb-2 text-[#23626d]">
          Get Unlimited Access
        </Text>
        <Text className="text-[15px] text-gray-600 text-center w-[280px] mb-4">
          Practice anytime, anywhere with flexible mock interviews.
        </Text>

        <View className="w-[60%]">
          <View className="flex-row items-center mt-4">
            <AntDesign name="checkcircleo" size={20} color="#23626d" />
            <Text className="ml-5 text-[#23626d] font-medium text-[15px]">
              Unlimited Mock Interviews
            </Text>
          </View>

          <View className="flex-row items-center mt-4">
            <AntDesign name="checkcircleo" size={20} color="#23626d" />
            <Text className="ml-5 text-[#23626d] font-medium text-[15px]">
              Real Time AI Feedback
            </Text>
          </View>

          <View className="flex-row items-center mt-4">
            <AntDesign name="checkcircleo" size={20} color="#23626d" />
            <Text className="ml-5 text-[#23626d] font-medium text-[15px]">
              Track Your Progress
            </Text>
          </View>
        </View>
      </View>

      {/* Subscription options */}
      <View className="bg-white shadow-lg rounded-t-[35px] p-6">
        <Pressable
          className={`py-6 rounded-2xl flex-row justify-between px-4 mt-6 ${
            selectedOption === "monthly"
              ? "border border-[#45d0ec] bg-[#BBEEF8]"
              : "border border-gray-300 bg-white"
          }`}
          onPress={() => setSelectedOption("monthly")}
        >
          <Text className="text-sm">Monthly</Text>
          <View className="flex-row items-center">
            <Text className="text-sm mr-1">₱299</Text>
            <Text className="text-xs">/ Month</Text>
          </View>
        </Pressable>

        <Pressable
          className={`mt-4 py-6 rounded-2xl flex-row justify-between px-4 ${
            selectedOption === "yearly"
              ? "border border-[#45d0ec] bg-[#BBEEF8]"
              : "border border-gray-300 bg-white"
          }`}
          onPress={() => setSelectedOption("yearly")}
        >
          <Text className="text-sm">Yearly</Text>
          <View className="flex-row items-center">
            <Text className="text-sm mr-1">₱3000</Text>
            <Text className="text-xs">/ Year</Text>
          </View>
        </Pressable>

        <Pressable
          className="mt-8 mb-4 py-5 bg-[#00AACE] rounded-2xl items-center"
          onPress={() => {}}
        >
          <Text className="text-white text-base font-medium">Subscribe</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

export default Subscription;
