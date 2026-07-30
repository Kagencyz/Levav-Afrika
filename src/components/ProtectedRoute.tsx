import { Navigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Accept a demo token or a real JWT (three dot-separated base64url segments) */
function isValidToken(token: string | null): boolean {
  if (!token) return false;
  if (token.startsWith('demo_token_') && token.length > 'demo_token_'.length) return true;
  return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(token);
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Direct localStorage check as primary auth source (static deployment has no backend)
  // SECURITY FIX: Validate token format, not just existence — prevents bypass with
  // localStorage.setItem('auth_token', 'x') or any arbitrary string
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const hasLocalAuth = isValidToken(token);

  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while auth state is being determined
  if (isLoading && !hasLocalAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-[#C6FF34]" />
          <p className="text-sm text-[#A0A0A0]">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // SECURITY FIX: Always check isAuthenticated from useAuth (which validates token format
  // AND user object shape). Do NOT render children solely based on localStorage token.
  if (!isAuthenticated && !hasLocalAuth) {
    return <Navigate to="/auth" replace />;
  }

  // Final gate: useAuth's isAuthenticated is the authoritative check
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
