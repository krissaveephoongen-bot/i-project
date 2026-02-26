function useProjectAnalytics(projectId) {
  const [analytics, setAnalytics] = React.useState({
    scurveData: [],
    budgetData: null,
    mandayData: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    if (projectId) {
      loadAnalytics();
      // Auto-refresh every 5 minutes for real-time updates
      const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setAnalytics({
        scurveData: [],
        budgetData: null,
        mandayData: null,
        loading: false,
        error: null,
      });
    }
  }, [projectId]);

  const loadAnalytics = async () => {
    try {
      setAnalytics((prev) => ({ ...prev, loading: true }));

      const [
        project,
        tasksResponse,
        timesheetsResponse,
        expensesResponse,
        usersResponse,
      ] = await Promise.all([
        trickleGetObject("project", projectId).catch(() => null),
        trickleListObjects("task", 500, true).catch(() => ({ items: [] })),
        trickleListObjects("worklog", 500, true).catch(() => ({ items: [] })),
        trickleListObjects("expense", 500, true).catch(() => ({ items: [] })),
        trickleListObjects("user", 100, true).catch(() => ({ items: [] })),
      ]);

      if (!project) {
        throw new Error("Project not found");
      }

      const tasks = (tasksResponse.items || []).filter(
        (t) => t.objectData && t.objectData.ProjectId === projectId,
      );

      const scurveData = SCurveService.generateSCurveData(
        project,
        tasks,
        timesheetsResponse.items || [],
      );

      const budgetData = ExpenseService.calculateBudgetUtilization(
        project,
        expensesResponse.items || [],
        timesheetsResponse.items || [],
        usersResponse.items || [],
      );

      const mandayData = MandayService.aggregateMandaysForProject(
        timesheetsResponse.items || [],
        projectId,
      );

      setAnalytics({
        scurveData,
        budgetData,
        mandayData,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
      setAnalytics({
        scurveData: [],
        budgetData: null,
        mandayData: null,
        loading: false,
        error: error.message,
      });
    }
  };

  return { ...analytics, refresh: loadAnalytics };
}
