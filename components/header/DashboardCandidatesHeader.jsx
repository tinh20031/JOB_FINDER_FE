'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import candidatesMenuData from "../../data/candidatesHeaderMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { useSelector, useDispatch } from "react-redux";
import { getUserFavorites } from "../../services/favoriteJobService";
import { useFavoriteJobs } from "../../contexts/FavoriteJobsContext";
import { clearLoginState } from '@/features/auth/authSlice';
import Cookies from 'js-cookie';

// Helper function to validate image URLs
const getValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  // Check if it's "string" literal or invalid
  if (url === "string") {
    return null;
  }
  // Check if it's an absolute URL or a relative path starting with /
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }
  return null; // Invalid URL
};

const DashboardCandidatesHeader = () => {
    const [navbar, setNavbar] = useState(false);
    const [fullName, setFullName] = useState("My Account");
    const [avatar, setAvatar] = useState("/images/resource/candidate-1.png");
    const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null;

    const { isLoggedIn, user, role } = useSelector((state) => state.auth);
    const { favoriteCount } = useFavoriteJobs() || {};
    const router = useRouter();
    const dispatch = useDispatch();

    const changeBackground = () => {
        if (typeof window !== 'undefined' && window.scrollY >= 0) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener("scroll", changeBackground);
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.fullName) setFullName(user.fullName);
            else if (user.name) setFullName(user.name);
            else {
                const userName = authService.getName();
                if (userName) {
                    setFullName(userName);
                }
            }
            
            // Handle avatar with validation
            let userAvatar = null;
            if (user.image) {
                userAvatar = getValidImageUrl(user.image);
            } else if (user.avatar) {
                userAvatar = getValidImageUrl(user.avatar);
            }
            
            setAvatar(userAvatar || "/images/resource/candidate-1.png");
        }
    }, []);

    // Hàm xử lý logout
    const handleLogout = (e) => {
        e.preventDefault();
        // Xóa cookie với cả path '/' và domain 'localhost'
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
        if (authService.logout) {
            authService.logout();
        }
        dispatch(clearLoginState());
        router.push('/');
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
                        {/* Danh sách yêu thích */}

                        <button className="menu-btn">
                            <span className="icon la la-bell"></span>
                        </button>
                        {/* Thông báo */}

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
                                    src={avatar}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{fullName}</span>
                            </a>

                            <ul className="dropdown-menu">
                                {candidatesMenuData.map((item) => (
                                    item.isLogout ? (
                                        <li className="mb-1" key={item.id}>
                                            <a href="/login" onClick={handleLogout}>
                                                <i className={`la ${item.icon}`}></i>{" "}
                                                {item.name}
                                            </a>
                                        </li>
                                    ) : (
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
                                            <Link href={item.routePath}>
                                                <i className={`la ${item.icon}`}></i>{" "}
                                                {item.name}
                                            </Link>
                                        </li>
                                    )
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

export default DashboardCandidatesHeader;
