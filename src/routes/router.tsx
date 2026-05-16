import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@shared/components/layout/AppLayout";
import { LoginPage } from "@features/auth/LoginPage";
import { OnboardingWizard } from "@features/auth/OnboardingWizard";
import { DashboardHome } from "@features/analytics/DashboardHome";
import { AppointmentsList } from "@features/appointments/AppointmentsList";
import { ConversationsList } from "@features/conversations/ConversationsList";
import { ServicesList } from "@features/services/ServicesList";
import { BusinessesList } from "@features/businesses/BusinessesList";

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
          { path: "appointments", element: <AppointmentsList /> },
          { path: "conversations", element: <ConversationsList /> },
          { path: "services", element: <ServicesList /> },
          { path: "businesses", element: <BusinessesList /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
