import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Platform,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  sessionId: string;
  onConfirmed: () => void;
  onDismissed: () => void;
}

const COUNTDOWN = 20;

export default function CrashAlert({
  visible,
  sessionId,
  onConfirmed,
  onDismissed,
}: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confirmedRef = useRef(false); // prevent double-fire

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const fireConfirm = useCallback(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    clearInterval(timerRef.current!);
    Vibration.cancel();
    pulseAnim.stopAnimation();
    onConfirmed();
  }, [onConfirmed]);

  useEffect(() => {
    if (!visible) {
      confirmedRef.current = false;
      return;
    }

    setSeconds(COUNTDOWN);
    startPulse();

    if (Platform.OS === "android") {
      Vibration.vibrate([0, 500, 300, 500, 300, 500]);
    }

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          fireConfirm();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current!);
      pulseAnim.stopAnimation();
      Vibration.cancel();
    };
  }, [visible]);

  const handleDismiss = () => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;
    clearInterval(timerRef.current!);
    Vibration.cancel();
    pulseAnim.stopAnimation();
    onDismissed();
  };

  const progress = seconds / COUNTDOWN;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/95 items-center justify-center px-6">
        {/* Pulsing icon */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="w-44 h-44 rounded-full border-4 border-red-500 items-center justify-center mb-8"
        >
          <Text style={{ fontSize: 72 }}>🚨</Text>
        </Animated.View>

        <Text className="text-white text-2xl font-bold text-center mb-3">
          Crash Detected
        </Text>
        <Text className="text-gray-400 text-center text-base mb-8 leading-6">
          A sudden impact was detected. Were you in an accident?
          {"\n"}Emergency services will be alerted if there's no response.
        </Text>

        {/* Countdown bar */}
        <View className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <View
            className="bg-red-500 h-2 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
        <Text className="text-gray-500 text-sm mb-10">
          Auto-alerting in{" "}
          <Text className="text-red-400 font-bold text-base">{seconds}s</Text>
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          onPress={fireConfirm}
          className="w-full bg-red-600 rounded-2xl py-5 items-center mb-4"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">
            🆘 Yes, I need help
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDismiss}
          className="w-full bg-gray-800 rounded-2xl py-5 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-gray-300 font-semibold text-lg">
            ✅ No, I'm fine — cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
