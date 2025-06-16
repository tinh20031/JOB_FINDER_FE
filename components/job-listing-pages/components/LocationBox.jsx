'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation } from "../../../features/filter/filterSlice";

// Nhận prop provinces
const LocationBox = ({ provinces }) => {
    const { jobList } = useSelector((state) => state.filter);
    // Giữ state cục bộ để quản lý giá trị select
    const [selectedProvince, setSelectedProvince] = useState(jobList.location);
    const dispatch = useDispatch(); // Đổi tên biến dispath thành dispatch

    // location handler
    const locationHandler = (e) => {
        const value = e.target.value; // Lấy giá trị (provinceName) từ select
        setSelectedProvince(value); // Cập nhật state cục bộ
        dispatch(addLocation(value)); // Dispatch giá trị (provinceName) được chọn
    };

    // Cập nhật state cục bộ khi jobList.location thay đổi (ví dụ: khi clear filters)
    useEffect(() => {
        setSelectedProvince(jobList.location);
    }, [jobList.location]);

    return (
        <>
            <select
                className="form-select" // Sử dụng class form-select của Bootstrap
                value={selectedProvince} // Controlled component
                onChange={locationHandler}
            >
                <option key="default" value="">City or postcode</option>
                {provinces?.map((province) => (
                    <option 
                        key={province.id || province.name} 
                        value={province.name}
                    >
                        {province.name}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;
