function ProjectOverviewHeader({ project, projectData }) {
  try {
    if (!project) {
      return (
        <div className="text-white text-center py-4">กรุณาเลือกโครงการ</div>
      );
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getStatusText = (status) => {
      const statusMap = {
        planning: "วางแผน",
        active: "ดำเนินการ",
        completed: "เสร็จสิ้น",
        "on-hold": "พักชั่วคราว",
      };
      return statusMap[status] || status;
    };

    const budget = parseFloat(project.objectData.Budget) || 0;
    const spent = projectData?.totalExpenses || 0;
    const remaining = budget - spent;

    const projectInfo = [
      { label: "Project Name", value: project.objectData.Name || "-" },
      {
        label: "Start Date",
        value: formatDate(project.objectData.StartDate),
        label2: "End Date",
        value2: formatDate(project.objectData.EndDate),
      },
      {
        label: "Project Manager",
        value: project.objectData.Manager || "-",
        label2: "Project Code",
        value2: project.objectData.Code || "-",
      },
      {
        label: "Team Size",
        value: `${project.objectData.TeamSize || 0} คน`,
        label2: "Total Tasks",
        value2: `${projectData?.tasks?.length || 0} งาน`,
      },
      {
        label: "Budget",
        value: `฿${budget.toLocaleString()}`,
        label2: "Remaining",
        value2: `฿${remaining.toLocaleString()}`,
      },
      {
        label: "Progress",
        value: `${projectData?.actualProgress || 0}%`,
        label2: "Status",
        value2: getStatusText(project.objectData.Status),
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {projectInfo.map((info, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/70 text-xs mb-1">{info.label}</div>
                <div className="text-white text-sm font-medium">
                  {info.value}
                </div>
              </div>
              {info.label2 && (
                <div>
                  <div className="text-white/70 text-xs mb-1">
                    {info.label2}
                  </div>
                  <div className="text-white text-sm font-medium">
                    {info.value2}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("ProjectOverviewHeader error:", error);
    return null;
  }
}
