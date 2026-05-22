import { useAuth } from "@clerk/expo";
import { Tabs } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { setAuthToken } from "../../../lib/api";

export default function TabLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1f2937" },
        tabBarActiveTintColor: "#7c3aed",
        tabBarInactiveTintColor: "#6b7280",
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📡</Text>
          ),
          headerRight: () => (
            <TouchableOpacity
              className="mr-4"
              onPress={async () => {
                setAuthToken(null);
                await signOut();
              }}
            >
              <Text className="text-gray-400">Sign out</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarLabel: "Sessions",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🗂️</Text>
          ),
        }}
      />
    </Tabs>
  );
}
