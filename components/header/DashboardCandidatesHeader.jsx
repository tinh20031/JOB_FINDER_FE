'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import candidatesMenuData from "../../data/candidatesMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import { authService } from "../../services/authService";
import { useSelector } from "react-redux";

const DashboardCandidatesHeader = () => {
    const [navbar, setNavbar] = useState(false);
    const [fullName, setFullName] = useState("Tài khoản của tôi");
    const [avatar, setAvatar] = useState("/images/resource/candidate-1.png");

    const { isLoggedIn, user, role } = useSelector((state) => state.auth); // Added useSelector

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
            if (user.image) {
                setAvatar(user.image);
            } else if (user.avatar) {
                setAvatar(user.avatar);
            } else {
                setAvatar("/images/resource/candidate-1.png");
            }
        }
    }, []);

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
                        <button className="menu-btn">
                            <span className="count">1</span>
                            <span className="icon la la-heart-o"></span>
                        </button>
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
                                            <i
                                                className={`la ${item.icon}`}
                                            ></i>{" "}
                                            {item.name}
                                        </Link>
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

export default DashboardCandidatesHeader;
