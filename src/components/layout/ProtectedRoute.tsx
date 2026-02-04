import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLicense } from '@/contexts/LicenseContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, isLicenseValid, license } = useLicense();
  const [isReady, setIsReady] = useState(false);

  // Add a small delay to ensure license data is fully loaded after auth state changes
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but no license or expired - redirect to expired page
  if (!isLicenseValid && license) {
    return <Navigate to="/license-expired" replace />;
  }

  // Authenticated but never purchased a license - redirect to purchase
  if (!license) {
    return <Navigate to="/purchase" replace />;
  }

  return <>{children}</>;
};
