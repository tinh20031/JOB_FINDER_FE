'use client'

import { useState } from 'react';
import { authService } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const FormContent = ({ onRegistrationSuccess }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
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
    setLoading(true);

    try {
      await authService.register(
        formData.fullName,
        formData.email,
        formData.phone,
        formData.password
      );

      console.log('Registration successful in FormContent.');
      toast.success('Registration successful!');

      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      } else {
        router.push('/login');
      }
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
    <form onSubmit={handleSubmit}>
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
        />
      </div>
      {/* email */}

      <div className="form-group">
        <label>Phone Number</label>
        <input 
          type="tel" 
          name="phone" 
          placeholder="Enter your phone number" 
          required 
          value={formData.phone}
          onChange={handleChange}
          className="form-control" 
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
        />
      </div>
      {/* password */}

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