import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import GetPro from "./GetPro";
import SubscriptionModal from "../Modal/SubscriptionModal";

const SubscribeButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View className="mx-6 mt-5">
        <Pressable
          className="flex-row items-center justify-between px-2 py-2 border border-gray-200 rounded-lg"
          onPress={() => setModalVisible(true)} 
        >
          <View className="flex-row items-center">
            <MaterialIcons
              name="subscriptions"
              size={17}
              style={{ marginRight: 8 }}
            />
            <Text className="text-[13px]">Subscribe to pro plan</Text>
          </View>
          <GetPro />
        </Pressable>
      </View>

      <SubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default SubscribeButton;
