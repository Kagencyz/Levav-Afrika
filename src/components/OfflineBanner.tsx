import { WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

export default function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/90 text-black text-sm text-center py-2 px-4 flex items-center justify-center gap-2 backdrop-blur-sm">
      <WifiOff size={14} className="flex-shrink-0" />
      <span>You are offline. Your actions will be saved and synced when you reconnect.</span>
    </div>
  );
}
