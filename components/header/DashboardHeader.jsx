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
    const { user, isLoggedIn, role, profileUpdated, userId } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    // Use state for user info to handle updates
    const [displayUserName, setDisplayUserName] = useState("My Account");
    const [displayAvatar, setDisplayAvatar] = useState("/images/resource/company-6.png");

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

    // Update state when user data from Redux changes
    useEffect(() => {
        const fetchCompanyProfile = async () => {
            let id = userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);
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

                        <button className="menu-btn">
                            <span className="icon la la-bell"></span>
                        </button>
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