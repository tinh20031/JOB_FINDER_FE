"use client";
import { useEffect, useState } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import DashboardHeader from "../../../header/DashboardHeaderAdmin";
import "../user-manager/user-manager-animations.css";
import ApiService from "../../../../services/api.service";

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

  useEffect(() => {
    fetchEmployers();
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const data = await ApiService.getMasterData('INDUSTRIES');
      console.log('Fetched industries:', data);
      setIndustries(data);
    } catch (error) {
      console.error('Error fetching industries:', error);
      setIndustries([]);
    }
  };

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCompanies();
      console.log('Raw API data for employers:', data);
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
      console.error('Error fetching employers:', error);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (employerId) => {
    try {
      await ApiService.verifyCompany(employerId);
      setAlertMsg("Company verified!");

      fetchEmployers();
    } catch (error) {
      console.error('Error verifying employer:', error);
      setAlertMsg("Verification failed.");
    }
  };

  const handleToggleLock = async (employerId, isLocked) => {
    try {
      await ApiService.request(
        `CompanyProfile/${employerId}/${isLocked ? "unlock" : "lock"}`,
        'PUT'
      );
      setAlertMsg(isLocked ? "Company unlocked." : "Company locked.");
      fetchEmployers();
    } catch (error) {
      console.error('Error toggling lock:', error);
      setAlertMsg("Operation failed.");
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

    console.log('Getting name for industry ID:', id);
    const found = industries.find(ind => ind.industryId === id);
    console.log('Found industry:', found);
    return found ? found.industryName : id;

  };

  return (
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
        @media (max-width: 700px) {
          .employer-card { flex-direction: column; align-items: flex-start; }
          .employer-actions { flex-direction: row; align-items: center; margin-top: 12px; }
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
      <DashboardHeader />
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
                      onChange={e => setSearch(e.target.value)}
                    />
                    <select className="form-select form-select-sm" style={{width:120}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                    </select>
                    <select className="form-select form-select-sm" style={{width:120}} value={filterLock} onChange={e=>setFilterLock(e.target.value)}>
                      <option value="all">All Status Lock</option>
                      <option value="locked">Locked</option>
                      <option value="unlocked">Unlocked</option>
                    </select>
                  </div>
                </div>
                <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                  {loading ? (
                    <div className="spinner"></div>
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
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <nav className="mt-3">
                          <ul className="pagination justify-content-end">
                            <li className={`page-item${currentPage===1?' disabled':''}`}>
                              <button className="page-link" onClick={()=>setCurrentPage(currentPage-1)} disabled={currentPage===1}>&laquo;</button>
                            </li>
                            {Array.from({length: totalPages}, (_,i)=>(
                              <li key={i+1} className={`page-item${currentPage===i+1?' active':''}`}>
                                <button className="page-link" onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
                              </li>
                            ))}
                            <li className={`page-item${currentPage===totalPages?' disabled':''}`}>
                              <button className="page-link" onClick={()=>setCurrentPage(currentPage+1)} disabled={currentPage===totalPages}>&raquo;</button>
                            </li>
                          </ul>
                        </nav>
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
  );
};

export default EmployerManagement; 