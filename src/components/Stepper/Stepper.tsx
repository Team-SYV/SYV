import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface StepperProps {
  isActive: boolean;
  onStepPress: (step: number) => void;
  index: number;
  isCompleted: boolean;
  section: SectionProps;
}

interface SectionProps {
  title: string;
}

interface FieldTitleProps {
  title: string;
}

const Stepper = ({
  isActive,
  onStepPress,
  section,
  index,
  isCompleted,
}: StepperProps) => {
  return (
    <View
      className={`relative flex-row items-center ${isActive ? "mb-3" : "mb-8"}`}
    >
      <View className="flex items-center">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => onStepPress(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted
                ? "bg-[#00AACE]"
                : `border-2 ${
                    isActive ? "border-[#00AACE]" : "border-gray-300"
                  }`
            }`}
          >
            {isCompleted && (
              <MaterialIcons name="check" size={20} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onStepPress(index)}
            className="ml-3"
          >
            <FieldTitle title={section.title} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const FieldTitle = ({ title }: FieldTitleProps) => {
  return <Text className="text-base text-gray-800">{title}</Text>;
};

export default Stepper;
