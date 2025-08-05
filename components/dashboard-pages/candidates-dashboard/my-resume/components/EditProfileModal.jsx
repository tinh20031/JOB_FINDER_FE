import React, { useState, useRef, useEffect } from "react";
import locationService from "@/services/locationService";
import ApiService from "@/services/api.service";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const EditProfileModal = ({ open, onClose, onSubmit, profile, saving = false }) => {
  const [form, setForm] = useState({
    FullName: profile?.fullName || "",
    JobTitle: profile?.jobTitle || "",
    Gender: profile?.gender || "Male",
    Dob: profile?.dob || "",
    Province: profile?.province || "",
    Ward: profile?.city || "", // Sử dụng city thay vì ward
    Address: profile?.address || "",
    PersonalLink: profile?.personalLink || "",
    Phone: profile?.phone || "",
    image: profile?.image || "",
    Email: profile?.email || "",
  });
  const [preview, setPreview] = useState(profile?.image || "");
  const fileInputRef = useRef();
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceCodeMap, setProvinceCodeMap] = useState({});
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  useEffect(() => {
    const formatDobForInput = (dob) => {
      if (!dob) return "";
      try {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (error) {
        return "";
      }
    };

    const initialForm = {
      FullName: profile?.fullName || "",
      JobTitle: profile?.jobTitle || "",
      Gender: profile?.gender || "Male",
      Dob: formatDobForInput(profile?.dob),
      Province: profile?.province || "",
      Ward: profile?.city || "", // Sử dụng city thay vì ward
      Address: profile?.address || "",
      PersonalLink: profile?.personalLink || "",
      Phone: profile?.phone || "",
      image: profile?.image || "",
      Email: profile?.email || "",
    };
    setForm(initialForm);
    setPreview(profile?.image || "");
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
    if (open) {
      setLoadingProvinces(true);
      locationService.getProvinces().then((data) => {
        const arr = Array.isArray(data) ? data : data || [];
        setProvinces(arr);
        const codeMap = {};
        arr.forEach((p) => {
          codeMap[p.name] = p.province_code;
        });
        setProvinceCodeMap(codeMap);
        if (profile?.province && codeMap[profile.province]) {
          setLoadingWards(true);
          locationService
            .getWards(codeMap[profile.province])
            .then((wardsData) => {
              const wardsArray = Array.isArray(wardsData) ? wardsData : [];
              setWards(wardsArray);
              // Kiểm tra xem ward từ profile có tồn tại trong danh sách wards không
              if (profile?.city && wardsArray.length > 0) {
                const existingWard = wardsArray.find(ward => ward.ward_name === profile.city);
                if (existingWard) {
                  // Đảm bảo form.Ward được set đúng giá trị từ profile
                  if (form.Ward !== profile.city) {
                    setForm(prev => ({ ...prev, Ward: profile.city }));
                  }
                }
              }
              setLoadingWards(false);
            })
            .catch((error) => {
              setWards([]);
              setLoadingWards(false);
            });
        } else {
          setWards([]);
        }
        setLoadingProvinces(false);
      }).catch((error) => {
        setProvinces([]);
        setWards([]);
        setLoadingProvinces(false);
      });
    }
  }, [profile, open]);

  useEffect(() => {
    if (form.Province && provinceCodeMap[form.Province]) {
      setLoadingWards(true);
      locationService
        .getWards(provinceCodeMap[form.Province])
        .then((wardsData) => {
          if (Array.isArray(wardsData)) {
            setWards(wardsData);
            // Chỉ reset Ward nếu đây là lần đầu load và có dữ liệu từ profile
            if (form.Province === profile?.province && profile?.city) {
              // Kiểm tra xem ward từ profile có tồn tại trong danh sách wards không
              const existingWard = wardsData.find(ward => ward.ward_name === profile.city);
            }
          } else {
            setWards([]);
          }
          setLoadingWards(false);
        })
        .catch((error) => {
          setWards([]);
          setLoadingWards(false);
        });
      // Chỉ reset Ward khi user thay đổi province (không phải lần đầu load)
      if (form.Province !== (profile?.province || "")) {
        setForm((f) => ({ ...f, Ward: "" }));
      }
    } else {
      setWards([]);
      // Chỉ reset Ward khi không có province được chọn
      if (!form.Province) {
        setForm((f) => ({ ...f, Ward: "" }));
      }
    }
  }, [form.Province, profile?.province, provinceCodeMap]);

  // useEffect để load wards ban đầu khi có dữ liệu từ profile
  useEffect(() => {
    if (profile?.province && profile?.city && provinceCodeMap[profile.province] && wards.length > 0) {
      // Kiểm tra xem ward từ profile có tồn tại trong danh sách wards không
      const existingWard = wards.find(ward => ward.ward_name === profile.city);
      if (existingWard) {
        // Đảm bảo form.Ward được set đúng giá trị từ profile
        if (form.Ward !== profile.city) {
          setForm(prev => ({ ...prev, Ward: profile.city }));
        }
      }
    }
  }, [profile?.province, profile?.city, provinceCodeMap, wards, form.Ward]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      const file = files[0];
      if (file) {
        setForm((prev) => ({ ...prev, imageFile: file }));
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setForm((prev) => ({ ...prev, imageFile: null }));
        setPreview("");
      }
    } else if (name === "Province") {
      // Khi thay đổi province, reset ward và load wards mới
      setForm((prev) => ({ ...prev, [name]: value, Ward: "" }));
      if (value && provinceCodeMap[value]) {
        setLoadingWards(true);
        locationService
          .getWards(provinceCodeMap[value])
          .then((wardsData) => {
            const wardsArray = Array.isArray(wardsData) ? wardsData : [];
            setWards(wardsArray);
            setLoadingWards(false);
          })
          .catch((error) => {
            setWards([]);
            setLoadingWards(false);
          });
      } else if (value) {
        setWards([]);
      } else {
        setWards([]);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditAvatar = (e) => {
    e.preventDefault();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDeleteAvatar = (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, imageFile: null, image: "" }));
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.FullName.trim()) newErrors.FullName = "Full name is required.";
    if (!form.JobTitle.trim()) newErrors.JobTitle = "Job title is required.";
    if (!form.Phone.trim()) newErrors.Phone = "Phone is required.";
    if (!form.Dob || form.Dob.trim() === "") newErrors.Dob = "Date of birth is required.";
    if (!form.Province.trim()) newErrors.Province = "Province is required.";
    if (!form.Ward.trim()) newErrors.Ward = "Ward is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
  
    const formatDobForAPI = (dob) => {
      if (!dob) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        return `${dob}T00:00:00.000Z`;
      }
      try {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day).toISOString();
      } catch (error) {
        return null;
      }
    };
  
    const formData = new FormData();
    formData.append("FullName", form.FullName);
    formData.append("JobTitle", form.JobTitle);
    formData.append("Phone", form.Phone);
    formData.append("Gender", form.Gender);
    formData.append("city", form.Ward || ""); // Gửi city
    formData.append("Province", form.Province);
    formData.append("Address", form.Address || "");
    formData.append("Dob", formatDobForAPI(form.Dob));
    if (form.imageFile) formData.append("imageFile", form.imageFile);
    formData.append("PersonalLink", form.PersonalLink || "");
  
    try {
      const response = await ApiService.request("CandidateProfile/me", "PUT", formData);
      
      // Tạo object chứa dữ liệu đã cập nhật để truyền cho onSubmit
      const updatedProfile = {
        fullName: form.FullName,
        jobTitle: form.JobTitle,
        phone: form.Phone,
        gender: form.Gender,
        city: form.Ward,
        province: form.Province,
        address: form.Address,
        dob: formatDobForAPI(form.Dob),
        personalLink: form.PersonalLink,
        image: form.imageFile ? preview : form.image, // Sử dụng preview nếu có file mới
        email: form.Email, // Giữ nguyên email
        ...response // Thêm response từ API nếu có
      };
      
      // Gọi onSubmit để cập nhật state ở component cha
      onSubmit(updatedProfile);
      onClose();
    } catch (error) {
      // Handle error silently or show toast notification
      console.error("Error updating profile:", error);
      throw error; // Re-throw để component cha có thể handle
    }
  };

  const getValidImageUrl = (url) => {
    if (!url || typeof url !== "string") {
      return null;
    }
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    return null;
  };

  return (
    <>
      <style>{`
        .modal-overlay-animated {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.3);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: ${show ? 1 : 0};
          transition: opacity 0.3s;
        }
        .modal-content-animated {
          background: #fff;
          border-radius: 16px;
          padding: 32px 24px;
          min-width: 320px;
          width: 95vw;
          max-width: 900px;
          position: relative;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          transform: translateY(${show ? "0" : "40px"});
          opacity: ${show ? 1 : 0};
          transition: all 0.3s cubic-bezier(.4,0,.2,1);
          margin: 16px;
          min-height: 60vh;
          max-height: 90vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 700px) {
          .modal-content-animated {
            padding: 48px 64px;
          }
        }
        .modal-flex {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        @media (min-width: 900px) {
          .modal-flex {
            flex-direction: row;
            align-items: flex-start;
            gap: 48px;
          }
        }
        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
          min-width: 180px;
        }
        .avatar-section img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eee;
          margin-bottom: 16px;
        }
        .avatar-section .avatar-actions {
          display: flex;
          gap: 16px;
        }
        .modal-form-flex {
          display: flex;
          flex-direction: column;
          flex: 1 1 auto;
          min-height: 0;
        }
        .modal-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 700px) {
          .modal-form-grid {
            grid-template-columns: 1fr 1fr;
          }
          .modal-form-grid .form-group.address,
          .modal-form-grid .form-group.personal-link {
            grid-column: 1 / 3;
          }
        }
        .form-group label {
          font-weight: 600;
          margin-bottom: 4px;
          display: block;
        }
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #ddd;
          font-size: 1rem;
          margin-top: 2px;
        }
        .form-group input[disabled] {
          background: #f5f5f5;
          color: #888;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          background: #fff;
          border-top: 1px solid #eee;
          padding: 16px 0 0 0;
        }
      `}</style>
      <div className="modal-overlay-animated">
        <div className="modal-content-animated">
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#888",
            }}
          >
            ×
          </button>
          <h2
            style={{
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Personal details
          </h2>
          <div className="modal-flex">
            <div className="avatar-section">
              <img
                src={
                  preview ||
                  getValidImageUrl(form.image) ||
                  "/images/resource/default-avatar.png"
                }
                alt="avatar"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #eee",
                  marginBottom: "16px",
                }}
              />
              <input
                type="file"
                name="imageFile"
                onChange={handleChange}
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
              />
              <div className="avatar-actions">
                <button
                  type="button"
                  onClick={handleEditAvatar}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#e60023",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="la la-camera" style={{ marginRight: 4 }}></i>{" "}
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#888",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i className="la la-trash" style={{ marginRight: 4 }}></i>{" "}
                  Delete
                </button>
              </div>
            </div>
            <form className="modal-form-flex" onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>
                    Full name <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <input
                    name="FullName"
                    value={form.FullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      border:
                        errors.FullName ||
                        (touched.FullName && !form.FullName.trim())
                          ? "2px solid #e60023"
                          : form.FullName.trim()
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.FullName ||
                        (touched.FullName && !form.FullName.trim())
                          ? "1px solid #e60023"
                          : undefined,
                      background: "#fff",
                    }}
                  />
                  {(errors.FullName ||
                    (touched.FullName && !form.FullName.trim())) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please enter your full name
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Job Title <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <input
                    name="JobTitle"
                    value={form.JobTitle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      border:
                        errors.JobTitle ||
                        (touched.JobTitle && !form.JobTitle.trim())
                          ? "2px solid #e60023"
                          : form.JobTitle.trim()
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.JobTitle ||
                        (touched.JobTitle && !form.JobTitle.trim())
                          ? "1px solid #e60023"
                          : undefined,
                      background: "#fff",
                    }}
                  />
                  {(errors.JobTitle ||
                    (touched.JobTitle && !form.JobTitle.trim())) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please enter your title
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email address</label>
                  <input name="Email" value={form.Email} disabled />
                </div>
                <div className="form-group">
                  <label>
                    Phone <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <input
                    name="Phone"
                    value={form.Phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      border:
                        errors.Phone || (touched.Phone && !form.Phone.trim())
                          ? "2px solid #e60023"
                          : form.Phone.trim()
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.Phone || (touched.Phone && !form.Phone.trim())
                          ? "1px solid #e60023"
                          : undefined,
                      background: "#fff",
                    }}
                  />
                  {(errors.Phone || (touched.Phone && !form.Phone.trim())) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please enter your phone
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    Date of Birth <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="Dob"
                    value={form.Dob}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      border:
                        errors.Dob || (touched.Dob && (!form.Dob || form.Dob.trim() === ""))
                          ? "2px solid #e60023"
                          : form.Dob && form.Dob.trim() !== ""
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.Dob || (touched.Dob && (!form.Dob || form.Dob.trim() === ""))
                          ? "1px solid #e60023"
                          : undefined,
                      background: "#fff",
                    }}
                  />
                  {(errors.Dob || (touched.Dob && (!form.Dob || form.Dob.trim() === ""))) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please enter your date of birth
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="Gender"
                    value={form.Gender}
                    onChange={handleChange}
                    required
                  >
                    {genderOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Province <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <select
                    name="Province"
                    value={form.Province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    disabled={loadingProvinces}
                    style={{
                      border:
                        errors.Province ||
                        (touched.Province && !form.Province.trim())
                          ? "2px solid #e60023"
                          : form.Province.trim()
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.Province ||
                        (touched.Province && !form.Province.trim())
                          ? "1px solid #e60023"
                          : undefined,
                      background: loadingProvinces ? "#f8f9fa" : "#fff",
                      opacity: loadingProvinces ? 0.7 : 1,
                    }}
                  >
                    <option value="">
                      {loadingProvinces ? "Loading provinces..." : "Select a province"}
                    </option>
                    {provinces.map((province) => (
                      <option
                        key={province.province_code}
                        value={province.name}
                      >
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {(errors.Province ||
                    (touched.Province && !form.Province.trim())) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please select a province
                    </div>
                  )}
                </div>
                <div className="form-group">
  <label>
    Ward/Commune <span style={{ color: "#e60023" }}>*</span>
  </label>
  <select
    name="Ward"
    value={form.Ward}
    onChange={handleChange}
    onBlur={handleBlur}
    required
    disabled={!form.Province || wards.length === 0 || loadingWards}
    style={{
      border:
        errors.Ward || (touched.Ward && !form.Ward.trim())
          ? "2px solid #e60023"
          : form.Ward.trim()
          ? "2px solid #28a745"
          : "1px solid #ddd",
      outline:
        errors.Ward || (touched.Ward && !form.Ward.trim())
          ? "1px solid #e60023"
          : undefined,
      background: loadingWards ? "#f8f9fa" : "#fff",
      opacity: loadingWards ? 0.7 : 1,
    }}
  >
    <option value="">
      {loadingWards
        ? "Loading wards..."
        : !form.Province
        ? "Please select a province first"
        : wards.length === 0
        ? "No wards available"
        : "Select a ward"}
    </option>
    {wards.map((ward) => (
      <option key={ward.ward_code} value={ward.ward_name}>
        {ward.ward_name}
      </option>
    ))}
  </select>
  {(errors.Ward || (touched.Ward && !form.Ward.trim())) && (
    <div style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}>
      Please select a ward
    </div>
  )}
</div>
                <div className="form-group address">
                  <label>Address (Street, district,...)</label>
                  <input
                    name="Address"
                    value={form.Address}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group personal-link">
                  <label>Personal link (Linkedin, portfolio,...)</label>
                  <input
                    name="PersonalLink"
                    value={form.PersonalLink}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "#fff",
                    border: "1px solid #e60023",
                    color: "#e60023",
                    padding: "10px 32px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: saving ? "#ccc" : "#e60023",
                    color: "#fff",
                    border: "none",
                    padding: "10px 32px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;