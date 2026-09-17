import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (user?.role === 'OFFICER') return '/officer/queue';
    if (user?.role === 'ADMIN') return '/analytics';
    return '/dashboard';
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-mono font-bold bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 uppercase">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">
            Access Denied
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Your account role (<span className="font-bold text-gray-800">{user?.role || 'Guest'}</span>) does not have permission to access this administrative or role-restricted portal.
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Strict Role-Based Access Control:</strong>
            <p className="mt-0.5 text-amber-800">
              Farmer, Extension Officer, and Admin workspaces are strictly separated in KrishiRakshak AI to protect privacy and system integrity.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to={getDashboardRoute()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-agri-900 hover:bg-agri-800 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
