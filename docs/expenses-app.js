function UserExpenses() {
  const [expenses, setExpenses] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userName] = React.useState(localStorage.getItem('userName') || 'User');

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      window.location.href = '../login.html';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      if (typeof trickleListObjects !== 'function') {
        console.error('Trickle database functions not available');
        setLoading(false);
        return;
      }

      const [expensesRes, projectsRes] = await Promise.all([
        trickleListObjects('expense', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('project', 50, true).catch(() => ({ items: [] }))
      ]);
      
      const userExpenses = (expensesRes.items || []).filter(e => 
        e.objectData.UserName === userName
      );
      
      setExpenses(userExpenses);
      setProjects(projectsRes.items || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const expenseData = {
        Date: formData.get('date'),
        ProjectId: formData.get('projectId'),
        Category: formData.get('category'),
        Amount: parseFloat(formData.get('amount')),
        Description: formData.get('description'),
        UserId: localStorage.getItem('userId') || '1',
        UserName: userName,
        Status: 'pending'
      };
      
      if (editingExpense) {
        await trickleUpdateObject('expense', editingExpense.objectId, expenseData);
      } else {
        await trickleCreateObject('expense', expenseData);
      }
      setShowForm(false);
      setEditingExpense(null);
      loadData();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error saving expense. Please try again.');
    }
  };

  const handleDelete = async (expenseId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await trickleDeleteObject('expense', expenseId);
      loadData();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting expense. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="icon-loader-2 text-4xl text-blue-500 animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <UserNav currentPage="expenses" />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Expenses</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <div className="icon-plus text-lg"></div>
            <span>Add Expense</span>
          </button>
        </div>
        
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="icon-receipt text-6xl text-gray-300 mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first expense</p>
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map(expense => (
              <div key={expense.objectId} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-semibold text-lg text-gray-900">
                        ฿{expense.objectData.Amount?.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        expense.objectData.Status === 'approved' ? 'bg-green-100 text-green-700' :
                        expense.objectData.Status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {expense.objectData.Status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">{expense.objectData.Description}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <div className="icon-calendar text-sm"></div>
                        <span>{new Date(expense.objectData.Date).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="icon-tag text-sm"></div>
                        <span>{expense.objectData.Category}</span>
                      </span>
                    </div>
                  </div>
                  {expense.objectData.Status === 'pending' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setEditingExpense(expense); setShowForm(true); }} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <div className="icon-edit text-lg"></div>
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.objectId)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <div className="icon-trash-2 text-lg"></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
               onClick={() => { setShowForm(false); setEditingExpense(null); }}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" 
                 onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={editingExpense?.objectData.Date || new Date().toISOString().split('T')[0]} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Project</label>
                  <select 
                    name="projectId" 
                    defaultValue={editingExpense?.objectData.ProjectId} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p.objectId} value={p.objectId}>
                        {p.objectData.Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select 
                    name="category" 
                    defaultValue={editingExpense?.objectData.Category} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="travel">Travel</option>
                    <option value="food">Food</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="equipment">Equipment</option>
                    <option value="software">Software</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (฿)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    step="0.01"
                    defaultValue={editingExpense?.objectData.Amount} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea 
                    name="description" 
                    rows="3" 
                    defaultValue={editingExpense?.objectData.Description} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowForm(false); setEditingExpense(null); }} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingExpense ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<UserExpenses />);