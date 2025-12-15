import api from "./client";
import type {
  MemberGoalResponse,
  ContributionStatsResponse,
  UserResponse,
} from "../types/api";

export const fetchProfile = async (): Promise<UserResponse> => {
  const { data } = await api.get<UserResponse>("/api/members/profile");
  return data;
};

export const updateProfile = async (
  payload: Partial<Pick<UserResponse, "firstName" | "lastName" | "phoneNumber" | "email" | "profilePictureUrl">>
): Promise<UserResponse> => {
  const { data } = await api.put<UserResponse>("/api/members/profile", payload);
  return data;
};

export const fetchMyGoals = async (): Promise<MemberGoalResponse[]> => {
  const { data } = await api.get<MemberGoalResponse[]>("/api/members/goals");
  return data;
};

export const fetchMyContributionStats = async (): Promise<
  ContributionStatsResponse
> => {
  const { data } = await api.get<ContributionStatsResponse>(
    "/api/members/contributions/stats"
  );
  return data;
};

