import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/features/auth/components/AuthGuard';

// Placeholder components - you'll implement these later
import Home from "@/pages/home/Home";
import Reader from "@/features/reader/components/Reader";
import LibraryView from "@/features/library/components/LibraryView";
import Dashboard from "@/features/dashboard/components/Dashboard";
import Practice from "@/features/practice/components/PracticeMain";
import Login from "@/pages/Login";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/reader" 
            element={
              <AuthGuard>
                <Reader />
              </AuthGuard>
            } 
          />
          <Route 
            path="/library" 
            element={
              <AuthGuard>
                <LibraryView />
              </AuthGuard>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } 
          />
          <Route 
            path="/practice" 
            element={
              <AuthGuard>
                <Practice />
              </AuthGuard>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;