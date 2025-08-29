"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { industryService } from "@/services/industryService";

const JobCategorie1 = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {industries.map((item) => (
        <div
          className="category-block col-lg-4 col-md-6 col-sm-12"
          key={item.industryId}
          style={{ cursor: 'pointer' }}
                          onClick={() => window.location.href = "/job-list"}
        >
          <div className="inner-box">
            <div className="content">
              <span className={`icon flaticon-briefcase`}></span>
              <h4>{item.industryName}</h4>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        .category-block {
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        .category-block:hover {
          box-shadow: 0 4px 24px rgba(37,99,235,0.10), 0 1.5px 8px rgba(0,0,0,0.06);
          border-color: #2563eb;
        }
        .category-block:hover .content h4 {
          color: #2563eb;
        }
      `}</style>
    </>
  );
};

export default JobCategorie1;
