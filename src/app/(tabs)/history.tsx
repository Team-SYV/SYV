import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { getInterviewHistory } from "@/api";
import { useUser } from "@clerk/clerk-expo";

const History = () => {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("virtual");
  const [interviewData, setInterviewData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const fetchedHistory = await getInterviewHistory(user.id);
        setInterviewData(fetchedHistory);
      } catch (error) {
        console.error("Error fetching data", error.message);
      }
    };
    if (user) {
      fetch();
    }
  }, [user]);

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

  // Normalize selectedTab to match data's type values
  const normalizedTab = selectedTab === "recording" ? "record" : "virtual";

  return (
    <View className="flex-1 bg-white pt-8 px-6">
      <Text className="text-[32px] font-bold text-center">
        {interviewData.length}
      </Text>
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
          activeOpacity={1}
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
        data={interviewData.filter(
          (item) => item.type.toLowerCase() === normalizedTab
        )}
        keyExtractor={(item) => item.interview_id}
        renderItem={({ item }) => (
          <View className="my-2">
            <Text className="text-[12px] text-[#00AACE]">{item.job_role}</Text>
            <Text className="text-[9px] text-gray-600 mb-1">
              {formatDateTime(item.created_at)}
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
