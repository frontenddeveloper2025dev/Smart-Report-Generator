import { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import LoginPage from '@/pages/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}