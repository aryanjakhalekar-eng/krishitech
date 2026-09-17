import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { Navbar } from './components/Navbar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { MyFarmsPage } from './pages/MyFarmsPage';
import { AddFarmPage } from './pages/AddFarmPage';
import { ScanCropPage } from './pages/ScanCropPage';
import { DiseaseResultPage } from './pages/DiseaseResultPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { FarmerCasesPage } from './pages/FarmerCasesPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { OfficerCaseReviewPage } from './pages/OfficerCaseReviewPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { GISOutbreakMapPage } from './pages/GISOutbreakMapPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center text-xs text-gray-500">Loading KrishiRakshak AI...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

const RoleDashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'OFFICER') {
    return <OfficerDashboard />;
  }
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <FarmerDashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-earth-50 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Dynamic Role Dashboard */}
                  <Route path="/dashboard" element={<ProtectedRoute><RoleDashboardRouter /></ProtectedRoute>} />

                  {/* Protected Farmer-Only Routes */}
                  <Route path="/farms" element={<ProtectedRoute allowedRoles={['FARMER']}><MyFarmsPage /></ProtectedRoute>} />
                  <Route path="/add-farm" element={<ProtectedRoute allowedRoles={['FARMER']}><AddFarmPage /></ProtectedRoute>} />
                  <Route path="/scan" element={<ProtectedRoute allowedRoles={['FARMER']}><ScanCropPage /></ProtectedRoute>} />
                  <Route path="/scan-result" element={<ProtectedRoute allowedRoles={['FARMER']}><DiseaseResultPage /></ProtectedRoute>} />
                  <Route path="/scan-history" element={<ProtectedRoute allowedRoles={['FARMER']}><ScanHistoryPage /></ProtectedRoute>} />
                  <Route path="/cases" element={<ProtectedRoute allowedRoles={['FARMER']}><FarmerCasesPage /></ProtectedRoute>} />

                  {/* Protected Extension Officer-Only Routes */}
                  <Route path="/officer/queue" element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerDashboard /></ProtectedRoute>} />
                  <Route path="/officer/review/:caseId" element={<ProtectedRoute allowedRoles={['OFFICER']}><OfficerCaseReviewPage /></ProtectedRoute>} />

                  {/* Protected Admin-Only Routes */}
                  <Route path="/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/gis-map" element={<ProtectedRoute allowedRoles={['ADMIN']}><GISOutbreakMapPage /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

