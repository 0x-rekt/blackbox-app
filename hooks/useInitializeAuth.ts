import { useAuth } from "@clerk/expo";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { api, setAuthToken } from "../lib/api";

export const useInitializeAuth = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const initializeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);

          if (Device.isDevice) {
            const permissions = await Notifications.getPermissionsAsync();
            let status = permissions.status;
            if (status !== "granted") {
              status = (await Notifications.requestPermissionsAsync()).status;
            }

            if (status === "granted") {
              const pushToken = (await Notifications.getExpoPushTokenAsync())
                .data;
              await api.patch("/users/me", { push_token: pushToken });
            }
          }
        } catch (error) {
          console.error("Failed to get auth token:", error);
        }
      } else {
        setAuthToken(null);
      }
    };

    initializeToken();
  }, [isSignedIn, getToken]);
};
