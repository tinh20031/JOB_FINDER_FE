"use client"
import { useEffect, useState } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import MainHeader from "../../../header/MainHeader";
import Link from "next/link";
import "./user-manager-animations.css";
import ApiService from "../../../../services/api.service";
import API_CONFIG from '../../../../config/api.config';
import { useDispatch } from 'react-redux';
import { setProfileUpdated } from '@/features/auth/authSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultUser = { fullName: "", email: "", phone: "", roleId: "", password: "", status: "Active", skills: [], cvUrl: "", image: "" };

// Mapping roleId cố định - Bỏ Company ra khỏi dropdown
const ROLE_MAP = [
  { id: 1, name: "Candidate" },
  { id: 3, name: "Admin" }
];

// Mapping roleId đầy đủ để xử lý dữ liệu
const FULL_ROLE_MAP = [
  { id: 1, name: "Candidate" },
  { id: 2, name: "Company" },
  { id: 3, name: "Admin" }
];

const FALLBACK_ROLES = [
  { id: 1, name: "Candidate" },
  { id: 3, name: "Admin" }
];

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formUser, setFormUser] = useState(defaultUser);
  const [formError, setFormError] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [filterRole, setFilterRole] = useState('all');
  const [filterLock, setFilterLock] = useState('all');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editError, setEditError] = useState("");
  const dispatch = useDispatch();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc page, search, filterRole, filterLock từ query string khi mount
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const searchParam = searchParams.get('search');
    const roleParam = searchParams.get('role');
    const lockParam = searchParams.get('lock');
    if (pageParam && !isNaN(Number(pageParam)) && Number(pageParam) > 0) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
    if (typeof searchParam === 'string') setSearch(searchParam);
    if (typeof roleParam === 'string') setFilterRole(roleParam);
    if (typeof lockParam === 'string') setFilterLock(lockParam);
  }, [searchParams]);

  // Tự động ẩn alert sau 2.5s
  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg("") , 2500);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await ApiService.get('/' + API_CONFIG.ENDPOINTS.ROLE.GET_ALL);
      
      let processedRoles = [];
      if (Array.isArray(response)) {
        processedRoles = response
          .filter(role => role && typeof role.roleId !== 'undefined' && role.roleId !== null)
          .map(role => ({
            id: parseInt(role.roleId),
            name: role.roleName || `Role ${role.roleId}` // Fallback name
          }));
      } else {
        // API did not return an array for roles
        processedRoles = FALLBACK_ROLES;
      }
      setRoles(processedRoles.length > 0 ? processedRoles : FALLBACK_ROLES);
    } catch (error) {
      console.warn('Failed to fetch roles from API, using fallback roles:', error.message);
      setRoles(FALLBACK_ROLES);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/' + API_CONFIG.ENDPOINTS.USER.BASE);
      if (Array.isArray(response)) {
        const usersWithRoleId = response.map(user => {
          // Ưu tiên lấy roleId dạng số, nếu không có thì map từ tên role
          let roleId = '';
          if (user.roleId) {
            roleId = parseInt(user.roleId);
          } else if (user.role_id) {
            roleId = parseInt(user.role_id);
          } else if (user.role) {
            // Nếu user.role là tên, map sang id - sử dụng FULL_ROLE_MAP để xử lý cả Company
            const found = FULL_ROLE_MAP.find(r => r.name.toLowerCase() === String(user.role).toLowerCase());
            roleId = found ? found.id : '';
          }
          return {
            ...user,
            roleId
          };
        });
        setUsers(usersWithRoleId);
      } else {
        setUsers([]);
      }
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Lọc user theo search và filter
  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' ? true : user.role === filterRole;
    const matchLock = filterLock === 'all' || (filterLock === 'locked' ? user.isActive === false : user.isActive !== false);
    return matchSearch && matchRole && matchLock;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage-1)*usersPerPage, currentPage*usersPerPage);

  // Khi chuyển trang, cập nhật query string
  const handleSetPage = (page) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('page', page);
    params.set('search', search);
    params.set('role', filterRole);
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
    params.set('role', filterRole);
    params.set('lock', filterLock);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };
  const handleFilterRole = (role) => {
    setFilterRole(role);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('role', role);
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
    params.set('role', filterRole);
    router.replace(`?${params.toString()}`);
    setCurrentPage(1);
  };

  // Handler functions
  const handleShowDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  const handleShowEdit = (user) => {
    // Map role name sang roleId cố định - sử dụng FULL_ROLE_MAP để xử lý cả Company
    const foundRole = FULL_ROLE_MAP.find(role => role.name === user.role);
    const roleIdToSet = foundRole ? foundRole.id : "";
    const userForForm = {
      ...user,
      role: user.role,
      roleId: roleIdToSet
    };
    setEditUser(userForForm);
    setFormUser(userForForm); 
    setEditError("");
    setShowEditModal(true);
    setFormError("");
    setSelectedImageFile(null);
  };
  const handleToggleLock = async (user) => {
    let action; // Declare action here
    try {
      const isLocked = user.isActive === false;
      action = isLocked ? 'unlock' : 'lock'; // Assign value here
      await ApiService.request(`user/${user.id}/${action}`, 'PUT');
      toast.success(`User ${isLocked ? 'unlocked' : 'locked'} successfully!`);
      setTimeout(fetchUsers, 300);
    } catch (error) {
      toast.error(`Failed to ${action} user.`);
    }
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setSelectedImageFile(files[0]);
      setFormUser({
        ...formUser,
        image: URL.createObjectURL(files[0])
      });
    } else if (name === "role") {
      // Map role name sang roleId cố định - sử dụng FULL_ROLE_MAP để xử lý cả Company
      const selectedRole = FULL_ROLE_MAP.find(r => r.name === value);
      setFormUser({
        ...formUser,
        role: value,
        roleId: selectedRole ? selectedRole.id : ""
      });
    } else {
      setFormUser({
        ...formUser,
        [name]: value
      });
    }
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Add or Edit
    if (showEditModal) {
      const formData = new FormData();
      formData.append('fullName', formUser.fullName);
      formData.append('email', formUser.email);
      formData.append('phone', formUser.phone);
      if (selectedImageFile) {
        formData.append('imageFile', selectedImageFile);
      }
      formData.append('roleId', Number(formUser.roleId)); // Gửi roleId (số)
      // Không gửi trường role (chuỗi) lên API
      ApiService.updateUser(editUser.id, formData)
        .then(() => {
          toast.success("User updated successfully!");
          fetchUsers();
          setShowEditModal(false);
          dispatch(setProfileUpdated(Date.now()));
        })
        .catch((err) => setEditError(err.message || "Failed to update user."));
    }
  };

  // Hàm lấy tên role từ roleId - sử dụng FULL_ROLE_MAP để xử lý cả Company
  const getRoleName = (roleId) => {
    const found = FULL_ROLE_MAP.find(r => r.id === Number(roleId));
    return found ? found.name : '';
  };

  const validateForm = () => {
    if (!formUser.fullName || !formUser.email) {
      setFormError("Full name and Email are required.");
      return false;
    }
    if (showAddModal && !formUser.password) {
      setFormError("Password is required.");
      return false;
    }
    return true;
  };

  const handleRoleButtonClick = (userId) => {
    setRoleDropdownOpen(roleDropdownOpen === userId ? null : userId);
  };

  const handleRoleChange = async (user, newRoleId) => {
    // Ngăn việc chọn Company role
    const selectedRole = FULL_ROLE_MAP.find(r => r.id === newRoleId);
    if (selectedRole && selectedRole.name === "Company") {
      toast.error('Cannot change to Company role. This option is disabled.');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('roleId', newRoleId);
      await ApiService.updateUser(user.id, formData);
      toast.success('Role updated successfully!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role.');
    } finally {
      setRoleDropdownOpen(null);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-wrapper dashboard">
        <span className="header-span"></span>
        <MainHeader />
        <DashboardAdminSidebar />
        <section className="user-dashboard">
          <div className="dashboard-outer">
            <BreadCrumb title="User Manager" />
            <MenuToggler />
            {alertMsg && (
              <div className="alert alert-info" style={{marginBottom: 12}}>
                {alertMsg}
              </div>
            )}
            <div className="row">
              <div className="col-lg-12">
                <div className="ls-widget">
                  <div className="widget-title d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <h4>User Management ({filteredUsers.length})</h4>
                    <div className="filter-container d-flex flex-wrap gap-2 align-items-center">
                      <div className="search-group">
                        <input
                          type="text"
                          className="form-control form-control-sm search-input"
                          placeholder="Search by name, email, phone..."
                          value={search}
                          onChange={handleSearch}
                        />
                      </div>
                      <div className="filter-group">
                        <select 
                          className="form-select form-select-sm filter-select" 
                          value={filterRole} 
                          onChange={e=>handleFilterRole(e.target.value)}
                        >
                          <option key="all" value="all">All Roles</option>
                          {Array.isArray(roles) && roles.length > 0 ? (
                            roles
                              .filter(role => role.name !== "Company") // Lọc bỏ Company khỏi filter
                              .map(role => (
                                <option key={`filter-role-${role.name}`} value={role.name}>
                                  {role.name || `Role`}
                                </option>
                              ))
                          ) : (
                            <option value="" disabled>No roles available</option>
                          )}
                        </select>
                      </div>
                      <div className="filter-group">
                        <select 
                          className="form-select form-select-sm filter-select" 
                          value={filterLock} 
                          onChange={e=>handleFilterLock(e.target.value)}
                        >
                          <option key="all-status" value="all">All Lock Status</option>
                          <option key="locked" value="locked">Locked</option>
                          <option key="unlocked" value="unlocked">Unlocked</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                    {loading ? (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Avatar</th>
                              <th>Full Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Role</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(8)].map((_, idx) => (
                              <tr key={idx}>
                                <td><div className="skeleton-line" style={{ width: 50, height: 50, borderRadius: '50%' }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 120, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 160, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 100, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 80, height: 18, borderRadius: 6 }}></div></td>
                                <td><div className="skeleton-line" style={{ width: 80, height: 32, borderRadius: 8 }}></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                      <>
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            {/* <th>ID</th> */}
                            <th>Avatar</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedUsers.length === 0 ? (
                            <tr><td colSpan={6}>No users found</td></tr>
                          ) : (
                            paginatedUsers.map((user) => {
                              const isLocked = user.isActive === false;
                              return (
                                <tr key={user.id}>
                                  {/* <td>{user.id}</td> */}
                                  <td>
                                    <img 
                                      src={
                                        user.role === 'Company' 
                                          ? (user.urlCompanyLogo || user.image || '/images/resource/company-6.png')
                                          : (user.image || '/images/resource/candidate-1.png')
                                      } 
                                      alt={user.fullName}
                                      style={{width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover'}}
                                    />
                                  </td>
                                  <td>{user.fullName}</td>
                                  <td>{user.email}</td>
                                  <td>{user.phone}</td>
                                  {/* Cột Role: dropdown đổi role */}
                                  <td>
                                    <select
                                      className="form-select form-select-sm"
                                      style={{ width: 120, display: 'inline-block' }}
                                      value={user.roleId || ''}
                                      onChange={e => handleRoleChange(user, Number(e.target.value))}
                                      disabled={user.role === 'Company'}
                                      title={user.role === 'Company' ? 'Company role cannot be changed' : ''}
                                    >
                                                                             {/* Hiển thị tất cả roles trong dropdown nhưng chỉ cho phép chọn Candidate và Admin */}
                                       {FULL_ROLE_MAP.map(role => (
                                         <option 
                                           key={role.id} 
                                           value={role.id}
                                           disabled={role.name === "Company"}
                                           style={role.name === "Company" ? { color: '#999', fontStyle: 'italic' } : {}}
                                         >
                                           {role.name}
                                         </option>
                                       ))}
                                    </select>
                                  </td>
                                  {/* Cột Actions: chỉ còn View và Lock/Unlock */}
                                  <td>
                                    <div className="action-buttons d-flex gap-2">
                                      <Link 
                                        href={`/admin-dashboard/user-manager/${user.id}`} 
                                        className="btn btn-sm btn-outline-primary"
                                        style={{
                                          minWidth: '80px',
                                          transition: 'all 0.3s ease',
                                          borderRadius: '8px',
                                          fontWeight: '600',
                                          boxShadow: 'none'
                                        }}
                                      >
                                        <i className="fas fa-eye me-1"></i>
                                        View
                                      </Link>
                                      <button
                                        className={`btn btn-sm ${isLocked ? 'btn-success' : 'btn-outline-danger'}`}
                                        onClick={() => handleToggleLock(user)}
                                        style={{
                                          minWidth: '80px',
                                          transition: 'all 0.3s ease',
                                          borderRadius: '8px',
                                          fontWeight: '600',
                                          boxShadow: isLocked ? '0 2px 8px rgba(40, 167, 69, 0.3)' : 'none'
                                        }}
                                      >
                                        <i className={`fas ${isLocked ? 'fa-unlock' : 'fa-lock'} me-1`}></i>
                                        {isLocked ? 'Unlock' : 'Lock'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      {/* Pagination */}
                      {filteredUsers.length > 0 && (
                        (() => {
                          const totalPagesToShow = totalPages >= 1 ? totalPages : 1;
                          return (
                            <div className="pagination">
                              <button
                                disabled={currentPage === 1}
                                onClick={() => handleSetPage(currentPage - 1)}
                              >
                                &#8592;
                              </button>
                              {Array.from({ length: totalPagesToShow }, (_, i) => (
                                <button
                                  key={i + 1}
                                  onClick={() => handleSetPage(i + 1)}
                                  className={currentPage === i + 1 ? 'active' : ''}
                                >
                                  {i + 1}
                                </button>
                              ))}
                              <button
                                disabled={currentPage === totalPagesToShow || totalPagesToShow === 0}
                                onClick={() => handleSetPage(currentPage + 1)}
                              >
                                &#8594;
                              </button>
                            </div>
                          );
                        })()
                      )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal show" style={{display:'block'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <form onSubmit={handleFormSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Edit User</h5>
                    <button className="btn-close" onClick={()=>setShowEditModal(false)} type="button"></button>
                  </div>
                  <div className="modal-body">
                    {editError && <div className="alert alert-danger">{editError}</div>}
                    <div className="mb-2">
                      <label>Profile Image</label>
                      <input 
                        className="form-control" 
                        type="file"
                        name="image"
                        onChange={handleFormChange}
                        accept="image/*"
                      />
                      {(selectedImageFile || formUser.image) && (
                        <img 
                          src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formUser.image} 
                          alt="Preview" 
                          style={{width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '50%'}}
                        />
                      )}
                    </div>
                    <div className="mb-2">
                      <label>Full Name</label>
                      <input className="form-control" name="fullName" value={formUser.fullName} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                      <label>Email</label>
                      <input className="form-control" name="email" value={formUser.email} onChange={handleFormChange} required />
                    </div>
                    <div className="mb-2">
                      <label>Phone</label>
                      <input className="form-control" name="phone" value={formUser.phone} onChange={handleFormChange} />
                    </div>
                    <div className="mb-2">
                      <label>Role</label>
                      <select className="form-control" name="role" value={formUser.role || ""} onChange={handleFormChange} required disabled={editUser?.role === 'Company'} title={editUser?.role === 'Company' ? 'Company role cannot be changed' : ''}>
                        <option value="">Select Role</option>
                        {ROLE_MAP.map(role => (
                          <option key={`edit-role-${role.id}`} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      {editUser?.role === 'Company' && (
                        <small className="text-muted">This user currently has the Company role and cannot be changed.</small>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" type="button" onClick={()=>setShowEditModal(false)}>Cancel</button>
                    <button className="btn btn-primary" type="submit">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManager; 