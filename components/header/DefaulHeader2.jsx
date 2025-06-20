'use client'

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { clearLoginState, setLoginState } from '@/features/auth/authSlice';
import { authService } from "@/services/authService";
import HeaderNavContent from "./HeaderNavContent";
import Image from "next/image";
import employerMenuData from "../../data/employerMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import candidatesMenuData from "../../data/candidatesMenuData";
import adminMenuData from "../../data/adminMenuData";
import BecomeRecruiterModal from '../common/form/shared/BecomeRecruiterModal';



const DefaulHeader2 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [navbar, setNavbar] = useState(false);

  const { isLoggedIn, user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [openRecruiterModal, setOpenRecruiterModal] = useState(false);
  const [displayUserName, setDisplayUserName] = useState("My Account");
  const [displayAvatar, setDisplayAvatar] = useState("/images/resource/candidate-1.png");

  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'Company') {
        setDisplayUserName(authService.getFullNameCompany() || "My Account");
        setDisplayAvatar(authService.getProfileImageCompany() || "/images/resource/company-6.png");
      } else if (role === 'Candidate' || role === 'Admin') {
        const name = authService.getFullName();
        const avatar = authService.getProfileImage();
        setDisplayUserName(name || "My Account");
        setDisplayAvatar(avatar || "/images/resource/candidate-1.png");
      }
    } else {
      setDisplayUserName("My Account");
      setDisplayAvatar("/images/resource/candidate-1.png");
    }
  }, [isLoggedIn, role, user]);

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
    
    // Cập nhật state
    dispatch(clearLoginState());

    // Chuyển hướng về trang chủ
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
                      userId={user?.id || user?.userId || user?._id || user.uid || user}
                    />
                  )}
                </>
              )}
              <div className="dropdown dashboard-option">
                <a className="dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <Image
                    alt="avatar"
                    width={50}
                    height={50}
                    src={displayAvatar}
                    className="thumb"
                  />
                  <span className="name">{displayUserName}</span>
                </a>
                <ul className="dropdown-menu">
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
