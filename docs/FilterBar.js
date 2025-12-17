function FilterBar({ onFilterChange, showStatusFilter = true, showProjectFilter = false, projects = [] }) {
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [status, setStatus] = React.useState('all');
    const [projectId, setProjectId] = React.useState('all');

    React.useEffect(() => {
        onFilterChange({
            startDate,
            endDate,
            status: status === 'all' ? null : status,
            projectId: projectId === 'all' ? null : projectId
        });
    }, [startDate, endDate, status, projectId]);

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setStatus('all');
        setProjectId('all');
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/30 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่มต้น</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    />
                </div>
                {showStatusFilter && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="active">กำลังดำเนินการ</option>
                            <option value="completed">เสร็จสิ้น</option>
                            <option value="on-hold">หยุดชั่วคราว</option>
                        </select>
                    </div>
                )}
                {showProjectFilter && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">โครงการ</label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                        >
                            <option value="all">ทั้งหมด</option>
                            {projects.map(p => (
                                <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="flex items-end">
                    <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <div className="icon-rotate-ccw text-lg"></div>
                        รีเซ็ต
                    </button>
                </div>
            </div>
        </div>
    );
}