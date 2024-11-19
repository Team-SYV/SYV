import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { getRatingsByUserId } from "@/api";

const Progress = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("answerRelevance");

  const [currentWeekStart, setCurrentWeekStart] = useState(
    dayjs().startOf("week")
  );

  const [ratingsData, setRatingsData] = useState({});
  const weekStart = currentWeekStart.format("MMMM D");
  const weekEnd = currentWeekStart.add(6, "day").format("MMMM D, YYYY");
  const currentWeekKey = currentWeekStart.format("YYYY-MM-DD");

  const weeklyRatings = ratingsData[currentWeekKey] || {};
  const categoryRatings = weeklyRatings[selectedCategory] || [];
  const today = dayjs();

  // Fetches the user’s ratings data for the selected week.
  const fetchRatings = async () => {
    setLoading(true);
    try {
      const weekStartFormatted = currentWeekStart.format("YYYY-MM-DD");
      const fetchedProgress = await getRatingsByUserId(
        user.id,
        weekStartFormatted
      );
      setRatingsData(fetchedProgress);
    } catch (error) {
      console.error("Error fetching data", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRatings();
    }
  }, [user, currentWeekStart]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchRatings();
      }
    }, [user, currentWeekStart, selectedCategory])
  );

  const todayIndex = today.isSame(currentWeekStart, "week")
    ? today.diff(currentWeekStart, "day")
    : -1;

  const filteredRatings = categoryRatings.filter((rating, index) => {
    return index <= todayIndex || rating !== 0;
  });

  // Round the ratings to whole numbers
  const roundedRatings = filteredRatings.map((rating) => Math.round(rating));

  // Calculate the lowest, average, and highest ratings
  const sum = roundedRatings.reduce((sum, rating) => sum + rating, 0);

  const average = roundedRatings.length ? sum / roundedRatings.length : 0;

  const highest = roundedRatings.length ? Math.max(...roundedRatings) : 0;

  const lowest = roundedRatings.length > 0 ? Math.min(...roundedRatings) : 0;

  const getChartData = () => {
    return today.isSame(currentWeekStart, "week")
      ? ["Su", "M", "T", "W", "Th", "F", "Sa"]
          .map((label, index) => ({
            label,
            value: Math.round(categoryRatings[index]) || 0,
          }))
          .slice(0, todayIndex + 1)
      : ["Su", "M", "T", "W", "Th", "F", "Sa"].map((label, index) => ({
          label,
          value: Math.round(categoryRatings[index]) || 0,
        }));
  };

  const handleNextWeek = () =>
    setCurrentWeekStart(currentWeekStart.add(7, "day"));

  const handlePreviousWeek = () =>
    setCurrentWeekStart(currentWeekStart.subtract(7, "day"));

  // Check if category has data
  const hasData =
    categoryRatings.length && !categoryRatings.every((rating) => rating === 0);

  // Format category names
  const formatCategoryName = (category) =>
    category
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

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

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00AACE"
          style={{ marginTop: 160, marginBottom: 163 }}
        />
      ) : hasData ? (
        <LineChart
          key={selectedCategory}
          data={getChartData()}
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
          animateOnDataChange={true}
        />
      ) : (
        <Text className="text-center text-gray-500 my-[170px]">
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
