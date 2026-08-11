import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';

/**
 * Slim top progress bar shown on every route change. Route transitions on
 * this app are plain synchronous React renders (no data loaders), so there
 * is no real "loading" signal to track — some pages are simply heavy enough
 * (hundreds of animated cards) that mounting them can take a couple of
 * seconds, longer on an underpowered phone. With zero visual feedback
 * during that gap, the app looks frozen and people refresh out of
 * confusion, which is worse. This never claims to know exactly when a page
 * has finished mounting — it trickles toward ~90% and then snaps to 100%
 * shortly after the pathname settles, same approach as NProgress.
 */
export default function RouteLoadingBar() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Don't show it on the very first paint of the app.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (trickleRef.current) clearInterval(trickleRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    setVisible(true);
    setProgress(20);

    trickleRef.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15));
    }, 150);

    // Heaviest pages observed taking up to ~3s to mount; give it margin.
    hideTimeoutRef.current = setTimeout(() => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      setProgress(100);
      setTimeout(() => setVisible(false), 200);
    }, 900);

    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#C6FF34] shadow-[0_0_8px_rgba(198,255,52,0.6)] transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
