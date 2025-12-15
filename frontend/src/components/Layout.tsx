import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/members";
import { getUnreadMessageCount } from "../api/messages";
import {
  HomeIcon,
  FlagIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ReceiptRefundIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  FlagIcon as FlagIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UsersIcon as UsersIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  DocumentChartBarIcon as DocumentChartBarIconSolid,
  ReceiptRefundIcon as ReceiptRefundIconSolid,
  SparklesIcon as SparklesIconSolid,
} from "@heroicons/react/24/solid";

const Layout = () => {
  const { user, logout, isAuthed } = useAuth();
  
  // Fetch fresh profile data to get updated profile picture
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: isAuthed,
    staleTime: 60000, // Consider data fresh for 60 seconds
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });

  // Fetch unread message count
  const { data: unreadMessageCount = 0 } = useQuery({
    queryKey: ["unread-message-count"],
    queryFn: getUnreadMessageCount,
    enabled: isAuthed,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 15000, // Refetch every 15 seconds (reduced from 10)
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
  
  // Use profile picture from profile query if available, otherwise fall back to user from auth
  const displayUser = profile ? { ...user, profilePictureUrl: profile.profilePictureUrl } : user;

  if (!isAuthed) {
  return (
    <div className="min-h-screen">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <span className="text-xl font-bold text-white">CF</span>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">Community Finance</div>
                <div className="text-xs text-slate-500">Financial Management</div>
              </div>
            </Link>
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <span className="text-xl font-bold text-white">CF</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Community Finance</div>
              <div className="text-xs text-slate-500">Management</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <HomeIconSolid className="h-5 w-5 text-white" />
                ) : (
                  <HomeIcon className="h-5 w-5" />
                )}
                <span className={isActive ? "text-white" : ""}>Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <FlagIconSolid className="h-5 w-5 text-white" />
                ) : (
                  <FlagIcon className="h-5 w-5" />
                )}
                <span className={isActive ? "text-white" : ""}>Goals</span>
              </>
            )}
            </NavLink>

          <NavLink
            to="/contributions"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <CurrencyDollarIconSolid className="h-5 w-5 text-white" />
                ) : (
                  <CurrencyDollarIcon className="h-5 w-5" />
                )}
                <span className={isActive ? "text-white" : ""}>Contributions</span>
              </>
            )}
            </NavLink>

          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <ChatBubbleLeftRightIconSolid className="h-5 w-5 text-white" />
                  ) : (
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  )}
                  <span className={isActive ? "text-white" : ""}>Messages</span>
                </div>
                {unreadMessageCount > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    isActive ? "bg-white text-blue-600" : "bg-red-500 text-white"
                  }`}>
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </span>
                )}
              </>
            )}
            </NavLink>

          <NavLink
            to="/loan-payments"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <ReceiptRefundIconSolid className="h-5 w-5 text-white" />
                ) : (
                  <ReceiptRefundIcon className="h-5 w-5" />
                )}
                <span className={isActive ? "text-white" : ""}>Payment History</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <SparklesIconSolid className="h-5 w-5 text-white" />
                ) : (
                  <SparklesIcon className="h-5 w-5" />
                )}
                <span className={isActive ? "text-white" : ""}>AI Help</span>
              </>
            )}
          </NavLink>

            {user?.role === "Admin" && (
            <>
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </p>
              </div>

              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <ChartBarIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <ChartBarIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white" : ""}>Admin Dashboard</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <UsersIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <UsersIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white" : ""}>Manage Members</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/goals"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <FlagIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <FlagIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white" : ""}>Manage Goals</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/contributions"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <ClipboardDocumentListIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white !important" : ""}>Review Contributions</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/loans"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <BanknotesIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <BanknotesIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white" : ""}>Loan Requests</span>
                  </>
                )}
              </NavLink>

              <NavLink
                to="/admin/general-report"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                      : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <DocumentChartBarIconSolid className="h-5 w-5 text-white" />
                    ) : (
                      <DocumentChartBarIcon className="h-5 w-5" />
                    )}
                    <span className={isActive ? "text-white !important" : ""}>Reports</span>
                  </>
                )}
              </NavLink>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-slate-200">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md !important"
                    : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <UserIconSolid className="h-5 w-5 text-white" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                  <span className={isActive ? "text-white" : ""}>Profile</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30">
          <div className="flex items-center gap-3 mb-3">
            {displayUser?.profilePictureUrl ? (
              <img
                src={displayUser.profilePictureUrl}
                alt={`${displayUser.firstName} ${displayUser.lastName}`}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white shadow-md ring-2 ring-blue-100">
                {displayUser?.firstName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 text-sm truncate">
                {displayUser?.firstName} {displayUser?.lastName}
              </div>
              <div className="text-xs text-slate-500">
                {displayUser?.role === "Admin" ? "Administrator" : "Member"}
              </div>
                  </div>
                </div>
                <button
                  onClick={logout}
            className="w-full btn-secondary text-sm py-2 hover:bg-slate-100"
                >
                  Sign out
                </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900">Welcome back, {displayUser?.firstName}!</h1>
                <p className="text-xs text-slate-500">Manage your finances efficiently</p>
              </div>
              {unreadMessageCount > 0 && (
              <Link
                  to="/chat"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {unreadMessageCount} unread message{unreadMessageCount !== 1 ? 's' : ''}
                  </span>
              </Link>
            )}
          </div>
        </div>
      </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6">
        <Outlet />
      </main>
      </div>
    </div>
  );
};

export default Layout;

