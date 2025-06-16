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
import MobileMenu from "../../../header/MobileMenu";

const defaultUser = { fullName: "", email: "", phone: "", roleId: "", password: "", status: "Active", skills: [], cvUrl: "", image: "" };

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      console.log('Users API Response:', response); // Debug log: Raw user data

      if (Array.isArray(response)) {
        const usersWithRoleId = response.map(user => {
          console.log('Processing user:', user); // Debug log: Each user object
          return ({
            ...user,
            // Assuming the API returns a field like 'roleId' or 'role_id' or just 'role' holding the ID
            // Let's log potential fields to see which one exists and holds the ID
            originalRoleIdField: user.roleId, // Log original roleId field if exists
            potentialRoleField: user.role, // Log potential 'role' field
            potentialRoleIdField: user.role_id, // Log potential 'role_id' field
            roleId: user.roleId ? parseInt(user.roleId) : "" // Keep existing parsing logic for now
          });
        });
        console.log('Processed Users:', usersWithRoleId); // Debug log: Processed user data
        setUsers(usersWithRoleId);
      } else {
        console.error('Invalid users data received (not an array):', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
    const matchRole = filterRole === 'all' || user.roleId === Number(filterRole);
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

    // Find the role ID from the fetched roles based on the user's role name
    const foundRole = roles.find(role => role.name === user.role);
    const roleIdToSet = foundRole ? foundRole.id : ""; // Use the found role's ID or empty string if not found

    const userForForm = {
      ...user,
      // Use the found numeric roleId for the form
      roleId: roleIdToSet
    };

    setEditUser(userForForm);
    setFormUser(userForForm); 

    console.log('Form User Role ID (after setting formUser): ', userForForm.roleId, typeof userForForm.roleId); // Log formUser.roleId after setting

    setEditError("");
    setShowEditModal(true);
    setFormError("");
    setSelectedImageFile(null);
  };
  const handleShowAdd = () => {
    setFormUser(defaultUser);
    setShowAddModal(true);
    setFormError("");
    setSelectedImageFile(null);
  };
  const handleShowDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    try {
      await ApiService.deleteUser(selectedUser.id);
      setAlertMsg("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      setAlertMsg("Failed to delete user.");
    }
    setShowDeleteModal(false);
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
    const { name, value } = e.target;
    setFormUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImageFile(e.target.files[0]);
      // Optionally, set a preview for the image if needed in the form
      setFormUser(prev => ({ ...prev, image: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const validateForm = () => {
    if (!formUser.fullName || !formUser.email || !formUser.phone || !formUser.roleId) {
      setFormError("All fields except password and CV are required.");
      return false;
    }
    if (showAddModal && !formUser.password) {
      setFormError("Password is required for new user.");
      return false;
    }
    if (formUser.password && formUser.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFormError("");

    const formDataToSend = new FormData();
    for (const key in formUser) {
      if (key !== 'image' && key !== 'avatar') { // Exclude image as it's handled separately
        formDataToSend.append(key, formUser[key]);
      }
    }

    if (selectedImageFile) {
      formDataToSend.append('image', selectedImageFile);
    } else if (formUser.image && !formUser.image.startsWith('blob:')) {
      // If there's an existing image URL and no new file selected, send the existing URL as a string
      formDataToSend.append('image', formUser.image);
    }

    try {
      if (showAddModal) {
        await ApiService.post(API_CONFIG.ENDPOINTS.USER.CREATE, formDataToSend, true); // true for multipart/form-data
        setAlertMsg("User added successfully!");
      } else if (editUser) {
        await ApiService.put(API_CONFIG.ENDPOINTS.USER.UPDATE_BY_ID(editUser.id), formDataToSend, true); // true for multipart/form-data
        setAlertMsg("User updated successfully!");
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
      setFormError(errorMessage);
      setAlertMsg("Failed to save user.");
    } finally {
      setLoading(false);
    }
  };


  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  // CSS for responsive table (already applied in previous step)
  const tableContainerStyle = {
    overflowX: 'auto',
  };

  const customTableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const thTdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  };

  const thStyle = {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
  };

  // Responsive styles for filter and search
  const filterContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  };

  const filterInputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100%',
    boxSizing: 'border-box',
  };

  const filterSelectStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    width: '100%',
    boxSizing: 'border-box',
  };


  return (
    <div className="page-wrapper dashboard" style={{background:'#f7f8fa', minHeight:'100vh'}}>
      <style>{`
        @media (max-width: 767px) {
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
          }
          .widget-title h4 {
            margin-bottom: 15px;
          }
          .widget-title .d-flex.align-items-center.gap-2 {
            flex-direction: column;
            width: 100%;
            align-items: stretch !important;
          }
          .widget-title .d-flex.align-items-center.gap-2 .form-control,
          .widget-title .d-flex.align-items-center.gap-2 .form-select,
          .widget-title .d-flex.align-items-center.gap-2 .btn {
            width: 100% !important;
            margin-right: 0 !important;
            margin-bottom: 10px;
          }
          .widget-title .d-flex.align-items-center.gap-2 .btn {
            margin-top: 10px;
          }
        }
      `}</style>
      <span className="header-span"></span>
      <DashboardHeader />
      <MobileMenu />
      <DashboardAdminSidebar />
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <BreadCrumb title="User Management" />
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
                  <h4>User List</h4>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{width:200}}
                      placeholder="Search by name, email, phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className="form-select form-select-sm" style={{width:120}} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                      <option value="all">All Roles</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                    <select className="form-select form-select-sm" style={{width:120}} value={filterLock} onChange={(e) => setFilterLock(e.target.value)}>
                      <option value="all">All Lock Status</option>
                      <option value="locked">Locked</option>
                      <option value="unlocked">Unlocked</option>
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={handleShowAdd}>Add New User</button>
                  </div>
                </div>
                <div className={`widget-content ${!loading ? 'fade-in' : ''}`}> 
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                    <div className="table-outer">
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
                                  {/* Display the actual role name from user data */}
                                  <td>{user.role || 'Unknown Role'}</td>
                                  <td>
                                    <button className="btn btn-sm me-1" onClick={() => handleShowDetail(user)} style={{display:'none'}}>View</button>
                                    <Link href={`/admin-dashboard/user-manager/${user.id}`} className="btn btn-sm me-1">View</Link>
                                    <button className="btn btn-sm me-1" onClick={() => handleShowEdit(user)}>Edit</button>
                                    <button className="btn btn-sm me-1" onClick={() => handleShowDelete(user)}>Delete</button>
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
                    </div>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details</h5>
                <button type="button" className="close" onClick={() => setShowDetailModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div style={{textAlign:'center', marginBottom:'20px'}}>
                  <img 
                    src={selectedUser.image || '/images/default-avatar.png'}
                    alt={selectedUser.fullName}
                    style={{width:'100px', height:'100px', borderRadius:'50%', objectFit:'cover', border:'2px solid #eee'}}
                  />
                </div>
                <p><strong>ID:</strong> {selectedUser.id}</p>
                <p><strong>Full Name:</strong> {selectedUser.fullName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.isActive ? "Active" : "Locked"}</p>
                {selectedUser.roleId === 1 && (
                  <>
                    <p><strong>Skills:</strong> {selectedUser.skills ? selectedUser.skills.join(", ") : 'N/A'}</p>
                    <p><strong>CV:</strong> {selectedUser.cvUrl ? <a href={selectedUser.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a> : 'N/A'}</p>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button type="button" className="close" onClick={() => setShowEditModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  {editError && <div className="alert alert-danger">{editError}</div>}
                  <div className="form-group mb-3">
                    <label>Full Name</label>
                    <input type="text" className="form-control" name="fullName" value={formUser.fullName} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" name="email" value={formUser.email} onChange={handleFormChange} disabled={true} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Phone</label>
                    <input type="text" className="form-control" name="phone" value={formUser.phone} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Role</label>
                    <select className="form-control" name="roleId" value={formUser.roleId} onChange={handleFormChange}>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-3">
                    <label>Status</label>
                    <select className="form-control" name="isActive" value={formUser.isActive ? "true" : "false"} onChange={e => setFormUser({ ...formUser, isActive: e.target.value === "true" })}>
                      <option value="true">Active</option>
                      <option value="false">Locked</option>
                    </select>
                  </div>
                  {formUser.roleId === 1 && (
                    <>
                      <div className="form-group mb-3">
                        <label>Skills (comma separated)</label>
                        <input type="text" className="form-control" name="skills" value={formUser.skills?.join(', ')} onChange={e => setFormUser({ ...formUser, skills: e.target.value.split(', ') })} />
                      </div>
                      <div className="form-group mb-3">
                        <label>CV URL</label>
                        <input type="text" className="form-control" name="cvUrl" value={formUser.cvUrl} onChange={handleFormChange} />
                      </div>
                    </>
                  )}
                  <div className="form-group mb-3">
                    <label>Image</label>
                    <input type="file" className="form-control" name="image" onChange={handleImageChange} />
                    {formUser.image && (
                      <img src={formUser.image} alt="Current" style={{width:'100px', height:'100px', objectFit:'cover', marginTop:'10px'}}/>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="close" onClick={() => setShowAddModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <div className="form-group mb-3">
                    <label>Full Name</label>
                    <input type="text" className="form-control" name="fullName" value={formUser.fullName} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" name="email" value={formUser.email} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Phone</label>
                    <input type="text" className="form-control" name="phone" value={formUser.phone} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" name="password" value={formUser.password} onChange={handleFormChange} />
                  </div>
                  <div className="form-group mb-3">
                    <label>Role</label>
                    <select className="form-control" name="roleId" value={formUser.roleId} onChange={handleFormChange}>
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  {formUser.roleId === 1 && (
                    <>
                      <div className="form-group mb-3">
                        <label>Skills (comma separated)</label>
                        <input type="text" className="form-control" name="skills" value={formUser.skills?.join(', ')} onChange={e => setFormUser({ ...formUser, skills: e.target.value.split(', ') })} />
                      </div>
                      <div className="form-group mb-3">
                        <label>CV URL</label>
                        <input type="text" className="form-control" name="cvUrl" value={formUser.cvUrl} onChange={handleFormChange} />
                      </div>
                    </>
                  )}
                  <div className="form-group mb-3">
                    <label>Image</label>
                    <input type="file" className="form-control" name="image" onChange={handleImageChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Close</button>
                  <button type="submit" className="btn btn-primary">Add User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="close" onClick={() => setShowDeleteModal(false)} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete user <strong>{selectedUser.fullName}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserManager; 