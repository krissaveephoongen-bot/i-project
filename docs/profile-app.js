function UserProfile() {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '../login.html';
      return;
    }
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const userData = await trickleGetObject('user', userId);
      setUser(userData);
      setFormData(userData.objectData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await trickleUpdateObject('user', user.objectId, formData);
      localStorage.setItem('userName', formData.Name);
      setUser({...user, objectData: formData});
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNav currentPage="profile" />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-20">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNav currentPage="profile" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <div className="icon-edit text-lg"></div>
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setIsEditing(false); setFormData(user.objectData); }} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({...formData, Name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.objectData.Name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.objectData.Email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.Phone || ''}
                  onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.objectData.Phone || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.objectData.Department || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.objectData.Position || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{user.objectData.Role}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(UserProfile));