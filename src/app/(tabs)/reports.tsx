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

const STATUS_STYLE: Record<CrashReportStatus, string> = {
  pending: "bg-yellow-950 text-yellow-400",
  completed: "bg-green-950 text-green-400",
  false_alarm: "bg-gray-800 text-gray-400",
};

export default function ReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<CrashReportRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/crash/reports");
      setReports(res.data);
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
      {reports.length === 0 && (
        <View className="items-center mt-20 gap-3">
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text className="text-gray-400">No crash reports yet.</Text>
        </View>
      )}

      {reports.map((report) => {
        const statusStyle = STATUS_STYLE[report.status];
        const [statusBackground, statusColor] = statusStyle.split(" ");

        return (
          <TouchableOpacity
            key={report.id}
            onPress={() => router.push(`/(tabs)/report/${report.id}`)}
            className="bg-gray-900 rounded-2xl p-4 gap-2"
            activeOpacity={0.7}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400 text-xs font-mono">
                {report.id.slice(0, 12)}…
              </Text>
              <View className={`px-2 py-1 rounded-full ${statusBackground}`}>
                <Text className={`text-xs font-medium ${statusColor}`}>
                  {STATUS_LABEL[report.status]}
                </Text>
              </View>
            </View>
            <Text className="text-white font-medium">
              {new Date(report.triggered_at).toLocaleString()}
            </Text>
            <Text className="text-gray-500 text-sm">
              {report.location_lat.toFixed(5)}, {report.location_lon.toFixed(5)}
            </Text>
            {report.severity && (
              <Text className="text-gray-400 text-sm">
                Severity: {report.severity}
              </Text>
            )}
            <Text className="text-violet-400 text-sm">Tap to view report →</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
