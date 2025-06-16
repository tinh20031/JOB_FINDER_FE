"use client";

import {

  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";

import mobileMenuData from "../../../data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import {
  isActiveLink,
  isActiveParentChaild,
} from "../../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";


const Index = () => {

  const router = useRouter()


  return (
    <div
      className="offcanvas offcanvas-start mobile_menu-contnet"
      tabIndex="-1"
      id="offcanvasMenu"
      data-bs-scroll="true"
    >
      <SidebarHeader />
      {/* End pro-header */}

      
        <Sidebar>
          <Menu>
            {mobileMenuData.map((item) => (
              item.items && item.items.length > 0 ? (
                <SubMenu
                  className={
                    isActiveParentChaild(item.items, usePathname())
                      ? "menu-active"
                      : ""
                  }
                  label={item.label}
                  key={item.id}
                >
                  {item.items.map((menuItem, i) => (
                    <MenuItem
                      onClick={() => router.push(menuItem.routePath)}
                      className={
                        isActiveLink(menuItem.routePath, usePathname())
                          ? "menu-active-link"
                          : ""
                      }
                      key={i}
                    >
                      {menuItem.name}
                    </MenuItem>
                  ))}
                </SubMenu>
              ) : (
                <MenuItem
                  onClick={() => router.push(item.routePath)}
                  className={isActiveLink(item.routePath, usePathname()) ? "menu-active-link" : ""}
                  key={item.id}
                >
                  {item.label}
                </MenuItem>
              )
            ))}
          </Menu>
        </Sidebar>


      <SidebarFooter />
    </div>
  );
};

export default Index;