import { Tabs } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useAuth } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getFocusedRouteNameFromRoute, Route } from "@react-navigation/native";
import { Text, View, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const TabLayout = () => {
  const { isSignedIn } = useAuth();

  // Helper function to hide tab bar and header on specific routes
  const shouldProfileTabBarBeVisible = (route: Route<string>) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "profile";
    return !(routeName === "edit-profile");
  };

  const shouldHomeTabBarBeVisible = (route: Route<string>) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "home";
    return !(
      routeName === "interview-tips" ||
      routeName === "[id]" ||
      routeName === "virtual-interview" ||
      routeName === "record-yourself"
    );
  };

  const shouldHeaderBeShown = (route: Route<string>) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "home";
    return !(
      routeName === "interview-tips" ||
      routeName === "[id]" ||
      routeName === "virtual-interview" ||
      routeName === "record-yourself"
    );
  };

  const HeaderLeft = () => (
    <View className="flex-row items-center">
      <Image
        source={require("@/assets/images/syv.png")}
        className="w-8 h-8 ml-2"
      />
      <Text className="text-white text-[17px] font-semibold"> Savy </Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        tabBarActiveTintColor: "#008FAE",
        tabBarInactiveTintColor: "#7F7F7F",
        tabBarStyle: {
          height: 54,
          position: "absolute",
          bottom: 10,
          left: 10,
          right: 10,
          borderRadius: 15,
          borderTopWidth: 0,
          shadowColor: "#000",
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 6,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={({ route }) => ({
          tabBarIcon: ({ size, color }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
          tabBarLabel: "Home",
          headerShown: shouldHeaderBeShown(route),
          tabBarStyle: shouldHomeTabBarBeVisible(route)
            ? {
                height: 54,
                position: "absolute",
                bottom: 10,
                left: 10,
                right: 10,
                borderRadius: 15,
                borderTopWidth: 0,
                shadowColor: "#000",
                elevation: 5,
              }
            : { display: "none" },
          headerStyle: {
            backgroundColor: "#009CBD",
            height: 75,
          },
          headerLeft: () => <HeaderLeft />,
          headerTitle: () => null,
        })}
        redirect={!isSignedIn}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
          tabBarLabel: "History",
        }}
        redirect={!isSignedIn}
      />

      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ size, color }) => (
            <AntDesign name="barschart" size={size} color={color} />
          ),
          tabBarLabel: "Progress",
        }}
        redirect={!isSignedIn}
      />

      <Tabs.Screen
        name="profile"
        options={({ route }) => ({
          tabBarIcon: ({ size, color }) => (
            <FontAwesome5 name="user-circle" size={size} color={color} />
          ),
          tabBarLabel: "Profile",
          tabBarStyle: shouldProfileTabBarBeVisible(route)
            ? {
                height: 56,
                position: "absolute",
                bottom: 10,
                left: 8,
                right: 8,
                borderRadius: 15,
                borderTopWidth: 0,
                shadowColor: "#000",
                elevation: 5,
              }
            : { display: "none" },
        })}
        redirect={!isSignedIn}
      />
    </Tabs>
  );
};

export default TabLayout;
