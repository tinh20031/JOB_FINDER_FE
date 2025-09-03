"use client";

import Link from "next/link.js";
import Image from "next/image.js";
import { useEffect, useState } from "react";
import { companyService } from "../../../../../services/companyService";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { industryService } from "@/services/industryService";

const CompanyFavouriteTable = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [isLoadingUnfavorite, setIsLoadingUnfavorite] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const data = await industryService.getAll();
        setIndustries(data);
      } catch (err) {
        console.error("Error fetching industries:", err);
        setError("Failed to load industries");
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // Map industryId to industryName
  const industryMap = industries.reduce((acc, cur) => {
    acc[cur.industryId] = cur.industryName;
    return acc;
  }, {});

  useEffect(() => {
    const fetchFavoriteCompanies = async () => {
      setLoading(true);
      try {
        const response = await companyService.getFavoriteCompanies();
        setCompanies(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorite companies:', err);
        setError('You need to login to view favorite companies');
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteCompanies();
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleUnfavorite = async (userId) => {
    try {
      setIsLoadingUnfavorite(true);
      await companyService.unfavoriteCompany(userId);
      setCompanies(prev => prev.filter(c => c.userId !== userId));
      toast.success("Removed from favorites");
    } catch (err) {
      console.error("Unfavorite error:", err, err?.response);
      toast.error("Error occurred while removing from favorites!");
    } finally {
      setIsLoadingUnfavorite(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="ls-outer">
      {companies.length === 0 ? (
        <div className="text-center py-5">No favorite companies found</div>
      ) : (
        companies.map((company) => (
          <div
            className="company-block-three"
            key={company.userId}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/company-detail/${company.userId}`)}
          >
            <div className="inner-box position-relative d-flex align-items-center">
              <img
                src={company.urlCompanyLogo || "/images/resource/company-logo/1-1.png"}
                alt={company.companyName}
                width={50}
                height={50}
                style={{ borderRadius: 8, objectFit: 'cover', background: '#fff' }}
              />
              <div className="ms-3">
                <h4 style={{ margin: 0 }}>{company.companyName}</h4>
                <div className="d-flex align-items-center gap-3" style={{ fontSize: 14, color: '#555' }}>
                  <span className="icon flaticon-map-locator me-2"></span>
                  <span>{company.location}</span>
                  {company.industryName && (
                    <>
                      <span className="icon flaticon-briefcase me-2"></span>
                      <span>{company.industryName}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                className="bookmark-btn active"
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 20,
                  color: '#ffc107',
                  fontSize: 24,
                  background: 'none',
                  border: 'none',
                  opacity: 1,
                  visibility: 'visible',
                  cursor: isLoadingUnfavorite ? 'not-allowed' : 'pointer'
                }}
                title="Remove from favorites"
                onClick={e => {
                  e.stopPropagation();
                  handleUnfavorite(company.userId);
                }}
                disabled={isLoadingUnfavorite}
              >
                <span className="flaticon-bookmark"></span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompanyFavouriteTable; 