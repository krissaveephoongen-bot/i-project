function AnalyticsTable() {
    const [projects, setProjects] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await trickleListObjects('project', 100, true);
            setProjects(data.items);
        } catch (error) {
            console.error('Load projects error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            active: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Active' },
            planning: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Planning' },
            completed: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Completed' },
            'on-hold': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'On Hold' }
        };
        const config = map[status] || map.active;
        return React.createElement('span', { className: 'px-2 py-1 rounded-full text-xs ' + config.bg + ' ' + config.text }, config.label);
    };

    if (loading) return React.createElement('div', { className: 'text-center text-gray-300 py-8' }, 'Loading...');

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-300 font-medium">Project</th>
                                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                                <th className="text-right py-3 px-4 text-gray-300 font-medium">Progress</th>
                                <th className="text-right py-3 px-4 text-gray-300 font-medium">Budget</th>
                                <th className="text-left py-3 px-4 text-gray-300 font-medium">Manager</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(p => (
                                <tr key={p.objectId} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-white">{p.objectData.Name}</td>
                                    <td className="py-3 px-4">{getStatusBadge(p.objectData.Status)}</td>
                                    <td className="py-3 px-4 text-right text-white">{p.objectData.ActualProgress || 0}%</td>
                                    <td className="py-3 px-4 text-right text-white">฿{(p.objectData.Budget || 0).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-white">{p.objectData.ProjectManager || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}