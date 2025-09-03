import { useEffect, useState } from "react";
import API_CONFIG from '../config/api.config';

const API_URL = API_CONFIG.BASE_URL;

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function useResumeData() {
  const [data, setData] = useState({
    aboutme: [],
    profile: {},
    education: [],
    experiences: [],
    awards: [],
    skills: [],
    foreignlanguage: [],
    project: [],
    certificate: [],
  });
  const [loading, setLoading] = useState(true);

  // Hàm fetch an toàn, nếu lỗi trả về mảng rỗng hoặc object rỗng
  async function safeFetch(url, defaultValue = []) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return defaultValue;
      const data = await res.json();
      return data ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Hàm fetch riêng cho profile (trả về object)
  async function safeFetchProfile(url) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return {};
      const data = await res.json();
      return data ?? {};
    } catch {
      return {};
    }
  }

  const fetchAll = async () => {
    const token = getToken();
    if (!token) return;
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
      ] = await Promise.all([
        safeFetch(`${API_URL}/AboutMe/me`),
        safeFetchProfile(`${API_URL}/CandidateProfile/me`),
        safeFetch(`${API_URL}/Education/me`),
        safeFetch(`${API_URL}/WorkExperience/me`),
        safeFetch(`${API_URL}/Award/me`),
        safeFetch(`${API_URL}/Skill/me`),
        safeFetch(`${API_URL}/ForeignLanguage/me`),
        safeFetch(`${API_URL}/HighlightProject/me`),
        safeFetch(`${API_URL}/Certificate/me`),
      ]);
      // Normalize education items (map backend Id -> educationId)
      const normalizedEducation = Array.isArray(education)
        ? education.map((e) => ({
            ...e,
            educationId: e?.educationId ?? e?.id ?? e?.Id ?? 0,
          }))
        : [];

      setData({
        aboutme: aboutme,
        profile:
          profile && typeof profile === "object" && !Array.isArray(profile)
            ? profile
            : {},
        education: normalizedEducation,
        experiences: Array.isArray(experiences) ? experiences : [],
        awards: Array.isArray(awards) ? awards : [],
        skills: Array.isArray(skills) ? skills : [],
        foreignlanguage: Array.isArray(foreignlanguage) ? foreignlanguage : [],
        project: Array.isArray(project) ? project : [],
        certificate: Array.isArray(certificate) ? certificate : [],
      });
    } catch (e) {
      // Không alert nữa, chỉ log lỗi
      console.error("Lỗi khi lấy dữ liệu hồ sơ!", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { ...data, loading, refetch: fetchAll };
}

export async function updateCandidateProfile({
  Gender,
  City,
  Province,
  Address,
  Dob,
  imageFile,
  FullName,
  Phone,
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
  if (Phone) formData.append("Phone", Phone);
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

export async function createAboutMe(aboutMe) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/AboutMe/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(aboutMe),
  });
  if (!response.ok) {
    console.error("Create About Me failed:", await response.text());
    throw new Error("Tạo About Me thất bại");
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

export async function deleteAboutMe(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/AboutMe/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });
  if (!response.ok) {
    throw new Error("Xóa about me thất bại");
  }
  if (response.status === 204) return true;
  return true;
}

export async function createEducation(education) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Education/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(education),
  });
  if (!response.ok) {
    console.error("Create education failed:", await response.text());
    throw new Error("Tạo education thất bại");
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

export async function deleteEducation(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Education/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });
  if (!response.ok) {
    throw new Error("Xóa education thất bại");
  }
  if (response.status === 204) return true;
  return true;
}

export async function createWorkExperience(workExperience) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/WorkExperience/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workExperience),
  });
  if (!response.ok) {
    console.error("Create skill failed:", await response.text());
    throw new Error("Tạo Work Experience thất bại");
  }
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

export async function deleteWorkExperience(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/WorkExperience/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "*/*",
    },
  });
  if (!response.ok) {
    throw new Error("Xóa Work Experience thất bại");
  }
  if (response.status === 204) return true;
  return true;
}

export async function createSkill(skill) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  // skill có thể là 1 object hoặc 1 array object
  const response = await fetch(`${API_URL}/Skill/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skill), // skill là 1 object hoặc 1 array
  });
  if (!response.ok) {
    console.error("Create skill failed:", await response.text());
    throw new Error("Tạo kỹ năng thất bại");
  }
  return await response.json();
}

export async function updateSkill(skillId, skill) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Skill/me/${skillId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skill),
  });
  if (!response.ok) {
    console.error("Update skill failed:", await response.text());
    throw new Error("Cập nhật kỹ năng thất bại");
  }
  if (response.status === 204) return;
  return;
}

export async function deleteSkill(skillId) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Skill/me/${skillId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    console.error("Delete skill failed:", await response.text());
    throw new Error("Xóa kỹ năng thất bại");
  }
  if (response.status === 204) return;
  return;
}

export async function createForeignLanguage(language) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/ForeignLanguage/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(language),
  });
  if (!response.ok) throw new Error("Tạo ngoại ngữ thất bại");
  return await response.json();
}

export async function updateForeignLanguage(id, language) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/ForeignLanguage/me/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(language),
  });
  if (!response.ok) throw new Error("Cập nhật ngoại ngữ thất bại");
  if (response.status === 204) return;
  return await response.json();
}

export async function deleteForeignLanguage(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/ForeignLanguage/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Xóa ngoại ngữ thất bại");
  if (response.status === 204) return;
  return;
}

export async function updateHighlighProject(highlightProject) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(
    `${API_URL}/HighlightProject/me/${highlightProject.highlightProjectId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(highlightProject),
    }
  );
  if (!response.ok) throw new Error("Cập nhật Work Experience thất bại");
  if (response.status === 204) return;
  return await response.json();
}

export async function createHighlighProject(highlightProject) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/HighlightProject/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(highlightProject),
  });
  if (!response.ok) throw new Error("Tạo Highlight Project thất bại");
  return await response.json();
}

export async function deleteHighlighProject(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/HighlightProject/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Xóa highlight Project thất bại");
  if (response.status === 204) return;
  return;
}

export async function creatCertificate(certificate) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Certificate/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(certificate),
  });
  if (!response.ok) throw new Error("Tạo Certificate thất bại");
  return await response.json();
}

export async function updateCertificate(certificate) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(
    `${API_URL}/Certificate/me/${certificate.certificateId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(certificate),
    }
  );
  if (!response.ok) throw new Error("Cập nhật Certificate thất bại");
  if (response.status === 204) return;
  return await response.json();
}

export async function deleteCertificate(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Certificate/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Xóa Certificate thất bại");
  if (response.status === 204) return;
  return;
}

export async function creatAward(award) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Award/me`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(award),
  });
  if (!response.ok) throw new Error("Tạo award thất bại");
  return await response.json();
}

export async function updateAward(award) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Award/me/${award.awardId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(award),
  });
  if (!response.ok) throw new Error("Cập nhật Award thất bại");
  if (response.status === 204) return;
  return await response.json();
}

export async function deleteAward(id) {
  const token = getToken();
  if (!token) throw new Error("No token found");
  const response = await fetch(`${API_URL}/Award/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Xóa Award thất bại");
  if (response.status === 204) return;
  return;
}

export async function fetchProfileStrength(token) {
  const response = await fetch(
    `${API_URL}/CandidateProfile/me/profile-strength`,
    {
      headers: {
        Authorization: `Bearer ${token || getToken()}`,
        Accept: "*/*",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Không lấy được profile strength");
  }
  return await response.json();
}

export async function getAboutMeByUserId(userId) {
  if (!userId) return null;
  const res = await fetch(`${API_URL}/AboutMe/${userId}`);
  if (!res.ok) return null;
  return await res.json();
}

export async function getWorkExperienceByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/WorkExperience/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getHighlightProjectByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/HighlightProject/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getAwardByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/Award/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getSkillByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/Skill/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getForeignLanguageByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/ForeignLanguage/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getEducationByUserId(userId) {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_URL}/Education/user/${userId}`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getCandidateProfileByUserId(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${API_URL}/CandidateProfile/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
