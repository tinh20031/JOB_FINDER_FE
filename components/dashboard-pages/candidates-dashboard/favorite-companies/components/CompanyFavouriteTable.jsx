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
        setError('Bạn cần đăng nhập để xem công ty yêu thích');
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

  const handleUnfavorite = async (companyId) => {
    try {
      setIsLoadingUnfavorite(true);
      await companyService.unfavoriteCompany(companyId);
      setCompanies(prev => prev.filter(c => c.userId !== companyId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (err) {
      console.error("Unfavorite error:", err, err?.response);
      toast.error("Có lỗi khi bỏ yêu thích!");
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
            onClick={() => router.push(`/employers-single-v1/${company.userId}`)}
          >
            <div className="inner-box position-relative d-flex align-items-center">
              <img
                src={company.urlCompanyLogo || "/images/resource/company-logo/1-1.png"}
                alt={company.companyName}
                width={50}
                height={50}
              />
              <div className="ms-3">
                <h4>{company.companyName}</h4>
                <div className="d-flex align-items-center gap-3">
                  <span className="icon flaticon-map-locator me-2"></span>
                  <span>{company.location}</span>
                  {company.industry?.industryName && (
                    <>
                      <span className="icon flaticon-briefcase me-2"></span>
                      <span>{company.industry.industryName}</span>
                    </>
                  )}
                  {company.teamSize && (
                    <>
                      <span className="icon flaticon-user me-2"></span>
                      <span>{company.teamSize}</span>
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
                title="Bỏ yêu thích"
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