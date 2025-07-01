"use client";

import Link from "next/link";
import { authService } from "@/services/authService";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setLoginState } from "@/features/auth/authSlice";
import { jwtDecode } from "jwt-decode";
import LoginWithSocial from "../shared/LoginWithSocial";
import VerifyEmailForm from "../shared/VerifyEmailForm";
import { toast } from "react-toastify";

const FormContent = ({ isPopup = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyEmailForm, setShowVerifyEmailForm] = useState(false);
  const closeBtnRef = useRef(null);
  const [verifyEmailAlert, setVerifyEmailAlert] = useState("");

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
      // Handle unverified email cases
      const isUnverifiedEmail =
        error.isUnverifiedEmail ||
        error.response?.data?.requiresVerification ||
        error.data?.requiresVerification ||
        (error.message &&
          (error.message.includes("requiresVerification") ||
            error.message.toLowerCase().includes("not verified") ||
            error.message.toLowerCase().includes("unverified") ||
            error.message.toLowerCase().includes("email chưa được xác thực") ||
            error.message.includes("Email has not been verified") ||
            error.message.includes("check your inbox to verify") ||
            error.message.includes("verify your account before logging in") ||
            error.message.toLowerCase().includes("verify") ||
            error.message.toLowerCase().includes("inbox")));

      if (isUnverifiedEmail) {
        // Extract email from error response or use form email
        const unverifiedEmail =
          error.email ||
          error.response?.data?.email ||
          error.data?.email ||
          formData.email;

        setShowVerifyEmailForm(true);
        setFormData((prev) => ({
          ...prev,
          email: unverifiedEmail,
        }));

        // Set appropriate alert message
        const alertMessage =
          error.response?.data?.message ||
          error.data?.message ||
          error.message ||
          "Your email is not verified. Please check your email for the confirmation code.";

        setVerifyEmailAlert(alertMessage);
        setError("");
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

  return (
    <div className="form-inner">
      <h3>Login to JobFinder</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {showVerifyEmailForm ? (
        <>
          {verifyEmailAlert && (
            <div className="alert alert-warning" style={{ fontWeight: 500 }}>
              {verifyEmailAlert}
            </div>
          )}
          <VerifyEmailForm
            initialEmail={formData.email}
            onVerified={async (email) => {
              setShowVerifyEmailForm(false);
              setFormData((prev) => ({ ...prev, email }));
              setVerifyEmailAlert("");
              setError("");
              // Tự động login lại sau khi xác thực thành công
              setLoading(true);
              try {
                const responseData = await authService.login(
                  email,
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
                // Thông báo thành công
                toast.success(
                  "Verification successful! You are now logged in."
                );
                // Chuyển hướng
                const userRole = responseData.role || user.role;
                const redirectPath =
                  userRole === "Admin" ? "/admin-dashboard/dashboard" : "/";
                window.location.href = redirectPath;
              } catch (err) {
                setError("Automatic login failed. Please login again.");
              } finally {
                setLoading(false);
              }
            }}
            onCancel={() => {
              setShowVerifyEmailForm(false);
              setVerifyEmailAlert("");
            }}
          />
        </>
      ) : (
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