import React from "react";

const JobDetailsBox = ({ job }) => {
  return (
    <div className="job-details-box">
      <h4>About This Job</h4>
      <div className="job-detail-section">
        <div className="job-detail-item">
          <h5>Job Description</h5>
          <div dangerouslySetInnerHTML={{ __html: job.description }} />
        </div>
        <div className="job-detail-item">
          <h5>Education</h5>
          <div dangerouslySetInnerHTML={{ __html: job.education }} />
        </div>
        <div className="job-detail-item">
          <h5>Skills</h5>
          <div>
            {Array.isArray(job.jobSkills) && job.jobSkills.length > 0
              ? job.jobSkills.map(skill => (
                  <span className="skill-tag" key={skill.id || skill}>{skill.name || skill}</span>
                ))
              : <span dangerouslySetInnerHTML={{ __html: job.yourSkill }} />}
          </div>
        </div>
        <div className="job-detail-item">
          <h5>Experience</h5>
          <div dangerouslySetInnerHTML={{ __html: job.yourExperience }} />
        </div>
      </div>
      <style jsx>{`
        .job-details-box {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.04);
          padding: 32px;
          margin-bottom: 32px;
        }
        .job-details-box h4 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .job-detail-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .job-detail-item h5 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .skill-tag {
          display: inline-block;
          background: #e3f0ff;
          color: #2a6ee0;
          border-radius: 16px;
          padding: 4px 12px;
          margin: 0 8px 8px 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default JobDetailsBox; 