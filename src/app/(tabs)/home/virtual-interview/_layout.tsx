import React from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VILayout = () => {
  const router = useRouter();

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
            <Ionicons name="arrow-back" size={22} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text className="text-center text-[15px] font-semibold text-[#2a2a2a]">
              Practice Area
            </Text>
          ),
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="job-information"
        options={{
          headerTitle: () => (
            <Text className="text-center text-[15px] font-semibold text-[#2a2a2a]">
              Talk with Virtual Interviewer
            </Text>
          ),
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="reminder"
        options={{
          headerTitle: () => (
            <Text className="text-center text-[15px] font-semibold text-[#2a2a2a]">
              Reminder
            </Text>
          ),
          headerBackVisible: false,
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

export default VILayout;
