function ProjectIndicator({ project, projectData }) {
  try {
    const progress = projectData?.actualProgress || 0;
    const status = project?.objectData?.Status || 'planning';
    
    const getIndicatorColor = () => {
      if (progress >= 100) return { from: 'green-400', to: 'green-600', text: 'เสร็จสิ้น' };
      if (progress >= 75) return { from: 'blue-400', to: 'blue-600', text: 'ใกล้เสร็จ' };
      if (progress >= 50) return { from: 'yellow-400', to: 'yellow-600', text: 'ระหว่างดำเนินการ' };
      if (progress >= 25) return { from: 'orange-400', to: 'orange-600', text: 'เริ่มต้น' };
      return { from: 'gray-400', to: 'gray-600', text: 'วางแผน' };
    };

    const indicator = getIndicatorColor();

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--slate-200)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--navy-900)]">สถานะโครงการ</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-${indicator.from} to-${indicator.to} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-3xl font-bold">{indicator.text}</span>
            </div>
            <div className={`absolute -top-2 -right-2 w-16 h-16 bg-${indicator.from} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>
              {progress}%
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectIndicator error:', error);
    return null;
  }
}
