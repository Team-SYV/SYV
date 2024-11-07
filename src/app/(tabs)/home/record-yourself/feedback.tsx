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
} from "react-native";
import { mockFeedbackData } from "@/constants/feedbackData";

const { width } = Dimensions.get("window");

const Feedback: React.FC = () => {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current index
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);
  const { videoURIs } = useLocalSearchParams();
  const parsedVideos: string[] =
    typeof videoURIs === "string" ? (JSON.parse(videoURIs) as string[]) : [];

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

  // Render each video and its corresponding question and feedback
  const renderFeedbackItem = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const feedback = mockFeedbackData[index];

    return (
      <View style={styles.itemContainer}>
        <View className="flex-row items-center px-4 mt-3">
          <View style={styles.questionContainer}>
            <Text className="font-semibold text-[13px]">
              Question {index + 1}{" "}
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
            <Text className="font-medium text-[12px] mb-2 ">
              Answer Relevance
            </Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.answerRelevance}
            </Text>

            <Text className="font-medium text-[12px] mb-2">Grammar</Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.grammar}
            </Text>

            <Text className="font-medium text-[12px] mb-2">Eye Contact </Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.eyeContact}
            </Text>

            <Text className="font-medium text-[12px] mb-2">
              Pace of Speech{" "}
            </Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.paceOfSpeech}
            </Text>

            <Text className="font-medium text-[12px] mb-2">Filler Words </Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.fillerWords}
            </Text>

            <Text className="font-medium text-[12px] mb-2">
              Tips & Ideal Answer
            </Text>
            <Text className="mb-3 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
              {feedback.tips}
            </Text>
          </View>

          <View className="mt-2 px-5">
            <TouchableOpacity
              onPress={() => {
                if (currentIndex === parsedVideos.length - 1) {
                  router.push("/home/record-yourself/ratings");
                } else {
                  setCurrentIndex(currentIndex + 1);
                  flatListRef.current?.scrollToIndex({
                    index: currentIndex + 1,
                    animated: true,
                  });
                }
              }}
              className="bg-[#00AACE] py-3 rounded-xl"
            >
              <Text className="text-white text-[15px] font-medium text-center">
                {currentIndex === parsedVideos.length - 1
                  ? "Proceed to Ratings"
                  : "Next"}
              </Text>
            </TouchableOpacity>
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

      {isFullScreen ? (
        <View className="absolute top-0 bottom-0 right-0 left-0 justify-center items-center bg-black z-10">
          <TouchableOpacity
            onPress={() => setIsFullScreen(false)}
            className="absolute right-4 top-[60px] z-10"
          >
            <AntDesign name="closecircle" size={33} color="#A92703" />
          </TouchableOpacity>

          <Video
            source={{ uri: selectedVideo }}
            style={styles.fullScreenVideo}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
          />
        </View>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={parsedVideos}
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

      {!isFullScreen && (
        <View className="absolute top-[5px] flex-row justify-center w-full">
          {parsedVideos.map((_, index) => {
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
        title="Discard Recording?"
        message={
          <Text>
            Exiting now will discard your progress.{"\n"}
            Are you sure you want to leave?
          </Text>
        }
        onConfirm={() => {
          setIsConfirmationVisible(false);
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
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#E3E3E3",
  },
  questionContainer: {
    width: "70%",
  },
  videoContainer: {
    width: "30%",
    paddingLeft: 10,
  },
  fullScreenVideo: {
    width: "100%",
    height: "100%",
  },
});
