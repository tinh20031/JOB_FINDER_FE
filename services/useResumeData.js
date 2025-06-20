import { useEffect, useState } from "react";

const API_URL = "http://localhost:5194/api";
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function useResumeData() {
  const [data, setData] = useState({
    aboutme: [],
    profile: [],
    education: [],
    experiences: [],
    awards: [],
    skills: [],
    foreignlanguage: [],
    project: [],
    certificate: [],
    award: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [
          aboutme,
          profile,
          education,
          experiences,
          awards,
          skills,
          foreignlanguage,
          project,
          certificate,
          award,
        ] = await Promise.all([
          fetch(`${API_URL}/AboutMe/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/CandidateProfile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/Education/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/WorkExperience/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/Award/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/Skill/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/ForeignLanguage/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/HighlightProject/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/Certificate/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
          fetch(`${API_URL}/Award/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((r) => r.json()),
        ]);
        setData({
          aboutme,
          profile,
          education,
          experiences,
          awards,
          skills,
          foreignlanguage,
          project,
          certificate,
          award,
        });
      } catch (e) {
        alert("Lỗi khi lấy dữ liệu hồ sơ!");
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  return { ...data, loading };
}

export async function updateCandidateProfile({
  Gender,
  City,
  Province,
  Address,
  Dob,
  imageFile,
  FullName,
  PersonalLink,
  JobTitle,
}) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const formData = new FormData();
  if (Gender) formData.append("Gender", Gender);
  if (City) formData.append("City", City);
  if (Province) formData.append("Province", Province);
  if (Address) formData.append("Address", Address);
  if (Dob) formData.append("Dob", Dob);
  if (imageFile) formData.append("imageFile", imageFile);
  if (FullName) formData.append("FullName", FullName);
  if (PersonalLink) formData.append("PersonalLink", PersonalLink);
  if (JobTitle) formData.append("JobTitle", JobTitle);

  const response = await fetch(`${API_URL}/CandidateProfile/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type' KHÔNG được set khi dùng FormData
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Cập nhật hồ sơ thất bại");
  }
  if (response.status === 204) {
    return;
  }
  return await response.json();
}

export async function updateAboutMe(aboutMe) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/AboutMe/me/${aboutMe.aboutMeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aboutMe),
  });
  if (!response.ok) {
    throw new Error("Cập nhật About Me thất bại");
  }
  if (response.status === 204) {
    return;
  }
  return await response.json();
}

export async function updateEducation(education) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(
    `${API_URL}/Education/me/${education.educationId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(education),
    }
  );
  if (!response.ok) throw new Error("Cập nhật Education thất bại");
  if (response.status === 204) return;
  return await response.json();
}

export async function updateWorkExperience(workExperience) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(
    `${API_URL}/WorkExperience/me/${workExperience.workExperienceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workExperience),
    }
  );
  if (!response.ok) throw new Error("Cập nhật Work Experience thất bại");
  if (response.status === 204) return;
  return await response.json();
}
