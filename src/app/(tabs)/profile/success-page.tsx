import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

const SuccessPage = () => {
  const { subscription } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleBackToHome = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.replace("(tabs)/profile");
    }, 1000);
  };

  return (
    <View className="flex-1 bg-white justify-center">
      <View className="items-center mb-28">
        <Image
          source={require("@/assets/images/check.jpg")}
          className="w-40 h-40 mb-4"
        />
        <Text className="text-2xl font-bold">Subscription Successful!</Text>
        <Text className="text-base mt-3 text-center mx-6">
          Congratulations! You've successfully subscribed to the {subscription}{" "}
          plan 🎉.
        </Text>

        <Pressable
          className="mt-12 py-3 w-[328px] border border-gray-400 rounded-2xl"
          onPress={handleBackToHome}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text className="text-lg text-gray-700 font-medium text-center">
              Return to Dashboard
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default SuccessPage;
