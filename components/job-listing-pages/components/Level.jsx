'use client'
import { useDispatch, useSelector } from "react-redux";
import { addLevel } from "../../../features/filter/filterSlice";

// Đổi tên component và props
const Level = ({ levels, onSelectLevel }) => {
    const dispatch = useDispatch();

    // Lấy level đang được chọn từ filter slice
    const { jobList } = useSelector((state) => state.filter) || {};
    const selectedLevel = jobList?.levelId || null;

    // level handler
    const levelHandler = (e, value) => {
        if (selectedLevel === value) {
            dispatch(addLevel(null)); // Tắt filter nếu click lại
            if (onSelectLevel) onSelectLevel(null);
        } else {
            dispatch(addLevel(value));
            if (onSelectLevel) onSelectLevel(value);
        }
    };

    return (
        <ul className="switchbox">
            {levels?.map((item) => (
                <li key={item.levelId}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={selectedLevel === item.levelId}
                            value={item.levelId}
                            onChange={(e) => levelHandler(e, item.levelId)}
                        />
                        <span className="slider round"></span>
                        <span className="title">{item.levelName}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
};

export default Level;
