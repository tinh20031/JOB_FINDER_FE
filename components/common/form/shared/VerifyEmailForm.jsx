import { useState } from "react";
import { authService } from "@/services/authService";

const VerifyEmailForm = ({ initialEmail = "", onVerified, onCancel }) => {
  const [email, setEmail] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyEmail(email, verificationCode);
      setMessage(res || "Email verification successful. You can log in now.");
      setError("");
      if (onVerified) onVerified(email);
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message;

      // Handle various error formats
      if (!msg || msg.includes("HTTP error") || msg.includes("400")) {
        msg = "The verification code is invalid or has expired.";
      } else if (msg.includes("404") || msg.includes("Not Found")) {
        msg = "Email not found. Please check your email address.";
      } else if (msg.includes("409") || msg.includes("Conflict")) {
        msg = "Email already verified. You can now log in.";
      } else if (msg.includes("500") || msg.includes("Internal Server Error")) {
        msg = "Server error. Please try again later.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);
    try {
      const res = await authService.resendVerification(email);
      setMessage(
        res || "The verification code has been re-sent to your email."
      );
      setError("");
    } catch (err) {
      let msg = err?.response?.data?.message || err?.message;

      if (!msg || msg.includes("HTTP error")) {
        msg = "Unable to resend verification code. Please try again.";
      } else if (msg.includes("404") || msg.includes("Not Found")) {
        msg = "Email not found. Please check your email address.";
      } else if (msg.includes("429") || msg.includes("Too Many Requests")) {
        msg = "Too many requests. Please wait a moment before trying again.";
      }

      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verification-section">
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
            placeholder="Enter your email"
            disabled={!!initialEmail}
          />
        </div>
        <div className="form-group">
          <label>Verification code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className="form-control"
            placeholder="Enter verification code"
            maxLength={6}
          />
        </div>
        <div className="form-group button-group">
          <button
            className="theme-btn btn-style-one"
            type="submit"
            disabled={loading || !verificationCode.trim()}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="secondary-buttons">
            <button
              type="button"
              className="secondary-btn resend-btn"
              onClick={handleResend}
              disabled={resendLoading || !email}
            >
              {resendLoading ? "Resending..." : "Resend code"}
            </button>

            {onCancel && (
              <button
                type="button"
                className="secondary-btn cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <style jsx>{`
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 20px;
        }

        .secondary-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .secondary-btn {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.3s ease;
          background: transparent;
        }

        .resend-btn {
          border: 1px solid #3498db;
          color: #3498db;
        }

        .resend-btn:hover:not(:disabled) {
          background-color: #ebf5fd;
        }

        .resend-btn:disabled {
          border-color: #a0c8e4;
          color: #a0c8e4;
          cursor: not-allowed;
        }

        .cancel-btn {
          border: 1px solid #e74c3c;
          color: #e74c3c;
        }

        .cancel-btn:hover {
          background-color: #fdf1f0;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailForm;