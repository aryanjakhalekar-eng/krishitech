import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';

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
    return <div className="min-h-[70vh] flex items-center justify-center text-xs text-gray-500 font-medium">Loading KrishiRakshak AI...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

const RoleDashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'OFFICER') {
    return <Navigate to="/officer/queue" replace />;
  }
  if (user?.role === 'ADMIN') {
    return <Navigate to="/analytics" replace />;
  }
  if (user?.role === 'FARMER') {
    return (
      <MainLayout>
        <FarmerDashboard />
      </MainLayout>
    );
  }
  return <Navigate to="/login" replace />;
};

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-gray-500 font-medium">
        Loading KrishiRakshak AI...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'OFFICER') {
    return <Navigate to="/officer/queue" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/analytics" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const MainLayout: React.FC<{ children: React.ReactNode; showSidebar?: boolean }> = ({ children, showSidebar = true }) => {
  const { user, isAuthenticated } = useAuth();
  const showFarmerNav = isAuthenticated && user?.role === 'FARMER' && showSidebar;

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        {showFarmerNav && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      {showFarmerNav && <MobileBottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <OfflineProvider>
          <BrowserRouter>
            <Routes>
              {/* Root Route: strictly redirects based on auth and role */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Pages */}
              <Route path="/login" element={<MainLayout showSidebar={false}><LoginPage /></MainLayout>} />
              <Route path="/register" element={<MainLayout showSidebar={false}><RegisterPage /></MainLayout>} />
              <Route path="/about" element={<MainLayout showSidebar={false}><LandingPage /></MainLayout>} />
              <Route path="/unauthorized" element={<MainLayout showSidebar={false}><UnauthorizedPage /></MainLayout>} />

              {/* Dynamic Role Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><RoleDashboardRouter /></ProtectedRoute>} />

              {/* Protected Farmer-Only Routes */}
              <Route path="/farms" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><MyFarmsPage /></MainLayout></ProtectedRoute>} />
              <Route path="/add-farm" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><AddFarmPage /></MainLayout></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><ScanCropPage /></MainLayout></ProtectedRoute>} />
              <Route path="/scan-result" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><DiseaseResultPage /></MainLayout></ProtectedRoute>} />
              <Route path="/scan-history" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><ScanHistoryPage /></MainLayout></ProtectedRoute>} />
              <Route path="/cases" element={<ProtectedRoute allowedRoles={['FARMER']}><MainLayout><FarmerCasesPage /></MainLayout></ProtectedRoute>} />

              {/* Protected Extension Officer-Only Routes */}
              <Route path="/officer/queue" element={<ProtectedRoute allowedRoles={['OFFICER']}><MainLayout showSidebar={false}><OfficerDashboard /></MainLayout></ProtectedRoute>} />
              <Route path="/officer/review/:caseId" element={<ProtectedRoute allowedRoles={['OFFICER']}><MainLayout showSidebar={false}><OfficerCaseReviewPage /></MainLayout></ProtectedRoute>} />

              {/* Protected Admin-Only Routes */}
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout showSidebar={false}><AdminDashboard /></MainLayout></ProtectedRoute>} />
              <Route path="/gis-map" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout showSidebar={false}><GISOutbreakMapPage /></MainLayout></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </OfflineProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
