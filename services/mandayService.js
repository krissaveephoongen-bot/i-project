if (typeof MandayService === 'undefined') {
  window.MandayService = {
  HOURS_PER_DAY: 8,

  calculateManday: (hours) => {
    if (typeof hours !== 'number' || hours < 0) return 0;
    return hours / MandayService.HOURS_PER_DAY;
  },

  calculateMandayFromTimesheet: (timesheetEntry) => {
    const hours = timesheetEntry?.objectData?.Hours || 0;
    return MandayService.calculateManday(hours);
  },

  aggregateMandaysForProject: (timesheets, projectId) => {
    try {
      const projectTimesheets = (timesheets || []).filter(ts => 
        ts.objectData &&
        ts.objectData.ProjectId === projectId && 
        ts.objectData.Status === 'approved'
      );

      const totalHours = projectTimesheets.reduce((sum, ts) => 
        sum + (ts.objectData.Hours || 0), 0
      );

      return {
        totalHours,
        totalMandays: MandayService.calculateManday(totalHours),
        entryCount: projectTimesheets.length
      };
    } catch (error) {
      console.error('Error aggregating mandays:', error);
      return {
        totalHours: 0,
        totalMandays: 0,
        entryCount: 0
      };
    }
  },

  calculateMandayCost: (mandays, hourlyRate) => {
    if (typeof mandays !== 'number' || typeof hourlyRate !== 'number') return 0;
    return mandays * MandayService.HOURS_PER_DAY * hourlyRate;
  }
  };
}
