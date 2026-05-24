import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MasterPortal } from './portals/MasterPortal';
import { OwnerPortal } from './portals/OwnerPortal';
import { FirmPortal } from './portals/FirmPortal';
import { AdminPortal } from './portals/AdminPortal';
import { StudentPortal } from './portals/StudentPortal';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { JoinRedirect } from './pages/JoinRedirect';
import { UserRole } from './types';

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: UserRole }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role && user.role !== UserRole.MASTER) return <Navigate to="/" />;
  
  return <>{children}</>;
}

function RoleBasedHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case UserRole.MASTER: return <Navigate to="/master" />;
    case UserRole.FIRM: return <Navigate to="/firm" />;
    case UserRole.ADMIN: return <Navigate to="/admin" />;
    case UserRole.STUDENT: return <Navigate to="/student" />;
    default: return <Navigate to="/login" />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleBasedHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/join/:appId" element={<JoinRedirect />} />
          
          <Route path="/master/*" element={
            <ProtectedRoute role={UserRole.MASTER}>
              <MasterPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/owner/*" element={<OwnerPortal />} />
          
          <Route path="/firm/*" element={
            <ProtectedRoute role={UserRole.FIRM}>
              <FirmPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute role={UserRole.ADMIN}>
              <AdminPortal />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute role={UserRole.STUDENT}>
              <StudentPortal />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
