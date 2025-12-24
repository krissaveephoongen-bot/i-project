import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// API Configuration
const API_BASE_URL = window.location.origin.includes('localhost:3001')
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;
const API_TIMEOUT = 30000;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Console Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ color: '#EF4444' }}>เกิดข้อผิดพลาด</h2>
          <p style={{ color: '#666' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            โหลดใหม่
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Auth utilities
const auth = {
  getToken: () => localStorage.getItem('token') || sessionStorage.getItem('token'),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  isAuthenticated: () => {
    return !!auth.getToken() && !!auth.getUser();
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.location.href = '/admin/login.html';
  }
};

// API utility functions
const apiCall = async (endpoint, options = {}) => {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers
    });

    if (response.status === 401) {
      auth.logout();
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// Alert Component
function Alert({ type, message, onClose }) {
  const alertClass = 'alert alert-' + type;
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-warning'
  };

  return (
    <div className={alertClass}>
      <i className={icons[type]}></i>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0 8px'
        }}
      >
        &times;
      </button>
    </div>
  );
}

// Loading Component
function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <p style={{ marginTop: '16px', color: '#666' }}>กำลังโหลด...</p>
    </div>
  );
}

// Dashboard Page
function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalBudget: 0
  });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load projects
      const projectsData = await apiCall('/projects');
      if (projectsData?.data) {
        setProjects(projectsData.data.slice(0, 10));
        
        const stats = {
          totalProjects: projectsData.data.length,
          activeProjects: projectsData.data.filter(p => p.status === 'active').length,
          totalUsers: 0,
          activeUsers: 0,
          pendingApprovals: 0,
          totalBudget: projectsData.data.reduce((sum, p) => sum + (p.budget || 0), 0)
        };
        setStats(stats);
      }

      // Load users
      const usersData = await apiCall('/users');
      if (usersData?.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.data.length,
          activeUsers: usersData.data.filter(u => u.status === 'active').length
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
        <i className="fas fa-tachometer-alt" style={{ marginRight: '10px' }}></i>
        แดชบอร์ด
      </h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <StatCard title="โครงการทั้งหมด" value={stats.totalProjects} icon="fas fa-project-diagram" color="#3B82F6" />
        <StatCard title="โครงการที่ทำงาน" value={stats.activeProjects} icon="fas fa-spinner" color="#10B981" />
        <StatCard title="ผู้ใช้ทั้งหมด" value={stats.totalUsers} icon="fas fa-users" color="#F59E0B" />
        <StatCard title="ผู้ใช้ที่ทำงาน" value={stats.activeUsers} icon="fas fa-user-check" color="#8B5CF6" />
        <StatCard title="อนุมัติที่รอ" value={stats.pendingApprovals} icon="fas fa-clock" color="#EF4444" />
        <StatCard title="งบประมาณรวม" value={`${(stats.totalBudget / 1000000).toFixed(1)}M`} icon="fas fa-coins" color="#06B6D4" />
      </div>

      {/* Recent Projects */}
      <div className="stat-card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          <i className="fas fa-list" style={{ marginRight: '8px' }}></i>
          โครงการล่าสุด
        </h2>
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อโครงการ</th>
              <th>สถานะ</th>
              <th>ความคืบหน้า</th>
              <th>งบประมาณ</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map(project => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>
                    <span className={`badge badge-${getStatusBadgeColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#10B981', width: `${project.progress || 0}%` }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td>฿{(project.budget || 0).toLocaleString('th-TH')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>ไม่มีข้อมูลโครงการ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#666', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>{title}</p>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>{value}</p>
        </div>
        <i className={icon} style={{ fontSize: '24px', color: color, opacity: 0.3 }}></i>
      </div>
    </div>
  );
}

// Projects Page
function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', budget: '', status: 'active' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/projects');
      if (data?.data) {
        setProjects(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingProject ? 'PUT' : 'POST';
      const endpoint = editingProject ? `/projects/${editingProject.id}` : '/projects';
      
      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData)
      });

      if (response?.success) {
        setAlert({ type: 'success', message: `โครงการ${editingProject ? 'ได้รับการอัปเดต' : 'สร้างขึ้น'}สำเร็จ` });
        setShowModal(false);
        setFormData({ name: '', description: '', budget: '', status: 'active' });
        setEditingProject(null);
        loadProjects();
      } else {
        setAlert({ type: 'error', message: 'เกิดข้อผิดพลาด' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?')) {
      try {
        const response = await apiCall(`/projects/${id}`, { method: 'DELETE' });
        if (response?.success) {
          setAlert({ type: 'success', message: 'ลบโครงการสำเร็จ' });
          loadProjects();
        }
      } catch (error) {
        setAlert({ type: 'error', message: error.message });
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
          <i className="fas fa-project-diagram" style={{ marginRight: '10px' }}></i>
          จัดการโครงการ
        </h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingProject(null);
          setFormData({ name: '', description: '', budget: '', status: 'active' });
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i>
          เพิ่มโครงการใหม่
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="stat-card">
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>รายละเอียด</th>
              <th>สถานะ</th>
              <th>งบประมาณ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td style={{ fontWeight: '500' }}>{project.name}</td>
                <td>{project.description}</td>
                <td>
                  <span className={`badge badge-${getStatusBadgeColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </td>
                <td>฿{(project.budget || 0).toLocaleString('th-TH')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ background: 'none', color: '#3B82F6', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingProject(project);
                        setFormData(project);
                        setShowModal(true);
                      }}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn" style={{ background: 'none', color: '#EF4444', cursor: 'pointer' }}
                      onClick={() => handleDelete(project.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              {editingProject ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่อโครงการ</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียด</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>งบประมาณ</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>สถานะ</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">ทำงาน</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="on_hold">ระงับ</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB', color: '#1F2937' }}
                  onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Users Page
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'member' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/users');
      if (data?.data) {
        setUsers(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const endpoint = editingUser ? `/users/${editingUser.id}` : '/users';
      
      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData)
      });

      if (response?.success) {
        setAlert({ type: 'success', message: `ผู้ใช้${editingUser ? 'ได้รับการอัปเดต' : 'สร้างขึ้น'}สำเร็จ` });
        setShowModal(false);
        setFormData({ name: '', email: '', role: 'member' });
        setEditingUser(null);
        loadUsers();
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
          <i className="fas fa-users" style={{ marginRight: '10px' }}></i>
          จัดการผู้ใช้
        </h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingUser(null);
          setFormData({ name: '', email: '', role: 'member' });
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i>
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="stat-card">
        <table className="table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>อีเมล</th>
              <th>บทบาท</th>
              <th>สถานะ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: '500' }}>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role === 'admin' ? 'danger' : 'info'}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.status === 'active' ? 'success' : 'warning'}`}>
                    {user.status === 'active' ? 'ทำงาน' : 'ไม่ทำงาน'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ background: 'none', color: '#3B82F6', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingUser(user);
                        setFormData(user);
                        setShowModal(true);
                      }}>
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              {editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่อ</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>อีเมล</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>บทบาท</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="member">สมาชิก</option>
                  <option value="manager">ผู้จัดการ</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB', color: '#1F2937' }}
                  onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tasks Page
function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'todo', priority: 'medium' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/tasks');
      if (data?.data) {
        setTasks(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingTask ? 'PUT' : 'POST';
      const endpoint = editingTask ? `/tasks/${editingTask.id}` : '/tasks';
      
      const response = await apiCall(endpoint, {
        method,
        body: JSON.stringify(formData)
      });

      if (response?.success) {
        setAlert({ type: 'success', message: 'บันทึกสำเร็จ' });
        setShowModal(false);
        loadTasks();
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
          <i className="fas fa-tasks" style={{ marginRight: '10px' }}></i>
          จัดการงาน
        </h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingTask(null);
          setFormData({ name: '', description: '', status: 'todo', priority: 'medium' });
          setShowModal(true);
        }}>
          <i className="fas fa-plus"></i>
          เพิ่มงานใหม่
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="stat-card">
        <table className="table">
          <thead>
            <tr>
              <th>ชื่องาน</th>
              <th>รายละเอียด</th>
              <th>สถานะ</th>
              <th>ลำดับความสำคัญ</th>
              <th>การกระทำ</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td style={{ fontWeight: '500' }}>{task.name}</td>
                <td>{task.description}</td>
                <td>
                  <span className={`badge badge-${getTaskStatusColor(task.status)}`}>
                    {getTaskStatusLabel(task.status)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'info'}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ background: 'none', color: '#3B82F6', cursor: 'pointer' }}
                      onClick={() => {
                        setEditingTask(task);
                        setFormData(task);
                        setShowModal(true);
                      }}>
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
              {editingTask ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ชื่องาน</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>รายละเอียด</label>
                <textarea
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>สถานะ</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="todo">ยังไม่ได้ทำ</option>
                  <option value="in-progress">กำลังทำ</option>
                  <option value="completed">เสร็จสิ้น</option>
                </select>
              </div>
              <div className="form-group">
                <label>ลำดับความสำคัญ</label>
                <select
                  className="form-control"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">ต่ำ</option>
                  <option value="medium">ปานกลาง</option>
                  <option value="high">สูง</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn" style={{ background: '#E5E7EB', color: '#1F2937' }}
                  onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reports Page
function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
        <i className="fas fa-chart-bar" style={{ marginRight: '10px' }}></i>
        รายงาน
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <ReportCard title="รายงานโครงการ" icon="fas fa-project-diagram" color="#3B82F6" />
        <ReportCard title="รายงานผู้ใช้" icon="fas fa-users" color="#10B981" />
        <ReportCard title="รายงานงาน" icon="fas fa-tasks" color="#F59E0B" />
        <ReportCard title="รายงานงบประมาณ" icon="fas fa-coins" color="#8B5CF6" />
      </div>

      <div className="stat-card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>ส่งออกข้อมูล</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            <i className="fas fa-file-csv"></i>
            ส่งออก CSV
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-file-pdf"></i>
            ส่งออก PDF
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-file-excel"></i>
            ส่งออก Excel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, icon, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${color}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '32px', color: color, opacity: 0.7 }}>
          <i className={icon}></i>
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>{title}</h3>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            <i className="fas fa-arrow-right"></i> ดูรายละเอียด
          </p>
        </div>
      </div>
    </div>
  );
}

// Settings Page
function SettingsPage() {
  const [formData, setFormData] = useState({
    appName: 'ระบบจัดการโครงการ',
    appVersion: '1.0.0',
    timezone: 'Asia/Bangkok',
    language: 'th',
    emailNotifications: true,
    autoBackup: true
  });
  const [alert, setAlert] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert({ type: 'success', message: 'บันทึกการตั้งค่าสำเร็จ' });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937' }}>
        <i className="fas fa-cog" style={{ marginRight: '10px' }}></i>
        การตั้งค่า
      </h1>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="stat-card">
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>ข้อมูลระบบ</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>ชื่อแอปพลิเคชัน</label>
              <input
                type="text"
                className="form-control"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>เวอร์ชั่น</label>
              <input
                type="text"
                className="form-control"
                value={formData.appVersion}
                disabled
              />
            </div>
            <div className="form-group">
              <label>표준 시간</label>
              <select
                className="form-control"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (ICT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="form-group">
              <label>ภาษา</label>
              <select
                className="form-control"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="th">ไทย</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '24px', marginBottom: '12px' }}>ตัวเลือกทั่วไป</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              />
              <span>เปิดใช้งานการแจ้งเตือนทางอีเมล</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.autoBackup}
                onChange={(e) => setFormData({ ...formData, autoBackup: e.target.checked })}
              />
              <span>เปิดใช้งานสำรองข้อมูลอัตโนมัติ</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper Functions
function getStatusLabel(status) {
  const labels = { active: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น', on_hold: 'ระงับ', cancelled: 'ยกเลิก' };
  return labels[status] || status;
}

function getStatusBadgeColor(status) {
  const colors = { active: 'info', completed: 'success', on_hold: 'warning', cancelled: 'danger' };
  return colors[status] || 'info';
}

function getRoleLabel(role) {
  const labels = { admin: 'ผู้ดูแลระบบ', manager: 'ผู้จัดการ', member: 'สมาชิก' };
  return labels[role] || role;
}

function getTaskStatusLabel(status) {
  const labels = { 'todo': 'ยังไม่ได้ทำ', 'in-progress': 'กำลังทำ', 'completed': 'เสร็จสิ้น' };
  return labels[status] || status;
}

function getTaskStatusColor(status) {
  const colors = { 'todo': 'info', 'in-progress': 'warning', 'completed': 'success' };
  return colors[status] || 'info';
}

function getPriorityLabel(priority) {
  const labels = { low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง' };
  return labels[priority] || priority;
}

// Sidebar Component
function Sidebar({ currentPage, onPageChange, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: 'fas fa-tachometer-alt' },
    { id: 'projects', label: 'โครงการ', icon: 'fas fa-project-diagram' },
    { id: 'users', label: 'ผู้ใช้', icon: 'fas fa-users' },
    { id: 'tasks', label: 'งาน', icon: 'fas fa-tasks' },
    { id: 'reports', label: 'รายงาน', icon: 'fas fa-chart-bar' },
    { id: 'settings', label: 'การตั้งค่า', icon: 'fas fa-cog' }
  ];

  return (
    <div className="sidebar">
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>
          <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>
          Admin Console
        </h2>
      </div>

      <nav style={{ paddingTop: '12px' }}>
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px 0', opacity: 0.7 }}>ผู้ใช้ปัจจุบัน</p>
          <p style={{ margin: '0', fontWeight: '500' }}>{user?.name || 'Admin'}</p>
        </div>
        <button className="btn" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', justifyContent: 'center' }}
          onClick={() => auth.logout()}>
          <i className="fas fa-sign-out-alt"></i>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// Main App Component
function AdminApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!auth.isAuthenticated()) {
      window.location.href = '/admin/login.html';
      return;
    }

    const currentUser = auth.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      auth.logout();
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <Loading />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <ProjectsPage />;
      case 'users': return <UsersPage />;
      case 'tasks': return <TasksPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <main className="main-content" style={{ padding: '30px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

// Initialize App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);
