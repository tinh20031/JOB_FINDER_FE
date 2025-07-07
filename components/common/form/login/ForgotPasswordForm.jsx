import { useState } from "react";
import { authService } from "@/services/authService";
import { toast } from "react-toastify";

const ForgotPasswordForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPasswordRequest(email);
      toast.success("Verification code sent to your email.");
      setStep(2);
    } catch (err) {
      let detailMsg = err?.data?.message || err?.response?.data?.message || err?.message || "Failed to send verification code.";
      if (
        (err?.response?.status === 400 || /400/.test(detailMsg)) &&
        (!err?.data?.message && !err?.response?.data?.message)
      ) {
        detailMsg = "Email does not exist";
      }
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPasswordVerify(email, code);
      toast.success("Code verified. Please enter your new password.");
      setStep(3);
    } catch (err) {
      let detailMsg = err?.data?.message || err?.response?.data?.message || err?.message || "Invalid code.";
      if (
        (err?.response?.status === 400 || /400/.test(detailMsg)) &&
        (!err?.data?.message && !err?.response?.data?.message)
      ) {
        detailMsg = "The verification code is incorrect or has expired.";
      }
      setError(detailMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Validate password
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      await authService.forgotPasswordReset(email, code, newPassword);
      toast.success("Password reset successfully. You can now log in.");
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await authService.forgotPasswordResendVerification(email);
      toast.success("Verification code resent.");
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <h3>Forgot Password</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {step === 1 && (
        <form onSubmit={handleRequest}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <button className="theme-btn btn-style-one" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
          <div className="form-group">
            <button type="button" className="btn btn-link" onClick={onClose}>
              Back to Login
            </button>
          </div>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Enter the code sent to your email"
            />
            
          </div>
          <div className="form-group">
            <button className="theme-btn btn-style-one" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? "Verifying..." : "Continue"}
            </button>
          </div>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-link" onClick={onClose}>
              Back to Login
            </button>
            <button type="button" className="btn btn-link" onClick={handleResend} disabled={loading}>
              Resend Code
            </button>
          </div>
         
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handleReset}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              minLength={8}
            />
          </div>
          <div className="form-group">
            <button className="theme-btn btn-style-one" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm; 