"use client"
import { useEffect, useState } from "react";
import DashboardAdminSidebar from "../../../header/DashboardAdminSidebar";
import BreadCrumb from "../../BreadCrumb";
import MenuToggler from "../../MenuToggler";
import DashboardHeader from "../../../header/DashboardHeaderAdmin";
import Link from "next/link";
import "./user-manager-animations.css";
import ApiService from "../../../../services/api.service";
import API_CONFIG from '../../../../config/api.config';
import { useDispatch } from 'react-redux';
import { setProfileUpdated } from '@/features/auth/authSlice';

const defaultUser = { fullName: "", email: "", phone: "", roleId: "", password: "", status: "Active", skills: [], cvUrl: "", image: "" };

// Mapping roleId cố định
const ROLE_MAP = [
  { id: 1, name: "Candidate" },
  { id: 2, name: "Company" },
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
      console.log('Roles API Response:', response);
      
      let processedRoles = [];
      if (Array.isArray(response)) {
        console.log('Response is an array, processing roles...');
        processedRoles = response
          .filter(role => role && typeof role.roleId !== 'undefined' && role.roleId !== null)
          .map(role => ({
            id: parseInt(role.roleId),
            name: role.roleName || `Role ${role.roleId}` // Fallback name
          }));
      } else {
        console.error('API did not return an array for roles:', response);
      }
      
      console.log('Processed Roles before setting state:', processedRoles);
      setRoles(processedRoles);
      console.log('Roles state after setting:', processedRoles); // Log state value

    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
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
            // Nếu user.role là tên, map sang id
            const found = ROLE_MAP.find(r => r.name.toLowerCase() === String(user.role).toLowerCase());
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handler functions
  const handleShowDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  const handleShowEdit = (user) => {
    console.log('Opening Edit Modal for User:', user); // Log user data
    console.log('User Role ID (before formUser): ', user.roleId, typeof user.roleId); // Log user.roleId (from user data)
    console.log('User Role Name (from user data): ', user.role); // Log user.role name
    console.log('Available Roles for lookup:', roles); // Log available roles

    // Map role name sang roleId cố định
    const foundRole = ROLE_MAP.find(role => role.name === user.role);
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
      setAlertMsg(`User ${isLocked ? 'unlocked' : 'locked'} successfully!`);
      setTimeout(fetchUsers, 300);
    } catch (error) {
      console.error('Error toggling user lock status:', error); // Added console log for error
      setAlertMsg(`Failed to ${action} user.`);
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
      // Map role name sang roleId cố định
      const selectedRole = ROLE_MAP.find(r => r.name === value);
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
      console.log('Submitting Edit Form:', { // Log data before appending to FormData
        fullName: formUser.fullName,
        email: formUser.email,
        phone: formUser.phone,
        roleId: formUser.roleId,
        roleIdType: typeof formUser.roleId // Log type of roleId
      });
      console.log('FormData roleId value (should match above): ', formData.get('roleId'), typeof formData.get('roleId')); // Log value and type from FormData

      ApiService.updateUser(editUser.id, formData)
        .then(() => {
          setAlertMsg("User updated successfully!");
          fetchUsers();
          setShowEditModal(false);
          dispatch(setProfileUpdated(Date.now()));
        })
        .catch((err) => setEditError(err.message || "Failed to update user."));
    }
  };

  // Hàm lấy tên role từ roleId
  const getRoleName = (roleId) => {
    const found = ROLE_MAP.find(r => r.id === Number(roleId));
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
    try {
      const formData = new FormData();
      formData.append('roleId', newRoleId);
      await ApiService.updateUser(user.id, formData);
      setAlertMsg('Role updated successfully!');
      fetchUsers();
    } catch (err) {
      setAlertMsg('Failed to update role.');
    } finally {
      setRoleDropdownOpen(null);
    }
  };

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <DashboardHeader />
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
                <div className="widget-title d-flex justify-content-between align-items-center">
                  <h4>User Manager</h4>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm me-2"
                      style={{width:220}}
                      placeholder="Search by name, email, phone..."
                      value={search}
                      onChange={handleSearch}
                    />
                    <select className="form-select form-select-sm me-2" style={{width:120}} value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
                      <option key="all" value="all">All Roles</option>
                      {Array.isArray(roles) && roles.length > 0 ? (
                        roles.map(role => (
                          <option key={`filter-role-${role.name}`} value={role.name}>
                            {role.name || `Role`}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No roles available</option>
                      )}
                    </select>
                    <select className="form-select form-select-sm me-2" style={{width:120}} value={filterLock} onChange={e=>setFilterLock(e.target.value)}>
                      <option key="all-status" value="all">All Status</option>
                      <option key="locked" value="locked">Locked</option>
                      <option key="unlocked" value="unlocked">Unlocked</option>
                    </select>
                  </div>
                </div>
                <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                    <table className="default-table manage-job-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Image</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.length === 0 ? (
                          <tr><td colSpan={7}>No users found</td></tr>
                        ) : (
                          paginatedUsers.map((user) => {
                            const isLocked = user.isActive === false;
                            return (
                              <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>
                                  <img 
                                    src={user.image || '/images/default-avatar.png'} 
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
                                  >
                                    {ROLE_MAP.map(role => (
                                      <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                  </select>
                                </td>
                                {/* Cột Actions: chỉ còn View và Lock/Unlock */}
                                <td>
                                  <button className="btn btn-sm me-1" onClick={() => handleShowDetail(user)} style={{display:'none'}}>View</button>
                                  <Link href={`/admin-dashboard/user-manager/${user.id}`} className="btn btn-sm me-1">View</Link>
                                  <button
                                    className={`btn btn-sm me-1 ${isLocked ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                                    onClick={() => handleToggleLock(user)}
                                  >
                                    {isLocked ? 'Unlock' : 'Lock'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="mt-3">
                        <ul className="pagination justify-content-end">
                          <li className={`page-item${currentPage===1?' disabled':''}`}>
                            <button className="page-link" onClick={()=>handlePageChange(currentPage-1)} disabled={currentPage===1}>&laquo;</button>
                          </li>
                          {Array.from({length: totalPages}, (_,i)=>(
                            <li key={i+1} className={`page-item${currentPage===i+1?' active':''}`}>
                              <button className="page-link" onClick={()=>handlePageChange(i+1)}>{i+1}</button>
                            </li>
                          ))}
                          <li className={`page-item${currentPage===totalPages?' disabled':''}`}>
                            <button className="page-link" onClick={()=>handlePageChange(currentPage+1)} disabled={currentPage===totalPages}>&raquo;</button>
                          </li>
                        </ul>
                      </nav>
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
                    <select className="form-control" name="role" value={formUser.role || ""} onChange={handleFormChange} required>
                      <option value="">Select Role</option>
                      {ROLE_MAP.map(role => (
                        <option key={`edit-role-${role.id}`} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
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
  );
};

export default UserManager; 