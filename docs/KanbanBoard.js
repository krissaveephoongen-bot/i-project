const { useState, useEffect } = React;

function KanbanBoard({ userId, isAdmin = false, projectId = null }) {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(projectId || 'all');

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

            let allTasks = [];
            if (selectedProject === 'all') {
                const tasksData = await trickleListObjects('task', 1000, true);
                allTasks = tasksData.items || [];
            } else {
                const tasksData = await trickleListObjects('task', 1000, true);
                allTasks = (tasksData.items || []).filter(t => t.objectData.ProjectId === selectedProject);
            }

            const filteredTasks = isAdmin ? allTasks : 
                allTasks.filter(t => t.objectData.Assignee === userId);

            setTasks(filteredTasks);
        } catch (error) {
            console.error('Load data error:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.objectData.Status === status);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
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
            <div className="flex items-center gap-4">
                <select 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                        <option key={project.objectId} value={project.objectId}>
                            {project.objectData.Name}
                        </option>
                    ))}
                </select>
            </div>

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
                                <div key={task.objectId} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <h4 className="font-medium text-gray-900 mb-2">{task.objectData.Name}</h4>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.objectData.Description || 'No description'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.objectData.Priority)}`}>
                                            {task.objectData.Priority || 'medium'}
                                        </span>
                                        <span className="text-xs text-gray-500">{task.objectData.Progress || 0}%</span>
                                    </div>
                                </div>
                            ))}
                            {getTasksByStatus(column.id).length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="icon-inbox text-3xl mb-2"></div>
                                    <p className="text-sm">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}