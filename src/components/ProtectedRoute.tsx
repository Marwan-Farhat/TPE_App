import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppInterface } from '@/types/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredInterface?: AppInterface;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredInterface }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check interface access if required
  if (requiredInterface && user.interface !== requiredInterface) {
    // Redirect to user's correct interface
    const redirectPath = getInterfaceRedirect(user.interface);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Helper function to get redirect path based on interface
const getInterfaceRedirect = (userInterface: AppInterface): string => {
  switch (userInterface) {
    case 'Admin':
      return '/admin';
    case 'Teacher':
      return '/teacher';
    case 'Client':
      return '/client';
    default:
      return '/login';
  }
};

export default ProtectedRoute;