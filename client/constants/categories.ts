export const ISSUE_CATEGORIES = [
  { id: 'roads', label: 'Roads & Potholes', icon: '���️' },
  { id: 'lighting', label: 'Lighting', icon: '💡' },
  { id: 'water', label: 'Water Supply', icon: '💧' },
  { id: 'cleanliness', label: 'Cleanliness & Garbage', icon: '🗑️' },
  { id: 'safety', label: 'Public Safety', icon: '⚠️' },
  { id: 'obstructions', label: 'Obstructions & Trees', icon: '🌳' },
] as const;

export const ISSUE_STATUS = [
  { id: 'reported', label: 'Reported', color: 'status-reported' },
  { id: 'in_progress', label: 'In Progress', color: 'status-in-progress' },
  { id: 'resolved', label: 'Resolved', color: 'status-resolved' },
] as const;

export const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 3, label: '3 km' },
  { value: 5, label: '5 km' },
] as const;

export type IssueCategory = typeof ISSUE_CATEGORIES[number]['id'];
export type IssueStatus = typeof ISSUE_STATUS[number]['id'];
