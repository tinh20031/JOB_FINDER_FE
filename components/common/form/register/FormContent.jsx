'use client'

import { useState } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setLoginState } from '@/features/auth/authSlice';

const FormContent = ({ onRegistrationSuccess }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password
      );

      toast.success('Registration successful! Logging you in...');

      // Automatically log in the user after successful registration
      const loginData = await authService.login(formData.email, formData.password);
      
      dispatch(setLoginState({
        isLoggedIn: true,
        user: loginData.user, // Assuming loginData contains user object
        role: loginData.role
      }));

      // Redirect to home page
      router.push('/');

    } catch (error) {
      console.log('Registration error:', error);
      if (error.message && (error.message.includes('already exists') || error.message.includes('Conflict'))) {
        setError('Email already registered. Please use a different email or login.');
      } else if (error.message && (error.message.includes('Bad Request') || error.message.includes('Validation'))) {
        setError('Invalid registration data. ');
      } else if (error.message && error.message.includes('HTTP error! status: 400')) {
        setError('Registration failed: Invalid data. ');
      } else if (error.message && error.message.includes('Network')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
      {/* fullName */}

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
      {/* email */}

      <div className="form-group">
        <label style={{ display: 'block', width: '100%' }}>Phone Number</label>
        <input 
          type="tel" 
          name="phone" 
          placeholder="Enter your phone number" 
          required 
          value={formData.phone}
          onChange={handleChange}
          style={{ display: 'block', width: '100%' }} 
        />
      </div>
      {/* phone */}

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
      </div>
      {/* password */}

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
      {/* confirm password */}

      <div className="form-group">
        <button 
          className="theme-btn btn-style-one" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
      {/* register button */}
    </form>
  );
};

export default FormContent;