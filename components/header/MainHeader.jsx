"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearLoginState } from '@/features/auth/authSlice';
import { authService } from "../../services/authService";
import HeaderNavContent from "./HeaderNavContent";
import employerMenuData from "../../data/employerHeaderMenuData";
import candidatesMenuData from "../../data/candidatesHeaderMenuData";
import adminMenuData from "../../data/adminHeadedrMenuData";
import BecomeRecruiterModal from '../common/form/shared/BecomeRecruiterModal';
import { useFavoriteJobs } from "../../contexts/FavoriteJobsContext";
import apiService from '@/services/api.service';
import Cookies from 'js-cookie';
import { isActiveLink } from "../../utils/linkActiveChecker";

// Helper function to validate image URLs
const getValidImageUrl = (url, fallback = "/images/resource/candidate-1.png") => {
  if (!url || typeof url !== 'string' || url === "string") return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
  return fallback;
};

const MainHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, role, profileUpdated, userId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { favoriteCount } = useFavoriteJobs() || {};

  const [navbar, setNavbar] = useState(false);
  const [displayUserName, setDisplayUserName] = useState("My Account");
  const [displayAvatar, setDisplayAvatar] = useState("/images/resource/candidate-1.png");
  const [openRecruiterModal, setOpenRecruiterModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Sticky header effect
  useEffect(() => {
    const changeBackground = () => {
      if (typeof window !== 'undefined' && window.scrollY >= 10) setNavbar(true);
      else setNavbar(false);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", changeBackground);
      return () => window.removeEventListener("scroll", changeBackground);
    }
  }, []);

  // Fetch profile by role
  useEffect(() => {
    const fetchProfile = async () => {
      let id = userId || user?.userId || user?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
      if (role === 'Candidate' && isLoggedIn) {
        try {
          const profile = await apiService.get('/CandidateProfile/me');
          setDisplayUserName(profile.fullName || "My Account");
          setDisplayAvatar(getValidImageUrl(profile.image));
        } catch {
          setDisplayUserName("My Account");
          setDisplayAvatar("/images/resource/candidate-1.png");
        }
      } else if (role === 'Company' && isLoggedIn && id) {
        try {
          const profile = await apiService.get(`/CompanyProfile/${id}`);
          setDisplayUserName(profile.companyName || "My Account");
          setDisplayAvatar(getValidImageUrl(profile.urlCompanyLogo, "/images/resource/company-6.png"));
        } catch {
          setDisplayUserName("My Account");
          setDisplayAvatar("/images/resource/company-6.png");
        }
      } else if (role === 'Admin' && isLoggedIn && id) {
        try {
          const profile = await apiService.get(`/User/${id}`);
          setDisplayUserName(profile.fullName || profile.name || "Admin");
          setDisplayAvatar(getValidImageUrl(profile.avatar || profile.image, "/images/resource/company-6.png"));
        } catch {
          setDisplayUserName("Admin");
          setDisplayAvatar("/images/resource/company-6.png");
        }
      } else {
        setDisplayUserName("My Account");
        setDisplayAvatar("/images/resource/candidate-1.png");
      }
    };
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn, role, profileUpdated, user, userId]);

  // Logout logic
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      Cookies.remove('token', { path: '/' });
      Cookies.remove('role', { path: '/' });
      Cookies.remove('name', { path: '/' });
      Cookies.remove('token', { path: '/', domain: 'localhost' });
      Cookies.remove('role', { path: '/', domain: 'localhost' });
      Cookies.remove('name', { path: '/', domain: 'localhost' });
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
    authService.logout();
    dispatch(clearLoginState());
    router.push('/');
  };

  const handleMenuClick = (item) => {
    if (item.isLogout) handleLogout();
  };

  return (
    <header className={`main-header header-shaddow ${navbar ? "fixed-header animated slideInDown" : ""}`}>
      <div className="main-box">
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
          <HeaderNavContent />
        </div>
        <div className="outer-box">
          {isLoggedIn ? (
            <div className="logged-in-info" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              {role === 'Candidate' && (
                <>
                  <button
                    type="button"
                    className="become-recruiter-btn"
                    style={{
                      marginRight: '12px',
                      background: '#f1f6fd',
                      color: '#1967d2',
                      borderRadius: '8px',
                      padding: '6px 18px',
                      fontWeight: 500,
                      fontSize: '15px',
                      transition: 'background 0.2s, color 0.2s',
                      border: 'none',
                      display: 'inline-block',
                      cursor: 'pointer',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = '#0a4ba1';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = '#f1f6fd';
                      e.currentTarget.style.color = '#1967d2';
                    }}
                    onClick={() => setOpenRecruiterModal(true)}
                  >
                    Become Recruiter
                  </button>
                  {openRecruiterModal && (
                    <BecomeRecruiterModal
                      open={openRecruiterModal}
                      onCancel={() => setOpenRecruiterModal(false)}
                      userId={currentUserId}
                    />
                  )}
                </>
              )}
              {role === 'Candidate' && (
                <Link href="/favorite-jobs">
                  <button className="menu-btn">
                    {favoriteCount > 0 && <span className="count">{favoriteCount}</span>}
                    <span className="icon la la-heart-o"></span>
                  </button>
                </Link>
              )}
              <div className="dropdown dashboard-option">
                <a className="dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <Image
                    alt="avatar"
                    width={50}
                    height={50}
                    src={displayAvatar}
                    className="thumb"
                    style={{ borderRadius: '50%', objectFit: 'cover', width: 50, height: 50 }}
                  />
                  <span className="name">{displayUserName}</span>
                </a>
                <ul className="dropdown-menu">
                  {role === 'Company' && employerMenuData.map((item) => (
                    <li
                      className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                    >
                      {item.isLogout ? (
                        <a style={{ cursor: 'pointer' }}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </a>
                      ) : (
                        <Link href={item.routePath}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                  {role === 'Candidate' && candidatesMenuData.map((item) => (
                    <li
                      className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                    >
                       {item.isLogout ? (
                        <a style={{ cursor: 'pointer' }}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </a>
                      ) : (
                        <Link href={item.routePath}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                   {role === 'Admin' && adminMenuData.map((item) => (
                    <li
                      className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                    >
                       {item.isLogout ? (
                        <a style={{ cursor: 'pointer' }}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </a>
                      ) : (
                        <Link href={item.routePath}>
                          <i className={`la ${item.icon}`}></i> {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <>
              <Link href="/candidates-dashboard/cv-manager" className="upload-cv">
                Upload your CV
              </Link>
              <div className="btn-box">
                <a
                  href="#"
                  className="theme-btn btn-style-three call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  Login / Register
                </a>
                <Link
                  href="/employers-dashboard/post-jobs"
                  className="theme-btn btn-style-one"
                >
                  Job Post
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainHeader; 