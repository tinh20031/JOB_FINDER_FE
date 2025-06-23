'use client';

import { useState } from 'react';
import { authService } from '../../../../../services/authService';
import { toast } from 'react-toastify';

const Form = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.message && error.message.includes('400')) {
        toast.error("Current password is incorrect.");
      } else {
        toast.error(error.message || "Failed to change password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* <!-- Input --> */}
        <div className="form-group col-lg-7 col-md-12">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-7 col-md-12">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-7 col-md-12">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* <!-- Input --> */}
        <div className="form-group col-lg-6 col-md-12">
          <button type="submit" className="theme-btn btn-style-one" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Form;
