import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";

const Progress = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(dayjs("2024-08-21"));
  const [selectedCategory, setSelectedCategory] = useState("");

  const ratingsData = {
    "2024-08-21": {
      answerRelevance: [3, 4, 0, 5, 3, 4, 2],
      grammar: [4, 3, 4, 3, 2, 3, 4],
      eyeContact: [5, 4, 5, 5, 3, 4, 5],
      paceOfSpeech: [4, 3, 4, 3, 4, 4, 5],
      fillerWords: [1, 2, 3, 2, 1, 2, 3],
    },
    "2024-08-28": {
      answerRelevance: [2, 3, 4, 4, 5, 3, 2],
      grammar: [3, 3, 4, 3, 3, 4, 3],
      eyeContact: [4, 5, 4, 5, 3, 4, 4],
      paceOfSpeech: [3, 3, 3, 4, 3, 4, 3],
      fillerWords: [2, 3, 3, 4, 2, 3, 3],
    },
  };

  const weekStart = currentWeekStart.format("MMMM D");
  const weekEnd = currentWeekStart.add(6, "day").format("MMMM D, YYYY");

  const currentWeekKey = currentWeekStart.format("YYYY-MM-DD");
  const weeklyRatings = ratingsData[currentWeekKey] || {};

  const categoryRatings = weeklyRatings[selectedCategory] || [];

  const chartData = categoryRatings.map((value, index) => ({
    value: value,
    label: ["Su", "M", "T", "W", "Th", "F", "Sa"][index],
  }));

  // Calculate the lowest, average, and highest ratings for each category
  const lowest = categoryRatings.length ? Math.min(...categoryRatings) : 0;
  const sum = categoryRatings.reduce((sum, rating) => sum + rating, 0);
  const average = categoryRatings.length
    ? (sum / categoryRatings.length).toFixed(0)
    : 0;
  const highest = categoryRatings.length ? Math.max(...categoryRatings) : 0;

  const handleNextWeek = () => {
    setCurrentWeekStart(currentWeekStart.add(7, "day"));
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(currentWeekStart.subtract(7, "day"));
  };

  const hasData =
    categoryRatings.length && !categoryRatings.every((rating) => rating === 0);

  // Helper function to format category names
  const formatCategoryName = (category) => {
    return category
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <View className="flex-1 bg-white pt-12 px-2">
      <View className="flex-row justify-evenly mb-5 mx-auto max-w-[84%]">
        {[
          "answerRelevance",
          "grammar",
          "eyeContact",
          "paceOfSpeech",
          "fillerWords",
        ].map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`p-3 rounded-2xl ${
              selectedCategory === category
                ? "bg-[#00AACE] z-10"
                : "bg-[#f0f0f0]"
            }`}
            style={{
              borderWidth: selectedCategory === category ? 2 : 1,
              borderColor:
                selectedCategory === category ? "transparent" : "#E0E0E0",
            }}
            activeOpacity={0.9}
          >
            <Text
              className={`${
                selectedCategory === category ? "text-white" : "text-black"
              } font-medium text-[10px]`}
            >
              {formatCategoryName(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row justify-between items-center mb-6 px-3 mt-6">
        <TouchableOpacity onPress={handlePreviousWeek}>
          <Feather name="chevron-left" size={24} />
        </TouchableOpacity>

        <Text className="text-lg font-medium mx-4">
          {weekStart} - {weekEnd}
        </Text>

        <TouchableOpacity onPress={handleNextWeek}>
          <Feather name="chevron-right" size={24} />
        </TouchableOpacity>
      </View>

      {hasData ? (
        <LineChart
          data={chartData}
          width={300}
          height={320}
          color="#00AACE"
          dataPointsColor="#00AACE"
          thickness={2}
          yAxisColor="white"
          xAxisColor="#D6D6D6"
          xAxisLabelTextStyle={{ fontSize: 12, marginTop: 4 }}
          yAxisTextStyle={{ fontSize: 12 }}
          spacing={46}
          maxValue={5}
          stepValue={1}
          isAnimated
          rulesType="solid"
          rulesColor="#D6D6D6"
        />
      ) : (
        <Text className="text-center text-gray-500 my-[160px]">
          No data available for this week
        </Text>
      )}

      <View className="flex-row justify-between mt-10">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-[#00758D]">{lowest}</Text>
          <Text className="mt-1 text-sm text-gray-800">LOWEST</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-semibold text-[#00758D]">
            {average}
          </Text>
          <Text className="mt-1 text-sm text-gray-800">AVERAGE</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-semibold text-[#00758D]">
            {highest}
          </Text>
          <Text className="mt-1 text-sm text-gray-800">HIGHEST</Text>
        </View>
      </View>
    </View>
  );
};

export default Progress;
