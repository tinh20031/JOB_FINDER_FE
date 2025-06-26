"use client";

import Link from "next/link";
import { authService } from "@/services/authService";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import LoginWithSocial from "../shared/LoginWithSocial";

const FormContent = ({ isPopup = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const closeBtnRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const responseData = await authService.login(
        formData.email,
        formData.password
      );
      let user = responseData.user || {};
      let userId = user.id || user.userId;
      if (!userId && responseData.token) {
        try {
          const decoded = jwtDecode(responseData.token);
          userId = decoded.sub;
        } catch (e) {}
      }
      if (userId) {
        user.id = userId;
      }
      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
      }
      const userInfo = {
        fullName: user.fullName || "",
        avatar: user.image || "/images/resource/company-6.png",
        email: user.email || formData.email,
      };
      await Promise.all([
        new Promise((resolve) => {
          localStorage.setItem("user", JSON.stringify(user));
          if (user.id) {
            localStorage.setItem("userId", user.id);
          }
          resolve();
        }),
        new Promise((resolve) => {
          dispatch(
            setLoginState({
              isLoggedIn: true,
              user: user,
              role: responseData.role,
              token: responseData.token,
            })
          );
          resolve();
        }),
      ]);
      if (isPopup && closeBtnRef.current) {
        closeBtnRef.current.click();
      }
      const userRole = responseData.role || user.role;
      const redirectPath =
        userRole === "Admin" ? "/admin-dashboard/dashboard" : "/";
      window.location.href = redirectPath;
    } catch (error) {
      // Handle unverified email
      if (
        error.response &&
        error.response.data &&
        error.response.data.requiresVerification
      ) {
        setShowVerification(true);
        setPendingEmail(error.response.data.email || formData.email);
        setPendingUserId(error.response.data.userId);
        setVerificationMessage(
          error.response.data.message ||
            "Email chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực tài khoản trước khi đăng nhập."
        );
      } else if (
        error.message &&
        error.message.includes("requiresVerification")
      ) {
        // fallback for thrown error with requiresVerification
        try {
          const errObj = JSON.parse(error.message);
          if (errObj.requiresVerification) {
            setShowVerification(true);
            setPendingEmail(errObj.email || formData.email);
            setPendingUserId(errObj.userId);
            setVerificationMessage(
              errObj.message ||
                "Email chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực tài khoản trước khi đăng nhập."
            );
          }
        } catch {
          setError(error.message);
        }
      } else if (
        error.message &&
        (error.message.includes("401") ||
          error.message.includes("Invalid credentials"))
      ) {
        setError("Incorrect password. Please try again.");
      } else if (error.message && error.message.includes("Unexpected token")) {
        setError("Network or server error.");
      } else {
        setError(error.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyEmail(pendingEmail, verificationCode);
      setVerificationMessage(
        res || "Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ."
      );
      setShowVerification(false);
      setError("");
      // Optionally, auto-fill the email for login
      setFormData((prev) => ({ ...prev, email: pendingEmail }));
      // Optionally, show a toast or message
    } catch (error) {
      setError(error.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authService.resendVerification(pendingEmail);
      setVerificationMessage(
        res || "Mã xác thực đã được gửi lại đến email của bạn."
      );
    } catch (error) {
      setError(error.message || "Không thể gửi lại mã xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-inner">
      <h3>Login to JobFinder</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {!showVerification ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <div className="field-outer">
              <div className="input-group checkboxes square">
                <input type="checkbox" name="remember-me" id="remember" />
                <label htmlFor="remember" className="remember">
                  <span className="custom-checkbox"></span> Remember me
                </label>
              </div>
              <a href="#" className="pwd">
                Forgot password?
              </a>
            </div>
          </div>
          <div className="form-group">
            <button
              className="theme-btn btn-style-one"
              type="submit"
              name="log-in"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
          {isPopup && (
            <button
              ref={closeBtnRef}
              data-bs-dismiss="modal"
              style={{ display: "none" }}
            ></button>
          )}
        </form>
      ) : (
        <div className="verification-section">
          {verificationMessage && (
            <div className="alert alert-success">{verificationMessage}</div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Nhập mã xác thực đã gửi đến email của bạn</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="form-control"
                placeholder="Verification code"
              />
            </div>
            <div className="form-group">
              <button
                className="theme-btn btn-style-one"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang xác thực..." : "Xác thực email"}
              </button>
            </div>
          </form>
          <button
            className="btn btn-link"
            onClick={handleResend}
            disabled={loading}
          >
            Gửi lại mã xác thực
          </button>
        </div>
      )}
      <div className="bottom-box">
        <div className="text">
          Don&apos;t have an account?{" "}
          {isPopup ? (
            <Link
              href="#"
              className="call-modal signup"
              data-bs-toggle="modal"
              data-bs-target="#registerModal"
            >
              Signup
            </Link>
          ) : (
            <Link href="/register">Signup</Link>
          )}
        </div>

        <div className="divider"></div>

        <LoginWithSocial />
      </div>
    </div>
  );
};

export default FormContent;
