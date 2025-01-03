import React from "react";
import { router, Stack } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HistoryLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerLeft: () => (
          <TouchableOpacity
            style={{ padding: 1 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#2a2a2a" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="feedback"
        options={{
          headerTitle: () => (
            <Text className="text-center text-[15px] font-semibold text-[#2a2a2a]">
              Feedback
            </Text>
          ),
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
};

export default HistoryLayout;
