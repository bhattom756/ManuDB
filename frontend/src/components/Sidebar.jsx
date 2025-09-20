import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState('Manufacturing Orders')

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z',
      count: null
    },
    {
      name: 'Manufacturing Orders',
      path: '/dashboard',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      count: 24
    },
    {
      name: 'Work Orders',
      path: '/workorders',
      icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4',
      count: 12
    },
    {
      name: 'Bills of Materials',
      path: '/bill',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      count: 8
    },
    {
      name: 'Work Centers',
      path: '/workcenter',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      count: 5
    },
    {
      name: 'Stock Ledger',
      path: '/stockledger',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      count: 156
    },
    {
      name: 'Product Master',
      path: '/product-master',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      count: 89
    }
  ]

  const handleItemClick = (item) => {
    setActiveItem(item.name)
    navigate(item.path)
    onClose() // Close sidebar after navigation
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Navigation</h1>
            <p className="text-sm text-gray-500">Main Menu</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-6 overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                activeItem === item.name || location.pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activeItem === item.name || location.pathname === item.path
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-100'
                }`}>
                  <svg className={`w-4 h-4 ${activeItem === item.name || location.pathname === item.path ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
              {item.count && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeItem === item.name || location.pathname === item.path
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
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">User Profile</p>
              <p className="text-xs text-gray-500">View & Edit Profile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
