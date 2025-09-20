import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState('Master Menu')

  const handleItemClick = (name, path) => {
    setActiveItem(name)
    navigate(path)
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
          {/* Master Menu Header */}
          <div className="master-menu-header">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              {/* <span className="font-bold text-gray-900">Master Menu</span> */}
            </div>
          </div>

          {/* Manufacturing Orders */}
          <button
            onClick={() => handleItemClick('Manufacturing Orders', '/manufacturing-orders')}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
              activeItem === 'Manufacturing Orders' || location.pathname === '/manufacturing-orders'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeItem === 'Manufacturing Orders' || location.pathname === '/manufacturing-orders'
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${activeItem === 'Manufacturing Orders' || location.pathname === '/manufacturing-orders' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-medium">Manufacturing Orders</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeItem === 'Manufacturing Orders' || location.pathname === '/manufacturing-orders'
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              24
            </span>
          </button>

          {/* Work Orders */}
          <button
            onClick={() => handleItemClick('Work Orders', '/work-orders')}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
              activeItem === 'Work Orders' || location.pathname === '/work-orders'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeItem === 'Work Orders' || location.pathname === '/work-orders'
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${activeItem === 'Work Orders' || location.pathname === '/work-orders' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <span className="font-medium">Work Orders</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeItem === 'Work Orders' || location.pathname === '/work-orders'
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              12
            </span>
          </button>

          {/* Bills of Materials */}
          <button
            onClick={() => handleItemClick('Bills of Materials', '/bills')}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
              activeItem === 'Bills of Materials' || location.pathname === '/bills'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeItem === 'Bills of Materials' || location.pathname === '/bills'
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${activeItem === 'Bills of Materials' || location.pathname === '/bills' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-medium">Bills of Materials</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeItem === 'Bills of Materials' || location.pathname === '/bills'
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              8
            </span>
          </button>

          {/* Work Centers */}
          <button
            onClick={() => handleItemClick('Work Centers', '/work-center')}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
              activeItem === 'Work Centers' || location.pathname === '/work-center'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeItem === 'Work Centers' || location.pathname === '/work-center'
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${activeItem === 'Work Centers' || location.pathname === '/work-center' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-medium">Work Centers</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeItem === 'Work Centers' || location.pathname === '/work-center'
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              5
            </span>
          </button>

          {/* Stock Ledger */}
          <button
            onClick={() => handleItemClick('Stock Ledger', '/stock-ledger')}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-all duration-200 ${
              activeItem === 'Stock Ledger' || location.pathname === '/stock-ledger'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activeItem === 'Stock Ledger' || location.pathname === '/stock-ledger'
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-gray-100'
              }`}>
                <svg className={`w-4 h-4 ${activeItem === 'Stock Ledger' || location.pathname === '/stock-ledger' ? 'text-white' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="font-medium">Stock Ledger</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeItem === 'Stock Ledger' || location.pathname === '/stock-ledger'
                ? 'bg-white bg-opacity-20 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              156
            </span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
