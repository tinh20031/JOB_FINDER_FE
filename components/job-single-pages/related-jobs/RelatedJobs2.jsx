"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { jobService } from "@/services/jobService";
import ClickableBox from "../../common/ClickableBox";
import { useSelector } from "react-redux";

const RelatedJobs2 = ({ job }) => {
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useSelector((state) => state.auth) || {};

  useEffect(() => {
    if (!job) {
      setRelatedJobs([]);
      setLoading(false);
      return;
    }
    const fetchRelatedJobs = async () => {
      setLoading(true);
      try {
        const filters = {
          category: job.industry?.industryId || job.industryId,
          location: job.provinceName,
          jobType: job.jobType?.id ? [job.jobType.id] : (job.jobTypeId ? [job.jobTypeId] : undefined),
          experience: job.experienceLevel?.id ? [job.experienceLevel.id] : (job.experienceLevelId ? [job.experienceLevelId] : undefined),
        };
        const { data } = await jobService.getJobs(filters);
        // Lọc thêm các điều kiện phụ trợ
        const now = new Date();
        const filtered = data.filter(j =>
          j.id !== job.id &&
          j.status === 2 && !j.deactivatedByAdmin && j.status !== 4 &&
          (!j.expiryDate || new Date(j.expiryDate) > now) &&
          ((job.level?.id || job.levelId) ? (j.level?.id || j.levelId) === (job.level?.id || job.levelId) : true) &&
          (job.skills && job.skills.length > 0
            ? j.skills?.some(jskill => job.skills.some(s => s.skillId === jskill.skillId))
            : true)
        );
        setRelatedJobs(filtered);
      } catch (e) {
        setRelatedJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelatedJobs();
  }, [job]);

  if (loading) return <div>Loading related jobs...</div>;
  if (!relatedJobs.length) return <div>No related jobs found.</div>;

  return (
    <>
      <div className="title-box">
        <h3>Related Jobs</h3>
        <div className="text">{relatedJobs.length} related job{relatedJobs.length !== 1 ? 's' : ''} found.</div>
      </div>
      {relatedJobs.slice(0, 4).map((item) => (
        <ClickableBox
          className="job-block"
          key={item.id}
                          onClick={() => window.location.href = `/job-detail/${item.id}`}
        >
          <div className="content">
            <span className="company-logo">
              <Image
                width={50}
                height={49}
                src={item.logo}
                alt={item.company?.companyName || item.companyName ||'item brand'}
              />
            </span>
            <h4>
                              <Link href={`/job-detail/${item.id}`}>{item.jobTitle}</Link>
            </h4>

            <ul className="job-info">
              <li>
                <span className="icon flaticon-briefcase"></span>
                {item.company?.companyName || item.companyName}
              </li>
              <li>
                <span className="icon flaticon-map-locator"></span>
                {item.provinceName || item.location}
              </li>
              <li>
                <span className="icon flaticon-clock-3"></span> 
                {item.createdAt
                  ? (() => {
                      const days = Math.floor((Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24));
                      return days === 0 ? 'Hôm nay' : `${days} ngày trước`;
                    })()
                  : 'N/A'}
              </li>
              <li>
                <span className="icon flaticon-money"></span>{" "}
                {isLoggedIn ? (
                  item.minSalary && item.maxSalary ? `$${item.minSalary} - $${item.maxSalary}` : 'Negotiable'
                ) : (
                  <>
                    <span style={{ filter: 'blur(4px)' }}>Login required</span>
                    <a
                      href="#"
                      className="theme-btn btn-style-three call-modal"
                      data-bs-toggle="modal"
                      data-bs-target="#loginPopupModal"
                      style={{ marginLeft: 10, padding: '2px 10px', fontSize: 12 }}
                      onClick={(e) => e.preventDefault()}
                    >
                      Login to view
                    </a>
                  </>
                )}
              </li>
            </ul>
            {/* End .job-info */}

            <ul className="job-other-info">
              {item.jobType && item.jobType.jobTypeName && (
                <li className="privacy">{item.jobType.jobTypeName}</li>
              )}
              {item.experienceLevel && item.experienceLevel.name && (
                <li className="required">{item.experienceLevel.name}</li>
              )}
            </ul>
            {/* End .job-other-info */}

            <button className="bookmark-btn" onClick={e => e.stopPropagation()}>
              <span className="flaticon-bookmark"></span>
            </button>
          </div>
        </ClickableBox>
      ))}
      {relatedJobs.length > 4 && (
        <div className="see-more" style={{ marginTop: 16 }}>
          <a
            href={
              `/job-list?industryId=${job.industry?.industryId || job.industryId}` +
              (job.provinceName ? `&provinceName=${encodeURIComponent(job.provinceName)}` : '') +
              ((job.level?.id || job.levelId) ? `&levelId=${job.level?.id || job.levelId}` : '') +
              ((job.jobType?.id || job.jobTypeId) ? `&jobTypeId=${job.jobType?.id || job.jobTypeId}` : '') +
              ((job.experienceLevel?.id || job.experienceLevelId) ? `&experienceLevelId=${job.experienceLevel?.id || job.experienceLevelId}` : '')
            }
            className="theme-btn btn-style-three"
          >
            See all related jobs
          </a>
        </div>
      )}
    </>
  );
};

export default RelatedJobs2;
