import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import workOrdersData from '@/data/workOrders.json'

const WorkOrdersAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    operation: '',
    workCenter: '',
    status: ''
  })

  // Use data from JSON file
  const workOrders = workOrdersData.workOrders

  // Filter work orders based on search term and filters
  const getFilteredWorkOrders = () => {
    let filtered = workOrders

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.workCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by specific filters
    if (searchFilters.operation) {
      filtered = filtered.filter(order =>
        order.operation.toLowerCase().includes(searchFilters.operation.toLowerCase())
      )
    }

    if (searchFilters.workCenter) {
      filtered = filtered.filter(order =>
        order.workCenter.toLowerCase().includes(searchFilters.workCenter.toLowerCase())
      )
    }

    if (searchFilters.status) {
      filtered = filtered.filter(order =>
        order.status.toLowerCase().includes(searchFilters.status.toLowerCase())
      )
    }

    return filtered
  }

  const filteredWorkOrders = getFilteredWorkOrders()

  // Calculate summary totals
  const calculateTotals = () => {
    const totalExpectedDuration = filteredWorkOrders.reduce((total, order) => {
      const [hours, minutes] = order.expectedDuration.split(':').map(Number)
      return total + (hours * 60 + minutes)
    }, 0)

    const totalRealDuration = filteredWorkOrders.reduce((total, order) => {
      const [hours, minutes] = order.realDuration.split(':').map(Number)
      return total + (hours * 60 + minutes)
    }, 0)

    const formatDuration = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    return {
      expectedDuration: formatDuration(totalExpectedDuration),
      realDuration: formatDuration(totalRealDuration)
    }
  }

  const totals = calculateTotals()

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'In Progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      'Done': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'Blocked': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    }
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  const handleSearchFilter = (filterType, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSearchFilters({
      operation: '',
      workCenter: '',
      status: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {/* <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg> */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Work Orders Analysis</h1>
              </div>
      </div>
      
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search by operation, work center, product, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
        </div>
        
              {(searchTerm || Object.values(searchFilters).some(filter => filter)) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                >
                  Clear Filters
          </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Advanced Search Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Search Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operation</label>
              <Input
                type="text"
                placeholder="Filter by operation..."
                value={searchFilters.operation}
                onChange={(e) => handleSearchFilter('operation', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Work Center</label>
              <Input
                type="text"
                placeholder="Filter by work center..."
                value={searchFilters.workCenter}
                onChange={(e) => handleSearchFilter('workCenter', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={searchFilters.status}
                onChange={(e) => handleSearchFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Work Orders Analysis Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Orders Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Detailed analysis of work order operations and performance</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operation</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Work Center</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Duration</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Real Duration</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkOrders.length > 0 ? (
                  filteredWorkOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order.operation}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.workCenter}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.finishedProduct}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">1</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.expectedDuration}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 dark:text-white">{order.realDuration}</span>
                          {order.isRunning && (
                            <button className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
          </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 lg:px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {searchTerm || Object.values(searchFilters).some(filter => filter)
                          ? 'No work orders found matching your search criteria.'
                          : 'No work orders available.'}
                      </div>
                    </td>
                  </tr>
                )}

                {/* Summary Row */}
                {filteredWorkOrders.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-300 dark:border-gray-600">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Total</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{filteredWorkOrders.length} Orders</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">-</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{filteredWorkOrders.length}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{totals.expectedDuration}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{totals.realDuration}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">-</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Analysis Summary Cards */}
        {filteredWorkOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredWorkOrders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Duration</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totals.expectedDuration}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Duration</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totals.realDuration}</p>
                </div>
              </div>
        </div>
        
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filteredWorkOrders.length > 0
                      ? Math.round((filteredWorkOrders.filter(order => order.status === 'Done').length / filteredWorkOrders.length) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Elegant Ape</span>
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkOrdersAnalysis
