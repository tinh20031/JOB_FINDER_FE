'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      return "/employers-dashboard/dashboard";
    } else if (userRole === 'Admin') {
      return "/admin-dashboard/dashboard";
    }
    return "/"; // Default path if role is not recognized
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
                    onError={(e) => { e.target.onerror = null; e.target.src = "/images/logo.svg"; }}
                  />
                </Link>
              </div>
            </div>

            <MobileSidebar />
          </div>

          <div className="outer-box">
            <div className="user-profile-box">
              <div className="dropdown">
                <button 
                  className="dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <Image
                    alt="avatar"
                    width={40}
                    height={40}
                    src={getValidImageUrl(user?.image || user?.avatar)}
                    className="rounded-circle"
                  />
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link href={getDashboardPath(role)}>
                      <i className="la la-user"></i> Dashboard
                    </Link>
                  </li>
                 
                  <li>
                    <a href="#" onClick={handleLogout}>
                      <i className="la la-sign-out"></i> Logout
                    </a>
                  </li>
                </ul>
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