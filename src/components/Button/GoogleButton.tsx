import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  Image,
  View,
} from "react-native";

interface GoogleButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  containerStyles?: string;
  textStyles?: string;
  onPress?: () => void;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  title,
  onPress,
  containerStyles,
  textStyles,
  isLoading,
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`border border-gray-300 rounded-2xl ${containerStyles} ${
        isLoading ? "opacity-80" : ""
      }`}
      disabled={isLoading}
      {...props}
    >
      <View className="flex-row items-center justify-center">
        <Image
          source={require("@/assets/icons/google-logo.png")}
          className="w-7 h-7 mr-5"
          resizeMode="contain"
        />
        <Text className={`${textStyles} text-center text-base`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GoogleButton;
