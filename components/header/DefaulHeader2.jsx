'use client'

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import { useSelector, useDispatch } from 'react-redux';
import { clearLoginState, setLoginState } from '@/features/auth/authSlice';
import { authService } from "@/services/authService";
import HeaderNavContent from "./HeaderNavContent";
import Image from "next/image";
import employerMenuData from "../../data/employerHeaderMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import candidatesMenuData from "../../data/candidatesHeaderMenuData";
import adminMenuData from "../../data/adminHeadedrMenuData";
import BecomeRecruiterModal from '../common/form/shared/BecomeRecruiterModal';
import { useFavoriteJobs } from "../../contexts/FavoriteJobsContext";

import apiService from '@/services/api.service';
import { startNotificationHub, stopNotificationHub } from "@/services/notificationHub";

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

const DefaulHeader2 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [navbar, setNavbar] = useState(false);

  const { isLoggedIn, user, role, profileUpdated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [openRecruiterModal, setOpenRecruiterModal] = useState(false);
  const [displayUserName, setDisplayUserName] = useState("My Account");
  const [displayAvatar, setDisplayAvatar] = useState("/images/resource/candidate-1.png");
  const [currentUserId, setCurrentUserId] = useState(null);
  const { favoriteCount } = useFavoriteJobs();
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(true);
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleDropdownToggle = () => setDropdownOpen((open) => !open);
  const handleDropdownClose = () => setDropdownOpen(false);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoggedIn) {
      const id = localStorage.getItem('userId');
      setCurrentUserId(id);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (role === 'Candidate' && isLoggedIn) {
        try {
          const profile = await apiService.get('/CandidateProfile/me');
          setDisplayUserName(profile.fullName || "My Account");
          setDisplayAvatar(profile.image || "/images/resource/candidate-1.png");
        } catch (e) {
          setDisplayUserName("My Account");
          setDisplayAvatar("/images/resource/candidate-1.png");
        }
      } else if (role === 'Company' && isLoggedIn) {
        let id = user?.userId || user?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
        if (id) {
          try {
            const profile = await apiService.get(`/CompanyProfile/${id}`);
            setDisplayUserName(profile.companyName || "My Account");
            setDisplayAvatar(profile.urlCompanyLogo || "/images/resource/company-6.png");
          } catch (e) {
            setDisplayUserName("My Account");
            setDisplayAvatar("/images/resource/company-6.png");
          }
        } else {
          setDisplayUserName("My Account");
          setDisplayAvatar("/images/resource/company-6.png");
        }
      } else if (role === 'Admin' && isLoggedIn) {
        let id = user?.userId || user?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
        if (id) {
          try {
            const profile = await apiService.get(`/User/${id}`);
            setDisplayUserName(profile.fullName || profile.name || "My Account");
            setDisplayAvatar(getValidImageUrl(profile.avatar || profile.image));
          } catch (e) {
            setDisplayUserName("My Account");
            setDisplayAvatar("/images/resource/candidate-1.png");
          }
        } else {
          setDisplayUserName("My Account");
          setDisplayAvatar("/images/resource/candidate-1.png");
        }
      } else {
        setDisplayUserName("My Account");
        setDisplayAvatar("/images/resource/candidate-1.png");
      }
    };
    fetchProfile();
  }, [isLoggedIn, role, profileUpdated, user]);

  // Thêm logic fetch notification/unreadCount và SignalR cho company
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || role !== 'Company') return;
      try {
        const res = await apiService.get(`/notification?page=1&pageSize=5`);
        setNotifications(Array.isArray(res) ? res : []);
      } catch {}
    };
    const fetchUnreadCount = async () => {
      if (!userId || role !== 'Company') return;
      try {
        const res = await apiService.get(`/notification/unread-count`);
        setUnreadCount(res?.count || 0);
      } catch {}
    };
    if (isLoggedIn && role === 'Company') {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId, profileUpdated, role]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (isLoggedIn && userId && token && role === 'Company') {
      const connection = startNotificationHub(token, userId, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return () => stopNotificationHub();
    }
  }, [isLoggedIn, userId, role]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Đánh dấu đã đọc khi mở dropdown
  const handleBellClick = async () => {
    setShowDropdown((prev) => !prev);
    if (unreadCount > 0) {
      try {
        await apiService.put(`/Notification/read-all`);
        setUnreadCount(0);
      } catch {}
    }
  };

  const changeBackground = () => {
    if (typeof window !== 'undefined' && window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", changeBackground);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("scroll", changeBackground);
      }
    };
  }, []);

  const handleLogout = () => {
    // Xóa tất cả dữ liệu authentication
    authService.logout();
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    dispatch(clearLoginState());
    window.location.href = '/';
  };

  const handleMenuClick = (item) => {
    if (item.isLogout) {
      handleLogout();
    }
  };

  return (
    <header
      className={`main-header  ${
        navbar ? "fixed-header animated slideInDown" : ""
      }`}
    >
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
              {/* Icon trái tim */}
              {isLoggedIn && (role === 'Candidate') && (
                <Link href="/favorite-jobs">
                  <button className="menu-btn">
                    {favoriteCount > 0 && <span className="count">{favoriteCount}</span>}
                    <span className="icon la la-heart-o"></span>
                  </button>
                </Link>
              )}
              <div className="dropdown dashboard-option" ref={dropdownRef}>
                <button
                  className="dropdown-toggle"
                  type="button"
                  aria-expanded={dropdownOpen}
                  onClick={handleDropdownToggle}
                  style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  <Image
                    alt="avatar"
                    width={50}
                    height={50}
                    src={getValidImageUrl(displayAvatar)}
                    className="thumb"
                    style={{ borderRadius: '50%', objectFit: 'cover', width: 50, height: 50 }}
                  />
                  <span className="name">{displayUserName}</span>
                </button>
                <ul className="dropdown-menu" style={{ display: dropdownOpen ? 'block' : 'none' }}>
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

export default DefaulHeader2;