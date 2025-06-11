'use client'

import { useState, useEffect } from "react";
import Categories from "../components/Categories";
import DestinationRangeSlider from "../components/DestinationRangeSlider";
import CandidatesGender from "../components/CandidatesGender";
import LocationBox from "../components/LocationBox";
import SearchBox from "../components/SearchBox";
import DatePosted from "../components/DatePosted";
import Experience from "../components/Experience";
import Qualification from "../components/Qualification";
import locationService from "@/services/locationService";

const FilterSidebar = () => {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const provincesData = await locationService.getProvinces();
                setProvinces(provincesData);
            } catch (err) {
                console.error('Error fetching provinces:', err);
                setError('Failed to load location data');
            } finally {
                setLoading(false);
            }
        };

        fetchProvinces();
    }, []);

    if (loading) return <div className="inner-column">Loading filters...</div>;
    if (error) return <div className="inner-column text-danger">{error}</div>;

    return (
        <div className="inner-column pd-right">
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
                        <LocationBox provinces={provinces} />
                    </div>

                    <p>Radius around selected destination</p>
                    <DestinationRangeSlider />
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Category</h4>
                    <div className="form-group">
                        <Categories />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Candidate Gender</h4>
                    <div className="form-group">
                        <CandidatesGender />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Date Posted</h4>
                    <DatePosted />
                </div>
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Experience</h4>
                    <Experience />
                </div>
                {/* <!-- Filter Block --> */}

                <div className=" checkbox-outer">
                    <h4>Qualification</h4>
                    <Qualification />
                </div>
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}
        </div>
    );
};

export default FilterSidebar;
