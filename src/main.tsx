import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import DemoPage from "./features/demo3d/DemoPage.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import React from "react";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import BankDetails from "./pages/BankDetails.tsx";
import NotFound from "./pages/NotFound.tsx";

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
    <RouterProvider router={router} />
  </React.StrictMode>
);
