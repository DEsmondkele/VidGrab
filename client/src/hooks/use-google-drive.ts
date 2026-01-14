import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

export function useGoogleDrive(clientId?: string) {
  const tokenClientRef = useRef<any>();

  useEffect(() => {
    if (!clientId) return;

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [clientId]);

  function requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!clientId) return reject(new Error("Missing Google client id"));
      if (!window.google) return reject(new Error("Google Identity Services not loaded"));

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (resp: any) => {
          if (resp && resp.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error("Failed to obtain access token"));
          }
        },
      });

      try {
        tokenClientRef.current.requestAccessToken({ prompt: "consent" });
      } catch (err) {
        reject(err);
      }
    });
  }

  return { requestAccessToken };
}
