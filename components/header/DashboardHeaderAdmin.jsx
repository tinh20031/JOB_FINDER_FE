'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import employerMenuData from "../../data/adminHeadedrMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { clearLoginState } from '@/features/auth/authSlice';
import { authService } from "../../services/authService";
import Cookies from 'js-cookie';
import { getUserFavorites } from "../../services/favoriteJobService";
import { useFavoriteJobs } from "../../contexts/FavoriteJobsContext";
import apiService from '@/services/api.service';


// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return "/images/resource/company-6.png";
  }
  // Check if it's "string" literal or invalid
  if (url === "string") {
    return "/images/resource/company-6.png";
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return "/images/resource/company-6.png"; // Invalid URL
};


const DashboardHeaderAdmin = () => {

    const [navbar, setNavbar] = useState(false);
    const [fullName, setFullName] = useState("Admin");
    const [avatar, setAvatar] = useState("/images/resource/company-6.png");
    const router = useRouter();
    const dispatch = useDispatch();
    const { favoriteCount } = useFavoriteJobs() || {};
    const { user, isLoggedIn, profileUpdated } = useSelector((state) => state.auth);

    // Dropdown state management
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const changeBackground = () => {
        if (window.scrollY >= 0) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    useEffect(() => {
        const fetchAdminProfile = async () => {
            let id = user?.UserId || user?.id || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
            if (isLoggedIn && id) {
                try {
                    const profile = await apiService.get(`/User/${id}`);
                    setFullName(profile.fullName || profile.name || "Admin");
                    setAvatar(getValidImageUrl(profile.avatar || profile.image));
                } catch (e) {
                    setFullName("Admin");
                    setAvatar("/images/resource/company-6.png");
                }
            } else {
                setFullName("Admin");
                setAvatar("/images/resource/company-6.png");
            }
        };
        fetchAdminProfile();
    }, [user, profileUpdated, isLoggedIn]);

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

                        {/* <!-- Main Menu End--> */}
                    </div>
                    {/* End .nav-outer */}

                    <div className="outer-box">
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
                                    src={avatar}
                                    width={50}
                                    height={50}
                                    style={{ borderRadius: '50%', objectFit: 'cover', width: 50, height: 50 }}
                                />
                                <span className="name">{fullName}</span>
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

export default DashboardHeaderAdmin;
