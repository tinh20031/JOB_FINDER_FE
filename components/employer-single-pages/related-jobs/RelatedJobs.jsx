import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { jobService } from "@/services/jobService";

const RelatedJobs = ({ companyId }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    jobService
      .getJobs({ companyId })
      .then((res) => {
        setJobs(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setJobs([]);
        setLoading(false);
      });
  }, [companyId]);

  if (!companyId) return null;
  if (loading) return <div>Loading related jobs...</div>;
  if (!jobs.length) return <div>No related jobs found.</div>;

  return (
    <>
      {jobs.slice(0, 3).map((item) => (
        <div className="job-block" key={item.id}>
          <div className="inner-box">
            <div className="content">
              <span className="company-logo">
                <Image width={50} height={49} src={item.logo} alt="resource" />
              </span>
              <h4>
                <Link href={`/job-detail/${item.id}`}>{item.jobTitle}</Link>
              </h4>

              <ul className="job-info">
                <li>
                  <span className="icon flaticon-briefcase"></span>
                  {item.company?.companyName || ""}
                </li>
                <li>
                  <span className="icon flaticon-map-locator"></span>
                  {item.location}
                </li>
                <li>
                  <span className="icon flaticon-clock-3"></span> {item.timeStart ? new Date(item.timeStart).toLocaleDateString() : ""}
                </li>
                <li>
                  <span className="icon flaticon-money"></span> {item.isSalaryNegotiable ? "Negotiable" : `${item.minSalary} - ${item.maxSalary}`}
                </li>
              </ul>

              <ul className="job-other-info">
                {item.jobType && item.jobType.jobTypeName && (
                  <li className="default-tag">{item.jobType.jobTypeName}</li>
                )}
              </ul>
              <button className="bookmark-btn">
                <span className="flaticon-bookmark"></span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RelatedJobs;
