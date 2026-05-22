import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { api } from "../../../lib/api";

interface Session {
  session_id: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
}

export default function SessionsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/telemetry/sessions");
      setSessions(res.data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="p-5 gap-3"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      {sessions.length === 0 && (
        <View className="items-center mt-20 gap-3">
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text className="text-gray-400">
            No sessions yet. Start one on the Dashboard.
          </Text>
        </View>
      )}

      {sessions.map((s) => (
        <TouchableOpacity
          key={s.session_id}
          onPress={() => router.push(`/(tabs)/report/${s.session_id}`)}
          className="bg-gray-900 rounded-2xl p-4 gap-2"
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-xs font-mono">
              {s.session_id.slice(0, 12)}…
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${s.is_active ? "bg-green-900" : "bg-gray-800"}`}
            >
              <Text
                className={`text-xs font-medium ${s.is_active ? "text-green-400" : "text-gray-400"}`}
              >
                {s.is_active ? "Active" : "Ended"}
              </Text>
            </View>
          </View>
          <Text className="text-white font-medium">
            {new Date(s.started_at).toLocaleString()}
          </Text>
          {s.ended_at && (
            <Text className="text-gray-500 text-sm">
              Ended {new Date(s.ended_at).toLocaleString()}
            </Text>
          )}
          <Text className="text-violet-400 text-sm">Tap to view report →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
