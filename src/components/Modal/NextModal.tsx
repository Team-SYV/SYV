import React from "react";
import { Modal, View, Text } from "react-native";
import CustomButton from "../Button/CustomButton";
import { LoadingDots } from "@mrakesh0608/react-native-loading-dots";

interface NextModalProps {
  isVisible: boolean;
  onNext: () => void;
  onClose: () => void;
  isLastQuestion: boolean;
  isLoading: boolean;
}

const NextModal: React.FC<NextModalProps> = ({
  isVisible,
  onNext,
  onClose,
  isLastQuestion,
  isLoading,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/70">
        {isLoading ? (
          <View className="bg-white rounded-xl items-center shadow-lg py-4 px-5">
            <Text className="text-[14px] font-medium mt-4 text-center">
              We’re analyzing your video to generate feedback.
            </Text>
            <Text className="text-[14px] mt-3">
              Please hold on for a moment.
            </Text>
            <LoadingDots
              animation="pulse"
              color="#00AACE"
              containerStyle={{
                padding: 12,
              }}
              dots={4}
              size={12}
              spacing={4}
            />
          </View>
        ) : (
          <View className="bg-white rounded-xl items-center shadow-lg px-16 py-6">
            <Text className="text-lg mb-6">
              {isLastQuestion
                ? "Get your interview results"
                : "Ready for the next question?"}
            </Text>

            <CustomButton
              title={isLastQuestion ? "Get Results" : "Next"}
              onPress={onNext}
              containerStyles="bg-[#00AACE] h-[45px] rounded-3xl px-[82px]"
              textStyles="text-white text-base font-semibold"
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default NextModal;
