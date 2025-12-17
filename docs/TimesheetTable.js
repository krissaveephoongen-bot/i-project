function TimesheetTable({ onUpdate }) {
    const [worklogs, setWorklogs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    React.useEffect(() => {
        loadWorklogs();
    }, []);

    const loadWorklogs = async () => {
        try {
            const data = await trickleListObjects('worklog', 1000, true);
            setWorklogs(data.items);
        } catch (error) {
            console.error('Load worklogs error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (worklog) => {
        try {
            await trickleUpdateObject('worklog', worklog.objectId, {
                ...worklog.objectData,
                Status: 'approved'
            });
            alert('Timesheet approved successfully');
            loadWorklogs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Approve error:', error);
            alert('Failed to approve timesheet');
        }
    };

    const handleReject = async (worklog) => {
        try {
            await trickleUpdateObject('worklog', worklog.objectId, {
                ...worklog.objectData,
                Status: 'rejected'
            });
            alert('Timesheet rejected');
            loadWorklogs();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Reject error:', error);
            alert('Failed to reject timesheet');
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
            approved: { bg: 'bg-green-500/20', text: 'text-green-300' },
            rejected: { bg: 'bg-red-500/20', text: 'text-red-300' }
        };
        const config = map[status] || map.pending;
        return React.createElement('span', { className: 'px-2 py-1 rounded-full text-xs ' + config.bg + ' ' + config.text }, status);
    };

    const filteredLogs = filter === 'all' ? worklogs : worklogs.filter(w => w.objectData.Status === filter);

    if (loading) return React.createElement('div', { className: 'text-center text-gray-300 py-8' }, 'Loading...');

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Timesheet Entries</h2>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-300">Date</th>
                                <th className="text-left py-3 px-4 text-gray-300">User</th>
                                <th className="text-left py-3 px-4 text-gray-300">Description</th>
                                <th className="text-right py-3 px-4 text-gray-300">Hours</th>
                                <th className="text-right py-3 px-4 text-gray-300">Manday</th>
                                <th className="text-center py-3 px-4 text-gray-300">Status</th>
                                <th className="text-center py-3 px-4 text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.objectId} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 px-4 text-white">{new Date(log.objectData.Date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-white">{log.objectData.UserName}</td>
                                    <td className="py-3 px-4 text-white">{log.objectData.Description}</td>
                                    <td className="py-3 px-4 text-right text-white">{log.objectData.Hours}</td>
                                    <td className="py-3 px-4 text-right text-white">{log.objectData.Manday?.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">{getStatusBadge(log.objectData.Status)}</td>
                                    <td className="py-3 px-4">
                                        {log.objectData.Status === 'pending' && (
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => handleApprove(log)} className="p-2 bg-green-600 hover:bg-green-700 rounded-lg">
                                                    <div className="icon-check text-sm text-white"></div>
                                                </button>
                                                <button onClick={() => handleReject(log)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg">
                                                    <div className="icon-x text-sm text-white"></div>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}