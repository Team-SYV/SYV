import React, { useState } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Spinner from "react-native-loading-spinner-overlay";

const Ratings = () => {
  const progressData = {
    relevance: 4,
    grammar: 3,
    eyeContact: 3,
    pace: 4,
    fillerWords: 2,
  };

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const ratings = Object.values(progressData);
  const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
  const overallRating = totalRating / ratings.length;

  const numberOfStars = 5;
  const filledStars = Math.round(overallRating);

  const renderProgressBar = (progress) => (
    <View className="w-full h-4 bg-gray-200 rounded-full">
      <View
        style={{ width: `${(progress / 5) * 100}%` }}
        className="h-full bg-[#FFC300] rounded-full"
      />
    </View>
  );

  const handleGoBack = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/home");
    }, 2000);
  };

  return (
    <View className="flex-1 p-6 bg-white">
      <Spinner visible={loading} color="#00AACE" />
      <Text className="text-[18px] text-center font-medium">
        Overall Rating
      </Text>

      <Text className="text-[70px] text-center font-medium">
        {overallRating.toFixed(0)}/5
      </Text>

      <View className="flex-row items-center justify-center">
        {[...Array(numberOfStars)].map((_, index) => (
          <View key={index} className="mx-2">
            <AntDesign
              name={index < filledStars ? "star" : "staro"}
              size={30}
              color={index < filledStars ? "#FFC300" : "gray"}
            />
          </View>
        ))}
      </View>

      <View className="mt-14">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[14px] font-medium">Answer Relevance</Text>
          <Text className="text-[14px] font-medium mr-2">
            {progressData.relevance}
          </Text>
        </View>
        {renderProgressBar(progressData.relevance)}

        <View className="flex-row justify-between items-center mb-2 mt-9">
          <Text className="text-[14px] font-medium">Grammar</Text>
          <Text className="text-[14px] font-medium mr-2">
            {progressData.grammar}
          </Text>
        </View>
        {renderProgressBar(progressData.grammar)}

        <View className="flex-row justify-between items-center mb-2 mt-9">
          <Text className="text-[14px] font-medium">Eye Contact</Text>
          <Text className="text-[14px] font-medium mr-2">
            {progressData.eyeContact}
          </Text>
        </View>
        {renderProgressBar(progressData.eyeContact)}

        <View className="flex-row justify-between items-center mb-2 mt-9">
          <Text className="text-[14px] font-medium">Pace of Speech</Text>
          <Text className="text-[14px] font-medium mr-2">
            {progressData.pace}
          </Text>
        </View>
        {renderProgressBar(progressData.pace)}

        <View className="flex-row justify-between items-center mb-2 mt-9">
          <Text className="text-[14px] font-semibold">Filler Words</Text>
          <Text className="text-[14px] font-medium mr-2">
            {progressData.fillerWords}
          </Text>
        </View>
        {renderProgressBar(progressData.fillerWords)}
      </View>

      <TouchableOpacity
        onPress={handleGoBack}
        className="absolute bottom-5 left-5 right-5 bg-gray-50 border border-gray-300 p-3 rounded-xl mt-8"
        disabled={loading}
      >
        <Text className="text-center text-[17px] font-medium"> Done </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Ratings;