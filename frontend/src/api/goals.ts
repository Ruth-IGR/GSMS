import api from "./client";
import type { GoalResponse, GoalStatsResponse } from "../types/api";

export const fetchGoals = async (): Promise<GoalResponse[]> => {
  const { data } = await api.get<GoalResponse[]>("/api/goals");
  return data;
};

export const fetchGoalById = async (
  id: number
): Promise<GoalResponse> => {
  const { data } = await api.get<GoalResponse>(`/api/goals/${id}`);
  return data;
};

export const fetchGoalStats = async (): Promise<GoalStatsResponse> => {
  const { data } = await api.get<GoalStatsResponse>("/api/goals/stats");
  return data;
};

