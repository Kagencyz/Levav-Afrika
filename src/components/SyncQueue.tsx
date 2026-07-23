import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudOff,
  Cloud,
  RotateCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  Briefcase,
  Star,
  FileText,
  X,
} from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Button } from '@/components/ui/button';

const ACTION_ICONS: Record<string, typeof Send> = {
  application: Briefcase,
  message: Send,
  review: Star,
};

const ACTION_LABELS: Record<string, string> = {
  application: 'Job Application',
  message: 'Message',
  review: 'Review',
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function SyncQueue() {
  const { isOffline, syncQueue, clearQueue, removeFromQueue } = useOffline();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (syncQueue.length === 0) return null;
  if (dismissed && !expanded) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[55] w-[340px] max-w-[calc(100vw-2rem)]">
      {/* Collapsed badge */}
      {!expanded && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={() => setExpanded(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border text-sm font-medium transition-colors ${
            isOffline
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
              : 'bg-[#C6FF34]/10 border-[#C6FF34]/20 text-[#C6FF34] hover:bg-[#C6FF34]/20'
          }`}
        >
          {isOffline ? <CloudOff size={14} /> : <Cloud size={14} />}
          <span>
            {syncQueue.length} pending {syncQueue.length === 1 ? 'action' : 'actions'}
          </span>
          <ChevronUp size={14} />
        </motion.button>
      )}

      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOffline ? 'bg-amber-400' : 'bg-[#C6FF34]'
                  }`}
                />
                <span className="text-white text-sm font-medium">
                  Sync Queue ({syncQueue.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpanded(false)}
                  className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors text-white/40 hover:text-white"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={() => {
                    setDismissed(true);
                    setExpanded(false);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Status bar */}
            <div
              className={`px-4 py-2 text-xs flex items-center gap-1.5 ${
                isOffline ? 'text-amber-400 bg-amber-400/5' : 'text-[#C6FF34] bg-[#C6FF34]/5'
              }`}
            >
              {isOffline ? (
                <>
                  <CloudOff size={12} />
                  Waiting for connection...
                </>
              ) : (
                <>
                  <Cloud size={12} />
                  You are online — ready to sync
                </>
              )}
            </div>

            {/* Items */}
            <div className="max-h-[240px] overflow-y-auto">
              {syncQueue.map((item, index) => {
                const Icon = ACTION_ICONS[item.type] || FileText;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-[#A0A0A0]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {ACTION_LABELS[item.type] || item.type}
                      </p>
                      {'title' in item.data && (
                        <p className="text-white/40 text-xs truncate">
                          {String(item.data.title)}
                        </p>
                      )}
                      {'content' in item.data && (
                        <p className="text-white/40 text-xs truncate">
                          {String(item.data.content)}
                        </p>
                      )}
                      {'comment' in item.data && (
                        <p className="text-white/40 text-xs truncate">
                          {String(item.data.comment)}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-[#666666]" />
                        <span className="text-[#666666] text-[10px]">
                          {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="w-6 h-6 rounded hover:bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white/20 hover:text-red-400"
                      title="Remove item"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-3 border-t border-white/[0.06]">
              {!isOffline && (
                <Button
                  size="sm"
                  className="flex-1 bg-[#C6FF34] text-black hover:bg-[#d4ff5c] text-xs h-9"
                  onClick={() => {
                    // Simulate sync: clear queue with success toast
                    clearQueue();
                  }}
                >
                  <RotateCw size={12} className="mr-1.5" />
                  Sync Now
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-white/40 hover:text-red-400 hover:bg-red-500/10 text-xs h-9"
                onClick={clearQueue}
              >
                <Trash2 size={12} className="mr-1.5" />
                Clear All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
