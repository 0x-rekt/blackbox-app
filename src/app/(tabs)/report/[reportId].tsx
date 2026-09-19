import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../../../lib/api";

type CrashReportStatus = "pending" | "completed" | "false_alarm";

interface CrashReportRead {
  id: string;
  status: CrashReportStatus;
  severity: string;
  summary: string;
  triggered_at: string;
  location_lat: number;
  location_lon: number;
}

const SEV_COLOR: Record<string, string> = {
  MINOR: "text-green-400",
  MODERATE: "text-yellow-400",
  SEVERE: "text-orange-400",
  CRITICAL: "text-red-500",
};
const SEV_BG: Record<string, string> = {
  MINOR: "bg-green-950 border-green-800",
  MODERATE: "bg-yellow-950 border-yellow-800",
  SEVERE: "bg-orange-950 border-orange-800",
  CRITICAL: "bg-red-950 border-red-800",
};
const SEV_ICON: Record<string, string> = {
  MINOR: "ℹ️",
  MODERATE: "⏱️",
  SEVERE: "⚠️",
  CRITICAL: "🆘",
};

export default function ReportScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<CrashReportRead | null>(null);
  const [polling, setPolling] = useState(true);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const d = setInterval(
      () => setDots((p) => (p.length >= 3 ? "" : p + ".")),
      500,
    );
    return () => clearInterval(d);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get<CrashReportRead>(`/crash/reports/${reportId}`);
        if (res.data.status === "completed") {
          setReport(res.data);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [reportId]);

  if (polling || !report) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center gap-6 px-8">
        <ActivityIndicator size="large" color="#7c3aed" />
        <View className="items-center gap-2">
          <Text className="text-white text-lg font-semibold">
            AI reconstruction in progress{dots}
          </Text>
          <Text className="text-gray-500 text-sm text-center">
            Analyzing crash data and generating forensic report
          </Text>
        </View>
      </View>
    );
  }

  const sev = report.severity || "MINOR";
  const details = [
    {
      label: "📍 Location",
      value: `${report.location_lat.toFixed(5)}, ${report.location_lon.toFixed(5)}`,
    },
  ].filter((d) => d.value);

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="p-5 gap-4"
    >
      <View className={`rounded-2xl p-6 items-center border ${SEV_BG[sev]}`}>
        <Text style={{ fontSize: 48 }}>{SEV_ICON[sev]}</Text>
        <Text className="text-gray-400 text-xs mt-2 mb-1">Severity</Text>
        <Text className={`${SEV_COLOR[sev]} text-4xl font-bold`}>{sev}</Text>
      </View>

      {report.summary && (
        <View className="bg-gray-900 rounded-2xl p-4">
          <Text className="text-gray-400 text-xs mb-2">Summary</Text>
          <Text className="text-white text-base leading-7">
            {report.summary}
          </Text>
        </View>
      )}

      <View className="bg-gray-900 rounded-2xl p-4 gap-3">
        <Text className="text-gray-400 text-xs mb-1">Details</Text>
        {details.map(({ label, value }) => (
          <View key={label} className="flex-row justify-between items-start">
            <Text className="text-gray-400 flex-shrink-0">{label}</Text>
            <Text className="text-white font-medium ml-4 text-right flex-1">
              {value}
            </Text>
          </View>
        ))}
      </View>

      <Text className="text-gray-600 text-xs text-center">
        Report triggered {new Date(report.triggered_at).toLocaleString()}
      </Text>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-gray-900 rounded-2xl py-4 items-center"
      >
        <Text className="text-gray-300 font-medium">← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
