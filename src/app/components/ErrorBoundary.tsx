import React from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { AlertCircle, RefreshCw, Home, LogIn } from 'lucide-react';

export const ErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  const errorMessage =
    error?.message ||
    error?.statusText ||
    (typeof error === 'string' ? error : 'An unexpected application error occurred.');

  const handleResetAndLogin = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('smartattend_jwt_token');
    window.location.href = '/login';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center relative z-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-200 dark:border-red-900">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Something Went Wrong
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          The application encountered an unexpected issue while rendering this page.
        </p>

        {/* Error Detail Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 mb-6 text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            Error Details
          </p>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 break-words line-clamp-3">
            {errorMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleReload}
            className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <button
            type="button"
            onClick={handleResetAndLogin}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Return to Login
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </button>

        <p className="mt-8 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          Takoradi Technical University • SmartAttend System
        </p>
      </div>
    </div>
  );
};
