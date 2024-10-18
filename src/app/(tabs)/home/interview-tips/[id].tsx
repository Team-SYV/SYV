import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { interviewTipsData } from "@/constants/interviewTipsData";

const ArticleDetails = () => {
  const { id } = useLocalSearchParams();
  const tip = interviewTipsData.find((tip) => tip.id === id);

  if (!tip) {
    return (
      <Text className="flex items-center justify-center text-gray-600">
        No tips found for this selection.
      </Text>
    );
  }

  return (
    <ScrollView className="px-5 py-3 bg-white">
      <Text className="text-[20px] font-bold">{tip.title}</Text>
      <Text className="text-[12px] font-light mt-3"> {tip.author} </Text>

      {tip.image && (
        <Image
          source={{ uri: tip.image }}
          className="mt-2 h-[200px] w-full rounded-lg"
          resizeMode="cover"
        />
      )}

      {tip.type === "qa" && (
        <View className="mt-5 mb-5">
          {tip.contents.map((item, index) => (
            <View key={index} className="mb-5">
              <Text className="font-bold text-[15px]">{item.question}</Text>
              <Text className="mt-1 text-sm">{item.description}</Text>

              <Text className="font-medium mt-3 text-[14px]">
                What it means:
              </Text>
              <Text className="mt-1 text-sm">{item.whatItMeans} </Text>

              <Text className="font-medium mt-3 mb-1 text-[14px]">
                How to answer:
              </Text>
              {item.howToAnswer.map((step, stepIndex) => (
                <Text key={stepIndex} className="ml-1 mb-1 text-sm">
                  - {step}
                </Text>
              ))}

              <Text className="font-medium mt-3 text-[14px]">
                Sample answer:
              </Text>
              <Text className="mt-1 text-sm">{item.sampleAnswer}</Text>
            </View>
          ))}
        </View>
      )}

      {tip.type === "mistakes" && (
        <View className="mt-5 mb-5">
          {tip.content.map((item, index) => (
            <View key={index} className="mb-5">
              <Text className="font-bold text-[15px]">{item.mistake}</Text>
              <Text className="mt-1 text-sm">{item.description}</Text>

              <Text className="font-semibold mt-3 text-[13px]">
                How to Avoid:
              </Text>
              <Text className="mt-1 text-sm">{item.howToAvoid}</Text>
            </View>
          ))}
        </View>
      )}

      {tip.type === "prepare" && (
        <View className="mt-5 mb-5">
          {tip.content.map((item, index) => (
            <View key={index} className="mb-5">
              <Text className="font-bold text-[15px]">{item.step}</Text>
              <Text className="mt-1 text-sm">{item.description}</Text>

              <Text className="font-semibold mt-3 mb-2 text-[13px]">Tips:</Text>
              {item.tips.map((tip, tipIndex) => (
                <Text key={tipIndex} className="ml-1 mb-1 text-sm">
                  - {tip}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default ArticleDetails;
