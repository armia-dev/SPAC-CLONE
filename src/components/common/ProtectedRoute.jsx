import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="min-h-screen flex flex-col items-center justify-center bg-[#f3f5e0] text-[#121212] p-6"
      >
        <div className="flex flex-col items-center gap-4 bg-white border border-[#D4C9A8] p-8 rounded-2xl shadow-sm max-w-sm w-full text-center">
          <img
            src="/saranay-logo.png"
            alt="Saranay Pickleball"
            className="h-12 w-auto object-contain animate-pulse"
            onError={(e) => {
              e.currentTarget.src = '/SARANAY LOGO.png';
            }}
          />
          <div className="w-8 h-8 border-3 border-[#ccff00] border-t-[#121212] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-neutral-700">
            Verifying security session...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation: if allowedRoles is provided, ensure user's trusted role is authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If customer tries to access staff management, send them to customer portal
    if (role === 'Customer') {
      return <Navigate to="/customer" replace />;
    }

    // Unauthorized staff role
    return (
      <div
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
        className="min-h-screen flex flex-col items-center justify-center bg-[#f3f5e0] text-[#121212] p-6"
      >
        <div className="flex flex-col items-center gap-4 bg-white border border-[#D4C9A8] p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-xl font-bold text-[#121212]">Access Restricted</h2>
          <p className="text-sm text-neutral-600">
            Your role (<span className="font-bold text-neutral-900">{role || 'Unknown'}</span>) does not have permission to access this administrative area.
          </p>
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="flex-1 py-2.5 rounded-xl border border-neutral-300 font-bold text-xs uppercase hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              My Dashboard
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex-1 py-2.5 rounded-xl bg-[#ccff00] border border-black font-bold text-xs uppercase hover:bg-[#b8e600] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
