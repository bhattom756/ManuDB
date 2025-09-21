import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ManufacturingOrderPopup from '../components/ManufacturingOrderPopup'
import { dashboardAPI, manufacturingOrderAPI } from '../services/api'

const DashboardContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [manufacturingOrderOpen, setManufacturingOrderOpen] = useState(false)
  const [viewMode, setViewMode] = useState('card')
  
  // Data states
  const [manufacturingOrders, setManufacturingOrders] = useState([])
  const [statusCounts, setStatusCounts] = useState({
    All: {},
    My: {}
  })
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Load manufacturing orders when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadManufacturingOrders()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedStatus, pagination.page])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getDashboardSummary()
      if (response.success) {
        setDashboardData(response.data)
        // Extract status counts from the response
        if (response.data.manufacturingOrdersByStatus) {
          setStatusCounts({
            All: response.data.manufacturingOrdersByStatus,
            My: response.data.manufacturingOrdersByStatus // For now, using same data
          })
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadManufacturingOrders = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: selectedStatus || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const response = await dashboardAPI.getManufacturingOrders(params)
      if (response.success) {
        setManufacturingOrders(response.data.manufacturingOrders)
        setPagination(response.data.pagination)
      }
    } catch (err) {
      setError('Failed to load manufacturing orders')
      console.error('Manufacturing orders error:', err)
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

  // Handle status filter click
  const handleStatusFilter = (filterType, status) => {
    setSelectedFilter(filterType)
    setSelectedStatus(status)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilter('All')
    setSelectedStatus(null)
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Handle delete manufacturing order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this manufacturing order?')) {
      try {
        const response = await manufacturingOrderAPI.deleteManufacturingOrder(orderId)
        if (response.success) {
          // Reload the data
          loadManufacturingOrders()
          setSelectedRows(prev => prev.filter(id => id !== orderId))
        }
      } catch (err) {
        setError('Failed to delete manufacturing order')
        console.error('Delete error:', err)
      }
    }
  }

  const getStateColor = (state) => {
    const colors = {
      'DRAFT': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'CONFIRMED': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'IN_PROGRESS': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'TO_CLOSE': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
      'CLOSED': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'CANCELLED': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }
    return colors[state] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'HIGH': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      'MEDIUM': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'LOW': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    }
    return colors[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.title || 'Manufacturing Dashboard'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">
                {dashboardData?.description || 'Monitor and manage your production orders'}
              </p>
              {dashboardData?.userRole && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {dashboardData.userRole.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={loadDashboardData}
                variant="outline"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
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

        {/* Summary Cards */}
        {dashboardData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Object.entries(dashboardData.summary).map(([key, value]) => (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KPIs Section */}
        {dashboardData?.kpis && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{dashboardData.kpis.ordersCompleted || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orders Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboardData.kpis.ordersInProgress || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orders In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{dashboardData.kpis.ordersDelayed || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Orders Delayed</p>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Products Section */}
        {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Low Stock Alert</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.lowStockProducts.slice(0, 6).map((product) => (
                <div key={product.id} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{product.currentStock}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.unitOfMeasure}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                onChange={(e) => handleSearch(e.target.value)}
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
                      checked={selectedRows.length === manufacturingOrders.length && manufacturingOrders.length > 0}
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
                {manufacturingOrders.map((order) => (
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.moNumber}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.scheduleDate ? new Date(order.scheduleDate).toLocaleDateString() : 'Not scheduled'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.finishedProduct?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority || 'MEDIUM')}`}>
                        {order.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.quantity} {order.finishedProduct?.unitOfMeasure || 'Units'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.assignee?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col lg:flex-row gap-1 lg:gap-3">
                        <button 
                          onClick={() => setManufacturingOrderOpen(true)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
              {manufacturingOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(order.id)}
                      onChange={() => handleRowSelect(order.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStateColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{order.moNumber}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{order.finishedProduct?.name || 'N/A'}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Start Date:</span>
                      <span className="text-gray-900 dark:text-white">
                        {order.scheduleDate ? new Date(order.scheduleDate).toLocaleDateString() : 'Not scheduled'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="text-gray-900 dark:text-white">
                        {order.quantity} {order.finishedProduct?.unitOfMeasure || 'Units'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                      <span className="text-gray-900 dark:text-white">{order.assignee?.name || 'Unassigned'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority || 'MEDIUM')}`}>
                        {order.priority || 'MEDIUM'}
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
                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
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
