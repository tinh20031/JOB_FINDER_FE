"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { clearLoginState, setLoginState } from '@/features/auth/authSlice';
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
import notificationHubService from "@/services/notificationHub";
import { getNotificationDetailUrl } from "@/services/notification.service";

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const avatarDropdownRef = useRef(null);

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
  function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    // Luôn cộng 7 tiếng để chuyển sang giờ Việt Nam
    date.setHours(date.getHours() + 7);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;
    return date.toLocaleDateString("en-US");
  }
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

  // Fallback: nếu redux chưa có user, lấy lại từ localStorage
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      if (userStr && token && role && userId) {
        dispatch(setLoginState({
          user: JSON.parse(userStr),
          isLoggedIn: true,
          role,
          userId,
        }));
      }
    }
  }, [user, dispatch]);

  // Fetch notifications/unread count cho cả Candidate và Company
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId || !(role === 'Company' || role === 'Candidate')) return;
      try {
        const res = await apiService.get(`/notification?page=1&pageSize=5`);
        setNotifications(Array.isArray(res) ? res : []);
      } catch {}
    };
    const fetchUnreadCount = async () => {
      if (!userId || !(role === 'Company' || role === 'Candidate')) return;
      try {
        const res = await apiService.get(`/notification/unread-count`);
        setUnreadCount(res?.count || 0);
      } catch {}
    };
    if (isLoggedIn && (role === 'Company' || role === 'Candidate')) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId, role]);

  // SignalR notification realtime cho cả Candidate và Company
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (isLoggedIn && userId && token && (role === 'Company' || role === 'Candidate')) {
      notificationHubService.start(token, userId, (notification) => {
        const incomingId = notification?.notificationId || notification?.id;
        let isDuplicate = false;
        setNotifications((prev) => {
          if (incomingId) {
            isDuplicate = prev.some((n) => (n.notificationId || n.id) === incomingId);
          }
          return isDuplicate ? prev : [notification, ...prev];
        });
        if (!isDuplicate) {
          setUnreadCount((prev) => prev + 1);
        }
      });
      return () => notificationHubService.stop();
    }
  }, [isLoggedIn, userId, role]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setShowAvatarDropdown(false);
      }
    }
    if (showDropdown || showAvatarDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, showAvatarDropdown]);

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

  // Toggle avatar dropdown
  const handleAvatarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAvatarDropdown((prev) => !prev);
  };

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
                  style={{ width: 'auto', height: 'auto' }}
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
                      isOpen={openRecruiterModal}
                      onClose={() => setOpenRecruiterModal(false)}
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
              {(role === 'Candidate' || role === 'Company') && (
                <div style={{ position: 'relative', marginRight: 16 }}>
                  <button className="menu-btn" onClick={handleBellClick} style={{ position: 'relative' }}>
                    <span className="icon la la-bell"></span>
                    {unreadCount > 0 && (
                      <span style={{ position: 'absolute', top: 0, right: 0, background: '#e74c3c', color: '#fff', borderRadius: '50%', fontSize: 12, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontWeight: 600 }}>{unreadCount}</span>
                    )}
                  </button>
                  {showDropdown && (
                    <div ref={dropdownRef} style={{ position: 'absolute', right: 0, top: 36, width: 340, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8, zIndex: 1000 }}>
                      <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 600 }}>New announcement</div>
                      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map((n, idx) => (
                            <Link key={n.notificationId || idx} href={getNotificationDetailUrl(n)} style={{ textDecoration: 'none', color: n.isRead ? '#aaa' : '#222' }}>
                              <div
                                style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid #f3f3f3',
                                  cursor: 'pointer',
                                  background: n.isRead ? '#fff' : '#f1f6fd',
                                  fontWeight: n.isRead ? 400 : 600,
                                  opacity: n.isRead ? 0.7 : 1,
                                }}
                              >
                                <div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title || n.message || 'Notification'}</div>
                                <div style={{ fontSize: 13, color: n.isRead ? '#bbb' : '#1967d2', margin: '4px 0 2px 0' }}>{n.message}</div>
                                <div style={{ fontSize: 12, color: '#888' }}>{n.createdAt ? timeAgo(n.createdAt) : ''}</div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      <div style={{ textAlign: 'center', padding: 8 }}>
                        <Link href={role === 'Company' ? "/company-dashboard/resume-alerts" : "/candidates-dashboard/job-alerts"} style={{ fontSize: 13, color: '#1967d2' }}>View all notifications</Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="dropdown dashboard-option" ref={avatarDropdownRef}>
                <a 
                  className="dropdown-toggle" 
                  role="button" 
                  onClick={handleAvatarClick}
                  style={{ cursor: 'pointer' }}
                >
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
                {showAvatarDropdown && (
                  <ul className="dropdown-menu" style={{ display: 'block' }}>
                    {role === 'Company' && employerMenuData.map((item) => (
                      <li
                        className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                        key={item.id}
                        onClick={() => {
                          handleMenuClick(item);
                          setShowAvatarDropdown(false);
                        }}
                      >
                        {item.isLogout ? (
                          <a style={{ cursor: 'pointer' }}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </a>
                        ) : (
                          <Link href={item.routePath} onClick={() => setShowAvatarDropdown(false)}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                    {role === 'Candidate' && candidatesMenuData.map((item) => (
                      <li
                        className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                        key={item.id}
                        onClick={() => {
                          handleMenuClick(item);
                          setShowAvatarDropdown(false);
                        }}
                      >
                         {item.isLogout ? (
                          <a style={{ cursor: 'pointer' }}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </a>
                        ) : (
                          <Link href={item.routePath} onClick={() => setShowAvatarDropdown(false)}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                     {role === 'Admin' && adminMenuData.map((item) => (
                      <li
                        className={`${isActiveLink(item.routePath, pathname) ? "active" : ""} mb-1`}
                        key={item.id}
                        onClick={() => {
                          handleMenuClick(item);
                          setShowAvatarDropdown(false);
                        }}
                      >
                         {item.isLogout ? (
                          <a style={{ cursor: 'pointer' }}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </a>
                        ) : (
                          <Link href={item.routePath} onClick={() => setShowAvatarDropdown(false)}>
                            <i className={`la ${item.icon}`}></i> {item.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
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
                  href="/company-dashboard/post-jobs"
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