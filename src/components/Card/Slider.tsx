import { FlatList, Text, View, Image } from "react-native";
import React from "react";

const data = [
  {
    title: "Most Common Interview Questions with Answer",
    image:
      "https://www.apcinc.com/wp-content/uploads/2023/09/Job-Interview-2.png",
  },
  {
    title: "Most Common Interview Questions with Answer",
    image:
      "https://newsroom.haas.berkeley.edu/wp-content/uploads/2018/07/AdobeStock_267017177-job-interview-tiny-scaled.jpeg",
  },
  {
    title: "Most Common Interview Questions with Answer",
    image:
      "https://static1.squarespace.com/static/5e62c2a449e8484d6ccc9c2b/t/6356a38bf33a6d5962aa9192/1666622347442/male-applicant-having-job-interview.jpg?format=1500w",
  },
];

const Slider = () => {
  return (
    <View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="mr-4 w-[155px]">
            <Image
              source={{ uri: item.image }}
              className="h-[155px] rounded-2xl"
              resizeMode="cover"
            />
            <Text className="text-[11px] p-1">{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Slider;
