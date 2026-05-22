import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { setAuthToken } from "../lib/api";

export const useInitializeAuth = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const initializeToken = async () => {
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);
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
