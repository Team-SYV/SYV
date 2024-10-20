import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

interface InterviewTypeCardProps {
  imageSource: ImageSourcePropType;
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
}

const InterviewTypeCard: React.FC<InterviewTypeCardProps> = ({
  imageSource,
  title,
  description,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View
        className={`rounded-xl shadow-lg overflow-hidden m-3 w-44 h-44 ${
          isSelected ? "bg-[#BBEEF8]" : "bg-[#EBEAEA]"
        }`}
      >
        <Image
          source={imageSource}
          className="h-9 w-9 mx-auto mt-4"
          resizeMode="cover"
        />
        <View className="p-1">
          <Text className="text-base font-semibold mb-1 text-center text-black">
            {title}
          </Text>
          <Text className="text-[10px] mx-2 font-light">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InterviewTypeCard;
