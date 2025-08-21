"use client";
import { useEffect, useState } from "react";
import jobService from "../../../../../services/jobService";
import { applicationService } from "../../../../../services/applicationService";
import messageService from "../../../../../services/messageService";

const TopCardBlock = () => {
  const [postedJobs, setPostedJobs] = useState(0);
  const [applicants, setApplicants] = useState(0);
  const [candidates, setCandidates] = useState(0);
  const [messages, setMessages] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);

  useEffect(() => {
    // Lấy companyId từ localStorage (hoặc từ redux nếu có)
    const userStr = localStorage.getItem("user");
    let companyId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        companyId = user.companyId || user.id || user.userId;
      } catch {}
    }
    if (companyId) {
      // Gọi API lấy danh sách jobs và đếm số lượng
      jobService.getJobs({ role: "company", companyId }).then((res) => {
        setPostedJobs(res.total || 0);
        // Đếm số job active (status === 2) và không bị lock
        if (Array.isArray(res.data)) {
                      setActiveJobs(res.data.filter(j => j.status === 2 && !j.deactivatedByAdmin && j.status !== 4).length);
        } else {
          setActiveJobs(0);
        }
      });
      applicationService
        .getUniqueCandidatesByCompany(companyId)
        .then((count) => {
          setCandidates(count || 0);
        });
      messageService.getUniqueMessageUsersByCompany(companyId).then((count) => {
        setMessages(count || 0);
      });
    }
    applicationService.getAllApplications().then((res) => {
      setApplicants(Array.isArray(res) ? res.length : 0);
    });
  }, []);

  const cardContent = [
    {
      id: 1,
      icon: "flaticon-briefcase",
      countNumber: postedJobs,
      metaName: "Posted Jobs",
      uiClass: "ui-blue",
    },
    {
      id: 2,
      icon: "la-check-circle",
      countNumber: activeJobs,
      metaName: "Active Jobs",
      uiClass: "ui-green",
    },
    {
      id: 3,
      icon: "la-file-invoice",
      countNumber: applicants,
      metaName: "Applicants",
      uiClass: "ui-yellow",
    },
    {
      id: 4,
      icon: "la-bookmark-o",
      countNumber: candidates,
      metaName: "Candidates",
      uiClass: "ui-red",
    },
  ];

  return (
    <>
      {cardContent.map((item) => (
        <div
          className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12"
          key={item.id}
        >
          <div className={`ui-item ${item.uiClass}`}>
            <div className="left">
              <i className={`icon la ${item.icon}`}></i>
            </div>
            <div className="right">
              <h4>{item.countNumber}</h4>
              <p>{item.metaName}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopCardBlock;
