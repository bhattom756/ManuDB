import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Sidebar from './Sidebar'
import MobileSidebar from './MobileSidebar'
import TopNavbar from './TopNavbar'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Always visible on desktop */}
      {!isMobile && (
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
      )}
      
      {/* Mobile Sidebar - Overlay */}
      {isMobile && (
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top Navigation */}
        <TopNavbar 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          isMobile={isMobile}
        />
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
