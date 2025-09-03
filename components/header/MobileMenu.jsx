'use client'

import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";
import { useSelector, useDispatch } from 'react-redux';
import MobileHeaderLoggedIn from "./MobileHeaderLoggedIn";
import { authService } from "@/services/authService";
import { setLoginState } from '@/features/auth/authSlice';
import { useEffect, useState } from 'react';

const MobileMenu = () => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined' && !isLoggedIn) {
      const token = authService.getToken();
      const userRole = authService.getRole();
      const userString = localStorage.getItem('user');

      if (token && userRole && userString) {
        try {
          const userObj = JSON.parse(userString);
          const userAvatar = userObj.image || userObj.avatar || "/images/resource/candidate-1.png";

          dispatch(setLoginState({
            isLoggedIn: true,
            userObject: {
              ...userObj,
              image: userAvatar,
              avatar: userAvatar
            },
            role: userRole
          }));
        } catch (error) {
          console.error('Error parsing user data from localStorage in MobileMenu:', error);
        }
      }
    }
  }, [hasMounted, isLoggedIn, dispatch]);

  if (!hasMounted) {
    return null;
  }

  if (isLoggedIn) {
    return <MobileHeaderLoggedIn />;
  }

  return (
    // <!-- Main Header-->
    <header className="main-header main-header-mobile">
      <div className="auto-container">
        {/* <!-- Main box --> */}
        <div className="inner-box">
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
                />
                </Link>
              </div>
            </div>
            {/* End .logo-box */}

            <MobileSidebar />
            {/* <!-- Main Menu End--> */}
          </div>
          {/* End .nav-outer */}

          <div className="outer-box">
            <div className="login-box">
              <a
                href="#"
                className="call-modal"
                data-bs-toggle="modal"
                data-bs-target="#loginPopupModal"
              >
                <span className="icon icon-user"></span>
              </a>
            </div>
            {/* login popup end */}

            <a
              href="#"
              className="mobile-nav-toggler"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
            >
              <span className="flaticon-menu-1"></span>
            </a>
            {/* right humberger menu */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileMenu;
