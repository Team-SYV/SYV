import { useRouter } from "expo-router";
import CustomButton from "@/components/Button/CustomButton";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  Animated,
  Text,
} from "react-native";
import { onBoarding } from "@/constants/onboardingData";

const { width } = Dimensions.get("window");

const OnboardingPage = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Auto scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % onBoarding.length;
      setCurrentIndex(nextIndex);
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / width);
    setCurrentIndex(newIndex);
    scrollX.setValue(contentOffsetX);
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={onBoarding}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ width: width, alignItems: "center" }}>
            <Image
              source={item.source}
              style={{
                width: width,
                height: 310,
                resizeMode: "contain",
                alignSelf: "center",
              }}
            />
            <Text className="mt-5 text-[21px] font-semibold text-gray-800 px-6 text-center">
              {item.title}
            </Text>
            <Text className="mt-1 mb-36 text-center text-gray-600 px-6 text-base">
              {item.description}
            </Text>
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        pagingEnabled
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}
      />

      {/* Page Indicator */}
      <View className="absolute bottom-[210px] w-full flex-row justify-center z-10">
        {onBoarding.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={{
                width: 9,
                height: 9,
                borderRadius: 4,
                backgroundColor: "#00AACE",
                marginHorizontal: 5,
                opacity,
                transform: [{ scale }],
              }}
            />
          );
        })}
      </View>

      <View className="absolute bottom-0 w-full px-6 py-8">
        <CustomButton
          title="Sign In"
          onPress={() => router.push("/(auth)/login")}
          containerStyles="bg-[#00AACE] h-[50px] w-full rounded-2xl"
          textStyles="text-white text-[16px] font-medium"
        />

        <CustomButton
          title="Sign Up"
          onPress={() => router.push("/(auth)/register")}
          containerStyles="border border-[#B5B5B5] h-[50px] w-full rounded-2xl mt-4"
          textStyles="text-gray-600 text-[16px] font-medium"
        />
      </View>
    </View>
  );
};

export default OnboardingPage;
