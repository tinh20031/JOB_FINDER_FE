// pages/auth/error.js or app/auth/error/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const message = searchParams.get("message");
    setError(message || "Unknown authentication error");

    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Đăng nhập không thành công
          </h2>
          <p className="mb-6 text-gray-700">{error}</p>
          <p className="mb-4 text-sm text-gray-500">
            Tự động chuyển hướng sau {countdown} giây...
          </p>
          <div>
            <Link
              href="/login"
              className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
