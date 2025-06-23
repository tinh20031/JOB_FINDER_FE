'use client';
import React from "react";
import FooterDefault from "../../components/footer/common-footer";
import Breadcrumb from "../../components/common/Breadcrumb";
import DefaulHeader2 from "../../components/header/DefaulHeader2";
import MobileMenu from "../../components/header/MobileMenu";
import FavoriteJobsBox from "../../components/job-listing-pages/favorite-jobs/FavoriteJobsBox";

const FavoriteJobsPage = () => {
  return (
    <>
      <span className="header-span"></span>
      <DefaulHeader2 />
      <MobileMenu />
      <Breadcrumb title="Favorite Jobs" meta="Favorite Jobs" />
      <section className="ls-section">
        <div className="auto-container">
          <div className="row">
            <div className="content-column col-lg-12 col-md-12 col-sm-12">
              <div className="ls-outer">
                <FavoriteJobsBox />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterDefault footerStyle="alternate5" />
    </>
  );
};

export default FavoriteJobsPage; 