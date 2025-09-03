import Link from "next/link";
import About from "../about/About";
// import AppSection from "../app-section/AppSection";
import Blog from "../blog/Blog";
import CallToAction from "../call-to-action/CallToAction";
import LoginPopup from "../common/form/login/LoginPopup";
// import Partner from "../common/partner/Partner";
import FooterDefault from "../footer/common-footer";
import Funfact from "../fun-fact-counter/Funfact";
import MainHeader from "@/components/header/MainHeader";
import MobileMenu from "../header/MobileMenu";
import Hero1 from "../hero/hero-1";
import JobCategorie1 from "../job-categories/JobCategorie1";
import JobFeatured1 from "../job-featured/JobFeatured1";
import TrendingJobsHome from "../job-featured/TrendingJobsHome";
// import Testimonial from "../testimonial/Testimonial";

const index = () => {
  return (
    <>
      <LoginPopup />
      {/* End Login Popup Modal */}

      <MainHeader />
      {/* End Header with upload cv btn */}

      <MobileMenu />
      {/* End MobileMenu */}

      <Hero1 />
      {/* End Hero Section */}

      <section className="job-categories ui-job-categories">
      <div className="auto-container">
        <div className="sec-title text-center">
          <h2>Popular Job Industry</h2>
        </div>

        <div
          className="row"
          data-aos="fade-up"
          data-aos-anchor-placement="top-bottom"
        >
          <JobCategorie1 />
        </div>
      </div>
    </section>
      {/* End Job Categorie Section */}

      {/* Trending Jobs Section */}
      <section className="job-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Trending Jobs</h2>
            <div className="text">
              Hot jobs trending now
            </div>
          </div>

          <div className="row " data-aos="fade-up">
            <TrendingJobsHome />
          </div>
        </div>
      </section>
      {/* End Trending Jobs Section */}

      <section className="job-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Featured Jobs</h2>
            <div className="text">
              Know your worth and find the job that qualify your life
            </div>
          </div>

          <div className="row " data-aos="fade-up">
            <JobFeatured1 />
          </div>

          <div className="btn-box">
            <Link
                              href="/job-list"
              className="theme-btn btn-style-one bg-blue"
            >
              <span className="btn-title">Load More Listing</span>
            </Link>
          </div>
        </div>
      </section>
      {/* End Job Featured Section */}

      <section className="about-section">
        <div className="auto-container">
          <div className="row">
            <About />
          </div>

          {/* <!-- Fun Fact Section --> */}
          <div className="fun-fact-section">
            <div className="row">
              <Funfact />
            </div>
          </div>
          {/* <!-- Fun Fact Section --> */}
        </div>
      </section>
      {/* <!-- End About Section --> */}

     
      {/* <!-- End App Section --> */}

      <CallToAction />
      {/* <!-- End Call To Action --> */}

      <FooterDefault />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
