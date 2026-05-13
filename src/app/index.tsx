import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-neutral-950 justify-center items-center">
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <View className="flex-1 bg-neutral-950 justify-center items-center">
      <Text className="text-white text-2xl">Home Page</Text>
    </View>
  );
}
