import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "../../api/admin";
import api from "../../api/client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../state/AuthContext";
import { MagnifyingGlassIcon, ArrowPathIcon, ArrowDownTrayIcon, ChartBarIcon } from "@heroicons/react/24/outline";

interface MemberDetail {
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  memberSince: string;
  profilePictureUrl?: string;
  contributions: Array<{
    contributionId: number;
    goalName: string;
    amount: number;
    status: string;
    submittedAt: string;
  }>;
  goals: Array<{
    goalId: number;
    goalName: string;
    status: string;
    progress: number;
    joinedAt: string;
  }>;
  loans: Array<{
    loanId: number;
    principalAmount: number;
    status: string;
    requestedDate: string;
    remainingAmount: number;
  }>;
  totalContributed: number;
  contributionCount: number;
  goalsJoined: number;
  hasActiveLoans: boolean;
  isFavorite: boolean; // Based on frequent contributions
}

const AdminGeneralReport = () => {
  const { isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const [memberDetails, setMemberDetails] = useState<MemberDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "contributed" | "contributions" | "goals">("contributed");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // "desc" = high to low, "asc" = low to high
  const [displayLimit, setDisplayLimit] = useState<number | null>(null); // null = show all

  // Fetch users with retry logic and proper error handling
  const { data: users, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      try {
        return await fetchUsers();
      } catch (err: any) {
        if (err?.response?.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw err;
      }
    },
    enabled: isAuthed,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const loadReport = async (retryCount = 0) => {
    if (!isAuthed) {
      setError("Please log in to view the report");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Wait a bit to ensure auth headers are set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch all data in parallel with proper error handling
      const [membersRes, goalsRes, contributionsRes, loansRes] = await Promise.all([
        api.get("/api/admin/users").catch((err) => {
          if (err?.response?.status === 401) {
            throw new Error("Unauthorized. Please provide valid X-User-Email and X-User-Password headers.");
          }
          throw err;
        }),
        api.get("/api/goals").catch(() => ({ data: [] })),
        api.get("/api/admin/contributions").catch(() => ({ data: [] })),
        api.get("/api/admin/loans").catch(() => ({ data: [] })),
      ]);

      // Filter members only (exclude admins)
      const allUsers = membersRes.data || [];
      const members = allUsers.filter((u: any) => u.role === "Member");
      const allGoals = goalsRes.data || [];
      const allContributions = contributionsRes.data || [];
      const allLoans = loansRes.data || [];

      // Get member goals - fetch goals for each member
      const memberGoalsMap = new Map<number, any[]>();
      for (const member of members) {
        try {
          // Use the member goals endpoint if available, or calculate from contributions
          const memberGoals = allGoals.filter((goal: any) => {
            // Check if member has contributions to this goal
            return allContributions.some(
              (c: any) => c.userId === member.userId && c.goalId === goal.goalId
            );
          }).map((goal: any) => {
            const memberContributions = allContributions.filter(
              (c: any) => c.userId === member.userId && c.goalId === goal.goalId
            );
            const firstContribution = memberContributions[0];
            return {
              goalId: goal.goalId,
              goalName: goal.goalName,
              status: goal.status,
              progress: goal.progressPercentage || 0,
              joinedAt: firstContribution?.submittedAt || goal.startDate,
            };
          });
          memberGoalsMap.set(member.userId, memberGoals);
        } catch (e) {
          // Skip if can't fetch
        }
      }

      // Calculate member statistics
      const memberDetailsList: MemberDetail[] = members.map((member: any) => {
        const memberContributions = allContributions.filter(
          (c: any) => c.userId === member.userId
        );
        const memberLoans = allLoans.filter((l: any) => l.userId === member.userId);
        const memberGoals = memberGoalsMap.get(member.userId) || [];

        const totalContributed = memberContributions
          .filter((c: any) => c.status === "Approved")
          .reduce((sum: number, c: any) => sum + c.amount, 0);

        const contributionCount = memberContributions.length;
        const goalsJoined = memberGoals.length;
        const hasActiveLoans = memberLoans.some(
          (l: any) => l.status === "Approved" && l.remainingAmount > 0
        );

        // Determine if member is "favorite" (frequent contributor)
        // Criteria: More than 5 contributions or total contributed > $1000
        const isFavorite =
          contributionCount >= 5 || totalContributed >= 1000;

        return {
          userId: member.userId,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          phoneNumber: member.phoneNumber,
          role: member.role,
          memberSince: new Date(member.createdAt).toLocaleDateString(),
          profilePictureUrl: member.profilePictureUrl,
          contributions: memberContributions.map((c: any) => ({
            contributionId: c.contributionId,
            goalName: c.goalName,
            amount: c.amount,
            status: c.status,
            submittedAt: c.submittedAt,
          })),
          goals: memberGoals,
          loans: memberLoans.map((l: any) => ({
            loanId: l.loanId,
            principalAmount: l.principalAmount,
            status: l.status,
            requestedDate: l.requestedDate,
            remainingAmount: l.remainingAmount || 0,
          })),
          totalContributed,
          contributionCount,
          goalsJoined,
          hasActiveLoans,
          isFavorite,
        };
      });

      // Sort by favorite status and total contributed
      memberDetailsList.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }
        return b.totalContributed - a.totalContributed;
      });

      setMemberDetails(memberDetailsList);
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to load report";
      setError(errorMessage);
      console.error("Report error:", err);
      
      // Retry once if it's an auth error and we haven't retried yet
      if (errorMessage.includes("Unauthorized") && retryCount < 1) {
        setTimeout(() => {
          loadReport(retryCount + 1);
        }, 1000);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed && users) {
      loadReport();
    }
  }, [isAuthed, users]);

  // Filter and sort members with performance optimization using useMemo
  const filteredAndSortedMembers = useMemo(() => {
    const filtered = memberDetails.filter((member) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.phoneNumber?.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "contributed":
          comparison = a.totalContributed - b.totalContributed;
          break;
        case "contributions":
          comparison = a.contributionCount - b.contributionCount;
          break;
        case "goals":
          comparison = a.goalsJoined - b.goalsJoined;
          break;
        default:
          return 0;
      }
      // Apply sort order (asc = low to high, desc = high to low)
      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Apply display limit
    return displayLimit ? sorted.slice(0, displayLimit) : sorted;
  }, [memberDetails, searchTerm, sortBy, sortOrder, displayLimit]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Total Contributed", "Contributions", "Goals Joined", "Active Loans", "Member Since"];
    const rows = filteredAndSortedMembers.map((m) => [
      m.name,
      m.email,
      m.phoneNumber || "",
      m.totalContributed.toFixed(2),
      m.contributionCount.toString(),
      m.goalsJoined.toString(),
      m.hasActiveLoans ? "Yes" : "No",
      m.memberSince,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `community-report-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary statistics
  const totalMembers = filteredAndSortedMembers.length;
  const totalContributed = filteredAndSortedMembers.reduce((sum, m) => sum + m.totalContributed, 0);
  const totalContributions = filteredAndSortedMembers.reduce((sum, m) => sum + m.contributionCount, 0);
  const favoriteMembers = filteredAndSortedMembers.filter((m) => m.isFavorite).length;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">General Report</h1>
          <p className="mt-1 text-sm text-slate-600">
            Comprehensive overview of all members, their contributions, goals, loans, and activity status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["admin-users"] });
              loadReport();
            }}
            disabled={loading}
            className="btn-secondary flex items-center gap-2 text-sm"
            title="Refresh report data"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {!loading && !error && memberDetails.length > 0 && (
            <button
              onClick={exportToCSV}
              className="btn-primary flex items-center gap-2 text-sm"
              title="Export report to CSV"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && !error && memberDetails.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Members</p>
                <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card-elevated">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 mb-1">Total Contributed</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 truncate" title={`$${totalContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                  ${totalContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Contributions</p>
                <p className="text-2xl font-bold text-slate-900">{totalContributions}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Top Contributors</p>
                <p className="text-2xl font-bold text-slate-900">{favoriteMembers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {!loading && !error && memberDetails.length > 0 && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm text-slate-600 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                }}
                className="input flex-1 sm:flex-initial min-w-[200px]"
              >
                <option value="contributed">Total Contributed</option>
                <option value="contributions">Contribution Count</option>
                <option value="goals">Goals Joined</option>
                <option value="name">Name</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="input min-w-[150px]"
                title="Sort order"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
              <select
                value={displayLimit || ""}
                onChange={(e) => setDisplayLimit(e.target.value ? Number(e.target.value) : null)}
                className="input min-w-[120px]"
                title="Display limit"
              >
                <option value="">Show All</option>
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {filteredAndSortedMembers.length} result{filteredAndSortedMembers.length !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {(loading || usersLoading) && (
        <div className="card text-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600">Loading report data...</p>
        </div>
      )}

      {/* Error State with Retry */}
      {error && (
        <div className="card">
          <div className="rounded-lg bg-red-50 px-4 py-4 text-sm text-red-700 ring-1 ring-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <strong className="block mb-1">Error loading report:</strong>
                <p>{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                  loadReport();
                }}
                className="btn-secondary ml-4 text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Loading Error */}
      {usersError && !error && (
        <div className="card">
          <div className="rounded-lg bg-red-50 px-4 py-4 text-sm text-red-700 ring-1 ring-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <strong className="block mb-1">Error loading users:</strong>
                <p>{usersError instanceof Error ? usersError.message : "Failed to load users"}</p>
              </div>
              <button
                onClick={() => refetchUsers()}
                className="btn-secondary ml-4 text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      {!loading && !error && !usersLoading && filteredAndSortedMembers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredAndSortedMembers.length}</span> of <span className="font-semibold text-slate-900">{memberDetails.length}</span> members
            </p>
          </div>
          {filteredAndSortedMembers.map((member) => (
            <div key={member.userId} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {member.profilePictureUrl ? (
                    <img
                      src={member.profilePictureUrl}
                      alt={member.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xl font-bold text-white">
                      {member.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                      {member.isFavorite && (
                        <span className="badge badge-warning">⭐ Favorite</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{member.email}</p>
                    {member.phoneNumber && (
                      <p className="text-xs text-slate-500">{member.phoneNumber}</p>
                    )}
                    <p className="text-xs text-slate-500">Member since: {member.memberSince}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedMember(expandedMember === member.userId ? null : member.userId)
                  }
                  className="btn-secondary text-sm"
                >
                  {expandedMember === member.userId ? "Hide Details" : "Show Details"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 min-w-0">
                  <p className="text-xs text-slate-600 mb-1">Total Contributed</p>
                  <p className="text-base sm:text-lg font-bold text-slate-900 truncate" title={`$${member.totalContributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                    ${member.totalContributed.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">Contributions</p>
                  <p className="text-lg font-bold text-slate-900">{member.contributionCount}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">Goals Joined</p>
                  <p className="text-lg font-bold text-slate-900">{member.goalsJoined}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">Active Loans</p>
                  <p className="text-lg font-bold text-slate-900">
                    {member.hasActiveLoans ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {expandedMember === member.userId && (
                <div className="mt-6 space-y-6 border-t border-slate-200 pt-6">
                  {/* Contributions */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Contributions</h4>
                    {member.contributions.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Goal
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Status
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {member.contributions.map((contrib) => (
                              <tr key={contrib.contributionId}>
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  {contrib.goalName}
                                </td>
                                <td className="px-3 py-2 text-slate-900">
                                  <span className="truncate block max-w-[120px]" title={`$${contrib.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${contrib.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`badge ${
                                      contrib.status === "Approved"
                                        ? "badge-success"
                                        : contrib.status === "Pending"
                                        ? "badge-warning"
                                        : "badge-danger"
                                    }`}
                                  >
                                    {contrib.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-600">
                                  {new Date(contrib.submittedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No contributions yet</p>
                    )}
                  </div>

                  {/* Goals */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Goals</h4>
                    {member.goals.length > 0 ? (
                      <div className="space-y-2">
                        {member.goals.map((goal) => (
                          <div
                            key={goal.goalId}
                            className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{goal.goalName}</p>
                              <p className="text-xs text-slate-500">
                                Joined: {new Date(goal.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span
                                className={`badge ${
                                  goal.status === "Active"
                                    ? "badge-success"
                                    : goal.status === "Completed"
                                    ? "badge-info"
                                    : "badge-pending"
                                }`}
                              >
                                {goal.status}
                              </span>
                              <p className="mt-1 text-xs text-slate-600">
                                {goal.progress.toFixed(1)}% complete
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No goals joined yet</p>
                    )}
                  </div>

                  {/* Loans */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Loan Requests</h4>
                    {member.loans.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Status
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Remaining
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                                Requested
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {member.loans.map((loan) => (
                              <tr key={loan.loanId}>
                                <td className="px-3 py-2 font-medium text-slate-900">
                                  <span className="truncate block max-w-[120px]" title={`$${loan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${loan.principalAmount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`badge ${
                                      loan.status === "Approved"
                                        ? "badge-success"
                                        : loan.status === "Pending"
                                        ? "badge-warning"
                                        : loan.status === "Rejected"
                                        ? "badge-danger"
                                        : "badge-pending"
                                    }`}
                                  >
                                    {loan.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-900">
                                  <span className="truncate block max-w-[120px]" title={`$${loan.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                                    ${loan.remainingAmount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-600">
                                  {new Date(loan.requestedDate).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No loan requests</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !usersLoading && memberDetails.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-600 text-lg">No members found in the system</p>
          <p className="text-sm text-slate-500 mt-2">Members will appear here once they register</p>
        </div>
      )}

      {/* No Search Results */}
      {!loading && !error && !usersLoading && memberDetails.length > 0 && filteredAndSortedMembers.length === 0 && (
        <div className="card text-center py-12">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 text-lg">No members match your search</p>
          <p className="text-sm text-slate-500 mt-2">Try adjusting your search terms</p>
          <button
            onClick={() => setSearchTerm("")}
            className="btn-secondary mt-4"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminGeneralReport;
