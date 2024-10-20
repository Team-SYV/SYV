import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
interface CompanyInputProps extends TextInputProps {
  title: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  otherStyles?: string;
}

const CompanyFormField: React.FC<CompanyInputProps> = ({
  title,
  value,
  placeholder,
  onChangeText,
  otherStyles,
  ...props
}) => {
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View className="h-[45px] mr-4 relative px-1 rounded-xl border border-[#6e6e6e] flex flex-row items-center">
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType="default"
          className="flex-1 px-2 bg-white text-[13px] text-[#5D5D5D] placeholder:text-[#5D5D5D]"
          {...props}
        />
      </View>
    </View>
  );
};

export default CompanyFormField;
