function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    if (userRole !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }
    
    loadData();
  }, []);

  const getApiUrl = (path) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ticket-apw-api.vercel.app/api';
    return `${apiUrl}${path}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(getApiUrl('/users'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error('Load data error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (userData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const isEditing = editingUser !== null;
      
      const url = isEditing 
        ? getApiUrl(`/users/${editingUser.id}`)
        : getApiUrl('/users');
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      alert(isEditing ? 'User updated successfully!' : 'User created successfully!');
      setShowForm(false);
      setEditingUser(null);
      await loadData();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(getApiUrl(`/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      alert('User deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Delete failed');
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt('Enter new password for this user:');
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(getApiUrl(`/users/${userId}/admin-reset-password`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Password reset failed');
      }

      alert('Password reset successfully!');
    } catch (error) {
      console.error('Reset password error:', error);
      alert(error.message || 'Password reset failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.name?.toLowerCase().includes(searchLower) || '') ||
      (u.email?.toLowerCase().includes(searchLower) || '');
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} currentPage="users" />
      <div className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-[#1E293B] border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage system users and roles</p>
            </div>
            <button 
              onClick={() => { setEditingUser(null); setShowForm(true); }} 
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
          </div>
        </header>
        
        <main className="p-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_lead">Team Lead</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
              <option value="designer">Designer</option>
            </select>
          </div>

          <div className="bg-[#1E293B] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300 font-medium">User</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-medium">Email</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-medium">Role</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-medium">Department</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-medium">Status</th>
                  <th className="px-6 py-3 text-center text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-400">{user.position || 'No position'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          user.role === 'manager' || user.role === 'project_manager' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {user.role || 'employee'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.department || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' || user.isActive ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {user.status === 'active' || user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => { setEditingUser(user); setShowForm(true); }} 
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
                            title="Edit user"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleResetPassword(user.id)} 
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white transition-colors"
                            title="Reset password"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)} 
                            className="p-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                            title="Delete user"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-gray-400 text-sm">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </main>
      </div>

      {showForm && (
        <UserFormModal
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingUser(null); }}
          initialData={editingUser}
        />
      )}
    </div>
  );
}

// User Form Modal Component
function UserFormModal({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    role: initialData?.role || 'employee',
    department: initialData?.department || '',
    position: initialData?.position || '',
    phone: initialData?.phone || '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (!initialData && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };
      if (!submitData.password) {
        delete submitData.password;
      }
      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-[#1E293B] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="email@example.com"
                disabled={!!initialData}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {initialData ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder={initialData ? "Leave blank" : "At least 8 characters"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="project_manager">Project Manager</option>
                <option value="team_lead">Team Lead</option>
                <option value="developer">Developer</option>
                <option value="tester">Tester</option>
                <option value="designer">Designer</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="+66 xxx xxx xxxx"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (initialData ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AdminUsers));
