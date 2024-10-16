import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomInputProps extends TextInputProps {
  title: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  otherStyles?: string;
}

const CustomFormField: React.FC<CustomInputProps> = ({
  title,
  value,
  placeholder,
  onChangeText,
  otherStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPasswordField = title === "Password" || title === "ConfirmPassword";

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <View
        className={`relative w-full h-[50px] px-1 rounded-2xl border bg-[#FBFBFB] ${
          isFocused ? "border-[#B5B5B5]" : "border-[#E2E2E2]"
        } flex flex-row items-center`}
      >
        <TextInput
          key={
            isPasswordField ? (showPassword ? "text" : "password") : undefined
          }
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPasswordField && !showPassword}
          className="flex-1 px-2 bg-[##FBFBFB] text-sm text-[#4C4C4C] placeholder:text-[#4C4C4C]"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPasswordField && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-4"
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={22}
              color="#4C4C4C"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomFormField;
