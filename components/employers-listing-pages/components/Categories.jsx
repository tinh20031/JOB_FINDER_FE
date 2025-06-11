'use client'
import { useDispatch, useSelector } from "react-redux";
import { addIndustry } from "../../../features/filter/employerFilterSlice";
import { useEffect, useState } from "react";

// Nhận industries từ props và prop onSelectIndustry
const Categories = ({ industries, onSelectIndustry }) => {
    const { employerFilter } = useSelector((state) => state) || {};
    const [getIndustry, setIndustry] = useState(employerFilter.industry);

    const dispatch = useDispatch();

    // category handler
    const industryHandler = (e) => {
         // Dispatch giá trị (industryId) của industry được chọn
        dispatch(addIndustry(e.target.value));
        // Call the handler passed from parent
        if (onSelectIndustry) {
            onSelectIndustry(e.target.value);
        }
    };

    useEffect(() => {
        setIndustry(employerFilter.industry);
    }, [setIndustry, employerFilter]);

    return (
        <>
            <select
                className="form-select"
                value={getIndustry} // Lấy giá trị industry đang chọn từ filter slice
                onChange={industryHandler}
            >
                <option value="">Choose an Industry</option>
                {/* Sử dụng industries từ state để render options */}
                {industries?.map((item) => (
                    <option key={item.industryId} value={item.industryId}> 
                        {item.industryName}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-briefcase"></span>
        </>
    );
};

export default Categories;
