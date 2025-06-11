'use client'
import { useDispatch, useSelector } from "react-redux";
import { addJobType } from "../../../features/filter/filterSlice";

const JobType = ({ jobTypes, onSelectJobType }) => {
    const dispatch = useDispatch();

    // Lấy jobType đang được chọn từ filter slice
    const { jobList } = useSelector((state) => state.filter) || {};
    const selectedJobTypes = jobList?.jobType || [];

    // dispatch job-type handler
    const jobTypeHandler = (e, value) => {
        console.log('jobTypeHandler called with value:', value);
        // Dispatch giá trị (value) của loại công việc được chọn
        dispatch(addJobType(value));
        // Call the handler passed from parent with item.id
        if (onSelectJobType) {
            onSelectJobType(e.target.checked ? value : null); // Pass value (item.id) if checked, or null if unchecked
        }
    };

    return (
        <ul className="switchbox">
            {jobTypes?.map((item) => (
                <li key={item.id}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={item.id} // Use item.id as the value
                            checked={selectedJobTypes.includes(item.id) || false} // Check based on item.id
                            onChange={(e) => jobTypeHandler(e, item.id)} // Pass item.id to handler
                        />
                        <span className="slider round"></span>
                        <span className="title">{item.jobTypeName}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
};

export default JobType;
