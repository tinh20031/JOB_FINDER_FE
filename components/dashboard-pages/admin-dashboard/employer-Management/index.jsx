"use client";
import { useEffect, useState } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import MainHeader from "../../../header/MainHeader";
import MobileMenu from "../../../header/MobileMenu";
import "../user-manager/user-manager-animations.css";
import ApiService from "../../../../services/api.service";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import teamSizeService from "@/services/teamSizeService";

const EmployerManagement = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employersPerPage = 10;
  const [filterStatus, setFilterStatus] = useState("all");
  const [industries, setIndustries] = useState([]);
  const [selectedCompanyImageFile, setSelectedCompanyImageFile] = useState(null);
  const [selectedCompanyLgrImageFile, setSelectedCompanyLgrImageFile] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchEmployers();
    fetchIndustries();
  }, []);

  // Đọc page, search, filterStatus từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const searchParam = searchParams.get("search");
    const statusParam = searchParams.get("status");
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
    if (typeof searchParam === "string") setSearch(searchParam);
    if (typeof statusParam === "string") setFilterStatus(statusParam);
  }, [searchParams]);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", page);
    params.set("search", search);
    params.set("status", filterStatus);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

  // Khi tìm kiếm/filter, cập nhật query string và reset về page 1
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("search", value);
    params.set("page", 1);
    params.set("status", filterStatus);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };
  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("status", status);
    params.set("page", 1);
    params.set("search", search);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };

  const fetchIndustries = async () => {
    try {
      const data = await ApiService.getMasterData("INDUSTRIES");
      setIndustries(data);
    } catch (error) {
      setIndustries([]);
    }
  };

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCompanies();
      // Map API fields to FE fields, bỏ qua IsLocked
      const mapped = data.map((item) => ({
        Id: item.userId,
        CompanyName: item.companyName,
        companyProfileDescription: item.companyProfileDescription,
        Location: item.location,
        UrlCompanyLogo: item.urlCompanyLogo,
        ImageLogoLgr: item.imageLogoLgr,
        TeamSize: item.teamSize,
        IsVerified: item.isVerified,
        Website: item.website,
        Contact: item.contact,
        IndustryId: item.industryId || "",
        IndustryName: item.industryName || "N/A",
      }));
      setEmployers(mapped);
    } catch (error) {
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (employerId) => {
    try {
      await ApiService.verifyCompany(employerId);
      toast.success("Company verified!");
      fetchEmployers();
    } catch (error) {
      toast.error("Verification failed.");
    }
  };

  // Lấy danh sách industry duy nhất từ employers
  const industryList = Array.from(new Set(employers.map((e) => e.IndustryName).filter(Boolean)));
  
  // State for team size options
  const [teamSizeOptions, setTeamSizeOptions] = useState(teamSizeService.getStaticFilterOptions());

  // Fetch team size options on component mount
  useEffect(() => {
    const fetchTeamSizes = async () => {
      try {
        const options = await teamSizeService.getAdminFilterOptions();
        setTeamSizeOptions(options);
      } catch (error) {
        console.error('Error fetching team size options:', error);
        // Keep default options if API fails
      }
    };
    fetchTeamSizes();
  }, []);

  // Filter nâng cao
  const filteredEmployers = employers.filter((emp) => {
    // Search
    const matchSearch =
      emp.CompanyName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.Location?.toLowerCase().includes(search.toLowerCase());
    // Status
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" && emp.IsVerified) ||
      (filterStatus === "pending" && !emp.IsVerified);

    return matchSearch && matchStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
  const paginatedEmployers = filteredEmployers.slice(
    (currentPage - 1) * employersPerPage,
    currentPage * employersPerPage
  );

  // Reset page về 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  // Helper để lấy tên ngành từ id
  const getIndustryName = (id) => {
    const found = industries.find((ind) => ind.industryId === id);
    return found ? found.industryName : id;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-wrapper dashboard" style={{ background: "#f7f8fa", minHeight: "100vh" }}>
        <style>{`
          .employer-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            padding: 24px 32px;
            margin-bottom: 24px;
            transition: box-shadow 0.2s, background 0.2s, transform 0.18s;
          }
          .employer-card:hover {
            background: #f5f7fa;
            box-shadow: 0 6px 24px rgba(25,103,210,0.08);
            transform: scale(1.015);
          }
          .employer-info {
            display: flex;
            align-items: center;
            gap: 24px;
          }
          .employer-logo {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #f3f3f3;
            object-fit: contain;
            border: 1px solid #eee;
          }
          .employer-meta {
            display: flex;
            align-items: center;
            gap: 18px;
            color: #555;
            font-size: 15px;
          }
          .employer-actions {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
          }
          .employer-actions button {
            min-width: 120px;
          }
          .badge {
            font-size: 13px;
            padding: 4px 12px;
            border-radius: 8px;
          }
          /* Responsive breakpoints */
          @media (max-width: 1200px) {
            .filter-container {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
            }
            
            .search-group, .filter-group {
              width: 100%;
            }
            
            .search-input, .filter-select {
              width: 100%;
              min-width: unset;
            }
            
            .widget-title {
              flex-direction: column;
              gap: 16px;
              align-items: stretch;
            }
          }
          
          @media (max-width: 767px) {
            .employer-card { flex-direction: column; align-items: flex-start; }
            .employer-actions { flex-direction: row; align-items: center; margin-top: 12px; }
            .employer-meta { flex-wrap: wrap; }
            
            /* Styles for header and filters */
            .upper-title-box {
              text-align: center;
            }
            .upper-title-box h3 {
              text-align: center;
              font-size: 24px;
            }
            .widget-title {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .widget-title h4 {
              margin-bottom: 15px;
            }
            .widget-title .d-flex.flex-wrap.gap-2.align-items-center {
              flex-direction: column;
              align-items: stretch !important;
            }
            .widget-title .d-flex.flex-wrap.gap-2.align-items-center .form-control,
            .widget-title .d-flex.flex-wrap.gap-2.align-items-center .form-select,
            .widget-title .d-flex.flex-wrap.gap-2.align-items-center .btn {
              width: 100% !important;
              margin-right: 0 !important;
              margin-bottom: 10px;
            }
          }
          
          @media (max-width: 480px) {
            .filter-container {
              gap: 8px;
            }
            
            .search-input, .filter-select {
              padding: 10px 12px;
              font-size: 16px; /* Prevent zoom on iOS */
            }
          }
          .btn.btn-sm:hover, .btn.btn-sm:focus {
            background: #f5f7fa;
            border-color: #1967d2;
            color: #1967d2;
            box-shadow: 0 2px 8px rgba(25,103,210,0.08);
            transform: scale(1.05);
            transition: all 0.18s;
          }
          /* Removed default border for small buttons */
          /* .btn.btn-sm { */
          /*   border: 1px solid #ccc; */ /* Example default border */
          /* } */
          /* Removed lock-toggle-btn styles as they are no longer needed */
          
          /* Added styles for company name link */
          .employer-info div a {
            color: #333; /* Default color (dark grey/black) */
          }
          .employer-info div a:hover {
            color: #1967d2; /* Blue color on hover */
          }
          
          /* Enhanced visual effects for company management */
          .employer-card {
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
          }
          
          .employer-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }
          
          .employer-card .employer-info {
            transition: all 0.3s ease;
          }
          
          .employer-card:hover .employer-info {
            transform: scale(1.02);
          }
          
          .employer-actions button {
            transition: all 0.3s ease;
            border-radius: 8px;
            font-weight: 600;
            position: relative;
            overflow: hidden;
          }
          
          .employer-actions button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .employer-actions button:active {
            transform: translateY(0);
          }
          
          .employer-actions button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }
          
          .employer-actions button:hover::before {
            left: 100%;
          }
          
          .ls-widget {
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
          }
          
          .ls-widget:hover {
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          }
          
          .widget-title {
            border-radius: 16px 16px 0 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-bottom: 2px solid #e9ecef;
          }
          
          /* Responsive filter styles */
          .filter-container {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
          }
          
          .search-group, .filter-group {
            position: relative;
            transition: all 0.3s ease;
          }
          
          .search-input {
            min-width: 180px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
            padding: 8px 12px;
            font-size: 14px;
          }
          
          .search-input:focus {
            border-color: #1967d2;
            box-shadow: 0 0 0 3px rgba(25, 103, 210, 0.1);
            transform: translateY(-1px);
          }
          
          .filter-select {
            min-width: 140px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
            padding: 8px 12px;
            font-size: 14px;
            background-color: #fff;
          }
          
          .filter-select:focus {
            border-color: #1967d2;
            box-shadow: 0 0 0 3px rgba(25, 103, 210, 0.1);
            transform: translateY(-1px);
          }
          
          .search-group:hover .search-input,
          .filter-group:hover .filter-select {
            border-color: #1967d2;
            transform: translateY(-1px);
          }
          
          /* Responsive breakpoints */
          @media (max-width: 1200px) {
            .filter-container {
              flex-direction: column;
              align-items: stretch;
              width: 100%;
            }
            
            .search-group, .filter-group {
              width: 100%;
            }
            
            .search-input, .filter-select {
              width: 100%;
              min-width: unset;
            }
            
            .widget-title {
              flex-direction: column;
              gap: 16px;
              align-items: stretch;
            }
          }
          
          @media (max-width: 768px) {
            .employer-actions {
              flex-direction: column;
              gap: 8px;
              align-items: stretch;
            }
            
            .employer-actions button {
              width: 100%;
              min-width: unset;
            }
            
            .employer-card {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }
            
            .employer-info {
              width: 100%;
            }
            
            .employer-actions {
              width: 100%;
              margin-top: 0;
            }
          }
          
          @media (max-width: 480px) {
            .filter-container {
              gap: 8px;
            }
            
            .search-input, .filter-select {
              padding: 10px 12px;
              font-size: 16px; /* Prevent zoom on iOS */
            }
            
            .employer-card {
              padding: 16px 20px;
            }
            
            .employer-logo {
              width: 48px;
              height: 48px;
            }
          }
        `}</style>

        <span className="header-span"></span>
        <MainHeader />

        <MobileMenu />
        {/* <!-- End MobileMenu --> */}

        <DashboardAdminSidebar />

        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="Company Management" />
            <MenuToggler />
            {alertMsg && (
              <div className="alert alert-info" style={{ marginBottom: 12 }}>
                {alertMsg}
              </div>
            )}
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <h4>Company List ({filteredEmployers.length})</h4>
                    <div className="filter-container d-flex flex-wrap gap-2 align-items-center">
                      <div className="search-group">
                        <input
                          type="text"
                          className="form-control form-control-sm search-input"
                          placeholder="Search company..."
                          value={search}
                          onChange={handleSearch}
                        />
                      </div>
                      <div className="filter-group">
                        <select
                          className="form-select form-select-sm filter-select"
                          value={filterStatus}
                          onChange={(e) => handleFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="verified">Verified</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={`widget-content ${!loading ? "fade-in" : ""}`}>
                    {loading ? (
                      <div>
                        {[...Array(8)].map((_, idx) => (
                          <div className="employer-card" key={idx}>
                            <div className="employer-info">
                              <div
                                className="skeleton-line"
                                style={{ width: 64, height: 64, borderRadius: "50%" }}
                              ></div>
                              <div style={{ flex: 1 }}>
                                <div
                                  className="skeleton-line"
                                  style={{
                                    width: 180,
                                    height: 22,
                                    borderRadius: 8,
                                    marginBottom: 8,
                                  }}
                                ></div>
                                <div style={{ display: "flex", gap: 18 }}>
                                  <div
                                    className="skeleton-line"
                                    style={{ width: 90, height: 16, borderRadius: 6 }}
                                  ></div>
                                  <div
                                    className="skeleton-line"
                                    style={{ width: 60, height: 16, borderRadius: 6 }}
                                  ></div>
                                  <div
                                    className="skeleton-line"
                                    style={{ width: 80, height: 16, borderRadius: 6 }}
                                  ></div>
                                  <div
                                    className="skeleton-line"
                                    style={{ width: 70, height: 16, borderRadius: 6 }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="employer-actions">
                              <div
                                className="skeleton-line"
                                style={{ width: 120, height: 32, borderRadius: 8, marginBottom: 8 }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        <style jsx>{`
                          .skeleton-line {
                            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
                            background-size: 400% 100%;
                            animation: skeleton-loading 1.4s ease infinite;
                            border-radius: 6px;
                          }
                          @keyframes skeleton-loading {
                            0% { background-position: 100% 50%; }
                            100% { background-position: 0 50%; }
                          }
                        `}</style>
                      </div>
                    ) : (
                      <div>
                        {paginatedEmployers.length === 0 ? (
                          <div style={{ padding: 32, textAlign: "center" }}>No company found</div>
                        ) : (
                          paginatedEmployers.map((emp) => (
                            <div className="employer-card" key={emp.Id}>
                              <div className="employer-info">
                                <img
                                  className="employer-logo"
                                  src={emp.UrlCompanyLogo || emp.ImageLogoLgr}
                                  alt="logo"
                                />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
                                    <a
                                      href={`/company-detail/${emp.Id}`}
                                      style={{ textDecoration: "none", cursor: "pointer" }}
                                    >
                                      {emp.CompanyName}
                                    </a>
                                  </div>
                                  <div className="employer-meta">
                                    <span>
                                      <i className="fa fa-map-marker-alt" style={{ marginRight: 4 }}></i>{" "}
                                      {emp.Location}
                                    </span>
                                    <span>
                                      <i className="fa fa-users" style={{ marginRight: 4 }}></i> {emp.TeamSize}
                                    </span>
                                    <span>
                                      <i className="fa fa-briefcase" style={{ marginRight: 4 }}></i>{" "}
                                      {emp.IndustryName}
                                    </span>
                                    {emp.IsVerified ? (
                                      <span className="badge bg-success">Verified</span>
                                    ) : (
                                      <span className="badge bg-warning">Pending Approval</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="employer-actions">
                                {!emp.IsVerified && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleVerify(emp.Id)}
                                    style={{
                                      minWidth: "80px",
                                      transition: "all 0.3s ease",
                                      boxShadow: "0 2px 8px rgba(40, 167, 69, 0.3)",
                                    }}
                                  >
                                    <i className="fas fa-check-circle me-1"></i>
                                    Approve
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        {!loading && filteredEmployers.length > 0 && (
                          (() => {
                            const totalPagesToShow = totalPages >= 1 ? totalPages : 1;
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: 16,
                                  margin: "24px 0",
                                }}
                              >
                                <button
                                  disabled={currentPage === 1}
                                  onClick={() => handleSetPage(currentPage - 1)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 22,
                                    cursor: "pointer",
                                    color: currentPage === 1 ? "#ccc" : "#444",
                                  }}
                                >
                                  &#8592;
                                </button>
                                {Array.from({ length: totalPagesToShow }, (_, i) => (
                                  <button
                                    key={i + 1}
                                    onClick={() => handleSetPage(i + 1)}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      background: currentPage === i + 1 ? "#1967d2" : "none",
                                      color: currentPage === i + 1 ? "#fff" : "#444",
                                      border: "none",
                                      fontWeight: 600,
                                      fontSize: 18,
                                      cursor: "pointer",
                                      outline: "none",
                                      boxShadow: "none",
                                      transition: "background 0.2s, color 0.2s",
                                    }}
                                  >
                                    {i + 1}
                                  </button>
                                ))}
                                <button
                                  disabled={currentPage === totalPagesToShow || totalPagesToShow === 0}
                                  onClick={() => handleSetPage(currentPage + 1)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: 22,
                                    cursor: "pointer",
                                    color:
                                      currentPage === totalPagesToShow || totalPagesToShow === 0 ? "#ccc" : "#444",
                                  }}
                                >
                                  &#8594;
                                </button>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EmployerManagement;