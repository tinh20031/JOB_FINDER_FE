"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/applicationService";
import messageService from "@/services/messageService";
import Cookies from "js-cookie";
import { getUserFavorites } from "@/services/favoriteJobService";

const TopCardBlock = () => {
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [appliedTimesCount, setAppliedTimesCount] = useState(0);
  const [messagedCompaniesCount, setMessagedCompaniesCount] = useState(0);
  const [favoriteJobsCount, setFavoriteJobsCount] = useState(0);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const applications = await applicationService.getAppliedJobs();
        setAppliedTimesCount(applications.length || 0);
        const uniqueJobIds = new Set(applications.map(app => app.jobId || (app.job && app.job.id)));
        setAppliedJobsCount(uniqueJobIds.size);
      } catch {
        setAppliedJobsCount(0);
        setAppliedTimesCount(0);
      }
    };
    fetchAppliedJobs();
  }, []);

  useEffect(() => {
    const fetchMessagedCompanies = async () => {
      try {
        let candidateId = Cookies.get("userId") || localStorage.getItem("userId");
        if (!candidateId) return setMessagedCompaniesCount(0);
        const res = await messageService.getMessagedCompanies(candidateId);
        // API trả về mảng các công ty đã nhắn tin, chỉ cần lấy length
        setMessagedCompaniesCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch {
        setMessagedCompaniesCount(0);
      }
    };
    fetchMessagedCompanies();
  }, []);

  useEffect(() => {
    const fetchFavoriteJobs = async () => {
      try {
        let userId = Cookies.get("userId") || localStorage.getItem("userId");
        if (!userId) return setFavoriteJobsCount(0);
        const res = await getUserFavorites(userId);
        setFavoriteJobsCount(Array.isArray(res.data) ? res.data.length : 0);
      } catch {
        setFavoriteJobsCount(0);
      }
    };
    fetchFavoriteJobs();
  }, []);

  const cardContent = [
    {
      id: 1,
      icon: "flaticon-briefcase",
      countNumber: appliedJobsCount,
      metaName: "Applied Jobs",
      uiClass: "ui-blue",
    },
    {
      id: 2,
      icon: "la-file-invoice",
      countNumber: appliedTimesCount,
      metaName: "Total Applications",
      uiClass: "ui-red",
    },
    {
      id: 3,
      icon: "la-comment-o",
      countNumber: messagedCompaniesCount,
      metaName: "Messages",
      uiClass: "ui-yellow",
    },
    {
      id: 4,
      icon: "la-bookmark-o",
      countNumber: favoriteJobsCount,
      metaName: "Favorite Jobs",
      uiClass: "ui-green",
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
