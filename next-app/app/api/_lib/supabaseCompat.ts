export function orEq(query: any, columnCandidates: string[], value: string) {
  const cond = columnCandidates.map(c => `${c}.eq.${value}`).join(',');
  return query.or(cond);
}

export function withProjectId(query: any, projectId: string) {
  return orEq(query, ['project_id', 'projectId', 'projectid'], projectId);
}

export function withMilestoneId(query: any, milestoneId: string) {
  return orEq(query, ['milestone_id', 'milestoneId', 'milestoneid'], milestoneId);
}

