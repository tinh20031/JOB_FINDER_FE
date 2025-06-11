'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation } from "../../../features/filter/employerFilterSlice";

const LocationBox = ({ provinces }) => {
    const { employerFilter } = useSelector((state) => state);
    const [getLocation, setLocation] = useState(employerFilter.location);
    const dispatch = useDispatch();

    // location handler
    const locationHandler = (e) => {
        dispatch(addLocation(e.target.value));
    };

    useEffect(() => {
        setLocation(employerFilter.location);
    }, [setLocation, employerFilter.location]);

    return (
        <>
            <select
                className="form-select"
                onChange={locationHandler}
                value={getLocation}
            >
                <option value="">City or postcode</option>
                {/* Sử dụng provinces từ state để render options */}
                {provinces?.map((item) => (
                    <option key={item.code} value={item.name}> 
                        {item.name}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;
