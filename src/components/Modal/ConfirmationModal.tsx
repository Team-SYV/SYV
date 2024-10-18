import React from "react";
import { Modal, View, Text } from "react-native";
import CustomButton from "@/components/Button/CustomButton";

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/40 bg-opacity-50">
        <View className="bg-white p-5 rounded-lg w-4/5 items-center">
          <Text className="text-xl font-bold mb-3">{title}</Text>
          <Text className="text-sm text-center mb-7">{message}</Text>
          <View className="flex-row justify-between w-full">
            <CustomButton
              title={cancelText}
              onPress={onClose}
              containerStyles="bg-gray-100 border border-gray-200 h-12 rounded-xl w-[46%]"
              textStyles="text-gray-700 text-base font-semibold"
            />
            <CustomButton
              title={confirmText}
              onPress={onConfirm}
              containerStyles={`bg-[#FF6347] h-12 rounded-xl w-[46%]`}
              textStyles="text-white text-base font-semibold"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
