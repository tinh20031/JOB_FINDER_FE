import { useEffect, useState } from "react";

const API_URL = "http://localhost:5194/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");

export default function useResumeData() {
  const [data, setData] = useState({
   
    profile : [],
    education: [],
    experiences: [],
    awards: [],
    skills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [profile,education, experiences, awards, skills] = await Promise.all([
          fetch(`${API_URL}/CandidateProfile/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          //fetch(`${API_URL}/AboutMe/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_URL}/Education/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_URL}/WorkExperience/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_URL}/Award/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
          fetch(`${API_URL}/Skill/me`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]);
        setData({ profile, education, experiences, awards, skills });
      } catch (e) {
        alert("Lỗi khi lấy dữ liệu hồ sơ!");
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  return { ...data, loading };
}