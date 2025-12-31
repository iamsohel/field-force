import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

// Auth pages
import LoginPage from '@modules/auth/LoginPage';

// Layout
import MainLayout from '@components/layout/MainLayout';

// Dashboard modules
import Dashboard from '@modules/dashboard/Dashboard';
import AdminDashboard from '@modules/dashboard/AdminDashboard';
import TeamDashboard from '@modules/dashboard/TeamDashboard';
import TeamMemberProfile from '@modules/team/TeamMemberProfile';
import Attendance from '@modules/attendance/Attendance';
import Tasks from '@modules/tasks/Tasks';
import Visits from '@modules/visits/Visits';
import Sales from '@modules/sales/Sales';
import Reports from '@modules/reports/Reports';
import Expenses from '@modules/expenses/Expenses';
import Territory from '@modules/territory/Territory';
import Settings from '@modules/settings/Settings';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />} />
        <Route path="team" element={<TeamDashboard />} />
        <Route path="team/:memberId" element={<TeamMemberProfile />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="visits" element={<Visits />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reports" element={<Reports />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="territory" element={<Territory />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
