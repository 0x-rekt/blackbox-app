import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function DashboardScreen() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const locationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-refresh GPS every 5s
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location required", "Enable location access in settings.");
        return;
      }
      const refresh = async () => {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      };
      await refresh();
      locationTimer.current = setInterval(refresh, 5000);
    })();
    return () => {
      if (locationTimer.current) clearInterval(locationTimer.current);
    };
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="p-5 gap-4"
    >
      {/* GPS card */}
      <View className="bg-gray-900 rounded-2xl p-4">
        <Text className="text-gray-400 text-xs mb-2">📍 Current location</Text>
        {location ? (
          <Text className="text-white font-medium">
            {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
          </Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#7c3aed" />
            <Text className="text-gray-500">Acquiring GPS…</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}
