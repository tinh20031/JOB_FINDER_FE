"use client";
import { useEffect, useState } from "react";
import Social from "../social/Social";
import { companyService } from "@/services/companyService";
import { jobService } from "@/services/jobService";
import Image from "next/image";

const CompanyInfo = ({ companyId }) => {
  const [company, setCompany] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch company info
        const companyData = await companyService.getCompanyById(companyId);
        setCompany(companyData);

        // Fetch industries
        const industriesData = await jobService.getIndustries();
        setIndustries(industriesData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const getIndustryName = (industryId) => {
    const industry = industries.find(i => i.industryId === industryId);
    return industry ? industry.industryName : "N/A";
  };

  if (loading) {
    return <div>Loading company information...</div>;
  }

  if (error) {
    return <div>Error loading company information</div>;
  }

  if (!company) {
    return null;
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
      {/* <li>
        Social media:
        <Social companyId={companyId} />
      </li> */}
    </ul>
  );
};

export default CompanyInfo;
