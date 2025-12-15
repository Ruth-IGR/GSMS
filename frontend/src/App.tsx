import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Contributions from "./pages/Contributions";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGoals from "./pages/admin/AdminGoals";
import AdminContributions from "./pages/admin/AdminContributions";
import AdminGeneralReport from "./pages/admin/AdminGeneralReport";
import AdminLoans from "./pages/admin/AdminLoans";
import Chat from "./pages/Chat";
import LoanPayments from "./pages/LoanPayments";
import AIHelp from "./pages/AIHelp";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="goals/:id" element={<GoalDetail />} />
          <Route path="contributions" element={<Contributions />} />
          <Route path="profile" element={<Profile />} />
          <Route path="chat" element={<Chat />} />
          <Route path="loan-payments" element={<LoanPayments />} />
          <Route path="help" element={<AIHelp />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={["Admin"]} />}
        >
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/goals" element={<AdminGoals />} />
          <Route path="admin/contributions" element={<AdminContributions />} />
          <Route path="admin/loans" element={<AdminLoans />} />
          <Route path="admin/general-report" element={<AdminGeneralReport />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

