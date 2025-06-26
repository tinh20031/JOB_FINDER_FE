"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const FormContent = ({ onRegistrationSuccess }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Real-time validation
    if (name === "phone") {
      if (!validatePhone(value)) {
        setPhoneError("Invalid phone number. Please enter 10-11 digits.");
      } else {
        setPhoneError("");
      }
    }
    if (name === "password") {
      if (!validatePassword(value)) {
        setPasswordError(
          "Password must be at least 8 characters, including letters and numbers."
        );
      } else {
        setPasswordError("");
      }
    }
  };

  const validatePhone = (phone) => {
    // Vietnamese phone: 10-11 digits, only numbers
    return /^\d{10,11}$/.test(phone);
  };

  const validatePassword = (password) => {
    // At least 8 chars, at least 1 letter and 1 number
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError("Invalid phone number. Please enter 10-11 digits.");
      return;
    }
    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters, including letters and numbers."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password
      );
      setShowVerification(true);
      setRegisteredEmail(res.email || formData.email);
      setUserId(res.userId);
      setVerificationMessage(
        res.message ||
          "Registration successful. Please check your email to verify your account."
      );
      toast.success(
        res.message ||
          "Registration successful. Please check your email to verify your account."
      );
    } catch (error) {
      if (
        error.message &&
        (error.message.includes("already exists") ||
          error.message.includes("Conflict"))
      ) {
        setError(
          "Email already registered. Please use a different email or login."
        );
      } else if (
        error.message &&
        (error.message.includes("Bad Request") ||
          error.message.includes("Validation"))
      ) {
        setError("Invalid registration data. ");
      } else if (
        error.message &&
        error.message.includes("HTTP error! status: 400")
      ) {
        setError("Email already exists. ");
      } else if (error.message && error.message.includes("Network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(error.message || "Registration failed. Please try again.");
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
      const res = await authService.verifyEmail(
        registeredEmail,
        verificationCode
      );
      toast.success(res || "Email verification successful. Logging in...");
      setVerificationMessage(
        res || "Email verification successful. Logging in..."
      );
      setShowVerification(false);
      // Tự động đăng nhập sau khi xác thực thành công
      try {
        const loginData = await authService.login(
          registeredEmail,
          formData.password
        );
        dispatch(
          setLoginState({
            isLoggedIn: true,
            user: loginData.user,
            role: loginData.role,
            token: loginData.token,
          })
        );
        // Nếu là popup, gọi callback để đóng popup, ngược lại chuyển hướng về trang chủ
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        } else {
          router.push("/");
        }
      } catch (loginError) {
        setError("Automatic login failed. Please login again.");
      }
    } catch (error) {
      setError(
        error.message || "The verification code is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authService.resendVerification(registeredEmail);
      toast.success(
        res || "The verification code has been re-sent to your email."
      );
      setVerificationMessage(
        res || "The verification code has been re-sent to your email."
      );
    } catch (error) {
      setError(error.message || "Unable to resend verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showVerification ? (
        <form onSubmit={handleSubmit} className="login-from">
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label style={{ display: "block", width: "100%" }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              required
              value={formData.phone}
              onChange={handleChange}
              style={{ display: "block", width: "100%" }}
            />
            {phoneError && (
              <div className="text-danger" style={{ fontSize: "0.9em" }}>
                {phoneError}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              id="password-field"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-control"
            />
            {passwordError && (
              <div className="text-danger" style={{ fontSize: "0.9em" }}>
                {passwordError}
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              id="confirm-password-field"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <button
              className="theme-btn btn-style-one"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      ) : (
        <div className="verification-section">
          {verificationMessage && (
            <div className="alert alert-success">{verificationMessage}</div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label>Enter the verification code sent to your email</label>
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
                {loading ? "Verifying..." : "Email authentication"}
              </button>
            </div>
          </form>
          <button
            className="btn btn-link"
            onClick={handleResend}
            disabled={loading}
          >
            Resend verification code
          </button>
        </div>
      )}
    </div>
  );
};

export default FormContent;
