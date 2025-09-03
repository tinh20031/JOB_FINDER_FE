"use client";

import Link from "next/link";
import {
  homeItems,
  findJobItems,
  employerItems,
  candidateItems,
  // blogItems,
  // pageItems,
} from "../../data/mainMenuData";
import { usePathname } from "next/navigation";
import { isActiveLink } from "../../utils/linkActiveChecker";

const mainLinks = [
  { name: "Home", route: homeItems[0]?.items[0]?.routePath || "/" },
  { name: "Find Jobs", route: findJobItems[0]?.items[0]?.routePath || "/" },
  { name: "Find Companies", route: employerItems[0]?.items[0]?.routePath || "/" },
  // { name: "Candidates", route: candidateItems[0]?.items[0]?.routePath || "/" },
  // { name: "Blog", route: blogItems[0]?.routePath || "/" },
  // { name: "Pages", route: pageItems[0]?.routePath || "/" },
];

const HeaderNavContent = () => {
  const pathname = usePathname();
  return (
    <nav className="nav main-menu">
      <ul className="navigation" id="navbar">
        {mainLinks.map((link) => (
          <li key={link.name} className={isActiveLink(link.route, pathname) ? "current" : ""}>
            <Link href={link.route}>{link.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderNavContent;