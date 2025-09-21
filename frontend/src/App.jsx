import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ManufacturingOrders from './pages/ManufacturingOrders'
import WorkOrders from './pages/WorkOrders'
import Bill from './pages/Bill'
import WorkCenter from './pages/WorkCenter'
import StockLedger from './pages/StockLedger'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import TopNavbar from './components/TopNavbar'

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <Dashboard />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/manufacturing-orders" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <ManufacturingOrders />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/workorders" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <WorkOrders />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/bill" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <Bill />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/workcenter" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <WorkCenter />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/stockledger" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <StockLedger />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/profile" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <Profile />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
      <Route path="/reports" element={
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-auto">
                <TopNavbar />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-800">
              <Reports />
            </div>
          </SidebarInset>
        </SidebarProvider>
      } />
    </Routes>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App