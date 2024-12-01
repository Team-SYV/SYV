import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { getFeedback, getQuestions } from "@/api";
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

const { width } = Dimensions.get("window");

const Feedback: React.FC = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);

  const [questions, setQuestions] = useState([]);
  const [feedbackItem, setFeedbackItem] = useState([]);

  const [loading, setLoading] = useState(true);
  const { interviewId } = useLocalSearchParams();

  // Fetch questions and feedback for a specific interview when the interviewId changes.
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const fetchedQuestions = await getQuestions(interviewId);
        setQuestions(fetchedQuestions.questions);
        const fetchedFeedback = await getFeedback(interviewId);
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

  // Render each questions and feedback
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

              <Text className="text-sm text-[13px]">{question}</Text>
            </View>
          </View>
        )}

        <ScrollView className="mt-5">
          <View className="px-4">
            <>
              <Text className="font-medium text-[12px] mb-2">
                Answer Relevance
              </Text>
              <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.answer_relevance || "No feedback available"}
              </Text>

              <Text className="font-medium text-[12px] mb-2">Grammar</Text>
              <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.grammar || "No feedback available"}
              </Text>

              <Text className="font-medium text-[12px] mb-2">Eye Contact</Text>
              <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.eye_contact || "No feedback available"}
              </Text>

              <Text className="font-medium text-[12px] mb-2">
                Pace of Speech
              </Text>
              <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.pace_of_speech || "No feedback available"}
              </Text>

              <Text className="font-medium text-[12px] mb-2">Filler Words</Text>
              <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.filler_words || "No feedback available"}
              </Text>

              {feedbackItem.length > 1 && (
                <>
                  <Text className="font-medium text-[12px] mb-2">
                    Tips & Ideal Answer
                  </Text>
                  <Text className="mb-6 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                    {feedback.tips || "No feedback available"}
                  </Text>
                </>
              )}
            </>
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
