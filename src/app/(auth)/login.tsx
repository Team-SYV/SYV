import React from "react";
import { Link, Stack } from "expo-router";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import LoginForm from "@/components/Form/LoginForm";

const Login = () => {
  return (
    <SafeAreaView className="bg-white min-h-full">
      <ScrollView>
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[26px] font-semibold mt-56 ml-5">
          Welcome Back!
        </Text>
        <Text className="text-[15px] ml-6 mt-1">Sign in to your account</Text>

        <LoginForm />

        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-[14px]"> Don't have an account? </Text>
          <Link
            href="/(auth)/register"
            className="text-[#00657A] underline font-medium ml-1 text-[14px]"
          >
            Create Account
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
