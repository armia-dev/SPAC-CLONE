import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./components/adminpages/Login";
import ForgotPassword from "./components/adminpages/ForgotPass";
import CheckEmail from "./components/adminpages/CheckEmail";
import ResetPassword from "./components/adminpages/ResetPassword";
import AdminMainForm from "./components/adminpages/AdminMainForm";
import CustomerMainForm from "./components/customerpages/CustomerMainForm";

import ProtectedRoute from "./components/common/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['Owner', 'Admin', 'Manager', 'Staff', 'Cashier', 'Court Attendant']}>
        <AdminMainForm />
      </ProtectedRoute>
    ),
  },
  { path: '/customer', element: <CustomerMainForm /> },
  { path: '/login', element: <Login /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/check-email', element: <CheckEmail /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;