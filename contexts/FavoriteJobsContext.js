import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserFavorites } from "../services/favoriteJobService";

const FavoriteJobsContext = createContext();

export const useFavoriteJobs = () => useContext(FavoriteJobsContext);

export const FavoriteJobsProvider = ({ children }) => {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteJobIds, setFavoriteJobIds] = useState([]);
  const UserId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : null;

  const fetchFavoriteJobs = async () => {
    if (UserId) {
      try {
        const res = await getUserFavorites(UserId);
        setFavoriteJobIds(res.data.map((item) => item.jobId));
        setFavoriteCount(res.data.length);
      } catch {
        setFavoriteJobIds([]);
        setFavoriteCount(0);
      }
    }
  };

  useEffect(() => {
    fetchFavoriteJobs();
    // eslint-disable-next-line
  }, [UserId]);

  // Hàm này sẽ được gọi khi thêm/xóa job yêu thích
  const updateFavoriteJobs = (newIds) => {
    setFavoriteJobIds(newIds);
    setFavoriteCount(newIds.length);
  };

  return (
    <FavoriteJobsContext.Provider value={{ favoriteCount, favoriteJobIds, updateFavoriteJobs, fetchFavoriteJobs }}>
      {children}
    </FavoriteJobsContext.Provider>
  );
}; 