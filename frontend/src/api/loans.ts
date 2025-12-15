import api from './client';
import type {
  LoanResponse,
  CreateLoanRequest,
  PayLoanRequest,
  MemberAccountResponse,
  LoanStatsResponse,
} from '../types/api';

export const requestLoan = async (data: CreateLoanRequest): Promise<LoanResponse> => {
  const { data: response } = await api.post<{ Loan: LoanResponse; RiskAssessment: any }>('/api/loans/request', data);
  // Return the loan, risk assessment is handled separately if needed
  return response.Loan;
};

export const assessLoanRisk = async (amount: number, purpose?: string): Promise<any> => {
  const { data } = await api.post('/api/loans/assess-risk', { amount, purpose });
  return data;
};

export const getUserRiskScore = async (): Promise<any> => {
  const { data } = await api.get('/api/loans/risk-score');
  return data;
};

export const payLoan = async (loanId: number, data: PayLoanRequest): Promise<LoanResponse> => {
  const { data: response } = await api.post<LoanResponse>(`/api/loans/${loanId}/pay`, data);
  return response;
};

export const getMyLoans = async (): Promise<LoanResponse[]> => {
  const { data } = await api.get<LoanResponse[]>('/api/loans/my-loans');
  return data;
};

export const getMyAccount = async (): Promise<MemberAccountResponse> => {
  const { data } = await api.get<MemberAccountResponse>('/api/loans/my-account');
  return data;
};

export const getPendingLoans = async (): Promise<LoanResponse[]> => {
  const { data } = await api.get<LoanResponse[]>('/api/loans/pending');
  return data;
};

export const approveLoan = async (loanId: number, notes?: string): Promise<LoanResponse> => {
  const { data } = await api.post<LoanResponse>(`/api/loans/${loanId}/approve`, { notes });
  return data;
};

export const rejectLoan = async (loanId: number, rejectionReason: string): Promise<LoanResponse> => {
  const { data } = await api.post<LoanResponse>(`/api/loans/${loanId}/reject`, { rejectionReason });
  return data;
};

export const getLoanStats = async (): Promise<LoanStatsResponse> => {
  const { data } = await api.get<LoanStatsResponse>('/api/loans/stats');
  return data;
};

