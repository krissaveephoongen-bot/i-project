function AnalyticsSummary() {
    const [summary, setSummary] = React.useState({
        totalProjects: 0,
        activeProjects: 0,
        totalBudget: 0,
        totalExpenses: 0
    });

    React.useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const projects = await trickleListObjects('project', 100, true);
            const expenses = await trickleListObjects('expense', 1000, true);

            const activeProjects = projects.items.filter(p => p.objectData.Status === 'active');
            const totalBudget = projects.items.reduce((sum, p) => sum + (p.objectData.Budget || 0), 0);
            const approvedExpenses = expenses.items.filter(e => e.objectData.Status === 'approved');
            const totalExpenses = approvedExpenses.reduce((sum, e) => sum + (e.objectData.Amount || 0), 0);

            setSummary({
                totalProjects: projects.items.length,
                activeProjects: activeProjects.length,
                totalBudget,
                totalExpenses
            });
        } catch (error) {
            console.error('Load summary error:', error);
        }
    };

    const cards = [
        { title: 'Total Projects', value: summary.totalProjects, icon: 'folder', color: 'from-blue-500 to-blue-600' },
        { title: 'Active Projects', value: summary.activeProjects, icon: 'activity', color: 'from-green-500 to-green-600' },
        { title: 'Total Budget', value: '฿' + summary.totalBudget.toLocaleString(), icon: 'wallet', color: 'from-purple-500 to-purple-600' },
        { title: 'Total Expenses', value: '฿' + summary.totalExpenses.toLocaleString(), icon: 'trending-up', color: 'from-orange-500 to-orange-600' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
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