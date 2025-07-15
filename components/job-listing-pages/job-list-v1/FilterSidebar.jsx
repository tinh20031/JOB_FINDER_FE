"use client";

import { useState, useEffect } from "react";
import CallToActions from "../components/CallToActions";
import Categories from "../components/Categories";
import DatePosted from "../components/DatePosted";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import Level from "../components/Level";
import JobType from "../components/JobType";
import LocationBox from "../components/LocationBox";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import SearchBox from "../components/SearchBox";
import Tag from "../components/Tag";
import { jobService } from "@/services/jobService";
import locationService from "@/services/locationService";
import { useDispatch } from "react-redux";
import {
  addCategory,
  addDatePosted,
  addDestination,
  addKeyword,
  addLocation,
  addPerPage,
  addSalary,
  addSort,
  addTag,
  addLevel,
  clearJobType,
} from "../../../features/filter/filterSlice";
import { clearDatePostToggle, clearJobTypeToggle } from "../../../features/job/jobSlice";

const FilterSidebar = () => {
  // Thêm state để lưu dữ liệu lookup trong FilterSidebar
  const [jobTypesData, setJobTypesData] = useState([]);
  const [levels, setLevels] = useState([]);
  const [industries, setIndustries] = useState([]);
  // Add state for provinces
  const [provinces, setProvinces] = useState([]);

  // Add state for loading lookup data
  const [loadingLookupData, setLoadingLookupData] = useState(true);

  const dispatch = useDispatch();

  // Fetch dữ liệu lookup khi component mount
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const [jobTypesRes, levelsRes, industriesRes, provincesRes] =
          await Promise.all([
            jobService.getJobTypes(),
            jobService.getJobLevels(),
            jobService.getIndustries(),
            locationService.getProvinces(),
          ]);
        setJobTypesData(jobTypesRes);
        setLevels(levelsRes);
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
            <DatePosted disabled={loadingLookupData} />
          )}
        </div>
        {/* <!-- Checkboxes Ouer --> */}

        <div className="checkbox-outer">
          <h4>Level</h4>
          {loadingLookupData ? (
            <div
              className="skeleton"
              style={{ width: "100%", height: 32, borderRadius: 6 }}
            />
          ) : (
            <Level
              levels={levels}
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
            <SalaryRangeSlider disabled={loadingLookupData} />
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
