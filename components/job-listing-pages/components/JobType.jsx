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
        if (selectedJobTypes.includes(value)) {
            // Nếu click lại loại đang chọn thì tắt hết
            dispatch({ type: 'filter/clearJobType' });
            if (onSelectJobType) onSelectJobType(null);
        } else {
            // Chỉ chọn 1 loại, tắt các loại khác
            dispatch({ type: 'filter/clearJobType' });
            dispatch(addJobType(value));
            if (onSelectJobType) onSelectJobType(value);
        }
    };

    return (
        <ul className="switchbox">
            {jobTypes?.map((item) => (
                <li key={item.jobTypeId}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={item.jobTypeId}
                            checked={selectedJobTypes.includes(item.jobTypeId)}
                            onChange={(e) => jobTypeHandler(e, item.jobTypeId)}
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
