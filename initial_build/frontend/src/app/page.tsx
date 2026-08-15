"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, apiFetch } from "./config";
import Script from "next/script";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleCallback = async (response: any) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("session_token", data.session_token);
        localStorage.setItem("user_email", data.email);
        if (data.name) localStorage.setItem("user_name", data.name);
        if (data.avatar_url) localStorage.setItem("user_avatar", data.avatar_url);
        router.push("/dashboard");
      } else {
        setError("Invalid Google Sign-In");
      }
    } catch (error) {
      console.error("Login failed", error);
      setError("Failed to connect to server");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: "717818816381-fhuud0lguf7djggk4nq2d3l38g8cejki.apps.googleusercontent.com", // Your Google Client ID
            callback: handleGoogleCallback
          });
          (window as any).google.accounts.id.renderButton(
            document.getElementById("google-signin-button"),
            { theme: "outline", size: "large", width: "100%" }
          );
        }
      }} />
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">MediCare</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to manage medications</p>
        </div>

        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}
        
        <div className="flex justify-center w-full" id="google-signin-button"></div>
      </div>
    </main>
  );
}

