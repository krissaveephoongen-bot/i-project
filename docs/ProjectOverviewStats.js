const { useState, useEffect } = React;

function ProjectOverviewStats({ projectId }) {
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        try {
            const proj = await trickleGetObject('project', projectId);
            setProject(proj);

            const tasksData = await trickleListObjects(`task:${projectId}`, 100, true);
            setTasks(tasksData.items);

            const expensesData = await trickleListObjects('expense', 1000, true);
            const projectExpenses = expensesData.items.filter(e => 
                e.objectData.ProjectId === projectId && e.objectData.Status === 'approved'
            );
            setExpenses(projectExpenses);
        } catch (error) {
            console.error('Load data error:', error);
        }
    };

    if (!project) return <div className="text-center py-8">Loading...</div>;

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.objectData.Amount || 0), 0);
    const budget = project.objectData.Budget || 0;
    const remaining = budget - totalExpenses;
    const completedTasks = tasks.filter(t => t.objectData.Status === 'completed').length;

    return (
        <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
                <h1 className="text-2xl font-bold text-gray-900">{project.objectData.Name}</h1>
                <p className="text-gray-600 mt-2">{project.objectData.Description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{project.objectData.ActualProgress || 0}%</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <div className="icon-trending-up text-xl text-blue-600"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Budget</p>
                            <p className="text-2xl font-bold text-gray-900">฿{budget.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <div className="icon-wallet text-xl text-green-600"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Spent</p>
                            <p className="text-2xl font-bold text-gray-900">฿{totalExpenses.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <div className="icon-credit-card text-xl text-orange-600"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tasks Done</p>
                            <p className="text-2xl font-bold text-gray-900">{completedTasks}/{tasks.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <div className="icon-check-circle text-xl text-purple-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}