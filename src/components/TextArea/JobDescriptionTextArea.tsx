import React from "react";
import { TextInput, View } from "react-native";

interface TextAreaProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyles?: string;
  textInputStyles?: string;
}

const JobDescriptionTextArea: React.FC<TextAreaProps> = ({
  placeholder = "",
  value,
  onChangeText,
  containerStyles = "",
  textInputStyles = "",
}) => {
  return (
    <View className={`${containerStyles}`}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        className={`border border-[#6e6e6e] rounded-lg text-[13px] p-3 h-36
          ${textInputStyles}`}
      />
    </View>
  );
};

export default JobDescriptionTextArea;
