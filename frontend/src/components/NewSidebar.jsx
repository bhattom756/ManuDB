import React, { useState } from 'react'

const NewSidebar = ({ isOpen, onClose }) => {
  const [activeItem, setActiveItem] = useState('Dashboard')

  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z',
      count: null,
      path: '/dashboard'
    },
    {
      name: 'Manufacturing Orders',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      count: 24,
      path: '/manufacturing-orders'
    },
    {
      name: 'Work Orders',
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
      count: 12,
      path: '/work-orders'
    },
    {
      name: 'Bills of Materials',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      count: 8,
      path: '/bills-of-materials'
    },
    {
      name: 'Work Centers',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      count: 5,
      path: '/work-centers'
    },
    {
      name: 'Stock Ledger',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      count: 156,
      path: '/stock-ledger'
    },
    {
      name: 'Product Master',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      count: 89,
      path: '/product-master'
    }
  ]

  const handleItemClick = (item) => {
    setActiveItem(item.name)
    console.log(`Navigating to: ${item.name} (${item.path})`)
    // Here you can add navigation logic
    // navigate(item.path)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop Overlay - only show when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={handleClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Navigation</h1>
              <p className="text-xs sm:text-sm text-gray-500">Main Menu</p>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <nav className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-left rounded-xl transition-all duration-200 ${
                  activeItem === item.name 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    activeItem === item.name 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100'
                  }`}>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${activeItem === item.name ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="font-medium text-sm sm:text-base">{item.name}</span>
                </div>
                {item.count && (
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full ${
                    activeItem === item.name 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">U</span>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900">User Profile</p>
                <p className="text-xs text-gray-500">View & Edit Profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NewSidebar
