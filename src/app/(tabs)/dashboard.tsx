import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../lib/api";

type CrashReportStatus = "pending" | "completed" | "false_alarm";

interface CrashReportRead {
  id: string;
  status: CrashReportStatus;
  severity: string | null;
  triggered_at: string;
  location_lat: number;
  location_lon: number;
}

const STATUS_LABEL: Record<CrashReportStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  false_alarm: "False alarm",
};

export default function DashboardScreen() {
  const router = useRouter();
  const [latestReport, setLatestReport] = useState<CrashReportRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestReport = async () => {
      try {
        const res = await api.get<CrashReportRead[]>("/crash/reports");
        const reports = [...res.data].sort(
          (a, b) =>
            new Date(b.triggered_at).getTime() -
            new Date(a.triggered_at).getTime(),
        );
        setLatestReport(reports[0] ?? null);
      } catch {
        setLatestReport(null);
      } finally {
        setLoading(false);
      }
    };

    loadLatestReport();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="p-5 gap-4"
    >
      {/* Paired device */}
      <View className="bg-gray-900 rounded-2xl p-4">
        <Text className="text-gray-400 text-xs mb-2">📡 Paired device</Text>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-semibold">BlackBox ESP32</Text>
            <Text className="text-gray-500 text-sm mt-1">Demo unit</Text>
          </View>
          <View className="items-end">
            <Text className="text-green-400 font-medium">Online</Text>
            <Text className="text-gray-500 text-xs mt-1">Last seen just now</Text>
          </View>
        </View>
      </View>

      {/* Most recent crash report */}
      <View className="bg-gray-900 rounded-2xl p-4 gap-3">
        <Text className="text-gray-400 text-xs">Most recent crash report</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#7c3aed" />
        ) : latestReport ? (
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/report/${latestReport.id}`)}
            activeOpacity={0.7}
            className="gap-2"
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-semibold">
                {latestReport.severity ?? "Incident"}
              </Text>
              <Text className="text-violet-400 text-sm">
                {STATUS_LABEL[latestReport.status]}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm">
              {new Date(latestReport.triggered_at).toLocaleString()}
            </Text>
            <Text className="text-gray-500 text-sm">
              {latestReport.location_lat.toFixed(5)}, {latestReport.location_lon.toFixed(5)}
            </Text>
            <Text className="text-violet-400 text-sm">Tap to view report →</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-500">No incidents yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}
