function AdminCustomers() {
  const [customers, setCustomers] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editCustomer, setEditCustomer] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    if (!isLoggedIn || role !== 'admin') window.location.href = '../login.html';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await trickleListObjects('customer', 100, true);
      setCustomers(result.items || []);
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editCustomer) {
        await trickleUpdateObject('customer', editCustomer.objectId, data);
      } else {
        await trickleCreateObject('customer', data);
      }
      setShowForm(false);
      setEditCustomer(null);
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this customer?')) {
      try {
        await trickleDeleteObject('customer', id);
        loadData();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.objectData.Name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#F4F6F9]">
      <AdminSidebar isOpen={true} />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <button onClick={() => { setShowForm(true); setEditCustomer(null); }}
              className="px-5 py-2.5 bg-[#0056D2] text-white rounded-lg hover:bg-[#004ab8] transition-colors flex items-center gap-2">
              <div className="icon-plus text-lg"></div>Add Customer
            </button>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-6">
            <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => (
                  <tr key={customer.objectId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.objectData.Name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.objectData.ContactPerson}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.objectData.Email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {customer.objectData.Type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditCustomer(customer); setShowForm(true); }} 
                        className="text-blue-600 hover:text-blue-700 mr-3">
                        <div className="icon-edit text-lg"></div>
                      </button>
                      <button onClick={() => handleDelete(customer.objectId)} className="text-red-600 hover:text-red-700">
                        <div className="icon-trash-2 text-lg"></div>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-4">{editCustomer ? 'Edit' : 'Add'} Customer</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleSubmit({
                    Name: formData.get('name'),
                    ContactPerson: formData.get('contact'),
                    Email: formData.get('email'),
                    Phone: formData.get('phone'),
                    Type: formData.get('type'),
                    Status: 'active'
                  });
                }}>
                  <div className="space-y-4">
                    <input name="name" defaultValue={editCustomer?.objectData.Name} placeholder="Name" required 
                      className="w-full px-4 py-2 border rounded-lg" />
                    <input name="contact" defaultValue={editCustomer?.objectData.ContactPerson} placeholder="Contact Person" 
                      className="w-full px-4 py-2 border rounded-lg" />
                    <input name="email" type="email" defaultValue={editCustomer?.objectData.Email} placeholder="Email" 
                      className="w-full px-4 py-2 border rounded-lg" />
                    <input name="phone" defaultValue={editCustomer?.objectData.Phone} placeholder="Phone" 
                      className="w-full px-4 py-2 border rounded-lg" />
                    <select name="type" defaultValue={editCustomer?.objectData.Type} required className="w-full px-4 py-2 border rounded-lg">
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => { setShowForm(false); setEditCustomer(null); }} 
                      className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AdminCustomers />);