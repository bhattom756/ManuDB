import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import NewSidebar from './NewSidebar'
import DesktopSidebar from './DesktopSidebar'
import TopNavbar from './TopNavbar'

const NewLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Close sidebar on mobile when resizing to desktop
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Always visible on desktop */}
      <DesktopSidebar />
      
      {/* Mobile Sidebar - Overlay on mobile */}
      <NewSidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
      />
      
      {/* Main Layout */}
      <div className="flex flex-col min-h-screen lg:pl-64 xl:pl-72">
        {/* Top Navigation */}
        <TopNavbar 
          onMenuClick={handleSidebarToggle}
          user={user}
          isMobile={isMobile}
        />
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-50 overflow-x-hidden">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default NewLayout
