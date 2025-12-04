import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App.tsx";
import "./index.css";
import DemoPage from "./features/demo3d/DemoPage.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

// Polyfill for amazon-cognito-identity-js
window.Buffer = Buffer;
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import BankDetails from "./pages/BankDetails.tsx";
import NotFound from "./pages/NotFound.tsx";
import DemoEChanneling from "./pages/echanneling/DemoEChanneling.tsx";
import FindTherapist from "./pages/echanneling/FindTherapist.tsx";
import EChannelingLogin from "./pages/echanneling/EChannelingLogin.tsx";
import EChannelingLoginNew from "./pages/echanneling/EChannelingLoginNew.tsx";
import EChannelingRegister from "./pages/echanneling/EChannelingRegister.tsx";
import EChannelingPage from "./pages/EChannelingPage.tsx";
import AuthCallback from "./pages/echanneling/AuthCallback.tsx";
import ConfirmSignUp from "./pages/echanneling/ConfirmSignUp.tsx";
import PatientDashboard from "./pages/echanneling/PatientDashboard.tsx";
import TherapistDashboard from "./pages/echanneling/TherapistDashboard.tsx";
import PatientProfile from "./pages/echanneling/PatientProfile.tsx";
import TherapistProfile from "./pages/echanneling/TherapistProfile.tsx";
import PatientLayout from "./pages/echanneling/PatientLayout.tsx";
import PatientAppointments from "./pages/echanneling/PatientAppointments.tsx";
import PatientBilling from "./pages/echanneling/PatientBilling.tsx";
import PatientReferrals from "./pages/echanneling/PatientReferrals.tsx";
import PatientRehabX from "./pages/echanneling/PatientRehabX.tsx";
import PatientMessages from "./pages/echanneling/PatientMessages.tsx";

// ...existing code...
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Index /> },
        { path: "admin", element: <Admin /> },
        { path: "admin/login", element: <AdminLogin /> },
        { path: "bank-details", element: <BankDetails /> },
        { path: "/demo", element: <DemoPage /> },
        { path: "echanneling", element: <EChannelingPage /> },
        { path: "echanneling/demo", element: <DemoEChanneling /> },
        { path: "echanneling/find-therapist", element: <FindTherapist /> },
        { path: "echanneling/login", element: <EChannelingLogin /> },
        { path: "echanneling/login-new", element: <EChannelingLoginNew /> },
        { path: "echanneling/register", element: <EChannelingRegister /> },
        { path: "auth/callback", element: <AuthCallback /> },
        { path: "echanneling/confirm", element: <ConfirmSignUp /> },
        {
          path: "echanneling/patient",
          element: <PatientLayout />,
          children: [
            { path: "dashboard", element: <PatientDashboard /> },
            { path: "appointments", element: <PatientAppointments /> },
            { path: "profile", element: <PatientProfile /> },
            { path: "billing", element: <PatientBilling /> },
            { path: "referrals", element: <PatientReferrals /> },
            { path: "rehabx", element: <PatientRehabX /> },
            { path: "messages", element: <PatientMessages /> },
          ],
        },
        {
          path: "echanneling/therapist/dashboard",
          element: <TherapistDashboard />,
        },
        {
          path: "echanneling/therapist/profile",
          element: <TherapistProfile />,
        },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);
// ...existing code...

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);
