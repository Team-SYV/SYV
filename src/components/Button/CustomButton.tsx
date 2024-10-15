import React from "react";
import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  containerStyles?: string;
  textStyles?: string;
  onPress?: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
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
      className={`${containerStyles} flex items-center justify-center ${
        isLoading ? "opacity-80" : ""
      }`}
      disabled={isLoading}
      {...props}
    >
      <Text className={`${textStyles} text-center`}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
