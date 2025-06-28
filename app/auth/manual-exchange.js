// pages/auth/manual-exchange.js or app/auth/manual-exchange/page.js
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ManualExchange() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      console.error("No code found in manual exchange URL");
      router.push("/login?error=missing_code");
      return;
    }

    console.log("Manual exchange - sending code to backend");

    // Call your backend's manual exchange endpoint
    fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://job-finder-kjt2.onrender.com"
      }/api/auth/manual-exchange?code=${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        console.log("Manual exchange response:", response.status);

        if (response.status === 200 || response.redirected) {
          // If successfully redirected, follow the redirect
          window.location.href = response.url;
        } else {
          router.push("/login?error=exchange_failed");
        }
      })
      .catch((error) => {
        console.error("Manual exchange error:", error);
        router.push("/login?error=exchange_error");
      });
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  );
}
