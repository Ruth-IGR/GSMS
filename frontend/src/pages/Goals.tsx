import { useQuery } from "@tanstack/react-query";
import { fetchGoals } from "../api/goals";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Goals = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchGoals,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Completed" | "Cancelled">("all");
  const [displayLimit, setDisplayLimit] = useState<number | null>(null);

  // Filter and limit goals with useMemo for performance
  const filteredGoals = useMemo(() => {
    if (!data) return [];

    let filtered = data.filter((goal) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (!goal.goalName.toLowerCase().includes(search) && 
            !goal.description?.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && goal.status !== statusFilter) {
        return false;
      }

      return true;
    });

    // Apply display limit
    return displayLimit ? filtered.slice(0, displayLimit) : filtered;
  }, [data, searchTerm, statusFilter, displayLimit]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Savings Goals</h1>
        <p className="mt-2 text-slate-600">
          View and track all community savings goals
        </p>
      </div>

      {/* Search and Filter Controls */}
      {!isLoading && data && data.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search goals by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={displayLimit || ""}
              onChange={(e) => setDisplayLimit(e.target.value ? Number(e.target.value) : null)}
              className="input min-w-[120px]"
            >
              <option value="">Show All</option>
              <option value="5">First 5</option>
              <option value="10">First 10</option>
              <option value="20">First 20</option>
            </select>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-slate-600">
              Showing {filteredGoals.length} of {data.length} goal(s)
            </div>
          )}
        </div>
      )}

      <div className="card overflow-x-auto">
        {isLoading && <p className="text-center py-8 text-slate-500">Loading goals...</p>}
        {error && (
          <p className="text-rose-600 text-center py-8">
            Failed to load goals: {(error as any).message}
          </p>
        )}
        {!isLoading && !error && (
          <>
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Current</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Ends</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGoals.map((goal) => (
                  <tr key={goal.goalId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link to={`/goals/${goal.goalId}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                        {goal.goalName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {goal.targetAmount.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {goal.currentAmount.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 min-w-[60px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{goal.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        goal.status === "Active" ? "bg-green-100 text-green-800" :
                        goal.status === "Completed" ? "bg-blue-100 text-blue-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {goal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(goal.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredGoals.length === 0 && !isLoading && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      {searchTerm || statusFilter !== "all" 
                        ? "No goals match your search criteria." 
                        : "No goals yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Goals;

