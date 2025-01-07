import { View, Text, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Slider from "@/components/Card/Slider";
import Card from "@/components/Card/Card";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import SubscriptionModal from "@/components/Modal/SubscriptionModal";

const Home = () => {
  const router = useRouter();
  const { user } = useUser();

  const [modalVisible, setModalVisible] = useState(false);
  const isSubscribed = useRef(false);

  useEffect(() => {
    isSubscribed.current = !!user.unsafeMetadata.subscribed;
    if (isSubscribed.current) {
      setModalVisible(false);
    }
  }, [user]);

  return (
    <View className="p-4 bg-white min-h-full">
      <View className="flex flex-row items-center mt-8">
        <Text className="text-[20px] font-semibold">Welcome</Text>
        <Image
          source={require("@/assets/icons/hand.png")}
          className="ml-1 w-7 h-7"
        />
      </View>

      <Text className="text-[12px] font-light mt-1">
        Get ready to ace interviews and advance your career with ease.
      </Text>

      <Text className="text-[13px] font-medium mt-9 mb-3">
        Practice Interview
      </Text>

      <View className="mb-4">
        <Card
          imageSource={require("@/assets/images/virtual-interview.png")}
          text="Talk with Virtual Interviewer"
          textClassName="text-[12px]"
          onPress={() =>
            isSubscribed.current
              ? router.push("/(tabs)/home/virtual-interview/job-information")
              : setModalVisible(true)
          }
        />
      </View>

      <Card
        imageSource={require("@/assets/images/record-yourself.png")}
        text="Record Yourself"
        textClassName="text-[14px]"
        onPress={() =>
          router.push("/(tabs)/home/record-yourself/job-information")
        }
      />

      <Text className="text-[13px] font-medium mt-9 mb-3">
        Read Interview Tips
      </Text>

      <Slider />
      <SubscriptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Home;
