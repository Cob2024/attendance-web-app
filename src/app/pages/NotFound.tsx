import React from 'react';
import { useNavigate } from 'react-router';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ttu-navy-50 to-ttu-navy-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
          <AlertTriangle className="w-10 h-10 text-ttu-gold" />
        </div>

        {/* Error Code */}
        <h1 className="text-7xl font-bold text-ttu-navy mb-2">404</h1>

        {/* Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
          Please check the URL or go back to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-outline rounded-xl w-full sm:w-auto font-medium gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary rounded-xl w-full sm:w-auto text-white font-bold gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Login
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-400">
          © 2026 SmartAttend — Takoradi Technical University
        </p>
      </div>
    </div>
  );
};
