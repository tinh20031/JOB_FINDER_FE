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
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      Cookies.set("token", token);
      Cookies.set("role", role);
      // Lấy user info từ token nếu có
      let user = null;
      let userId = null;
      try {
        user = jwtDecode(token);
        userId = user.id || user.userId || user.sub || user.nameid;
        // Đảm bảo user object luôn có trường id
        if (!user.id && (user.sub || user.nameid)) {
          user.id = user.sub || user.nameid;
        }
        if (userId) {
          localStorage.setItem("userId", userId);
          Cookies.set("userId", userId);
        }
        // Lưu user object vào localStorage/cookies
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          if (user.fullName) {
            localStorage.setItem("fullName", user.fullName);
            Cookies.set("fullName", user.fullName);
          }
          if (user.email) {
            localStorage.setItem("email", user.email);
            Cookies.set("email", user.email);
          }
          if (user.image || user.avatar) {
            const avatar = user.image || user.avatar;
            localStorage.setItem("profileImage", avatar);
            Cookies.set("profileImage", avatar);
          }
        }
      } catch (e) {}
      dispatch(
        setLoginState({
          isLoggedIn: true,
          user: user || {},
          role,
          token,
        })
      );
      // Reload lại trang để đồng bộ Redux state đăng nhập
      if (role === "Admin") {
        window.location.href = "/admin-dashboard/dashboard";
      } else {
        window.location.href = "/";
      }
    }
  }, [router, searchParams, dispatch]);

  return <div>Logging in with Google...</div>;
}

export default function Callback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
