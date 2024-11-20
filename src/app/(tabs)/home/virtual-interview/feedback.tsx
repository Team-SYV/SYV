import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import ConfirmationModal from "@/components/Modal/ConfirmationModal";
import Spinner from "react-native-loading-spinner-overlay";
import { getFeedback } from "@/api";

const Feedback: React.FC = () => {
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState({
    answerRelevance: "",
    grammar: "",
    eyeContact: "",
    paceOfSpeech: "",
    fillerWords: "",
  });
  const router = useRouter();
  const { interviewId } = useLocalSearchParams();

  useEffect(() => {
    const fetch = async () => {
      try {
        const fetchedFeedback = await getFeedback(interviewId);
        setFeedbackItem({
          answerRelevance: fetchedFeedback[0].answer_relevance,
          grammar: fetchedFeedback[0].grammar,
          eyeContact: fetchedFeedback[0].eye_contact,
          paceOfSpeech: fetchedFeedback[0].pace_of_speech,
          fillerWords: fetchedFeedback[0].filler_words,
        });
      } catch (error) {
        console.error("Error fetching data", error.message);
      }
    };
    if (interviewId) {
      fetch();
    }
  }, [interviewId]);

  const handleProceedToRatings = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(`/home/virtual-interview/ratings?interviewId=${interviewId}`);
    }, 1000);
  };

  // Android back button
  useEffect(() => {
    const backAction = () => {
      setIsConfirmationVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View className="bg-white flex-1">
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "white" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => setIsConfirmationVisible(true)}>
              <AntDesign name="arrowleft" size={24} color="#2a2a2a" />
            </TouchableOpacity>
          ),
        }}
      />

      <Spinner visible={loading} color="#00AACE" />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="p-4">
        <View>
          <Text className="font-medium text-[12px] mb-2 ml-1">
            Answer Relevance
          </Text>
          <Text className="mb-4 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
            {feedbackItem.answerRelevance}
          </Text>
        </View>

        <View>
          <Text className="font-medium text-[12px] mb-2 ml-1">Grammar</Text>
          <Text className="mb-4 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
            {feedbackItem.grammar}
          </Text>
        </View>

        <View>
          <Text className="font-medium text-[12px] mb-2 ml-1">Eye Contact</Text>
          <Text className="mb-4 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
            {feedbackItem.eyeContact}
          </Text>
        </View>

        <View>
          <Text className="font-medium text-[12px] mb-2 ml-1">
            Pace of Speech
          </Text>
          <Text className="mb-4 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
            {feedbackItem.paceOfSpeech}
          </Text>
        </View>

        <View>
          <Text className="font-medium text-[12px] mb-2 ml-1">
            Filler Words
          </Text>
          <Text className="mb-6 text-sm font-light border border-[#E3E3E3] rounded-md px-2 py-2">
            {feedbackItem.fillerWords}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleProceedToRatings}
          className="bg-[#00AACE] h-14 rounded-xl mb-3 justify-center items-center"
          disabled={loading}
        >
          <Text className="text-center text-white text-[15px] font-medium">
            Proceed
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmationModal
        isVisible={isConfirmationVisible}
        title="Discard Recording?"
        message={
          <Text>
            Exiting now will discard your progress. {"\n"} Are you sure you want
            to leave?
          </Text>
        }
        onConfirm={() => {
          setIsConfirmationVisible(false);
          router.push("/home");
        }}
        onClose={() => setIsConfirmationVisible(false)}
      />
    </View>
  );
};

export default Feedback;
