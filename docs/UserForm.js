function UserForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = React.useState(initialData || {
    Name: '',
    Email: '',
    Password: '',
    Department: '',
    Position: '',
    Role: 'employee',
    Phone: '',
    HourlyRate: 0,
    Status: 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={formData.Name}
            onChange={(e) => setFormData({...formData, Name: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.Email}
            onChange={(e) => setFormData({...formData, Email: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
            required
          />
        </div>
        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={formData.Password}
              onChange={(e) => setFormData({...formData, Password: e.target.value})}
              className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
              required={!initialData}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.Phone}
            onChange={(e) => setFormData({...formData, Phone: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
          <input
            type="text"
            value={formData.Department}
            onChange={(e) => setFormData({...formData, Department: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
          <input
            type="text"
            value={formData.Position}
            onChange={(e) => setFormData({...formData, Position: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.Role}
            onChange={(e) => setFormData({...formData, Role: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Hourly Rate (฿)</label>
          <input
            type="number"
            value={formData.HourlyRate}
            onChange={(e) => setFormData({...formData, HourlyRate: parseFloat(e.target.value)})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            value={formData.Status}
            onChange={(e) => setFormData({...formData, Status: e.target.value})}
            className="w-full px-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          Cancel
        </button>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}