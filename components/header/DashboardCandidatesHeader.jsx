"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import candidatesMenuData from "../../data/candidatesHeaderMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { useSelector, useDispatch } from "react-redux";
import { getUserFavorites } from "../../services/favoriteJobService";
import { useFavoriteJobs } from "../../contexts/FavoriteJobsContext";
import { clearLoginState } from "@/features/auth/authSlice";
import Cookies from "js-cookie";
import apiService from "@/services/api.service";
import notificationHubService from "@/services/notificationHub";

// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }
  // Check if it's "string" literal or invalid
  if (url === "string") {
    return null;
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/")
  ) {
    return url;
  }
  return null; // Invalid URL
};

const DashboardCandidatesHeader = () => {
  const [navbar, setNavbar] = useState(false);
  const [fullName, setFullName] = useState("My Account");
  const [avatar, setAvatar] = useState("/images/resource/candidate-1.png");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const userId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("userId"))
      : null;

  const { isLoggedIn, user, role, profileUpdated } = useSelector(
    (state) => state.auth
  );
  const { favoriteCount } = useFavoriteJobs() || {};
  const router = useRouter();
  const dispatch = useDispatch();

  // Lấy avatar và tên realtime từ API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiService.get("/CandidateProfile/me");
        setFullName(profile.fullName || "My Account");
        setAvatar(profile.image || "/images/resource/candidate-1.png");
      } catch (e) {
        setFullName("My Account");
        setAvatar("/images/resource/candidate-1.png");
      }
    };
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn, profileUpdated]);

  // Fetch notifications/unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        // Lấy 5 notification mới nhất
        const res = await apiService.get(`/notification?page=1&pageSize=5`);
        // API trả về mảng notification
        setNotifications(Array.isArray(res) ? res : []);
      } catch {}
    };
    const fetchUnreadCount = async () => {
      if (!userId) return;
      try {
        const res = await apiService.get(`/notification/unread-count`);
        setUnreadCount(res?.count || 0);
      } catch {}
    };
    if (isLoggedIn) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isLoggedIn, userId, profileUpdated]);

  // Tích hợp SignalR notification realtime: khi candidate đăng nhập, kết nối đến notificationHub, nhận notification mới và cập nhật vào state. Khi nhận notification mới, thêm vào đầu danh sách và tăng unreadCount.
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (isLoggedIn && userId && token) {
      notificationHubService.start(token, userId, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      return () => notificationHubService.stop();
    }
  }, [isLoggedIn, userId]);

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
    if (typeof window !== "undefined" && window.scrollY >= 0) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", changeBackground);
    }
  }, []);

  // Hàm xử lý logout
  const handleLogout = (e) => {
    e.preventDefault();
    // Xóa cookie với cả path '/' và domain 'localhost'
    if (typeof window !== "undefined") {
      Cookies.remove("token", { path: "/" });
      Cookies.remove("role", { path: "/" });
      Cookies.remove("name", { path: "/" });
      Cookies.remove("token", { path: "/", domain: "localhost" });
      Cookies.remove("role", { path: "/", domain: "localhost" });
      Cookies.remove("name", { path: "/", domain: "localhost" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    }
    if (authService.logout) {
      authService.logout();
    }
    dispatch(clearLoginState());
    router.push("/");
  };

  return (
    // <!-- Main Header-->
    <header
      className={`main-header header-shaddow  ${navbar ? "fixed-header " : ""}`}
    >
      <div className="container-fluid">
        {/* <!-- Main box --> */}
        <div className="main-box">
          {/* <!--Nav Outer --> */}
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    alt="Logo JobFinder"
                    src="/images/jobfinder-logo.png"
                    width={90}
                    height={90}
                    title="JobFinder"
                  />
                </Link>
              </div>
            </div>
            {/* End .logo-box */}

            <HeaderNavContent />
            {/* <!-- Main Menu End--> */}
          </div>
          {/* End .nav-outer */}

          <div className="outer-box">
            {isLoggedIn && (
              <Link href="/favorite-jobs">
                <button className="menu-btn">
                  <span className="count">{favoriteCount}</span>
                  <span className="icon la la-heart-o"></span>
                </button>
              </Link>
            )}
            {/* Notification bell */}
            <div className="notification-bell-wrapper" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button className="menu-btn" onClick={handleBellClick} style={{ position: 'relative' }}>
                {unreadCount > 0 && <span className="count" style={{ background: '#e74c3c', color: '#fff', borderRadius: '50%', fontSize: 12, position: 'absolute', top: 0, right: 0, minWidth: 18, minHeight: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
                <span className="icon la la-bell"></span>
              </button>
              {showDropdown && (
                <div className="notification-dropdown" style={{ position: 'absolute', right: 0, top: 40, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8, minWidth: 320, zIndex: 1000 }}>
                  <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 600 }}>New announcement</div>
                  <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 16, textAlign: 'center', color: '#888' }}>No new notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <Link key={n.notificationId} href={n.link || '#'} style={{ textDecoration: 'none', color: n.isRead ? '#aaa' : '#222' }}>
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
                            <div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.title}</div>
                            <div style={{ fontSize: 13, color: n.isRead ? '#bbb' : '#666', marginTop: 2 }}>{n.message}</div>
                            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div style={{ textAlign: 'center', padding: 8 }}>
                    <Link href="/candidates-dashboard/job-alerts" style={{ fontSize: 13, color: '#1967d2' }}>View all notifications</Link>
                  </div>
                </div>
              )}
            </div>
            {/* End notification bell */}
            {/* Danh sách yêu thích */}

            {/* <!-- Dashboard Option --> */}
            <div className="dropdown dashboard-option">
              <a
                className="dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <Image
                  alt="Ảnh đại diện"
                  className="thumb"
                  src={
                    getValidImageUrl(avatar) ||
                    "/images/resource/candidate-1.png"
                  }
                  width={50}
                  height={50}
                />
                <span className="name">{fullName}</span>
              </a>

              <ul className="dropdown-menu">
                {candidatesMenuData.map((item) =>
                  item.isLogout ? (
                    <li className="mb-1" key={item.id}>
                      <a href="/login" onClick={handleLogout}>
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </a>
                    </li>
                  ) : (
                    <li
                      className={`${
                        isActiveLink(item.routePath, usePathname())
                          ? "active"
                          : ""
                      } mb-1`}
                      key={item.id}
                    >
                      <Link href={item.routePath}>
                        <i className={`la ${item.icon}`}></i> {item.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            {/* End dropdown */}
          </div>
          {/* End outer-box */}
        </div>
      </div>
    </header>
  );
};

export default DashboardCandidatesHeader;
