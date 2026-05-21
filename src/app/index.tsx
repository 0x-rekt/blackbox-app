import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded, signOut } = useAuth();

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
    <View className="flex-1 bg-neutral-950 justify-center items-center gap-6">
      <Text className="text-white text-2xl font-semibold">Home Page</Text>

      <Pressable
        onPress={() => signOut()}
        style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
        className="bg-violet-600 active:bg-violet-700 rounded-xl px-8 py-3"
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Text className="text-white text-base font-semibold">Logout</Text>
      </Pressable>
    </View>
  );
}
