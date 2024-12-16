import {View,Text,TouchableOpacity, FlatList, ActivityIndicator} from "react-native";
import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { getInterviewHistory } from "@/api/interview";

const History = () => {
  const { getToken } = useAuth();
  const [selectedTab, setSelectedTab] = useState("virtual");
  const [interviewData, setInterviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  // Fetch interview history data 
  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          setLoading(true);
          const token = await getToken({template:"supabase"});
          console.log(token)
          const fetchedHistory = await getInterviewHistory(token);
          const sortedHistory = fetchedHistory.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );

          setInterviewData(sortedHistory);
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setLoading(false);
        }
      };
      const token =  getToken()
      if (token) {
        fetch();
      }
    }, [getToken])
  );

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
      {loading ? (
        <ActivityIndicator size="large" color="#00AACE" className="flex-1 mb-[110px]" />
      ) : (
        <>
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
                <View className="flex-row items-center">
                  <Text className="text-[13px] text-[#00AACE] mr-1">
                    {item.job_role}
                  </Text>

                  {item.company_name !== "None" && (
                    <Text className="text-[11px] text-[#00AACE]">
                      ( {item.company_name} )
                    </Text>
                  )}
                </View>
                <Text className="text-[10px] text-gray-600 mb-1">
                  {formatDateTime(item.created_at)}
                </Text>
                <TouchableOpacity
                  className="w-[80%] mt-2 py-2 rounded-lg border border-[#D4D4D4]"
                  onPress={() => {
                    if (!buttonDisabled) {
                      setButtonDisabled(true);
                      router.push({
                        pathname: `/history/feedback`,
                        params: { interviewId: item.interview_id },
                      });
                      setTimeout(() => setButtonDisabled(false), 1000);
                    }
                  }}
                  disabled={buttonDisabled}
                >
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
        </>
      )}
    </View>
  );
};

export default History;
