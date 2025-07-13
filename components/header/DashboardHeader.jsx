'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import employerMenuData from "../../data/employerHeaderMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { authService } from "../../services/authService";
import { clearLoginState } from "../../features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import apiService from '@/services/api.service';
import { startNotificationHub, stopNotificationHub } from "@/services/notificationHub";


const getValidAvatarPath = (user) => {
    const avatar = user?.avatar || user?.image;
    if (!avatar || typeof avatar !== 'string') {
        return "/images/resource/company-6.png";
    }
    // Check if it's "string" literal or invalid
    if (avatar === "string") {
        return "/images/resource/company-6.png";
    }
    // Check if it's an absolute URL or a relative path starting with /
    if (avatar.startsWith('/') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar;
    }
    return "/images/resource/company-6.png";
};


const DashboardHeader = () => {
    const [navbar, setNavbar] = useState(false);

    // Get user data from Redux store
    const { user, isLoggedIn, role, profileUpdated, userId: reduxUserId } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    // Use state for user info to handle updates
    const [displayUserName, setDisplayUserName] = useState("My Account");
    const [displayAvatar, setDisplayAvatar] = useState("/images/resource/company-6.png");
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [userId, setUserId] = useState(null);

    // Lấy userId từ Redux hoặc localStorage khi reload
    useEffect(() => {
        const id = reduxUserId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
        setUserId(id ? Number(id) : null);
    }, [reduxUserId]);

    // Dropdown state management
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleDropdownToggle = () => setDropdownOpen((open) => !open);
    const handleDropdownClose = () => setDropdownOpen(false);

    // Close dropdown when clicking outside
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

    // Update state when user data from Redux changes
    useEffect(() => {
        const fetchCompanyProfile = async () => {
            let id = userId;
            if (role === 'Company' && isLoggedIn && id) {
                try {
                    const profile = await apiService.get(`/CompanyProfile/${id}`);
                    setDisplayUserName(profile.companyName || "My Account");
                    setDisplayAvatar(profile.urlCompanyLogo || "/images/resource/company-6.png");
                } catch (e) {
                    setDisplayUserName("My Account");
                    setDisplayAvatar("/images/resource/company-6.png");
                }
            } else if (user) {
                setDisplayUserName(user.fullName || "My Account");
                setDisplayAvatar(user.avatar || "/images/resource/company-6.png");
            } else {
                // Fallback for non-company users if Redux is empty
                const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                if (userString) {
                    try {
                        const userObj = JSON.parse(userString);
                        setDisplayUserName(userObj.fullName || "My Account");
                        setDisplayAvatar(userObj.avatar || "/images/resource/company-6.png");
                    } catch (e) {
                        setDisplayUserName("My Account");
                        setDisplayAvatar("/images/resource/company-6.png");
                    }
                } else {
                    setDisplayUserName("My Account");
                    setDisplayAvatar("/images/resource/company-6.png");
                }
            }
        };
        fetchCompanyProfile();
    }, [user, role, isLoggedIn, profileUpdated, userId]);

    // Fetch notifications/unread count
    useEffect(() => {
        if (role === 'Company' && isLoggedIn && userId) {
            const fetchNotifications = async () => {
                try {
                    const res = await apiService.get(`/notification?page=1&pageSize=5`);
                    setNotifications(Array.isArray(res) ? res : []);
                } catch {}
            };
            const fetchUnreadCount = async () => {
                try {
                    const res = await apiService.get(`/notification/unread-count`);
                    setUnreadCount(res?.count || 0);
                } catch {}
            };
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [isLoggedIn, userId, role, profileUpdated]);

    // Tích hợp SignalR notification realtime cho company
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (role === 'Company' && isLoggedIn && userId && token) {
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
        if (window.scrollY >= 0) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", changeBackground);
    }, []);

    const handleLogout = () => {
        authService.logout(); // Clear localStorage
        dispatch(clearLoginState()); // Clear Redux state
        window.location.href = '/'; // Redirect to home page
    };

    const handleMenuClick = (item) => {
        if (item.isLogout) {
            handleLogout();
        }
        setDropdownOpen(false);
    };

    return (
        // <!-- Main Header-->
        <header
            className={`main-header header-shaddow  ${
                navbar ? "fixed-header " : ""
            }`}
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
                                        alt="JobFinder logo"
                                        src="/images/jobfinder-logo.png"
                                        width={154}
                                        height={50}
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
                        {/* <button className="menu-btn">
                            <span className="count">1</span>
                            <span className="icon la la-heart-o"></span>
                        </button> */}
                        {/* wishlisted menu */}

                        {/* Notification bell for Company */}
                        {role === 'Company' && isLoggedIn && (
                            <div style={{ position: 'relative', marginRight: 16 }}>
                                <button className="menu-btn" onClick={handleBellClick} style={{ position: 'relative' }}>
                                    <span className="icon la la-bell"></span>
                                    {unreadCount > 0 && (
                                        <span style={{ position: 'absolute', top: 0, right: 0, background: '#e74c3c', color: '#fff', borderRadius: '50%', fontSize: 12, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{unreadCount}</span>
                                    )}
                                </button>
                                {showDropdown && (
                                    <div ref={dropdownRef} style={{ position: 'absolute', right: 0, top: 36, width: 340, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8, zIndex: 1000 }}>
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
                                                            <div style={{ fontSize: 13, color: n.isRead ? '#bbb' : '#1967d2', margin: '4px 0 2px 0' }}>{n.message}</div>
                                                            <div style={{ fontSize: 12, color: '#888' }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'center', padding: 8 }}>
                                            <Link href="/employers-dashboard/resume-alerts" style={{ fontSize: 13, color: '#1967d2' }}>View all notifications</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* End notification-icon */}

                        {/* <!-- Dashboard Option --> */}
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
                                    className="thumb"
                                    src={displayAvatar}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{displayUserName}</span>
                            </button>

                            <ul className="dropdown-menu" style={{ display: dropdownOpen ? 'block' : 'none' }}>
                                {employerMenuData.map((item) => (
                                    <li
                                        className={`${
                                            isActiveLink(
                                                item.routePath,
                                                usePathname()
                                            )
                                                ? "active"
                                                : ""
                                        } mb-1`}
                                        key={item.id}
                                        onClick={() => handleMenuClick(item)}
                                    >
                                        {item.isLogout ? (
                                            <a style={{ cursor: 'pointer' }}>
                                                <i className={`la ${item.icon}`}></i>{" "}
                                                {item.name}
                                            </a>
                                        ) : (
                                            <Link href={item.routePath}>
                                                <i
                                                    className={`la ${item.icon}`}
                                                ></i>{" "}
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
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

export default DashboardHeader;