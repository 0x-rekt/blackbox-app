import useSocialAuth from "@/hooks/useSocialAuth";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
const AuthScreen = () => {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const isLoading = loadingStrategy !== null;

  return (
    <View className="flex-1 bg-neutral-950 px-6 py-12 justify-center">
      {/* Title Section */}
      <View className="mb-12">
        <Text className="text-4xl font-bold text-white mb-3">Welcome</Text>
        <Text className="text-lg text-neutral-400">
          Sign in to continue to your account
        </Text>
      </View>

      {/* Auth Options */}
      <View className="gap-4 mb-8">
        {/* Google Button */}
        <Pressable
          className="flex-row items-center justify-center gap-3 bg-white rounded-xl px-6 py-4 active:scale-95"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          onPress={() => !isLoading && handleSocialAuth()}
        >
          {loadingStrategy === "oauth_google" ? (
            <ActivityIndicator size="small" color="#6C5CE7" />
          ) : (
            <>
              <Ionicons name="logo-google" size={24} color="#1F2937" />
              <Text className="text-lg font-semibold text-neutral-900">
                Continue with Google
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Footer Text */}
      <View className="items-center">
        <Text className="text-sm text-neutral-500">
          By signing in, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
};

export default AuthScreen;
