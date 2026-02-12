function ProjectDetailHeader({ project }) {
  if (!project) return null;

  const data = project.objectData || {};
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-[var(--border-color)] rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {data.Name || 'Untitled Project'}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {data.Code || 'N/A'}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium w-32">ธนาคารที่ใช้งาน:</span>
              <span>{data.Customer || '-'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-32">Project Manager:</span>
              <span>{data.ProjectManager || '-'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
          <div className="text-right">
            <div className="text-5xl font-bold text-[var(--primary-color)] mb-2">
              {data.ActualProgress || 0}%
            </div>
            <div className="text-sm text-[var(--text-secondary)] space-y-1">
              <div>% Actual (Now)</div>
              <div>% Planning: {data.PlannedProgress || 0}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">มูลค่าสัญญา</div>
          <div className="font-semibold">
            {(data.Budget || 0).toLocaleString()} บาท
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">วันเริ่มสัญญา</div>
          <div className="font-semibold">
            {data.StartDate ? new Date(data.StartDate).toLocaleDateString('th-TH') : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">วันสิ้นสุดสัญญา</div>
          <div className="font-semibold">
            {data.EndDate ? new Date(data.EndDate).toLocaleDateString('th-TH') : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">ดำเนินงานเหลือ</div>
          <div className="font-semibold text-red-600">
            {data.RemainingDays || 0} วัน
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Project Action</div>
          <div className="font-medium">{data.ProjectAction || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">ระยะเวลาดำเนินการ</div>
          <div className="font-medium">{data.DurationDays || 0} วัน</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Project Type</div>
          <div className="font-medium">{data.ProjectType || '-'}</div>
        </div>
      </div>
    </div>
  );
}