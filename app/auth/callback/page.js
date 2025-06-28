// pages/auth/callback.js or app/auth/callback/page.js
"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // Add debug logging for troubleshooting
    console.log("Callback received - processing auth response");

    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId"); // Add this to capture userId explicitly passed from backend

    console.log(`Token received: ${token ? "Yes" : "No"}`);
    console.log(`Role received: ${role || "Not provided"}`);
    console.log(`UserId received: ${userId || "Not provided"}`);

    if (token) {
      const cookieOptions = {
        expires: 7, // 7 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      };

      // Store core auth data
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      Cookies.set("token", token, cookieOptions);
      Cookies.set("role", role, cookieOptions);

      // Handle userId - prefer from URL params first, then decode from token
      let decodedUser = null;
      let userIdFromToken = null;

      try {
        decodedUser = jwtDecode(token);
        console.log("Token decoded successfully:", decodedUser);

        // Extract user ID from various possible fields
        userIdFromToken =
          decodedUser.id ||
          decodedUser.userId ||
          decodedUser.sub ||
          decodedUser.nameid;

        // Use userId from params if available, otherwise use from token
        const finalUserId = userId || userIdFromToken;

        if (finalUserId) {
          localStorage.setItem("userId", finalUserId);
          Cookies.set("userId", finalUserId, cookieOptions);
          console.log(`User ID stored: ${finalUserId}`);
        }

        // Store user data
        if (decodedUser) {
          localStorage.setItem("user", JSON.stringify(decodedUser));

          if (decodedUser.fullName || decodedUser.name) {
            const fullName = decodedUser.fullName || decodedUser.name;
            localStorage.setItem("fullName", fullName);
            Cookies.set("fullName", fullName, cookieOptions);
          }

          if (decodedUser.email) {
            localStorage.setItem("email", decodedUser.email);
            Cookies.set("email", decodedUser.email, cookieOptions);
          }

          if (decodedUser.image || decodedUser.picture) {
            const profileImage = decodedUser.image || decodedUser.picture;
            localStorage.setItem("profileImage", profileImage);
            Cookies.set("profileImage", profileImage, cookieOptions);
          }
        }
      } catch (e) {
        console.error("Error decoding JWT token:", e);
      }

      // Update Redux state
      dispatch(
        setLoginState({
          isLoggedIn: true,
          user: decodedUser || {},
          role,
          token,
          userId: userId || userIdFromToken,
        })
      );

      console.log(`Redirecting user with role: ${role}`);

      // Redirect based on role
      if (role === "Admin") {
        window.location.href = "/admin-dashboard/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      console.error("No token found in callback URL");
      // Handle error - redirect to login with message
      router.push("/login?error=auth_failed");
    }
  }, [router, searchParams, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Đang đăng nhập bằng Google...</p>
      </div>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
