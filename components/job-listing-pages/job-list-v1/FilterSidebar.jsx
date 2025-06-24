"use client";

import { useState, useEffect } from "react";
import CallToActions from "../components/CallToActions";
import Categories from "../components/Categories";
import DatePosted from "../components/DatePosted";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import ExperienceLevel from "../components/ExperienceLevel";
import JobType from "../components/JobType";
import LocationBox from "../components/LocationBox";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import SearchBox from "../components/SearchBox";
import Tag from "../components/Tag";
import { jobService } from "@/services/jobService";
import locationService from "@/services/locationService";

const FilterSidebar = () => {
  // Thêm state để lưu dữ liệu lookup trong FilterSidebar
  const [jobTypesData, setJobTypesData] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  // Add state for provinces
  const [provinces, setProvinces] = useState([]);

  // Add state for filter selections
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedDatePosted, setSelectedDatePosted] = useState(null);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState([0, 20000]); // Default salary range

  // Add state for loading lookup data
  const [loadingLookupData, setLoadingLookupData] = useState(true);

  // Handler functions for filter changes
  const handleJobTypeChange = (jobTypeId) => {
    // Example handler: toggle job type selection
    setSelectedJobTypes((prev) =>
      prev.includes(jobTypeId)
        ? prev.filter((id) => id !== jobTypeId)
        : [...prev, jobTypeId]
    );
    console.log("Job Type selected:", jobTypeId);
  };

  const handleDatePostedChange = (dateValue) => {
    setSelectedDatePosted(dateValue);
  };

  const handleExperienceLevelChange = (expLevelId) => {
    // Example handler: toggle experience level selection
    setSelectedExperienceLevels((prev) =>
      prev.includes(expLevelId)
        ? prev.filter((id) => id !== expLevelId)
        : [...prev, expLevelId]
    );
  };

  const handleIndustryChange = (industryId) => {
    setSelectedIndustry(industryId);
  };

  const handleSalaryRangeChange = (range) => {
    setSelectedSalaryRange(range);
  };

  // Fetch dữ liệu lookup khi component mount
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const [jobTypesRes, expLevelsRes, industriesRes, provincesRes] =
          await Promise.all([
            jobService.getJobTypes(),
            jobService.getExperienceLevels(),
            jobService.getIndustries(),
            locationService.getProvinces(),
          ]);
        setJobTypesData(jobTypesRes);
        setExperienceLevels(expLevelsRes);
        setIndustries(industriesRes);
        setProvinces(provincesRes);
      } catch (err) {
        console.error("Failed to fetch lookup data in FilterSidebar", err);
      } finally {
        setLoadingLookupData(false);
      }
    };
    fetchLookupData();
  }, []);

  return (
    <div className="inner-column">
      <div className="filters-outer">
        <button
          type="button"
          className="btn-close text-reset close-filters show-1023"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
        {/* End .close filter */}

        <div className="filter-block">
          <h4>Search by Keywords</h4>
          <div className="form-group">
            <SearchBox disabled={loadingLookupData} />
          </div>
        </div>
        {/* <!-- Filter Block --> */}

        <div className="filter-block">
          <h4>Location</h4>
          <div className="form-group">
            {loadingLookupData ? (
              <div
                className="skeleton"
                style={{ width: "100%", height: 32, borderRadius: 6 }}
              />
            ) : (
              <LocationBox provinces={provinces} disabled={loadingLookupData} />
            )}
          </div>
        </div>
        {/* <!-- Filter Block --> */}

        <div className="filter-block">
          <h4>Industry</h4>
          <div className="form-group">
            {loadingLookupData ? (
              <div
                className="skeleton"
                style={{ width: "100%", height: 32, borderRadius: 6 }}
              />
            ) : (
              <Categories
                industries={industries}
                onSelectIndustry={handleIndustryChange}
                disabled={loadingLookupData}
              />
            )}
          </div>
        </div>
        {/* <!-- Filter Block --> */}

        <div className="switchbox-outer">
          <h4>Job type</h4>
          {loadingLookupData ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: 32, borderRadius: 6 }}
            />
          ) : (
            <JobType
              jobTypes={jobTypesData}
              onSelectJobType={handleJobTypeChange}
              disabled={loadingLookupData}
            />
          )}
        </div>
        {/* <!-- Switchbox Outer --> */}

        <div className="checkbox-outer">
          <h4>Date Posted</h4>
          {loadingLookupData ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: 32, borderRadius: 6 }}
            />
          ) : (
            <DatePosted
              onSelectDatePosted={handleDatePostedChange}
              disabled={loadingLookupData}
            />
          )}
        </div>
        {/* <!-- Checkboxes Ouer --> */}

        <div className="checkbox-outer">
          <h4>Experience Level</h4>
          {loadingLookupData ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: 32, borderRadius: 6 }}
            />
          ) : (
            <ExperienceLevel
              experienceLevels={experienceLevels}
              onSelectExperienceLevel={handleExperienceLevelChange}
              disabled={loadingLookupData}
            />
          )}
        </div>
        {/* <!-- Checkboxes Ouer --> */}

        <div className="filter-block">
          <h4>Salary</h4>
          {loadingLookupData ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: 32, borderRadius: 6 }}
            />
          ) : (
            <SalaryRangeSlider
              onChange={handleSalaryRangeChange}
              disabled={loadingLookupData}
            />
          )}
        </div>
        {/* <!-- Filter Block --> */}

        <div className="filter-block"></div>
        {/* <!-- Filter Block --> */}
      </div>
      {/* Filter Outer */}

      <CallToActions />
      {/* <!-- End Call To Action --> */}
      <style jsx>{`
        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 37%,
            #f0f0f0 63%
          );
          background-size: 400% 100%;
          animation: skeleton-loading 1.4s ease infinite;
        }
        @keyframes skeleton-loading {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default FilterSidebar;
