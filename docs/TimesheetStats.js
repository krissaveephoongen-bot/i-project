function TimesheetStats() {
    const [stats, setStats] = React.useState({
        totalHours: 0,
        totalMandays: 0,
        pendingApprovals: 0,
        approved: 0
    });

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const worklogs = await trickleListObjects('worklog', 1000, true);
            
            const totalHours = worklogs.items.reduce((sum, w) => sum + (w.objectData.Hours || 0), 0);
            const totalMandays = worklogs.items.reduce((sum, w) => sum + (w.objectData.Manday || 0), 0);
            const pending = worklogs.items.filter(w => w.objectData.Status === 'pending').length;
            const approved = worklogs.items.filter(w => w.objectData.Status === 'approved').length;

            setStats({
                totalHours: totalHours.toFixed(1),
                totalMandays: totalMandays.toFixed(2),
                pendingApprovals: pending,
                approved: approved
            });
        } catch (error) {
            console.error('Load stats error:', error);
        }
    };

    const cards = [
        { title: 'Total Hours', value: stats.totalHours, icon: 'clock', color: 'from-blue-500 to-blue-600' },
        { title: 'Total Mandays', value: stats.totalMandays, icon: 'calendar', color: 'from-purple-500 to-purple-600' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: 'alert-circle', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Approved', value: stats.approved, icon: 'check-circle', color: 'from-green-500 to-green-600' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 text-sm mb-1">{card.title}</p>
                            <p className="text-white text-2xl font-bold">{card.value}</p>
                        </div>
                        <div className={'w-12 h-12 rounded-lg bg-gradient-to-br ' + card.color + ' flex items-center justify-center'}>
                            <div className={'icon-' + card.icon + ' text-xl text-white'}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}