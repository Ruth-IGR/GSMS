import { Link } from "react-router-dom";
import { downloadUrl } from "../../api/reports";

const AdminReports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports & Exports</h1>
        <p className="text-sm text-slate-600">
          Generate comprehensive reports and export data.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">General Report</h2>
        <p className="mb-4 text-sm text-slate-600">
          View comprehensive statistics including member goals, contributions, duration, and more.
        </p>
        <Link
          to="/admin/general-report"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View General Report
        </Link>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Export Data</h2>
        <p className="mb-4 text-sm text-slate-600">
          Download data in Excel format for external analysis.
        </p>
        <div className="space-y-3">
          <ExportLink label="Export contributions" href={downloadUrl.contributions} />
          <ExportLink label="Export members" href={downloadUrl.members} />
          <ExportLink label="Export goals" href={downloadUrl.goals} />
          <ExportLink label="Financial report" href={downloadUrl.financial} />
          <ExportLink label="Audit report" href={downloadUrl.audit} />
        </div>
      </div>
    </div>
  );
};

const ExportLink = ({ label, href }: { label: string; href: string }) => (
  <a
    href={href}
    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
  >
    <span>{label}</span>
    <span className="text-blue-600">Download</span>
  </a>
);

export default AdminReports;

