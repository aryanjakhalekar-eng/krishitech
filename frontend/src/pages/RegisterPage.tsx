import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { apiClient } from '../api/client';
import { Shield, User, Mail, Lock, Phone, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Baramati');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Client Validations
    if (!fullName.trim()) {
      setError(language === 'mr' ? 'पूर्ण नाव आवश्यक आहे.' : 'Full Name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError(language === 'mr' ? 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.' : 'Please enter a valid email address.');
      return;
    }

    if (!phone.trim()) {
      setError(language === 'mr' ? 'मोबाईल नंबर आवश्यक आहे.' : 'Mobile number is required.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!taluka.trim()) {
      setError(language === 'mr' ? 'तालुका आवश्यक आहे.' : 'Taluka is required.');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passMin', 'Password must be at least 6 characters'));
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'mr' ? 'पासवर्ड जुळत नाहीत.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/auth/register', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: cleanPhone,
        role: 'FARMER',
        district,
        taluka: taluka.trim()
      });

      setSuccess(language === 'mr' ? 'खाते यशस्वीरित्या तयार झाले! लॉगिनकडे पुनर्निर्देशित करत आहे...' : 'Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || (language === 'mr' ? 'नोंदणी अयशस्वी झाली. कृपया माहिती तपासा.' : 'Registration failed. Please check your information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-earth-100 shadow-xl p-8">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-agri-800 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {t('auth.registerTitle', 'Create Farmer Account')}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {t('auth.registerSubtitle', "Join Maharashtra's trusted AI crop disease safety network.")}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl mb-4 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('auth.fullNameLabel', 'Full Name')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t('auth.emailLabel', 'Email Address')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
              />
            </div>
          </div>

          {/* Mobile Number & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.phoneLabel', 'Mobile Number')}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.roleLabel', 'Account Role')}
              </label>
              <div className="w-full px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>🧑‍🌾 {t('roles.farmer', 'Farmer')}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  {language === 'mr' ? 'प्रमाणित' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* District & Taluka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.districtLabel', 'District')}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-agri-800 cursor-pointer"
              >
                <option value="Pune">{language === 'mr' ? 'पुणे (Pune)' : 'Pune'}</option>
                <option value="Solapur">{language === 'mr' ? 'सोलापूर (Solapur)' : 'Solapur'}</option>
                <option value="Satara">{language === 'mr' ? 'सातारा (Satara)' : 'Satara'}</option>
                <option value="Nashik">{language === 'mr' ? 'नाशिक (Nashik)' : 'Nashik'}</option>
                <option value="Kolhapur">{language === 'mr' ? 'कोल्हापूर (Kolhapur)' : 'Kolhapur'}</option>
                <option value="Sangli">{language === 'mr' ? 'सांगली (Sangli)' : 'Sangli'}</option>
                <option value="Ahmednagar">{language === 'mr' ? 'अहमदनगर (Ahmednagar)' : 'Ahmednagar'}</option>
                <option value="Nanded">{language === 'mr' ? 'नांदेड (Nanded)' : 'Nanded'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.talukaLabel', 'Taluka')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="e.g. Baramati"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t('auth.passwordLabel', 'Password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {language === 'mr' ? 'पासवर्डची पुष्टी करा' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-agri-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading ? t('auth.creatingAccount', 'Creating account...') : t('auth.createAccountBtn', 'Register Account')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link back to Login */}
        <div className="mt-6 text-center text-xs text-gray-500">
          {t('auth.haveAccount', 'Already registered?')}{' '}
          <Link to="/login" className="font-bold text-agri-800 hover:underline">
            {t('auth.loginLink', 'Sign In here')}
          </Link>
        </div>

      </div>
    </div>
  );
};
