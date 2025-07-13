import React, { useState, useRef, useEffect } from "react";
import locationService from "@/services/locationService";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const EditProfileModal = ({ open, onClose, onSubmit, profile }) => {
  const [form, setForm] = useState({
    FullName: profile?.fullName || "",
    JobTitle: profile?.jobTitle || "",
    Gender: profile?.gender || "Male",
    Dob: profile?.dob || "",
    Province: profile?.province || "",
    City: profile?.city || "",
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
  const [cities, setCities] = useState([]);
  const [provinceCodeMap, setProvinceCodeMap] = useState({});

  useEffect(() => {
    // Convert dob from ISO string to YYYY-MM-DD format for date input
    const formatDobForInput = (dob) => {
      if (!dob) return "";
      try {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return "";
        // Use local date to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      } catch (error) {
        return "";
      }
    };

    setForm({
      FullName: profile?.fullName || "",
      JobTitle: profile?.jobTitle || "",
      Gender: profile?.gender || "Male",
      Dob: formatDobForInput(profile?.dob),
      Province: profile?.province || "",
      City: profile?.city || "",
      Address: profile?.address || "",
      PersonalLink: profile?.personalLink || "",
      Phone: profile?.phone || "",
      image: profile?.image || "",
      Email: profile?.email || "",
    });
    setPreview(profile?.image || "");
    if (open) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
    // Fetch provinces when modal opens
    if (open) {
      locationService.getProvinces().then((data) => {
        const arr = Array.isArray(data) ? data : data || [];
        setProvinces(arr);
        // Tạo map tên -> code để lấy code khi chọn
        const codeMap = {};
        arr.forEach((p) => {
          codeMap[p.name] = p.code || p.id;
        });
        setProvinceCodeMap(codeMap);
        // Nếu đã có province và city cũ, fetch districts luôn
        if (profile?.province && codeMap[profile.province]) {
          locationService
            .getDistricts(codeMap[profile.province])
            .then((districts) => {
              setCities(Array.isArray(districts) ? districts : []);
            });
        } else {
          setCities([]);
        }
      });
    }
  }, [profile, open]);

  // Khi chọn province, fetch city, chỉ reset City nếu đổi province (không reset khi khởi tạo từ profile)
  useEffect(() => {
    if (form.Province && provinceCodeMap[form.Province]) {
      locationService
        .getDistricts(provinceCodeMap[form.Province])
        .then((districts) => {
          setCities(Array.isArray(districts) ? districts : []);
        });
      // Nếu province khác với profile.province thì reset City
      if (form.Province !== (profile?.province || "")) {
        setForm((f) => ({ ...f, City: "" }));
      }
    } else {
      setCities([]);
      setForm((f) => ({ ...f, City: "" }));
    }
  }, [form.Province]);

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
    // Reset file input
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
    if (!form.City.trim()) newErrors.City = "City is required.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    
    // Convert date back to ISO string for API
    const formatDobForAPI = (dob) => {
      if (!dob) return null;
      try {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return null;
        // Create date at midnight local time to avoid timezone issues
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        return new Date(year, month, day).toISOString();
      } catch (error) {
        return null;
      }
    };

    const submitData = {
      FullName: form.FullName,
      JobTitle: form.JobTitle,
      Phone: form.Phone,
      Gender: form.Gender,
      City: form.City,
      Province: form.Province,
      Address: form.Address,
      Dob: formatDobForAPI(form.Dob),
      imageFile: form.imageFile,
      PersonalLink: form.PersonalLink,
    };
    onSubmit(submitData);
  };

  // Add URL validation function
  const getValidImageUrl = (url) => {
    if (!url || typeof url !== "string") {
      return null;
    }
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("/") ||
      url.startsWith("data:") // Add support for data URLs from FileReader
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
            {/* Avatar + Edit/Delete */}
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
            {/* Form fields */}
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
                    Current province/city{" "}
                    <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <select
                    name="Province"
                    value={form.Province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
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
                      background: "#fff",
                    }}
                  >
                    <option value="">Select province</option>
                    {provinces.map((province) => (
                      <option
                        key={province.code || province.id || province.name}
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
                      Please enter your province
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>
                    City <span style={{ color: "#e60023" }}>*</span>
                  </label>
                  <select
                    name="City"
                    value={form.City}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      border:
                        errors.City || (touched.City && !form.City.trim())
                          ? "2px solid #e60023"
                          : form.City.trim()
                          ? "2px solid #28a745"
                          : "1px solid #ddd",
                      outline:
                        errors.City || (touched.City && !form.City.trim())
                          ? "1px solid #e60023"
                          : undefined,
                      background: "#fff",
                    }}
                    disabled={!form.Province || cities.length === 0}
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option
                        key={city.code || city.id || city.name}
                        value={city.name}
                      >
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {(errors.City || (touched.City && !form.City.trim())) && (
                    <div
                      style={{ color: "#e60023", fontSize: 13, marginTop: 2 }}
                    >
                      Please enter your city
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
                  style={{
                    background: "#e60023",
                    color: "#fff",
                    border: "none",
                    padding: "10px 32px",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Save
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
