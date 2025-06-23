"use client";
import { useEffect, useState } from "react";
import ApiService from "@/services/api.service";

const Social = ({ companyId }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCompanyProfileById(companyId);
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company info:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyInfo();
    }
  }, [companyId]);

  if (loading) {
    return null;
  }

  if (!company?.website) {
    return null;
  }

  return (
    <div className="social-links">
      <a
        href={company.website}
        target="_blank"
        rel="noopener noreferrer"
        title="Company Website"
      >
        <i className="fas fa-globe"></i>
      </a>
    </div>
  );
};

export default Social;
