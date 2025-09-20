import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/Sidebar'
import ManufacturingOrderPopup from '@/components/ManufacturingOrderPopup'

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedRows, setSelectedRows] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [manufacturingOrderOpen, setManufacturingOrderOpen] = useState(false)

  // Sample data based on wireframe
  const manufacturingOrders = [
    {
      id: 'MO-000001',
      reference: 'MO-000001',
      startDate: 'Tomorrow',
      finishedProduct: 'Dinning Table',
      componentStatus: 'Not Available',
      quantity: '5.00',
      unit: 'Units',
      state: 'Confirmed'
    },
    {
      id: 'MO-000002',
      reference: 'MO-000002',
      startDate: 'Yesterday',
      finishedProduct: 'Drawer',
      componentStatus: 'Available',
      quantity: '2.00',
      unit: 'Units',
      state: 'In-Progress'
    }
  ]

  const statusCounts = {
    All: {
      Draft: 2,
      Confirmed: 7,
      'In-Progress': 1,
      'To Close': 5,
      'Not Assigned': 11,
      Late: 11
    },
    My: {
      Confirmed: 7,
      'In-Progress': 1,
      'To Close': 5,
      Late: 8
    }
  }

  const handleRowSelect = (orderId) => {
    setSelectedRows(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === manufacturingOrders.length 
        ? [] 
        : manufacturingOrders.map(order => order.id)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Popup */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Manufacturing Order Popup */}
      <ManufacturingOrderPopup 
        isOpen={manufacturingOrderOpen} 
        onClose={() => setManufacturingOrderOpen(false)} 
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* App Logo and Name */}
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold">App Logo and Name</div>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-400">
            App Dashboard
          </h1>
        </div>

        {/* Top Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => setManufacturingOrderOpen(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            New Manufacturing Order
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex space-x-8">
            {/* All Category */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-400">All</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts.All).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === 'All' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedFilter('All')}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>

            {/* My Category */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-400">My</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts.My).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === 'My' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setSelectedFilter('My')}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === manufacturingOrders.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Finished Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Component Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {manufacturingOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(order.id)}
                        onChange={() => handleRowSelect(order.id)}
                        className="rounded border-gray-300 bg-white text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.startDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.finishedProduct}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.componentStatus}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.state}</td>
                  </tr>
                ))}
                {/* Empty rows for more data */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`empty-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 bg-white text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                    <td className="px-4 py-3 text-sm text-gray-400">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}