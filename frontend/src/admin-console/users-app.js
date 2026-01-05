function AdminUsers() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    if (!isLoggedIn || role !== 'admin') window.location.href = '../login.html';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await trickleListObjects('user', 100, true);
      setUsers(result.items || []);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handleSubmit = async (userData) => {
    try {
      if (editingUser) {
        await trickleUpdateObject('user', editingUser.objectId, userData);
        alert('User updated successfully!');
      } else {
        await trickleCreateObject('user', userData);
        alert('User created successfully!');
      }
      setShowForm(false);
      setEditingUser(null);
      await loadData();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await trickleDeleteObject('user', userId);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.objectData.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.objectData.Email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.objectData.Role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} currentPage="users" />
      <div className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-[#1E293B] border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <div className="icon-user-plus text-lg"></div>
              Add User
            </button>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="bg-[#1E293B] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300">User</th>
                  <th className="px-6 py-3 text-left text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-gray-300">Role</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-center text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map(user => (
                  <tr key={user.objectId}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.objectData.Name}</div>
                      <div className="text-sm text-gray-400">{user.objectData.Position}</div>
                    </td>
                    <td className="px-6 py-4 text-white">{user.objectData.Email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.objectData.Role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        user.objectData.Role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>{user.objectData.Role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.objectData.Status === 'active' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>{user.objectData.Status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => { setEditingUser(user); setShowForm(true); }} 
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                          <div className="icon-edit text-sm"></div>
                        </button>
                        <button onClick={() => handleDelete(user.objectId)} 
                                className="p-2 bg-red-600 hover:bg-red-700 rounded text-white">
                          <div className="icon-trash-2 text-sm"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
                 onClick={() => { setShowForm(false); setEditingUser(null); }}>
              <div className="bg-[#1E293B] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
                   onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{editingUser ? 'Edit User' : 'Add User'}</h2>
                <UserForm 
                  onSubmit={handleSubmit} 
                  onCancel={() => { setShowForm(false); setEditingUser(null); }}
                  initialData={editingUser?.objectData}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AdminUsers));