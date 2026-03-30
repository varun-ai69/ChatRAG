import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { getToken } from "./utils/auth";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import ProfilePage from "./pages/ProfilePage";
import ComingSoonPage from "./pages/ComingSoonPage";
import DashboardDocuments from "./pages/DashboardDocuments";
import DashboardChats from "./pages/DashboardChats";
import ChatDetail from "./pages/ChatDetail";
import DashboardAnalytics from "./pages/Dashboardanalytics";
import DashboardChatbot from "./pages/DashboardChatbot";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardApiScript from "./pages/DashboardApiScript";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function ProtectedRoute() {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="/dashboard/documents" element={<DashboardDocuments />} />

            <Route path="/dashboard/chats" element={<DashboardChats />} />
            <Route path="/dashboard/chats/:sessionId" element={<ChatDetail />} />
            <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="/dashboard/chatbot" element={<DashboardChatbot />} />
            <Route path="/dashboard/api" element={<DashboardApiScript />} />
            <Route path="/dashboard/settings" element={<DashboardSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
