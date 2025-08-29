'use client'

import { useState, useEffect } from "react";
import Select from "react-select";
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { industryService } from "@/services/industryService";
import locationService from "@/services/locationService";
import teamSizeService from "@/services/teamSizeService";

const FormInfoBox = ({ onFormChange, validationErrors, initialData, isEditing }) => {
    const [formData, setFormData] = useState({
        companyName: initialData?.companyName || "",
        phone: initialData?.phone || "",
        website: initialData?.website || "",
        teamSize: initialData?.teamSize || "50 - 100", // Updated default value
        location: initialData?.location || "", // Will store the selected province name
        industryId: initialData?.industryId || "", // Will store the selected industry ID (number)
        aboutCompany: initialData?.aboutCompany || "",
    });

    const [provinces, setProvinces] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [teamSizes, setTeamSizes] = useState([]);

    // Fetch provinces on component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await locationService.getProvinces();
                const sortedProvinces = response.sort((a, b) => a.name.localeCompare(b.name));
                setProvinces(sortedProvinces);
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        fetchProvinces();
    }, []); // Empty dependency array means this effect runs once on mount

    // Fetch industries on component mount
    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const response = await industryService.getAll();
                // Sort industries alphabetically by name
                const sortedIndustries = response.sort((a, b) => a.industryName.localeCompare(b.industryName));
                setIndustries(sortedIndustries);
            } catch (error) {
                console.error("Error fetching industries:", error);
            }
        };
        fetchIndustries();
    }, []); // Empty dependency array means this effect runs once on mount

    // Fetch team sizes on component mount
    useEffect(() => {
        const fetchTeamSizes = async () => {
            try {
                const response = await teamSizeService.getAllTeamSizes();
                setTeamSizes(response);
            } catch (error) {
                // Set default options if API fails
                setTeamSizes(teamSizeService.getStaticTeamSizeOptions());
            }
        };
        fetchTeamSizes();
    }, []); // Empty dependency array means this effect runs once on mount


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        if (onFormChange) {
             const updatedFormData = {
                ...formData,
                [name]: value,
            };
            onFormChange(updatedFormData);
        }
    };

     // Handle select change for Team Size, Location, and Industry ID
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        // For industryId, convert value to number
        const processedValue = name === 'industryId' ? parseInt(value, 10) : value;

         setFormData(prevState => ({
            ...prevState,
            [name]: processedValue,
        }));
        if (onFormChange) {
             const updatedFormData = {
                ...formData,
                [name]: processedValue,
            };
            onFormChange(updatedFormData);
        }
    };

    const handleAboutCompanyChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            aboutCompany: value,
        }));
        if (onFormChange) {
            const updatedFormData = {
                ...formData,
                aboutCompany: value,
            };
            onFormChange(updatedFormData);
        }
    };

    return (
        <form className="default-form">
            <div className="row">
                {/* <!-- Input - Company Name --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Company name</label>
                    <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                         className={validationErrors.companyName ? 'form-control is-invalid' : 'form-control'}
                        disabled={true}
                    />
                    {validationErrors.companyName && <div className="invalid-feedback">{validationErrors.companyName}</div>}
                </div>

                {/* <!-- Input - Phone (Contact) --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Phone</label>
                    <input
                        type="text"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                         className={validationErrors.phone ? 'form-control is-invalid' : 'form-control'}
                        disabled={!isEditing}
                    />
                     {validationErrors.phone && <div className="invalid-feedback">{validationErrors.phone}</div>}
                </div>

                {/* <!-- Input - Website --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Website</label>
                    <input
                        type="text"
                        name="website"
                        required
                        value={formData.website}
                        onChange={handleInputChange}
                         className={validationErrors.website ? 'form-control is-invalid' : 'form-control'}
                        disabled={!isEditing}
                    />
                     {validationErrors.website && <div className="invalid-feedback">{validationErrors.website}</div>}
                </div>

                 {/* <!-- Input - Location - Using Select for Provinces API --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Location</label>
                    <select
                        className={validationErrors.location ? 'chosen-single form-select is-invalid' : 'chosen-single form-select'}
                        required
                        name="location"
                        value={formData.location}
                        onChange={handleSelectChange}
                        disabled={!isEditing}
                    >
                        <option value="">Select Location</option>
                        {provinces.map(province => (
                            <option key={province.code} value={province.name}>
                                {province.name}
                            </option>
                        ))}
                    </select>
                     {validationErrors.location && <div className="invalid-feedback">{validationErrors.location}</div>}
                </div>

                {/* <!-- Input - Team Size --> */}
                <div className="form-group col-lg-6 col-md-12">
                    <label>Team Size</label>
                    <select className={validationErrors.teamSize ? 'chosen-single form-select is-invalid' : 'chosen-single form-select'} required name="teamSize" value={formData.teamSize} onChange={handleSelectChange}
                        disabled={!isEditing}
                    >
                        {teamSizes.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    {validationErrors.teamSize && <div className="invalid-feedback">{validationErrors.teamSize}</div>}
                </div>

                {/* <!-- Input - Industry ID - Using Select for Industry API --> */}
                 <div className="form-group col-lg-6 col-md-12">
                    <label>Industry</label>
                     <select
                        className={validationErrors.industryId ? 'chosen-single form-select is-invalid' : 'chosen-single form-select'}
                        required
                        name="industryId"
                        value={formData.industryId}
                        onChange={handleSelectChange}
                        disabled={!isEditing}
                    >
                        <option value="">Select Industry</option>
                        {industries.map(industry => (
                            <option key={industry.industryId} value={industry.industryId}>
                                {industry.industryName}
                            </option>
                        ))}
                    </select>
                     {validationErrors.industryId && <div className="invalid-feedback">{validationErrors.industryId}</div>}
                </div>

                {/* <!-- About Company - CompanyProfileDescription --> */}
                <div className="form-group col-lg-12 col-md-12">
                    <label>About Company</label>
                    <ReactQuill
                        className="job-description-quill"
                        theme="snow"
                        value={formData.aboutCompany}
                        onChange={handleAboutCompanyChange}
                        readOnly={!isEditing}
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, false] }],
                                ['bold', 'italic', 'underline', 'strike', 'link'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                [{ 'script': 'sub' }, { 'script': 'super' }],
                                [{ 'indent': '-1' }, { 'indent': '+1' }],
                                [{ 'direction': 'rtl' }],
                                [{ 'size': ['small', false, 'large', 'huge'] }],
                                [{ 'color': [] }, { 'background': [] }],
                                [{ 'align': [] }],
                                ['clean']
                            ],
                        }}
                        formats={[
                            'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent',
                            'link', 'image', 'color', 'background', 'align', 'size',
                        ]}
                        placeholder="Enter about company description"
                    />
                    {validationErrors.aboutCompany && <div className="invalid-feedback">{validationErrors.aboutCompany}</div>}
                </div>
            </div>
        </form>
    );
};

export default FormInfoBox;
