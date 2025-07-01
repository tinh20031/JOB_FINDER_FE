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

    // Test case: Simulate unverified email error for testing
    if (
      formData.email === "test@unverified.com" &&
      formData.password === "test123"
    ) {
      console.log("Test case: Simulating unverified email error");
      const mockError = {
        response: {
          status: 401,
          data: {
            requiresVerification: true,
            message:
              "Email chưa được xác thực. Vui lòng kiểm tra email của bạn.",
            email: formData.email,
          },
        },
      };

      // Simulate the error handling
      let isUnverifiedEmail = false;
      let errorMessage = "";
      let errorEmail = formData.email;

      if (mockError.response && mockError.response.data) {
        const errorData = mockError.response.data;
        if (
          errorData.requiresVerification ||
          errorData.message?.toLowerCase().includes("not verified") ||
          errorData.message?.toLowerCase().includes("unverified") ||
          errorData.message
            ?.toLowerCase()
            .includes("email chưa được xác thực") ||
          errorData.message?.toLowerCase().includes("chưa xác thực")
        ) {
          isUnverifiedEmail = true;
          errorMessage =
            errorData.message ||
            "Your email is not verified. Please check your email for the confirmation code.";
          errorEmail = errorData.email || formData.email;
        }
      }

      if (isUnverifiedEmail) {
        setShowVerifyEmailForm(true);
        setFormData((prev) => ({
          ...prev,
          email: errorEmail,
        }));
        setVerifyEmailAlert(errorMessage);
        setError("");
        setLoading(false);
        return;
      }
    }

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
      console.log("Login error:", error);

      // Kiểm tra tất cả các trường hợp có thể của lỗi email chưa xác minh
      let isUnverifiedEmail = false;
      let errorMessage = "";
      let errorEmail = formData.email;

      // Kiểm tra error.response.data
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (
          errorData.requiresVerification ||
          errorData.message?.toLowerCase().includes("not verified") ||
          errorData.message?.toLowerCase().includes("unverified") ||
          errorData.message
            ?.toLowerCase()
            .includes("email chưa được xác thực") ||
          errorData.message?.toLowerCase().includes("chưa xác thực")
        ) {
          isUnverifiedEmail = true;
          errorMessage =
            errorData.message ||
            "Your email is not verified. Please check your email for the confirmation code.";
          errorEmail = errorData.email || formData.email;
        }
      }

      // Kiểm tra error.data (trường hợp error trực tiếp)
      if (!isUnverifiedEmail && error.data) {
        const errorData = error.data;
        if (
          errorData.requiresVerification ||
          errorData.message?.toLowerCase().includes("not verified") ||
          errorData.message?.toLowerCase().includes("unverified") ||
          errorData.message
            ?.toLowerCase()
            .includes("email chưa được xác thực") ||
          errorData.message?.toLowerCase().includes("chưa xác thực")
        ) {
          isUnverifiedEmail = true;
          errorMessage =
            errorData.message ||
            "Your email is not verified. Please check your email for the confirmation code.";
          errorEmail = errorData.email || formData.email;
        }
      }

      // Kiểm tra error.message
      if (!isUnverifiedEmail && error.message) {
        const message = error.message.toLowerCase();
        if (
          message.includes("requiresverification") ||
          message.includes("not verified") ||
          message.includes("unverified") ||
          message.includes("email chưa được xác thực") ||
          message.includes("chưa xác thực") ||
          (message.includes("401") && message.includes("email"))
        ) {
          isUnverifiedEmail = true;
          errorMessage =
            error.message ||
            "Your email is not verified. Please check your email for the confirmation code.";

          // Thử parse JSON từ message nếu có
          try {
            const parsedError = JSON.parse(error.message);
            if (parsedError.email) {
              errorEmail = parsedError.email;
            }
          } catch (e) {
            // Nếu không parse được JSON, giữ nguyên email hiện tại
          }
        }
      }

      // Kiểm tra status code 401 với message cụ thể
      if (
        !isUnverifiedEmail &&
        error.response &&
        error.response.status === 401
      ) {
        const message = (
          error.response.data?.message ||
          error.message ||
          ""
        ).toLowerCase();
        if (
          message.includes("email") &&
          (message.includes("not verified") ||
            message.includes("unverified") ||
            message.includes("chưa xác thực"))
        ) {
          isUnverifiedEmail = true;
          errorMessage =
            error.response.data?.message ||
            error.message ||
            "Your email is not verified. Please check your email for the confirmation code.";
        }
      }

      if (isUnverifiedEmail) {
        setShowVerifyEmailForm(true);
        setFormData((prev) => ({
          ...prev,
          email: errorEmail,
        }));
        setVerifyEmailAlert(errorMessage);
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
              // Tự động login lại
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
