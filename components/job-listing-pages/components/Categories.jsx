'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";

// Nhận industries từ props và prop onSelectIndustry
const Categories = ({ industries, onSelectIndustry }) => {
    const { category } = useSelector((state) => state.filter.jobList) || {};
    // Không cần state getCategory/setCategory riêng nữa
    // const [getCategory, setCategory] = useState(jobList.category);

    const dispatch = useDispatch();

    // category handler
    const categoryHandler = (e) => {
         // Dispatch giá trị (industryId) của category được chọn
        dispatch(addCategory(e.target.value));
        // Call the handler passed from parent
        if (onSelectIndustry) {
            onSelectIndustry(e.target.value);
        }
    };

    // Không cần useEffect để cập nhật state category riêng nữa
    // useEffect(() => {
    //     setCategory(jobList.category);
    // }, [setCategory, jobList]);

    return (
        <>
            <select
                className="form-select"
                value={category || ""} 
                onChange={categoryHandler}
            >
                <option value="">Choose an Industry</option>
                {/* Sử dụng industries từ props để render options */}
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
