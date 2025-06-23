"use client";
import { useEffect, useState } from "react";
import Social from "../social/Social";
import ApiService from "@/services/api.service";
import { jobService } from "@/services/jobService";
import Image from "next/image";

const CompanyInfo = ({ company, industries = [] }) => {
  const getIndustryName = (industryId) => {
    const industry = industries.find(i => i.industryId === industryId);
    return industry ? industry.industryName : "N/A";
  };

  if (!company) {
    // You can return a loading state or null if you prefer
    return <div>Loading company information...</div>;
  }

  return (
    <ul className="company-info">
      {company.industryId && (
        <li>
          Industry: <span>{getIndustryName(company.industryId)}</span>
        </li>
      )}
      {company.teamSize && (
        <li>
          Company size: <span>{company.teamSize}</span>
        </li>
      )}
      {company.location && (
        <li>
          Location: <span>{company.location}</span>
        </li>
      )}
      {company.contact && (
        <li>
          Contact: <span>{company.contact}</span>
        </li>
      )}
      {/* Optional Social links */}
    </ul>
  );
};

export default CompanyInfo;
