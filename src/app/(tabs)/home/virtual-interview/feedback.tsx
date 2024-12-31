import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import Spinner from "react-native-loading-spinner-overlay";
import { useAuth } from "@clerk/clerk-expo";
import { getFeedbackVirtual } from "@/api/feedback";

const Feedback: React.FC = () => {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [isClamped, setIsClamped] = useState<Record<string, boolean>>({});

  const [feedbackItem, setFeedbackItem] = useState({
    answerRelevance: "No feedback available",
    grammar: "No feedback available",
    eyeContact: "No feedback available",
    paceOfSpeech: "No feedback available",
    fillerWords: "No feedback available",
  });
  const [exit, setExit] = useState(true);
  const router = useRouter();
  const { interviewId } = useLocalSearchParams();
  const { getToken } = useAuth();

  // Fetch feedback
  useEffect(() => {
    const fetch = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        setLoading(true);
        const fetchedFeedback = await getFeedbackVirtual(interviewId, token);
        setFeedbackItem({
          answerRelevance: fetchedFeedback[0].answer_relevance,
          grammar: fetchedFeedback[0].grammar,
          eyeContact: fetchedFeedback[0].eye_contact,
          paceOfSpeech: fetchedFeedback[0].pace_of_speech,
          fillerWords: fetchedFeedback[0].filler_words,
        });
      } catch (error) {
        console.error("Error fetching data", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetch();
    }
  }, [interviewId]);

  // Handle Android back button with confirmation modal
  const handleBackButtonPress = () => {
    if (exit) {
      setIsConfirmationVisible(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButtonPress
    );

    return () => {
      backHandler.remove();
    };
  }, [isConfirmationVisible, exit]);

  // Handle back navigation to home or leave page
  const handleLeavePage = () => {
    setIsConfirmationVisible(false);
    setExit(false);
    router.push("/home");
  };

  // Route to ratings
  const handleProceedToRatings = () => {
    setButtonLoading(true);
    setExit(false);
    setTimeout(() => {
      setButtonLoading(false);
      router.push(`/home/virtual-interview/ratings?interviewId=${interviewId}`);
    }, 1000);
  };

  const toggleExpand = (key: string) => {
    setIsExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTextLayout = (key: string, event) => {
    const { lines } = event.nativeEvent;
    setIsClamped((prev) => ({
      ...prev,
      [key]: lines.length > 3,
    }));
  };

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderExpandableSection = (
    title: string,
    content: string,
    key: string
  ) => (
    <>
      <Text className="font-medium text-[12px] mb-2">{title}</Text>
      <View className="mb-4 border border-[#E3E3E3] rounded-md px-2 py-2">
        <Text
          className="text-sm font-light"
          numberOfLines={isExpanded[key] ? undefined : 3}
          onTextLayout={(event) => handleTextLayout(key, event)}
        >
          {content || "No feedback available"}
        </Text>

        {content && isClamped[key] && (
          <TouchableOpacity onPress={() => toggleExpand(key)}>
            <Text className="text-sm font-base text-[#0092B1] mt-1">
              {isExpanded[key] ? "View less" : "View more"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <View className="bg-white flex-1">
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => setIsConfirmationVisible(true)}>
              <AntDesign name="arrowleft" size={24} color="#2a2a2a" />
            </TouchableOpacity>
          ),
        }}
      />

      <Spinner visible={loading} color="#00AACE" />

      {!loading && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          className="p-4"
        >
          {Object.entries(feedbackItem).map(([field, value]) =>
            renderExpandableSection(formatFieldName(field), value, field)
          )}

          <TouchableOpacity
            onPress={handleProceedToRatings}
            className="bg-[#00AACE] h-14 rounded-xl mb-3 justify-center items-center"
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-center text-white text-[15px] font-medium">
                Proceed
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      <ConfirmationModal
        isVisible={isConfirmationVisible}
        title="Leave Feedback?"
        message={
          <Text>
            Exiting will take you back to the home page.{"\n"}
            Are you sure you want to leave?
          </Text>
        }
        onConfirm={handleLeavePage}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default Feedback;
