import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState('Manufacturing Orders')

  const menuItems = [
    { name: 'Manufacturing Orders', path: '/dashboard' },
    { name: 'Work Orders', path: '/workorders' },
    { name: 'Bills of Materials', path: '/bill' },
    { name: 'Work Center', path: '/workcenter' },
    { name: 'Stock Ledger', path: '/stockledger' }
  ]

  const handleItemClick = (item) => {
    setActiveItem(item.name)
    navigate(item.path)
    onClose() // Close sidebar after navigation
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 backdrop-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      <div className="fixed left-0 top-0 h-full w-80 bg-white border-r-2 border-pink-500 shadow-xl z-50 transform transition-all duration-500 ease-out animate-slide-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Master Menu
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="py-4">
              {menuItems.map((item) => (
                <div key={item.name} className="relative mb-2">
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-lg mx-2 ${
                      activeItem === item.name || location.pathname === item.path
                        ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-500 shadow-sm' 
                        : 'hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activeItem === item.name || location.pathname === item.path ? 'bg-pink-500' : 'bg-gray-300'
                      }`}></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </button>
                </div>
              ))}
              
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`empty-${index}`} className="px-6 py-4 mx-2">
                  <div className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
