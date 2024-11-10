import React from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RecordYourselfLayout = () => {
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
              Record
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
              Record Yourself
            </Text>
          ),
          headerBackVisible: false,
        }}
      />

      <Stack.Screen
        name="file-upload"
        options={{
          headerTitle: () => (
            <Text className="text-center text-[15px] font-semibold text-[#2a2a2a]">
              File Upload
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

export default RecordYourselfLayout;
