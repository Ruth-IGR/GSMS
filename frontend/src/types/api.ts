// DTO shapes aligned with the backend controllers/DTOs

export interface UserResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string | null;
}

export interface AuthResponse {
  token?: string | null;
  expiresAt?: string | null;
  user: UserResponse;
}

export interface GoalResponse {
  goalId: number;
  goalName: string;
  description?: string | null;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  memberCount: number;
  isOverdue: boolean;
  daysRemaining: number;
}

export interface CreateGoalRequest {
  goalName: string;
  description?: string | null;
  targetAmount: number;
  startDate: string;
  endDate: string;
}

export interface UpdateGoalRequest {
  goalName?: string | null;
  description?: string | null;
  targetAmount?: number | null;
  endDate?: string | null;
  status?: string | null;
}

export interface GoalStatsResponse {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgressPercentage: number;
}

export interface ContributionResponse {
  contributionId: number;
  userId: number;
  userName: string;
  goalId: number;
  goalName: string;
  amount: number;
  paymentReference: string;
  status: string;
  submittedAt: string;
  reviewedBy?: number | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface ContributionStatsResponse {
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  rejectedContributions: number;
  totalAmount: number;
  averageContribution: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  percentageChange: number;
}

export interface MemberGoalResponse {
  memberGoalId: number;
  userId: number;
  userName: string;
  goalId: number;
  goalName: string;
  personalTarget: number;
  currentAmount: number;
  personalProgressPercentage: number;
  joinedAt: string;
}

export interface FinancialReportResponse {
  reportDate: string;
  totalMembers: number;
  totalGoals: number;
  totalContributions: number;
  totalDisbursed: number;
  currentBalance: number;
  goalSummaries: GoalSummary[];
  monthlyContributions: MonthlyContribution[];
  topContributors: MemberContributionSummary[];
}

export interface GoalSummary {
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  memberCount: number;
}

export interface MonthlyContribution {
  month: string;
  year: number;
  amount: number;
}

export interface MemberContributionSummary {
  memberName: string;
  totalContributed: number;
  contributionCount: number;
}

export interface DashboardStats {
  goalStats: GoalStatsResponse;
  contributionStats: ContributionStatsResponse;
  totalMembers: number;
  pendingContributionsCount: number;
}

export interface LoanResponse {
  loanId: number;
  userId: number;
  userName: string;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  remainingAmount: number;
  paidAmount: number;
  requestedDate: string;
  dueDate: string;
  status: string;
  approvedBy?: number | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  isOverdue: boolean;
  daysUntilDue: number;
  createdAt: string;
}

export interface CreateLoanRequest {
  amount: number;
  purpose?: string | null;
}

export interface PayLoanRequest {
  amount: number;
  paymentReference: string;
}

export interface MemberAccountResponse {
  userId: number;
  userName: string;
  accountBalance: number;
  totalLoansTaken: number;
  totalLoansPaid: number;
  outstandingLoanAmount: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  activeLoans: LoanResponse[];
  contributionTier: string; // Bronze, Silver, Gold, Platinum
  maxLoanAmount: number;
  maxLoanPercentage: number;
}

export interface LoanStatsResponse {
  totalAccountBalance: number;
  totalLoansOutstanding: number;
  totalLoansPaid: number;
  totalInterestEarned: number;
  pendingLoanRequests: number;
  activeLoans: number;
  overdueLoans: number;
  maxIndividualLoanAmount: number;
}

