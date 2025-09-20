import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ManufacturingOrderPopup from '../components/ManufacturingOrderPopup'

const DashboardContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [manufacturingOrderOpen, setManufacturingOrderOpen] = useState(false)
  const [viewMode, setViewMode] = useState('card') 

  const manufacturingOrders = [
    {
      id: 'MO-000001',
      reference: 'MO-000001',
      startDate: 'Tomorrow',
      finishedProduct: 'Dinning Table',
      componentStatus: 'Not Available',
      quantity: '5.00',
      unit: 'Units',
      state: 'Confirmed',
      priority: 'High',
      assignee: 'John Doe'
    },
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
    const filteredOrders = getFilteredOrders()
    setSelectedRows(
      selectedRows.length === filteredOrders.length 
        ? [] 
        : filteredOrders.map(order => order.id)
    )
  }

  // Filter orders based on search term and selected status
  const getFilteredOrders = () => {
    let filtered = manufacturingOrders

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.assignee && order.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by selected status
    if (selectedStatus) {
      filtered = filtered.filter(order => order.state === selectedStatus)
    }

    return filtered
  }

  // Handle status filter click
  const handleStatusFilter = (filterType, status) => {
    setSelectedFilter(filterType)
    setSelectedStatus(status)
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilter('All')
    setSelectedStatus(null)
  }

  const getStateColor = (state) => {
    const colors = {
      'Draft': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'Confirmed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'In-Progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'To Close': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      'Closed': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    }
    return colors[state] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      'Medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'Low': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    }
    return colors[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Manufacturing Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">Monitor and manage your production orders</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setManufacturingOrderOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">New Manufacturing Order</span>
                <span className="sm:hidden">New Order</span>
              </Button>
            </div>
          </div>
        </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search orders, products, or materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mt-4 lg:mt-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* All Category */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 lg:mb-3">All Orders</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts.All).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-3 py-2 lg:px-4 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                      selectedFilter === 'All' && selectedStatus === status
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                    }`}
                    onClick={() => handleStatusFilter('All', status)}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>

            {/* My Category */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 lg:mb-3">My Orders</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusCounts.My).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-3 py-2 lg:px-4 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                      selectedFilter === 'My' && selectedStatus === status
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                    }`}
                    onClick={() => handleStatusFilter('My', status)}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manufacturing Orders</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your production orders and track progress</p>
        </div>
        
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === getFilteredOrders().length && getFilteredOrders().length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {getFilteredOrders().map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(order.id)}
                        onChange={() => handleRowSelect(order.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.reference}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.startDate}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.finishedProduct}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.state)}`}>
                        {order.state}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.quantity} {order.unit}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.assignee || 'Unassigned'}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col lg:flex-row gap-1 lg:gap-3">
                        <button 
                          onClick={() => setManufacturingOrderOpen(true)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {getFilteredOrders().map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.state)}`}>
                        {order.state}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{order.reference}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{order.finishedProduct}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                      <span className="text-gray-900 dark:text-white">{order.startDate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="text-gray-900 dark:text-white">{order.quantity} {order.unit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                      <span className="text-gray-900 dark:text-white">{order.assignee || 'Unassigned'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={() => setManufacturingOrderOpen(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

        {/* Manufacturing Order Popup */}
        <ManufacturingOrderPopup 
          isOpen={manufacturingOrderOpen} 
          onClose={() => setManufacturingOrderOpen(false)} 
        />
      </div>
    </div>
  )
}

export default DashboardContent
