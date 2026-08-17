import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, AlertCircle } from 'lucide-react';
import { t } from '@/copy';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-[calc(100dvh-72px)] flex items-center justify-center px-4 pb-24 md:pb-0">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      >
        {/* 404 Icon */}
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-[#666666]" />
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-[#C6FF34] font-display mb-2">{t('notfound.code')}</h1>

        {/* Title */}
        <h2 className="text-white text-2xl font-semibold mb-3">{t('notfound.title')}</h2>

        {/* Message */}
        <p className="text-[#666666] mb-2">
          {t('notfound.body')}
        </p>
        <p className="text-[#444444] text-sm mb-8 font-mono break-all">
          {t('notfound.path', { path: location.pathname })}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-[#A0A0A0] font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notfound.action.back')}
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C6FF34] text-black font-semibold rounded-xl hover:bg-[#d4ff5c] transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            {t('notfound.action.home')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
