import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@shared/components/layout/AppLayout";
import { LoginPage } from "@features/auth/LoginPage";
import { OnboardingWizard } from "@features/auth/OnboardingWizard";
import { DashboardHome } from "@features/analytics/DashboardHome";
import { CalendarView } from "@features/appointments/CalendarView";
import { ConversationsList } from "@features/conversations/ConversationsList";
import { ServicesList } from "@features/services/ServicesList";
import { BusinessesList } from "@features/businesses/BusinessesList";
import { ProfessionalsList } from "@features/professionals/ProfessionalsList";
import { SettingsPage } from "@pages/SettingsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/onboarding", element: <OnboardingWizard /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardHome /> },
          { path: "appointments", element: <CalendarView /> },
          { path: "conversations", element: <ConversationsList /> },
          { path: "services", element: <ServicesList /> },
          { path: "professionals", element: <ProfessionalsList /> },
          { path: "businesses", element: <BusinessesList /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
