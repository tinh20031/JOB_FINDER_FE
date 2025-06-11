'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import employerMenuData from "../../data/adminMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from 'react-redux';
import { clearLoginState } from '@/features/auth/authSlice';
import { authService } from "../../services/authService";
import Cookies from 'js-cookie';

const DashboardHeader = () => {
    const [navbar, setNavbar] = useState(false);
    const [fullName, setFullName] = useState("Admin");
    const [avatar, setAvatar] = useState("/images/resource/company-6.png");
    const router = useRouter();
    const dispatch = useDispatch();

    const changeBackground = () => {
        if (window.scrollY >= 0) {
            setNavbar(true);
        } else {
            setNavbar(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", changeBackground);
        // Lấy thông tin user từ localStorage (nếu có)
        if (typeof window !== 'undefined') {
            const userString = localStorage.getItem('user');
            console.log('User string from localStorage:', userString);
            if (userString) {
                const user = JSON.parse(userString);
                console.log('Parsed user object:', user);
                if (user.fullName) setFullName(user.fullName);
                else if (user.name) setFullName(user.name);
                if (user.avatar) {
                    console.log('Found user avatar URL:', user.avatar);
                    setAvatar(user.avatar);
                } else {
                    console.log('No user avatar URL found in user object.');
                    setAvatar("/images/resource/company-6.png"); // Keep default if no avatar
                }
            } else {
                console.log('No user data found in localStorage.');
                setAvatar("/images/resource/company-6.png"); // Keep default if no user data
            }
        }
    }, []);

    const handleLogout = () => {
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
          console.log('LOGOUT CALLED from Admin Dashboard Header: cookies and localStorage removed');
        }
        authService.logout(); // vẫn gọi để đồng bộ logic
        dispatch(clearLoginState());
        router.push('/'); // Redirect to home or login page
      };
    
      const handleMenuClick = (item) => {
        if (item.isLogout) {
          handleLogout();
        } else {
            router.push(item.routePath);
        }
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
                    </div>
                    {/* End .nav-outer */}

                    <div className="outer-box">
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
                                    src={avatar}
                                    width={50}
                                    height={50}
                                />
                                <span className="name">{fullName}</span>
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
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick(item); }}>
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
