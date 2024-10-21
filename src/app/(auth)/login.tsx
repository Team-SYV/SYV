import React from "react";
import { Link, Stack } from "expo-router";
import { View, Text, ScrollView, SafeAreaView, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import LoginForm from "@/components/Form/LoginForm";
import GoogleSignIn from "@/components/Button/GoogleSignIn";

// Hook to warm up and cool down the web browser for authentication.
export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);
};
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  useWarmUpBrowser();
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <SafeAreaView className="bg-white min-h-full">
      <ScrollView>
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-[28px] font-semibold mt-48 ml-5">Welcome Back!</Text>
        <Text className="text-[15px] ml-6 mt-1">Sign in to your account</Text>

        <LoginForm />

        <View className="flex-row items-center justify-center mt-6 mb-8 mx-6">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="text-center mx-2 text-gray-600"> or </Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        <GoogleSignIn isLoading={isLoading} setIsLoading={setIsLoading} />

        <View className="flex-row items-center justify-center mt-6 mb-10">
          <Text className="text-[13px]"> Don't have an account? </Text>
          <Link
            href="/(auth)/register"
            className="text-[#00657A] underline font-medium ml-1 text-[13px]"
          >
            Create Account
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
