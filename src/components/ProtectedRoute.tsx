import { Navigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Auth is an httpOnly cookie now — there's nothing in localStorage to
  // read as a client-side shortcut, and there shouldn't be: the previous
  // design's ability to read/spoof a token client-side was itself a real
  // bypass risk. trpc.auth.me (via useAuth) is the sole source of truth.
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
