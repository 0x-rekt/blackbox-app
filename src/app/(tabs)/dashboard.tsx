import { zodResolver } from "@hookform/resolvers/zod";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { z } from "zod";
import CrashAlert from "../../../components/CrashAlert";
import { api } from "../../../lib/api";
import { useSessionStore } from "../../../store/sessionStore";

const schema = z.object({
  speed: z.coerce.number().min(0, "≥ 0").max(300, "Too high"),
  accel: z.coerce.number().min(-50).max(50),
});
type Form = z.infer<typeof schema>;

export default function DashboardScreen() {
  const router = useRouter();
  const {
    sessionId,
    isActive,
    readings,
    location,
    setLocation,
    setSessionId,
    addReading,
    endSession,
  } = useSessionStore();

  const [starting, setStarting] = useState(false);
  const [crashVisible, setCrashVisible] = useState(false);
  const pendingSession = useRef<string | null>(null);
  const locationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema) as Resolver<Form>,
    defaultValues: { speed: 0, accel: 0 },
  });

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

  const handleStart = async () => {
    try {
      setStarting(true);
      const res = await api.post("/telemetry/session/start");
      setSessionId(res.data.session_id);
    } catch {
      Alert.alert("Error", "Could not start session. Is the backend running?");
    } finally {
      setStarting(false);
    }
  };

  const handleEnd = async () => {
    if (!sessionId) return;
    await api.post(`/telemetry/session/end/${sessionId}`).catch(() => {});
    endSession();
    reset();
  };

  const onSubmit = async (data: Form) => {
    if (!sessionId || !location) {
      Alert.alert("Not ready", "Start a session and wait for GPS lock.");
      return;
    }
    try {
      const res = await api.post("/telemetry/event", {
        session_id: sessionId,
        lat: location.lat,
        lon: location.lon,
        speed: data.speed,
        accel: data.accel,
        timestamp: new Date().toISOString(),
      });

      addReading({
        ...data,
        lat: location.lat,
        lon: location.lon,
        timestamp: new Date().toISOString(),
        crashFlagged: res.data.crash_detected,
      });

      if (res.data.crash_detected) {
        pendingSession.current = sessionId;
        setCrashVisible(true);
      }
    } catch {
      Alert.alert("Submit failed", "Check your connection.");
    }
  };

  const handleCrashConfirmed = async () => {
    setCrashVisible(false);
    const sid = pendingSession.current;
    if (!sid) return;
    try {
      await api.post(`/telemetry/reconstruct/${sid}`);
      router.push(`/(tabs)/report/${sid}`);
    } catch {
      Alert.alert("Error", "Reconstruction request failed.");
    }
  };

  const handleCrashDismissed = async () => {
    setCrashVisible(false);
    const sid = pendingSession.current;
    if (sid) await api.post(`/telemetry/false-alarm/${sid}`).catch(() => {});
    pendingSession.current = null;
  };

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

      {/* Session control */}
      {!isActive ? (
        <TouchableOpacity
          onPress={handleStart}
          disabled={starting}
          className="bg-violet-600 rounded-2xl py-4 items-center"
        >
          {starting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              ▶ Start Session
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View className="flex-row gap-3">
          <View className="flex-1 bg-gray-900 rounded-2xl p-4">
            <Text className="text-gray-400 text-xs">Session active</Text>
            <Text className="text-green-400 font-mono text-sm mt-1">
              {sessionId?.slice(0, 8)}…
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEnd}
            className="bg-red-950 rounded-2xl px-5 items-center justify-center"
          >
            <Text className="text-red-400 font-semibold">■ End</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input form */}
      {isActive && (
        <View className="bg-gray-900 rounded-2xl p-4 gap-4">
          <Text className="text-white font-semibold text-base">
            Log reading
          </Text>

          <View className="gap-1">
            <Text className="text-gray-400 text-xs">Speed (km/h)</Text>
            <Controller
              control={control}
              name="speed"
              render={({ field }) => (
                <TextInput
                  className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
                  keyboardType="numeric"
                  onChangeText={field.onChange}
                  value={String(field.value)}
                  placeholderTextColor="#6b7280"
                  placeholder="0"
                />
              )}
            />
            {errors.speed && (
              <Text className="text-red-400 text-xs">
                {errors.speed.message}
              </Text>
            )}
          </View>

          <View className="gap-1">
            <Text className="text-gray-400 text-xs">Acceleration (m/s²)</Text>
            <Controller
              control={control}
              name="accel"
              render={({ field }) => (
                <TextInput
                  className="bg-gray-800 text-white rounded-xl px-4 py-3 text-base"
                  keyboardType="numeric"
                  onChangeText={field.onChange}
                  value={String(field.value)}
                  placeholderTextColor="#6b7280"
                  placeholder="0"
                />
              )}
            />
            {errors.accel && (
              <Text className="text-red-400 text-xs">
                {errors.accel.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-violet-600 rounded-xl py-4 items-center"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Submit reading</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Recent readings */}
      {readings.length > 0 && (
        <View className="bg-gray-900 rounded-2xl p-4 gap-2">
          <Text className="text-white font-semibold mb-1">Recent readings</Text>
          {readings.slice(0, 5).map((r, i) => (
            <View
              key={i}
              className={`flex-row justify-between items-center px-3 py-2 rounded-xl ${
                r.crashFlagged ? "bg-red-950" : "bg-gray-800"
              }`}
            >
              <Text className={r.crashFlagged ? "text-red-400" : "text-white"}>
                {r.speed} km/h · {r.accel} m/s²
                {r.crashFlagged ? "  🚨" : ""}
              </Text>
              <Text className="text-gray-500 text-xs">
                {new Date(r.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Crash alert modal */}
      <CrashAlert
        visible={crashVisible}
        sessionId={pendingSession.current ?? ""}
        onConfirmed={handleCrashConfirmed}
        onDismissed={handleCrashDismissed}
      />
    </ScrollView>
  );
}
