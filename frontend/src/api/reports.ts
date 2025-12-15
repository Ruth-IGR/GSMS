const baseURL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? "http://localhost:5154";

export const downloadUrl = {
  contributions: `${baseURL}/api/admin/export/contributions`,
  members: `${baseURL}/api/admin/export/members`,
  goals: `${baseURL}/api/admin/export/goals`,
  financial: `${baseURL}/api/reports/financial`,
  audit: `${baseURL}/api/reports/audit`,
};

