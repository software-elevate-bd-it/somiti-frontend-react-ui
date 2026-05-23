
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ThemeProvider from "@/components/shared/ThemeProvider";
import ThemeStudioPage from "@/pages/settings/ThemeStudioPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import PublicRegistrationPage from "@/pages/members/PublicRegistrationPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MembersPage from "@/pages/members/MembersPage";
import MemberProfilePage from "@/pages/members/MemberProfilePage";
import MemberRegistrationPage from "@/pages/members/MemberRegistrationPage";
import MemberRequestsPage from "@/pages/members/MemberRequestsPage";
import CollectionsPage from "@/pages/collections/CollectionsPage";
import AdvancedCollectionPage from "@/pages/collections/AdvancedCollectionPage";
import ExpensesPage from "@/pages/expenses/ExpensesPage";
import LedgerPage from "@/pages/ledger/LedgerPage";
import BankAccountsPage from "@/pages/bank/BankAccountsPage";
import CashBookPage from "@/pages/cashbook/CashBookPage";
import PaymentsPage from "@/pages/payments/PaymentsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import IncomeExpenseReport from "@/pages/reports/IncomeExpenseReport";
import CashFlowReport from "@/pages/reports/CashFlowReport";
import MemberDueReport from "@/pages/reports/MemberDueReport";
import BankCashReport from "@/pages/reports/BankCashReport";
import CollectionReport from "@/pages/reports/CollectionReport";
import SMSPage from "@/pages/sms/SMSPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import SomiteesPage from "@/pages/somitees/SomiteesPage";
import FAQPage from "@/pages/faq/FAQPage";
import ApiDocsPage from "@/pages/docs/ApiDocsPage";
import UserManualPage from "@/pages/docs/UserManualPage";
import HelpCenterPage from "@/pages/help/HelpCenterPage";
import RolesPage from "@/pages/roles/RolesPage";
import ApprovalsPage from "@/pages/approvals/ApprovalsPage";
import UsersPage from "@/pages/users/UsersPage";
import LeadershipPage from "@/pages/leadership/LeadershipPage";
import DrawSavingsPage from "@/pages/draw-savings/DrawSavingsPage";
import NotFound from "@/pages/NotFound";
import IncomePage from "./pages/income/IncomePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize API token on app start
function AppInitializer() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Set token in API client when it changes
  React.useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  // Load initial data when authenticated
  React.useEffect(() => {
    if (isAuthenticated && token) {
      // Import stores dynamically to avoid circular dependencies
      import('@/stores/companyStore').then(({ useCompanyStore }) => {
        useCompanyStore.getState().loadCompany();
      });

      import('@/stores/rolesStore').then(({ useRolesStore }) => {
        useRolesStore.getState().loadRoles();
        useRolesStore.getState().loadAssignments();
      });

      import('@/stores/dashboardStore').then(({ useDashboardStore }) => {
        useDashboardStore.getState().loadStats();
      });
    }
  }, [isAuthenticated, token]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppInitializer />
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/apply" element={<PublicRegistrationPage />} />
          <Route path="/docs" element={<HelpCenterPage publicView />} />
          <Route path="/docs/:articleId" element={<HelpCenterPage publicView />} />
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leadership" element={<LeadershipPage />} />
            <Route path="somitees" element={<SomiteesPage />} />
            <Route path="subscriptions" element={<DashboardPage />} />
            <Route path="analytics" element={<DashboardPage />} />
            <Route path="global-settings" element={<SettingsPage />} />
            <Route path="member-registration" element={<MemberRegistrationPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/:id" element={<MemberProfilePage />} />
            <Route path="member-requests" element={<MemberRequestsPage />} />
            <Route path="collections" element={<AdvancedCollectionPage />} />
            <Route path="collections/simple" element={<CollectionsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="ledger" element={<LedgerPage />} />
            <Route path="bank-accounts" element={<BankAccountsPage />} />
            <Route path="cashbook" element={<CashBookPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/income-expense" element={<IncomeExpenseReport />} />
            <Route path="reports/cash-flow" element={<CashFlowReport />} />
            <Route path="reports/member-due" element={<MemberDueReport />} />
            <Route path="reports/bank-cash" element={<BankCashReport />} />
            <Route path="reports/collection" element={<CollectionReport />} />
            <Route path="sms" element={<SMSPage />} />
            <Route path="my-ledger" element={<LedgerPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="api-docs" element={<ApiDocsPage />} />
            <Route path="user-manual" element={<UserManualPage />} />
            <Route path="help" element={<HelpCenterPage />} />
            <Route path="help/:articleId" element={<HelpCenterPage />} />
            <Route path="how-to-work" element={<Navigate to="/help" replace />} />
            <Route path="theme-studio" element={<ThemeStudioPage />} />
            <Route path="draw-savings" element={<DrawSavingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
