import api from "./client";
import type {
  ContributionResponse,
  DashboardStats,
  GoalResponse,
  UserResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateUserRequest,
} from "../types/api";

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get<DashboardStats>("/api/admin/dashboard/stats");
  return data;
};

export const fetchUsers = async (): Promise<UserResponse[]> => {
  const { data } = await api.get<UserResponse[]>("/api/admin/users");
  return data;
};

export const fetchGoalsAdmin = async (): Promise<GoalResponse[]> => {
  const { data } = await api.get<GoalResponse[]>("/api/goals");
  return data;
};

export const createGoalAdmin = async (
  payload: CreateGoalRequest
): Promise<GoalResponse> => {
  const { data } = await api.post<GoalResponse>("/api/goals", payload);
  return data;
};

export const updateGoalAdmin = async (
  goalId: number,
  payload: UpdateGoalRequest
): Promise<GoalResponse> => {
  const { data } = await api.put<GoalResponse>(`/api/goals/${goalId}`, payload);
  return data;
};

export const fetchPendingContributionsAdmin = async (): Promise<
  ContributionResponse[]
> => {
  const { data } = await api.get<ContributionResponse[]>(
    "/api/admin/contributions/pending"
  );
  return data;
};

export const approveContribution = async (id: number) => {
  const { data } = await api.put(
    `/api/admin/contributions/${id}/status`,
    {
      status: "Approved",
    }
  );
  return data;
};

export const rejectContribution = async (id: number, rejectionReason?: string) => {
  const { data } = await api.put(
    `/api/admin/contributions/${id}/status`,
    { status: "Rejected", rejectionReason }
  );
  return data;
};

export const updateUser = async (userId: number, payload: UpdateUserRequest): Promise<UserResponse> => {
  const { data } = await api.put<UserResponse>(`/api/admin/users/${userId}`, payload);
  return data;
};

export const deactivateUser = async (userId: number): Promise<void> => {
  await api.put(`/api/admin/users/${userId}/deactivate`);
};

export const activateUser = async (userId: number): Promise<void> => {
  await api.put(`/api/admin/users/${userId}/activate`);
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/api/admin/users/${userId}`);
};

