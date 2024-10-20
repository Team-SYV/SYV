import { FlatList, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { interviewTipsData } from "@/constants/interviewTipsData";

const Slider = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCardPress = (item) => {
    if (!isNavigating) {
      setIsNavigating(true);
      router.push({
        pathname: "/(tabs)/home/interview-tips/[id]",
        params: { id: item.id },
      });

      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  return (
    <View>
      <FlatList
        data={interviewTipsData}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCardPress(item)}
            activeOpacity={0.8}
            disabled={isNavigating}
          >
            <View className="mr-4 w-[155px]">
              <Image
                source={{ uri: item.image }}
                className="h-[145px] rounded-2xl"
                resizeMode="cover"
              />
              <Text className="text-[11px] p-1">{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Slider;
