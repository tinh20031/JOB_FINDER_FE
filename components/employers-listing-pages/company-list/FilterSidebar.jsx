'use client'

import { useState, useEffect } from "react";
import CallToActions from "../components/CallToActions";
import Categories from "../components/Categories";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import CompanySize from "../components/CompanySize";
import LocationBox from "../components/LocationBox";
import FoundationDate from "../components/FoundationDate";
import SearchBox from "../components/SearchBox";
import locationService from "@/services/locationService";
import { industryService } from "@/services/industryService";

const FilterSidebar = () => {
    // Thêm state để lưu dữ liệu lookup
    const [fetchedProvinces, setFetchedProvinces] = useState([]);
    const [fetchedIndustries, setFetchedIndustries] = useState([]);
    const [loadingLookupData, setLoadingLookupData] = useState(true);
    const [lookupDataError, setLookupDataError] = useState(null);

    // Fetch dữ liệu lookup khi component mount
    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                setLoadingLookupData(true);
                const [provincesRes, industriesRes] = await Promise.all([
                    locationService.getProvinces(),
                    industryService.getAll()
                ]);
                setFetchedProvinces(provincesRes);
                setFetchedIndustries(industriesRes);
            } catch (err) {
                setLookupDataError(err.message || 'Failed to fetch lookup data in sidebar');
                console.error('Failed to fetch lookup data in FilterSidebar', err);
            } finally {
                setLoadingLookupData(false);
            }
        };
        fetchLookupData();
    }, []); // Mảng rỗng đảm bảo chỉ chạy một lần khi mount

    return (
        <div className="inner-column pd-right">
            {loadingLookupData && <div className="text-center py-3">Loading filters...</div>}
            {lookupDataError && <div className="text-center py-3 text-danger">Error loading filters: {lookupDataError}</div>}
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
                        <SearchBox />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Location</h4>
                    <div className="form-group">
                        <LocationBox provinces={fetchedProvinces} />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Industry</h4>
                    <div className="form-group">
                        <Categories industries={fetchedIndustries} />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Company Size</h4>
                    <div className="form-group">
                        <CompanySize />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}

            <CallToActions />
            {/* <!-- End Call To Action --> */}
        </div>
    );
};

export default FilterSidebar;
