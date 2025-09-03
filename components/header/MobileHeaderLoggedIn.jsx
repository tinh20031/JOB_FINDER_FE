'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { clearLoginState } from '@/features/auth/authSlice';
import { authService } from "@/services/authService";
import Image from "next/image";
import MobileSidebar from "./mobile-sidebar";

// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return "/images/resource/candidate-1.png";
  }
  // Check if it's "string" literal or invalid
  if (url === "string") {
    return "/images/resource/candidate-1.png";
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return "/images/resource/candidate-1.png"; // Invalid URL
};

const MobileHeaderLoggedIn = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);
  const [navbar, setNavbar] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const avatarDropdownRef = useRef(null);

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
    return () => {
      window.removeEventListener("scroll", changeBackground);
    };
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
      }
    }
    if (showAvatarDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAvatarDropdown]);

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    dispatch(clearLoginState());
    router.push('/');
  };

  const getDashboardPath = (userRole) => {
    if (userRole === 'Candidate') {
      return "/candidates-dashboard/dashboard";
    } else if (userRole === 'Company') {
              return "/company-dashboard/dashboard";
    } else if (userRole === 'Admin') {
      return "/admin-dashboard/dashboard";
    }
    return "/"; // Default path if role is not recognized
  };

  // Toggle avatar dropdown
  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAvatarDropdown((prev) => !prev);
  };

  

  return (
    <header className={`main-header main-header-mobile ${navbar ? "fixed-header animated slideInDown" : ""}`}>
      <div className="auto-container">
        <div className="inner-box">
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    width={154}
                    height={50}
                    src="/images/jobfinder-logo.png"
                    alt="JobFinder logo"
                    title="JobFinder"
                    style={{ width: 'auto', height: 'auto' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/logo.svg"; }}
                  />
                </Link>
              </div>
            </div>

            <MobileSidebar />
          </div>

          <div className="outer-box">
            <div className="user-profile-box">
              <div className="dropdown" ref={avatarDropdownRef}>
                <button 
                  className="dropdown-toggle" 
                  type="button" 
                  onClick={handleAvatarClick}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    alt="avatar"
                    width={40}
                    height={40}
                    src={
                      role === 'Company' 
                        ? getValidImageUrl(user?.imageLogoLgr || user?.image || user?.avatar, "/images/resource/company-6.png")
                        : getValidImageUrl(user?.image || user?.avatar, "/images/resource/candidate-1.png")
                    }
                    className="rounded-circle"
                  />
                </button>
                {showAvatarDropdown && (
                  <ul className="dropdown-menu" style={{ display: 'block' }}>
                    <li>
                      <Link href={getDashboardPath(role)} onClick={() => setShowAvatarDropdown(false)}>
                        <i className="la la-user"></i> Dashboard
                      </Link>
                    </li>
                   
                    <li>
                      <a href="#" onClick={() => {
                        handleLogout();
                        setShowAvatarDropdown(false);
                      }}>
                        <i className="la la-sign-out"></i> Logout
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <a
              href="#"
              className="mobile-nav-toggler"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
            >
              <span className="flaticon-menu-1"></span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeaderLoggedIn; 