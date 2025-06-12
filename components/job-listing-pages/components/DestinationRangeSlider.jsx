'use client'

import { useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/filterSlice";

const DestinationRangeSlider = () => {
    const dispatch = useDispatch();
    const { jobList } = useSelector((state) => state.filter);
    const [destination, setDestination] = useState({
        min: jobList.destination.min,
        max: jobList.destination.max,
    });

    useEffect(() => {
        setDestination({
            min: jobList.destination.min,
            max: jobList.destination.max,
        });
    }, [setDestination, jobList]);

    const handleOnChange = (value) => {
        const [min, max] = value;
        dispatch(addDestination({ min, max }));
    };

    return (
        <div className="range-slider-one">
            <Slider
                range
                min={0}
                max={100}
                value={[destination.min, destination.max]}
                onChange={handleOnChange}
                allowCross={false}
                trackStyle={[{ backgroundColor: '#1967d2', height: 8 }]}
                railStyle={{ backgroundColor: '#e9ecef', height: 8 }}
                handleStyle={[
                    { borderColor: '#1967d2', height: 20, width: 20, marginTop: -6 },
                    { borderColor: '#1967d2', height: 20, width: 20, marginTop: -6 }
                ]}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    <span className="area-amount">{destination.max}</span>
                    km
                </div>
            </div>
        </div>
    );
};

export default DestinationRangeSlider;
