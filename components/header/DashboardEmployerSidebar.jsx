'use client'

import Link from "next/link";
import employerMenuData from "../../data/employerMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";

import { useDispatch, useSelector } from "react-redux";
import { menuToggle } from "../../features/toggle/toggleSlice";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/authService";
import { clearLoginState } from "../../features/auth/authSlice";

const DashboardEmployerSidebar = () => {

    const { menu } = useSelector((state) => state.toggle);

    const dispatch = useDispatch();
    const router = useRouter();

    // menu togggle handler
    const menuToggleHandler = () => {
        dispatch(menuToggle());
    };

    const handleLogout = () => {
        authService.logout(); // Clear localStorage
        dispatch(clearLoginState()); // Clear Redux state
        window.location.href = '/'; // Redirect to home page
    };

    return (
        <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
            {/* Start sidebar close icon */}
            <div className="pro-header text-end pb-0 mb-0 show-1023">
                <div className="fix-icon" onClick={menuToggleHandler}>
                    <span className="flaticon-close"></span>
                </div>
            </div>
            {/* End sidebar close icon */}

            <div className="sidebar-inner">
                <ul className="navigation">
                    {employerMenuData.map((item) => (
                        <li
                            className={`${
                                isActiveLink(item.routePath, usePathname())
                                    ? "active"
                                    : ""
                            } mb-1`}
                            key={item.id}
                            onClick={menuToggleHandler}
                        >
                            {item.isLogout ? (
                                <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                    <i className={`la ${item.icon}`}></i>{" "}
                                    {item.name}
                                </a>
                            ) : (
                                <Link href={item.routePath}>
                                    <i className={`la ${item.icon}`}></i>{" "}
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardEmployerSidebar;