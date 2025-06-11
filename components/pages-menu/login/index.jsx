import dynamic from "next/dynamic";

import FormContent from "../../common/form/login/FormContent";
// import MobileMenu from "../../header/MobileMenu"; // Remove direct import
// import Header from "./Header"; // Remove direct import

const Header = dynamic(() => import("./Header"), { ssr: false }); // Dynamically import Header
const MobileMenu = dynamic(() => import("../../header/MobileMenu"), { ssr: false }); // Dynamically import MobileMenu

const index = () => {
  return (
    <>
      <Header />
      {/* <!--End Main Header -->  */}

      <MobileMenu />
      {/* End MobileMenu */}

      <div className="login-section">
        <div
          className="image-layer"
          style={{ backgroundImage: "url(/images/background/12.jpg)" }}
        ></div>
        <div className="outer-box">
          {/* <!-- Login Form --> */}
          <div className="login-form default-form">
            <FormContent />
          </div>
          {/* <!--End Login Form --> */}
        </div>
      </div>
      {/* <!-- End Info Section --> */}
    </>
  );
};

export default index;
