import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";

const History = () => {
  const [selectedTab, setSelectedTab] = useState("virtual");

  // Sample data for interviews
  const interviewData = [
    {
      id: "1",
      jobRole: "Software Engineer",
      dateTime: "2024-11-13T10:00:00",
      type: "virtual",
    },
    {
      id: "2",
      jobRole: "Product Manager",
      dateTime: "2024-11-12T15:00:00",
      type: "virtual",
    },
    {
      id: "3",
      jobRole: "UX Designer",
      dateTime: "2024-11-11T13:30:00",
      type: "virtual",
    },
    {
      id: "4",
      jobRole: "Data Scientist",
      dateTime: "2024-11-10T09:00:00",
      type: "virtual",
    },
    {
      id: "5",
      jobRole: "Marketing Specialist",
      dateTime: "2024-11-09T14:00:00",
      type: "virtual",
    },
    {
      id: "6",
      jobRole: "Backend Developer",
      dateTime: "2024-11-08T11:30:00",
      type: "virtual",
    },
  ];
  // Helper function to format the date
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <View className="flex-1 bg-white pt-8 px-6">
      <Text className="text-[32px] font-bold text-center">20</Text>
      <Text className="text-[15px] text-center mb-8">Total Interviews</Text>

      <View className="flex-row justify-center w-full">
        <TouchableOpacity
          className="flex-1 items-center pb-2"
          onPress={() => setSelectedTab("virtual")}
          activeOpacity={1}
        >
          <Text
            className={`text-sm ${
              selectedTab === "virtual"
                ? "font-medium text-gray-800"
                : "text-gray-700"
            }`}
          >
            Virtual Interview
          </Text>
          {selectedTab === "virtual" && (
            <View className="w-full h-1 bg-[#00AACE] mt-1 rounded-full"></View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center pb-2"
          onPress={() => setSelectedTab("recording")}
        >
          <Text
            className={`text-sm ${
              selectedTab === "recording"
                ? "font-medium text-gray-800"
                : "text-gray-700"
            }`}
          >
            Recording Interview
          </Text>
          {selectedTab === "recording" && (
            <View className="w-full h-1 bg-[#00AACE] mt-1 rounded-full"></View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={interviewData.filter((item) => item.type === selectedTab)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="my-2">
            <Text className="text-[12px] text-[#00AACE]">{item.jobRole}</Text>
            <Text className="text-[9px] text-gray-600 mb-1">
              {formatDateTime(item.dateTime)}
            </Text>
            <TouchableOpacity className="w-[80%] mt-2 py-2 rounded-lg border border-[#D4D4D4]">
              <Text className="text-center text-[12px]">View Feedback</Text>
            </TouchableOpacity>

            <View className="w-full h-[1px] bg-gray-300 mt-4"></View>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-700 mt-52 text-[13px]">
            No interview history available.
          </Text>
        }
        className="w-full mt-4 mb-[80px]"
      />
    </View>
  );
};

export default History;
