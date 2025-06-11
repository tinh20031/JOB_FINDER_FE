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
        >
          <div className="inner-box">
            <div className="content">
              <span className={`icon flaticon-briefcase`}></span>
              <h4>
                <Link href="/job-list-v1">{item.industryName}</Link>
              </h4>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default JobCategorie1;
