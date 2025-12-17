const { useState, useEffect } = React;

function KanbanBoard({ userId, isAdmin }) {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState('all');

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
        { id: 'progress', title: 'In Progress', color: 'bg-blue-100' },
        { id: 'review', title: 'Review', color: 'bg-yellow-100' },
        { id: 'completed', title: 'Completed', color: 'bg-green-100' }
    ];

    useEffect(() => {
        loadData();
    }, [selectedProject]);

    const loadData = async () => {
        try {
            setLoading(true);
            const projectsData = await trickleListObjects('project', 100, true);
            setProjects(projectsData.items || []);

            const tasksData = await trickleListObjects('task', 1000, true);
            let allTasks = tasksData.items || [];

            if (selectedProject !== 'all') {
                allTasks = allTasks.filter(t => t.objectData.ProjectId === selectedProject);
            }

            const filteredTasks = isAdmin ? allTasks : allTasks.filter(t => t.objectData.Assignee === userId);
            setTasks(filteredTasks);
        } catch (error) {
            console.error('Load data error:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const getTasksByStatus = (status) => tasks.filter(task => task.objectData.Status === status);

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'text-red-600 bg-red-50',
            medium: 'text-yellow-600 bg-yellow-50',
            low: 'text-green-600 bg-green-50'
        };
        return colors[priority] || 'text-gray-600 bg-gray-50';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="icon-loader-2 text-4xl text-blue-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Projects</option>
                {projects.map(p => <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>)}
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map(column => (
                    <div key={column.id} className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                            <span className="bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-full">
                                {getTasksByStatus(column.id).length}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {getTasksByStatus(column.id).map(task => (
                                <div key={task.objectId} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-2">{task.objectData.Name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">{task.objectData.Description || 'No description'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={'text-xs px-2 py-1 rounded-full ' + getPriorityColor(task.objectData.Priority)}>
                                            {task.objectData.Priority || 'medium'}
                                        </span>
                                        <span className="text-xs text-gray-500">{task.objectData.Progress || 0}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TaskBoardApp() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = '../login.html';
            return;
        }
        
        const userName = localStorage.getItem('userName') || 'User';
        const userRole = localStorage.getItem('userRole') || 'employee';
        const userEmail = localStorage.getItem('userEmail') || '';
        
        setUser({ 
            name: userName, 
            role: userRole,
            email: userEmail 
        });
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="icon-loader-2 text-4xl text-blue-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <UserNav currentPage="task-board" />
            <div className="pl-64 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
                <p className="text-gray-600 mb-8">Manage your tasks with Kanban view</p>
                <KanbanBoard userId={user.name} isAdmin={false} />
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TaskBoardApp />);