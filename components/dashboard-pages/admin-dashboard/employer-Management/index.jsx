"use client";
import { useEffect, useState } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import MainHeader from "../../../header/MainHeader";
import MobileMenu from "../../../header/MobileMenu";
import "../user-manager/user-manager-animations.css";
import ApiService from "../../../../services/api.service";
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployerManagement = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const employersPerPage = 10;
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLock, setFilterLock] = useState('all');
  const [industries, setIndustries] = useState([]);
  const [selectedCompanyImageFile, setSelectedCompanyImageFile] = useState(null);
  const [selectedCompanyLgrImageFile, setSelectedCompanyLgrImageFile] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchEmployers();
    fetchIndustries();
  }, []);

  // Đọc page, search, filterStatus, filterLock từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const statusParam = searchParams.get('status');
    const lockParam = searchParams.get('lock');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
    if (typeof searchParam === 'string') setSearch(searchParam);
    if (typeof statusParam === 'string') setFilterStatus(statusParam);
    if (typeof lockParam === 'string') setFilterLock(lockParam);
  }, [searchParams]);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    params.set('search', search);
    params.set('status', filterStatus);
    params.set('lock', filterLock);
    router.replace(`?${params.toString()}`);
    setCurrentPage(page);
  };

  // Khi tìm kiếm/filter, cập nhật query string và reset về page 1
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('search', value);
    params.set('page', 1);
    params.set('status', filterStatus);
    params.set('lock', filterLock);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };
  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('status', status);
    params.set('page', 1);
    params.set('search', search);
    params.set('lock', filterLock);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };
  const handleFilterLock = (lock) => {
    setFilterLock(lock);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('lock', lock);
    params.set('page', 1);
    params.set('search', search);
    params.set('status', filterStatus);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };

  const fetchIndustries = async () => {
    try {
      const data = await ApiService.getMasterData('INDUSTRIES');
      setIndustries(data);
    } catch (error) {
      setIndustries([]);
    }
  };

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCompanies();
      // Map API fields to FE fields
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
        IndustryId: item.industryId || '',
        IndustryName: item.industryName || 'N/A',

        IsLocked: !item.isActive
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

  const handleToggleLock = async (employerId, isLocked) => {
    try {
      await ApiService.request(
        `CompanyProfile/${employerId}/${isLocked ? "unlock" : "lock"}`,
        'PUT'
      );
      toast.success(isLocked ? "Company unlocked." : "Company locked.");
      fetchEmployers();
    } catch (error) {
      toast.error("Operation failed.");
    }
  };



  // Lấy danh sách industry duy nhất từ employers
  const industryList = Array.from(new Set(employers.map(e => e.IndustryName).filter(Boolean)));
  // Lấy danh sách team size mẫu
  const teamSizeOptions = [
    { label: 'All', value: 'all' },
    { label: '1-50', value: '1-50' },
    { label: '51-200', value: '51-200' },
    { label: '201-500', value: '201-500' },
    { label: '501+', value: '501+' },
  ];

  // Filter nâng cao
  const filteredEmployers = employers.filter(emp => {
    // Search
    const matchSearch = emp.CompanyName?.toLowerCase().includes(search.toLowerCase()) ||
      emp.Location?.toLowerCase().includes(search.toLowerCase());
    // Status
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'verified' && emp.IsVerified) ||
      (filterStatus === 'pending' && !emp.IsVerified);

    // Lock Status Filter Logic
    const matchLock = filterLock === 'all' || 
                      (filterLock === 'locked' ? emp.IsLocked === true : emp.IsLocked === false);

    return matchSearch && matchStatus && matchLock;

  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployers.length / employersPerPage);
  const paginatedEmployers = filteredEmployers.slice((currentPage-1)*employersPerPage, currentPage*employersPerPage);

  // Reset page về 1 khi filter/search thay đổi
  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, filterLock]);

  // Helper để lấy tên ngành từ id
  const getIndustryName = (id) => {

    const found = industries.find(ind => ind.industryId === id);
    return found ? found.industryName : id;

  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
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
          .lock-toggle-btn {
            border: 1px solid #ccc; /* Default border color */
            background: #fff; /* White background */
            color: #777; /* Grey text color */
            /* Removed hover/focus styles */
          }
          .lock-toggle-btn:hover, .lock-toggle-btn:focus { /* Add hover/focus styles */
            background: #f5f7fa; /* Light blue-grey background on hover/focus */
            border-color: #1967d2; /* Blue border on hover/focus */
            color: #1967d2; /* Blue text on hover/focus */
            box-shadow: 0 2px 8px rgba(25,103,210,0.08);
            transform: scale(1.05);
            transition: all 0.18s;
          }
          /* Added styles for company name link */
          .employer-info div a {
            color: #333; /* Default color (dark grey/black) */
          }
          .employer-info div a:hover {
            color: #1967d2; /* Blue color on hover */
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
              <div className="alert alert-info" style={{marginBottom: 12}}>
                {alertMsg}
              </div>
            )}
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="widget-title d-flex flex-wrap gap-2 justify-content-between align-items-center">
                    <h4>Company List</h4>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{width:180}}
                        placeholder="Search company..."
                        value={search}
                        onChange={handleSearch}
                      />
                      <select className="form-select form-select-sm" style={{width:120}} value={filterStatus} onChange={e=>handleFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                      </select>
                      <select className="form-select form-select-sm" style={{width:120}} value={filterLock} onChange={e=>handleFilterLock(e.target.value)}>
                        <option value="all">All Status Lock</option>
                        <option value="locked">Locked</option>
                        <option value="unlocked">Unlocked</option>
                      </select>
                    </div>
                  </div>
                  <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                    {loading ? (
                      <div>
                        {[...Array(8)].map((_, idx) => (
                          <div className="employer-card" key={idx}>
                            <div className="employer-info">
                              <div className="skeleton-line" style={{ width: 64, height: 64, borderRadius: '50%' }}></div>
                              <div style={{ flex: 1 }}>
                                <div className="skeleton-line" style={{ width: 180, height: 22, borderRadius: 8, marginBottom: 8 }}></div>
                                <div style={{ display: 'flex', gap: 18 }}>
                                  <div className="skeleton-line" style={{ width: 90, height: 16, borderRadius: 6 }}></div>
                                  <div className="skeleton-line" style={{ width: 60, height: 16, borderRadius: 6 }}></div>
                                  <div className="skeleton-line" style={{ width: 80, height: 16, borderRadius: 6 }}></div>
                                  <div className="skeleton-line" style={{ width: 70, height: 16, borderRadius: 6 }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="employer-actions">
                              <div className="skeleton-line" style={{ width: 120, height: 32, borderRadius: 8, marginBottom: 8 }}></div>
                              <div className="skeleton-line" style={{ width: 120, height: 32, borderRadius: 8 }}></div>
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
                          <div style={{padding:32, textAlign:'center'}}>No company found</div>
                        ) : (
                          paginatedEmployers.map((emp) => (
                            <div className="employer-card" key={emp.Id}>
                              <div className="employer-info">
                                  <img className="employer-logo" src={emp.UrlCompanyLogo || emp.ImageLogoLgr} alt="logo" />
                                  <div>
                                    <div style={{fontWeight:600, fontSize:20, marginBottom:4}}>
                                      <a href={`/employers-single-v1/${emp.Id}`} style={{textDecoration: 'none', cursor: 'pointer'}}>
                                        {emp.CompanyName}
                                      </a>
                                    </div>
                                    <div className="employer-meta">
                                      <span><i className="fa fa-map-marker-alt" style={{marginRight:4}}></i> {emp.Location}</span>
                                      <span><i className="fa fa-users" style={{marginRight:4}}></i> {emp.TeamSize}</span>
                                      <span><i className="fa fa-briefcase" style={{marginRight:4}}></i> {emp.IndustryName}</span>
                                      {emp.IsVerified ? (
                                        <span className="badge bg-success">Verified</span>
                                      ) : (
                                        <span className="badge bg-warning">Pending Approval</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="employer-actions">
                                  {/* Removed View Profile and Edit buttons */}
                                  {!emp.IsVerified && (
                                    <button className="btn btn-sm me-1" onClick={() => handleVerify(emp.Id)}>Approve</button>
                                  )}
                                  <button className="btn btn-sm lock-toggle-btn" onClick={() => handleToggleLock(emp.Id, emp.IsLocked)}>{emp.IsLocked ? "Unlock" : "Lock"}</button>
                                </div>
                              </div>
                            ))
                          )}
                        {!loading && filteredEmployers.length > 0 && (
                          (() => {
                            const totalPagesToShow = totalPages >= 1 ? totalPages : 1;
                            return (
                              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                                <button
                                  disabled={currentPage === 1}
                                  onClick={() => handleSetPage(currentPage - 1)}
                                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === 1 ? '#ccc' : '#444' }}
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
                                      borderRadius: '50%',
                                      background: currentPage === i + 1 ? '#1967d2' : 'none',
                                      color: currentPage === i + 1 ? '#fff' : '#444',
                                      border: 'none',
                                      fontWeight: 600,
                                      fontSize: 18,
                                      cursor: 'pointer',
                                      outline: 'none',
                                      boxShadow: 'none',
                                      transition: 'background 0.2s, color 0.2s'
                                    }}
                                  >
                                    {i + 1}
                                  </button>
                                ))}
                                <button
                                  disabled={currentPage === totalPagesToShow || totalPagesToShow === 0}
                                  onClick={() => handleSetPage(currentPage + 1)}
                                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: currentPage === totalPagesToShow || totalPagesToShow === 0 ? '#ccc' : '#444' }}
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