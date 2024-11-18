import React, { useEffect, useState, useRef } from "react";
import { Video, ResizeMode } from "expo-av";
import { router, Stack, useLocalSearchParams } from "expo-router";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  BackHandler,
  Dimensions,
  Animated,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getFeedback, getQuestions } from "@/api";

const { width, height } = Dimensions.get("window");

const Feedback: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);

  const [questions, setQuestions] = useState([]);
  const [feedbackItem, setFeedbackItem] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const { interviewId } = useLocalSearchParams();

  // Android back button
  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        setIsFullScreen(false);
        return true;
      }
      setIsConfirmationVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isFullScreen]);

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

  // Render each video and its corresponding question and feedback
  const renderFeedbackItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const feedback = feedbackItem[index] || {};
    const question = questions[index] || "No question available";

    return (
      <View style={styles.itemContainer}>
        <View className="flex-row items-center px-4 mt-4">
          <View style={styles.questionContainer}>
            <Text className="font-semibold text-[13px]">
              Question {index + 1}
            </Text>

            <Text className="text-sm text-[13px]">{question}</Text>
          </View>
        </View>

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

              <Text className="font-medium text-[12px] mb-2">
                Tips & Ideal Answer
              </Text>
              <Text className="mb-6 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
                {feedback.tips || "No feedback available"}
              </Text>
            </>
          </View>
        </ScrollView>
      </View>
    );
  };
  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: !isFullScreen,
          headerStyle: {
            backgroundColor: "white",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => setIsConfirmationVisible(true)}>
              <AntDesign name="arrowleft" size={24} color="#2a2a2a" />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00AACE" />
        </View>
      ) : isFullScreen ? (
        <View style={styles.fullScreenVideoContainer}>
          <TouchableOpacity
            onPress={() => setIsFullScreen(false)}
            className="absolute right-4 top-14 z-10"
          >
            <AntDesign name="closecircle" size={33} color="#A92703" />
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={feedbackItem}
          keyExtractor={(item, index) => index.toString()}
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

      {!isFullScreen && !loading && (
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
  videoContainer: {
    width: "30%",
    paddingLeft: 10,
  },
  fullScreenVideoContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenVideo: {
    width,
    height,
  },
});
