'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import employerMenuData from "../../data/employerMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { authService } from "../../services/authService";
import { clearLoginState } from "../../features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";


const DashboardHeader = () => {
    const [navbar, setNavbar] = useState(false);

    // Get user data from Redux store
    const { user, isLoggedIn, role } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    // Use state for user info to handle updates
    const [displayUserName, setDisplayUserName] = useState("My Account");
    const [displayAvatar, setDisplayAvatar] = useState("/images/resource/company-6.png");

    // Update state when user data from Redux changes
    useEffect(() => {
        // First, try to get user from Redux
        if (user) {
            console.log('DashboardHeader: Using user from Redux', user);
            setDisplayUserName(user.fullName || user.name || "My Account");
            setDisplayAvatar(user.avatar || user.image || "/images/resource/company-6.png");
        } else if (typeof window !== 'undefined') { // If not in Redux, try localStorage
            const userString = localStorage.getItem('user');
            if (userString) {
                try {
                    const userObj = JSON.parse(userString);
                    console.log('DashboardHeader: Using user from localStorage', userObj);
                    setDisplayUserName(userObj.fullName || userObj.name || "My Account");
                    setDisplayAvatar(userObj.avatar || userObj.image || "/images/resource/company-6.png");
                } catch (e) {
                    console.error('DashboardHeader: Failed to parse user from localStorage', e);
                    setDisplayUserName("My Account");
                    setDisplayAvatar("/images/resource/company-6.png");
                }
            } else {
                 console.log('DashboardHeader: No user found in Redux or localStorage');
                 setDisplayUserName("My Account");
                 setDisplayAvatar("/images/resource/company-6.png");
            }
        }
    }, [user]); // Depend on user from Redux

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
        router.push("/login"); // Redirect to login page
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
                        <button className="menu-btn">
                            <span className="count">1</span>
                            <span className="icon la la-heart-o"></span>
                        </button>
                        {/* wishlisted menu */}

                        <button className="menu-btn">
                            <span className="icon la la-bell"></span>
                        </button>
                        {/* End notification-icon */}

                        {/* <!-- Dashboard Option --> */}
                        <div className="dropdown dashboard-option">
                            <a
                                className="dropdown-toggle"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <Image
                                    alt="avatar"
                                    className="thumb"
                                    src={displayAvatar}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{displayUserName}</span>
                            </a>

                            <ul className="dropdown-menu">
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
                                    >
                                        {item.isLogout ? (
                                            <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
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
