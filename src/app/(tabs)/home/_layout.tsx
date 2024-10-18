import React from "react";
import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#f2f2f2",
        },
      }}
    >
      <Stack.Screen name="index"/>
      <Stack.Screen name="interview-tips"/>
    </Stack>
  );
};

export default HomeLayout;
