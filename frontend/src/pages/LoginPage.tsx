import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';
import { Shield, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      const data = res.data;
      login(data.access_token, {
        id: data.user_id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        district: data.district,
        taluka: data.taluka,
        created_at: new Date().toISOString()
      });

      if (data.role === 'OFFICER') {
        navigate('/officer/queue');
      } else if (data.role === 'ADMIN') {
        navigate('/gis-map');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCreds = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-earth-100 shadow-xl p-8">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-agri-800 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="text-xs text-gray-500 mt-1">Sign in to KrishiRakshak AI Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@krishirakshak.in"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-3 text-center">
            Quick Demo Credentials
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setDemoCreds('farmer@krishirakshak.in', 'farmer123')}
              className="w-full text-left text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl border border-emerald-200 font-medium flex justify-between items-center"
            >
              <span>🧑‍🌾 Farmer (Ramesh Patil)</span>
              <span className="text-[10px] font-mono bg-emerald-200 px-1.5 py-0.5 rounded">Select</span>
            </button>

            <button
              onClick={() => setDemoCreds('officer@krishirakshak.in', 'officer123')}
              className="w-full text-left text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-2 rounded-xl border border-amber-200 font-medium flex justify-between items-center"
            >
              <span>👮 Extension Officer (Gram Sevak)</span>
              <span className="text-[10px] font-mono bg-amber-200 px-1.5 py-0.5 rounded">Select</span>
            </button>

            <button
              onClick={() => setDemoCreds('admin@krishirakshak.in', 'admin123')}
              className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 px-3 py-2 rounded-xl border border-blue-200 font-medium flex justify-between items-center"
            >
              <span>🏛️ Admin & GIS Officer</span>
              <span className="text-[10px] font-mono bg-blue-200 px-1.5 py-0.5 rounded">Select</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-agri-800 hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
