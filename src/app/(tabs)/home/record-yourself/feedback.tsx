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
import Ratings from "@/components/Rating/Ratings";
import { getFeedbackWithQuestions, getRatings } from "@/api";
import { RatingsData } from "@/types/ratingsData";

const { width, height } = Dimensions.get("window");

const Feedback: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);

  const [feedbackItem, setFeedbackItem] = useState([]);
  const [ratings, setRatings] = useState<RatingsData>();

  const [loading, setLoading] = useState(true);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isOnPage, setIsOnPage] = useState(true);

  const { videoURIs, interviewId } = useLocalSearchParams();
  const parsedVideos: string[] =
    typeof videoURIs === "string" ? (JSON.parse(videoURIs) as string[]) : [];
  const videosWithRatings = [...parsedVideos, "ratings"];

  // Android back button
  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        setIsFullScreen(false);
        return true;
      } else {
        if (isOnPage) {
          setIsConfirmationVisible(true);
          return true;
        }
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isFullScreen, isOnPage]);

  // Fetch questions, feedback and ratings
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);

        const fetchedFeedback = await getFeedbackWithQuestions(interviewId);
        setFeedbackItem(fetchedFeedback);
        const fetchedRatings = await getRatings(interviewId);
        setRatings(fetchedRatings);
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
    if (item === "ratings") {
      return (
        <View style={styles.itemContainer}>
          {ratings ? (
            <Ratings
              relevance={ratings[0].answer_relevance}
              grammar={ratings[0].grammar}
              eyeContact={ratings[0].eye_contact}
              pace={ratings[0].pace_of_speech}
              fillerWords={ratings[0].filler_words}
              setIsOnPage={setIsOnPage}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#00AACE" />
            </View>
          )}
        </View>
      );
    }

    const feedback = feedbackItem[index] || {};

    return (
      <View style={styles.itemContainer}>
        <View className="flex-row items-center px-4 mt-4">
          <View style={styles.questionContainer}>
            <Text className="font-semibold text-[13px]">
              Question {index + 1}
            </Text>

            <Text className="text-sm text-[13px]">{feedback.question}</Text>
          </View>
          <View style={styles.videoContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedVideo(item);
                setIsFullScreen(true);
              }}
              className="rounded-md bg-[#00AACE] py-[8px] px-3 mt-2"
            >
              <Text className="text-white font-medium text-[12px] text-center">
                View Video
              </Text>
            </TouchableOpacity>
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

          <Video
            source={{ uri: selectedVideo }}
            style={styles.fullScreenVideo}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping={false}
          />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={videosWithRatings}
          keyExtractor={(item) => item}
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
          {videosWithRatings.map((_, index) => {
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
                <Animated.View
                  style={{
                    opacity,
                  }}
                  className="w-[22px] h-[9px] rounded-full bg-[#00AACE] mx-[4px]"
                />
              </TouchableOpacity>
            );
          })}
        </View>
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
        onConfirm={() => {
          setIsConfirmationVisible(false);
          setIsOnPage(false);
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
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
    width: "70%",
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
