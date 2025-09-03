'use client';
import React, { Suspense } from "react";
import FooterDefault from "../../components/footer/common-footer";
import Breadcrumb from "../../components/common/Breadcrumb";
import MainHeader from "@/components/header/MainHeader";
import MobileMenu from "../../components/header/MobileMenu";
import FavoriteJobsBox from "../../components/job-listing-pages/favorite-jobs/FavoriteJobsBox";
import FilterSidebar from "../../components/job-listing-pages/job-list/FilterSidebar";

const FavoriteJobsPage = () => {
  return (
    <>
      <span className="header-span"></span>
      <MainHeader />
      <MobileMenu />
      <Breadcrumb title="Favorite Jobs" meta="Favorite Jobs" />
      <section className="ls-section">
        <div className="auto-container">
          <div className="row">
            <div className="col-lg-4 col-md-12 col-sm-12">
              <FilterSidebar />
            </div>
            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              <div className="ls-outer">
                <Suspense fallback={<div>Loading...</div>}>
                  <FavoriteJobsBox />
                </Suspense>
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