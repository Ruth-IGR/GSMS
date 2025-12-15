import api from "./client";
import type {
  ContributionResponse,
  ContributionStatsResponse,
} from "../types/api";

export const fetchMyContributions = async (): Promise<
  ContributionResponse[]
> => {
  const { data } = await api.get<ContributionResponse[]>(
    "/api/members/contributions"
  );
  return data;
};

export const createContribution = async (payload: {
  goalId: number;
  amount: number;
  paymentReference?: string;
}): Promise<ContributionResponse> => {
  const { data } = await api.post<ContributionResponse>(
    "/api/members/contributions",
    {
      goalId: payload.goalId,
      amount: payload.amount,
      paymentReference: payload.paymentReference || undefined,
    }
  );
  return data;
};

export const fetchContributionStats = async (): Promise<
  ContributionStatsResponse
> => {
  const { data } = await api.get<ContributionStatsResponse>(
    "/api/contributions/stats"
  );
  return data;
};

export const fetchPendingContributions = async (): Promise<
  ContributionResponse[]
> => {
  const { data } = await api.get<ContributionResponse[]>(
    "/api/admin/contributions/pending"
  );
  return data;
};

