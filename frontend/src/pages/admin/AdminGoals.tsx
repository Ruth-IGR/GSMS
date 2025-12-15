import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGoalsAdmin, createGoalAdmin, updateGoalAdmin } from "../../api/admin";
import { useState } from "react";
import type { GoalResponse, UpdateGoalRequest } from "../../types/api";

const AdminGoals = () => {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-goals"],
    queryFn: fetchGoalsAdmin,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState<number | null>(null);

  const [form, setForm] = useState({
    goalName: "",
    description: "",
    targetAmount: "",
    startDate: "",
    endDate: "",
  });

  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);
  const [editForm, setEditForm] = useState({
    goalName: "",
    description: "",
    targetAmount: "",
    endDate: "",
    status: "",
  });

  const mutation = useMutation({
    mutationFn: createGoalAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-goals"] });
      setForm({
        goalName: "",
        description: "",
        targetAmount: "",
        startDate: "",
        endDate: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ goalId, payload }: { goalId: number; payload: UpdateGoalRequest }) =>
      updateGoalAdmin(goalId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-goals"] });
      setEditingGoal(null);
      setEditForm({
        goalName: "",
        description: "",
        targetAmount: "",
        endDate: "",
        status: "",
      });
    },
  });

  const handleEditClick = (goal: GoalResponse) => {
    setEditingGoal(goal);
    setEditForm({
      goalName: goal.goalName,
      description: goal.description || "",
      targetAmount: goal.targetAmount.toString(),
      endDate: goal.endDate.split("T")[0],
      status: goal.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    const payload: UpdateGoalRequest = {};
    if (editForm.goalName) payload.goalName = editForm.goalName;
    if (editForm.description) payload.description = editForm.description;
    if (editForm.targetAmount) payload.targetAmount = Number(editForm.targetAmount);
    if (editForm.endDate) payload.endDate = editForm.endDate;
    if (editForm.status) payload.status = editForm.status;
    updateMutation.mutate({ goalId: editingGoal.goalId, payload });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.goalName || !form.targetAmount || !form.startDate || !form.endDate)
      return;
    mutation.mutate({
      goalName: form.goalName,
      description: form.description || undefined,
      targetAmount: Number(form.targetAmount),
      startDate: form.startDate,
      endDate: form.endDate,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Goals (admin)</h1>
        <p className="text-sm text-slate-600">
          Create goals and view existing ones. Uses `/api/goals` (POST/GET).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={form.goalName}
              onChange={(e) => setForm((f) => ({ ...f, goalName: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Target amount
            </label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.targetAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetAmount: e.target.value }))
              }
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Start date
            </label>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">End date</label>
            <input
              required
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Description (optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating..." : "Create goal"}
        </button>
        {mutation.isError && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Failed to create goal: {(mutation.error as any)?.response?.data?.message ?? (mutation.error as any)?.message ?? "An error occurred. Please check your authentication and try again."}
          </div>
        )}
      </form>

      {/* Search and Filter Controls */}
      <div className="card flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search goals by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full input-field"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Show:</label>
          <select
            value={limit === null ? "all" : limit.toString()}
            onChange={(e) => setLimit(e.target.value === "all" ? null : parseInt(e.target.value))}
            className="input-field w-32"
          >
            <option value="5">First 5</option>
            <option value="10">First 10</option>
            <option value="20">First 20</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Members</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {data
              ?.filter((g) =>
                searchTerm
                  ? g.goalName.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
              )
              .slice(0, limit || undefined)
              .map((g) => (
              <tr key={g.goalId} className="border-t">
                <td className="px-3 py-2 font-medium">{g.goalName}</td>
                <td className="px-3 py-2">{g.targetAmount.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span
                      className={`inline-block rounded-full px-2 py-1 text-xs ${
                      g.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : g.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="px-3 py-2">{g.memberCount}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => handleEditClick(g)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
              ))}
            {(!data?.length ||
              data.filter((g) =>
                searchTerm
                  ? g.goalName.toLowerCase().includes(searchTerm.toLowerCase())
                  : true
              ).length === 0) && (
              <tr>
                <td className="px-3 py-4 text-slate-500" colSpan={5}>
                  {searchTerm ? "No goals found matching your search." : "No goals found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="card max-w-2xl bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Edit Goal</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                <input
                  value={editForm.goalName}
                  onChange={(e) => setEditForm((f) => ({ ...f, goalName: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Target Amount</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.targetAmount}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, targetAmount: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Goal"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal(null);
                    setEditForm({
                      goalName: "",
                      description: "",
                      targetAmount: "",
                      endDate: "",
                      status: "",
                    });
                  }}
                  className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
              {updateMutation.isError && (
                <p className="text-sm text-rose-600">
                  Failed to update goal: {(updateMutation.error as any)?.message ?? "Error"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGoals;

