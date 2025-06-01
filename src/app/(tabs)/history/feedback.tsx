import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { getQuestions } from "@/api/question";
import { getFeedback } from "@/api/feedback";
import { cleanQuestion } from "@/utils/cleanQuestion";

const { width } = Dimensions.get("window");

const Feedback: React.FC = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);

  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [isClamped, setIsClamped] = useState<Record<string, boolean>>({});

  const [questions, setQuestions] = useState([]);
  const [feedbackItem, setFeedbackItem] = useState([]);

  const [loading, setLoading] = useState(true);
  const { interviewId } = useLocalSearchParams();

  const { getToken } = useAuth();

  // Fetch questions and feedback for a specific interview when the interviewId changes.
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const token = await getToken({ template: "supabase" });
        const fetchedQuestions = await getQuestions(interviewId, token);
        setQuestions(fetchedQuestions.questions);
        const fetchedFeedback = await getFeedback(interviewId, token);
        setFeedbackItem(fetchedFeedback);
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

  const renderFeedbackItem = ({ index }: { item: string; index: number }) => {
    const feedback = feedbackItem[index] || {};
    const question = questions[index] || "No question available";

    const dynamicMargin = feedbackItem.length > 1 ? 14 : 0;
    return (
      <View style={[styles.itemContainer, { marginTop: dynamicMargin }]}>
        {feedbackItem.length > 1 && (
          <View className="flex-row items-center px-4 mt-4">
            <View style={styles.questionContainer}>
              <Text className="font-semibold text-[13px]">
                Question {index + 1}
              </Text>
              <Text className="text-sm text-[13px]">
                {cleanQuestion(question)}
              </Text>
            </View>
          </View>
        )}
        <ScrollView className="mt-5">
          <View className="px-4">
            {feedback.answer &&
              renderExpandableSection(
                "Answer ",
                feedback.answer,
                `answer-${index}`
              )}
            {renderExpandableSection(
              "Answer Relevance",
              feedback.answer_relevance,
              `answerRelevance-${index}`
            )}
            {renderExpandableSection(
              "Grammar",
              feedback.grammar,
              `grammar-${index}`
            )}
            {renderExpandableSection(
              "Eye Contact",
              feedback.eye_contact,
              `eyeContact-${index}`
            )}
            {renderExpandableSection(
              "Pace of Speech",
              feedback.pace_of_speech,
              `paceOfSpeech-${index}`
            )}
            {renderExpandableSection(
              "Filler Words",
              feedback.filler_words,
              `fillerWords-${index}`
            )}
            {feedbackItem.length > 1 &&
              renderExpandableSection(
                "Tips & Ideal Answer",
                feedback.tips,
                `tips-${index}`
              )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AACE" />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={feedbackItem}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderFeedbackItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
        />
      )}

      {/* Pagination indicators */}
      {!loading && (
        <View className="absolute top-[5px] flex-row justify-center w-full">
          {feedbackItem.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  flatListRef.current?.scrollToIndex({ index, animated: true })
                }
              >
                {feedbackItem.length > 1 && (
                  <Animated.View
                    style={{
                      opacity,
                    }}
                    className="w-[22px] h-[9px] rounded-full bg-[#00AACE] mx-[4px]"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  itemContainer: {
    width,
    marginTop: 14,
  },
  questionContainer: {
    width: "100%",
  },
});
