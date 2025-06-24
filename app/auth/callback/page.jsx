"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";

export default function Callback() {
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
      try {
        user = jwtDecode(token);
      } catch (e) {}
      dispatch(
        setLoginState({
          isLoggedIn: true,
          user: user || {},
          role,
          token,
        })
      );
      // Redirect: Admin về dashboard, còn lại về home
      if (role === "Admin") {
        router.replace("/admin-dashboard/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [router, searchParams, dispatch]);

  return <div>Đang đăng nhập bằng Google...</div>;
}
