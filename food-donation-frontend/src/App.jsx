import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Guards
import PublicLayout    from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute  from './routes/ProtectedRoute';

// Public pages
import LandingPage         from './pages/public/LandingPage';
import BrowseDonationsPage from './pages/public/BrowseDonationsPage';
import DonationDetailPage  from './pages/public/DonationDetailPage';
import AboutPage           from './pages/public/AboutPage';
import FAQPage             from './pages/public/FAQPage';
import ContactPage         from './pages/public/ContactPage';
import NotFoundPage        from './pages/public/NotFoundPage';
import UnauthorizedPage    from './pages/public/UnauthorizedPage';

// Auth pages
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// Shared pages
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage       from './pages/shared/ProfilePage';

// Donor pages
import DonorDashboardPage  from './pages/donor/DonorDashboardPage';
import MyDonationsPage     from './pages/donor/MyDonationsPage';
import AddEditDonationPage from './pages/donor/AddEditDonationPage';

// NGO pages
import NgoDashboardPage from './pages/ngo/NgoDashboardPage';
import NgoBrowsePage    from './pages/ngo/NgoBrowsePage';
import MyClaimsPage     from './pages/ngo/MyClaimsPage';

// Agent pages
import AgentDashboardPage  from './pages/agent/AgentDashboardPage';
import AssignedPickupsPage from './pages/agent/AssignedPickupsPage';
import DeliveryDetailPage  from './pages/agent/DeliveryDetailPage';
import DeliveryHistoryPage from './pages/agent/DeliveryHistoryPage';

// Admin pages
import AdminDashboardPage       from './pages/admin/AdminDashboardPage';
import AdminUsersPage           from './pages/admin/AdminUsersPage';
import AdminDonationsPage       from './pages/admin/AdminDonationsPage';
import AdminClaimsPage          from './pages/admin/AdminClaimsPage';
import AdminDeliveriesPage      from './pages/admin/AdminDeliveriesPage';
import AdminCategoriesPage      from './pages/admin/AdminCategoriesPage';
import AdminReportsPage         from './pages/admin/AdminReportsPage';
import AdminMessagesPage        from './pages/admin/AdminMessagesPage';
import AdminNotificationsPage   from './pages/admin/AdminNotificationsPage';
import AdminProfileRequestsPage from './pages/admin/AdminProfileRequestsPage';

function App() {
  return (
    <>
      <Routes>

        {/* ── PUBLIC ─────────────────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/"           element={<LandingPage />} />
          <Route path="/browse"     element={<BrowseDonationsPage />} />
          <Route path="/browse/:id" element={<DonationDetailPage />} />
          <Route path="/about"      element={<AboutPage />} />
          <Route path="/faq"        element={<FAQPage />} />
          <Route path="/contact"    element={<ContactPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* ── AUTH ───────────────────────────────────────────── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── DONOR ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['DONOR']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/donor/dashboard"          element={<DonorDashboardPage />} />
            <Route path="/donor/donations"          element={<MyDonationsPage />} />
            <Route path="/donor/donations/new"      element={<AddEditDonationPage />} />
            <Route path="/donor/donations/:id/edit" element={<AddEditDonationPage />} />
            <Route path="/donor/notifications"      element={<NotificationsPage />} />
            <Route path="/donor/profile"            element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── NGO ────────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['NGO']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/ngo/dashboard"      element={<NgoDashboardPage />} />
            <Route path="/ngo/browse"         element={<NgoBrowsePage />} />
            <Route path="/ngo/donations/:id"  element={<DonationDetailPage />} />
            <Route path="/ngo/claims"         element={<MyClaimsPage />} />
            <Route path="/ngo/notifications"  element={<NotificationsPage />} />
            <Route path="/ngo/profile"        element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── DELIVERY AGENT ─────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['DELIVERY_AGENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/agent/dashboard"      element={<AgentDashboardPage />} />
            <Route path="/agent/deliveries"     element={<AssignedPickupsPage />} />
            <Route path="/agent/deliveries/:id" element={<DeliveryDetailPage />} />
            <Route path="/agent/history"        element={<DeliveryHistoryPage />} />
            <Route path="/agent/notifications"  element={<NotificationsPage />} />
            <Route path="/agent/profile"        element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── ADMIN ──────────────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard"         element={<AdminDashboardPage />} />
            <Route path="/admin/users"             element={<AdminUsersPage />} />
            <Route path="/admin/donations"         element={<AdminDonationsPage />} />
            <Route path="/admin/claims"            element={<AdminClaimsPage />} />
            <Route path="/admin/deliveries"        element={<AdminDeliveriesPage />} />
            <Route path="/admin/categories"        element={<AdminCategoriesPage />} />
            <Route path="/admin/reports"           element={<AdminReportsPage />} />
            <Route path="/admin/messages"          element={<AdminMessagesPage />} />
            <Route path="/admin/notifications"     element={<AdminNotificationsPage />} />
            {/* ✅ NEW — Profile change requests page */}
            <Route path="/admin/profile-requests"  element={<AdminProfileRequestsPage />} />
            <Route path="/admin/profile"           element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        toastStyle={{ borderRadius: 12, fontSize: 14 }}
      />
    </>
  );
}

export default App;