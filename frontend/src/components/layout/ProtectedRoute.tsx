import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface RouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
          <span className="text-slate-500 font-medium text-sm">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<RouteProps> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090a0f] transition-colors duration-200">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
          <span className="text-slate-500 font-medium text-sm">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Redirect standard students to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
