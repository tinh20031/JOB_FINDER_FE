'use client'
import { useDispatch, useSelector } from "react-redux";
import { addExperience } from "../../../features/filter/filterSlice";

const ExperienceLevel = ({ experienceLevels, onSelectExperienceLevel }) => {
    const dispatch = useDispatch();

    // Lấy experience đang được chọn từ filter slice
    const { jobList } = useSelector((state) => state.filter) || {};
    const selectedExperienceLevels = jobList?.experience || [];

    // experience handler
    const experienceHandler = (e, value) => {
        dispatch(addExperience(value));
        // Call the handler passed from parent with item.id and checked status
        if (onSelectExperienceLevel) {
            onSelectExperienceLevel(value);
        }
    };

    return (
        <ul className="switchbox">
            {experienceLevels?.map((item) => (
                <li key={item.id}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={selectedExperienceLevels.includes(item.id)}
                            value={item.id}
                            onChange={(e) => experienceHandler(e, item.id)}
                        />
                        <span className="slider round"></span>
                        <span className="title">{item.name}</span>
                    </label>
                </li>
            ))}
           
        </ul>
    );
};

export default ExperienceLevel;
