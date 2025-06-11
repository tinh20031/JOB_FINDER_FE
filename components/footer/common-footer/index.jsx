import Image from "next/image";
// import CopyrightFooter from "./CopyrightFooter";
import FooterContent from "./FooterContent";

const index = ({ footerStyle = "" }) => {
  return (
    <footer className={`main-footer ${footerStyle}`}>
      <div className="auto-container">
        {/* <!--Widgets Section--> */}
        <div className="widgets-section" data-aos="fade-up">
          <div className="row">
            {/* Xóa bỏ cột hiển thị logo, số điện thoại, địa chỉ, email */}
            {/*
            <div className="big-column col-xl-4 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo">
                  <a href="#">
                    <Image
                      width={154}
                      height={50}
                      src="/images/logo.svg"
                      alt="brand"
                    />
                  </a>
                </div>
                <p className="phone-num">
                  <span>Call us </span>
                  <a href="thebeehost@support.com">123 456 7890</a>
                </p>
                <p className="address">
                  329 Queensberry Street, North Melbourne VIC
                  <br /> 3051, Australia. <br />
                  <a href="mailto:support@superio.com" className="email">
                    support@superio.com
                  </a>
                </p>
              </div>
            </div>
            */}
            {/* End footer left widget */}

            {/* Điều chỉnh cột bên phải để chiếm toàn bộ chiều rộng */}
            <div className="big-column col-xl-12 col-lg-12 col-md-12">
              <div className="row">
                <FooterContent />
              </div>
            </div>
            {/* End col-xl-8 */}
          </div>
        </div>
      </div>
      {/* End auto-container */}

    </footer>
    //   {/* <!-- End Main Footer --> */}
  );
};

export default index;
