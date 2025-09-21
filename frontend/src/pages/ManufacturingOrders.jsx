import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/Sidebar'
import ManufacturingOrderPopup from '@/components/ManufacturingOrderPopup'
import { manufacturingOrderAPI } from '@/services/api'
import toast from 'react-hot-toast'

export default function ManufacturingOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedRows, setSelectedRows] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [manufacturingOrderOpen, setManufacturingOrderOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [manufacturingOrders, setManufacturingOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusCounts, setStatusCounts] = useState({
    All: {},
    My: {}
  })

  // Fetch manufacturing orders from both API and localStorage
  const fetchManufacturingOrders = async () => {
    try {
      setLoading(true)
      
      // Fetch from API
      let apiOrders = []
      try {
        const response = await manufacturingOrderAPI.getManufacturingOrders({
          status: selectedFilter === 'All' ? undefined : selectedFilter,
          search: searchTerm
        })
        apiOrders = response || []
      } catch (apiError) {
        console.log('API not available, using local data only')
        apiOrders = []
      }
      
      // Fetch from localStorage
      const localOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
      
      // Combine and deduplicate orders (API takes precedence)
      const apiOrderIds = new Set(apiOrders.map(order => order.id))
      const uniqueLocalOrders = localOrders.filter(order => !apiOrderIds.has(order.id))
      
      const allOrders = [...apiOrders, ...uniqueLocalOrders]
      
      // Apply search filter
      let filteredOrders = allOrders
      if (searchTerm) {
        filteredOrders = allOrders.filter(order => 
          (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.productName && order.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.finishedProduct && order.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      
      // Apply status filter
      if (selectedFilter !== 'All') {
        filteredOrders = filteredOrders.filter(order => 
          (order.status || 'DRAFT').toUpperCase() === selectedFilter.toUpperCase()
        )
      }
      
      setManufacturingOrders(filteredOrders)
      
      // Calculate status counts from all orders (not just filtered)
      const allCounts = {}
      const myCounts = {}
      
      allOrders.forEach(order => {
        const status = order.status || 'DRAFT'
        allCounts[status] = (allCounts[status] || 0) + 1
        
        // For "My" counts, you might want to filter by current user
        // For now, we'll use the same counts
        myCounts[status] = (myCounts[status] || 0) + 1
      })
      
      setStatusCounts({
        All: allCounts,
        My: myCounts
      })
    } catch (error) {
      console.error('Error fetching manufacturing orders:', error)
      toast.error('Failed to fetch manufacturing orders')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchManufacturingOrders()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedFilter])

  // Initial fetch
  useEffect(() => {
    fetchManufacturingOrders()
  }, [])

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <ManufacturingOrderPopup
        isOpen={manufacturingOrderOpen}
        orderId={editingOrderId}
        onClose={() => {
          setManufacturingOrderOpen(false)
          setEditingOrderId(null)
          fetchManufacturingOrders() // Refresh data
        }}
      />

      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">Manufacturing Orders</div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-400 dark:text-pink-300">
            Manufacturing Orders Management
          </h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
          <Button
            onClick={() => {
              setEditingOrderId(null)
              setManufacturingOrderOpen(true)
            }}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            New Manufacturing Order
          </Button>
            <Button
              onClick={fetchManufacturingOrders}
              className="bg-gray-500 hover:bg-gray-600 text-white"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Manufacturing Orders"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="flex space-x-2">
              <button className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-400 dark:text-pink-300">All</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === 'All'
                      ? 'bg-pink-500 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                  }`}
                  onClick={() => setSelectedFilter('All')}
                >
                  All ({manufacturingOrders.length})
                </button>
                {Object.entries(statusCounts.All).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === status
                        ? 'bg-pink-500 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                    }`}
                    onClick={() => setSelectedFilter(status)}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-pink-400 dark:text-pink-300">My</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === 'My'
                      ? 'bg-pink-500 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                  }`}
                  onClick={() => setSelectedFilter('My')}
                >
                  My ({manufacturingOrders.length})
                </button>
                {Object.entries(statusCounts.My).map(([status, count]) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === `My-${status}`
                        ? 'bg-pink-500 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                    }`}
                    onClick={() => setSelectedFilter(`My-${status}`)}
                  >
                    {count} {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === manufacturingOrders.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Finished Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Component Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assignee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">State</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                        <span className="ml-2">Loading manufacturing orders...</span>
                      </div>
                    </td>
                  </tr>
                ) : manufacturingOrders.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No manufacturing orders found
                    </td>
                  </tr>
                ) : (
                  manufacturingOrders.map((order) => {
                    const isLocalOrder = order.createdAt && !order.updatedAt // Local orders have createdAt but no updatedAt
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(order.id)}
                        onChange={() => handleRowSelect(order.id)}
                            className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <span>{order.orderNumber || order.id}</span>
                            {isLocalOrder && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                                Local
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.startDate ? new Date(order.startDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.productName || order.finishedProduct || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.bom ? 'Available' : 'Not Available'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.quantity || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.unit || 'Units'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {order.assignee?.name || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : order.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : order.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                              : order.status === 'CLOSED'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {order.status || 'Draft'}
                          </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setEditingOrderId(order.id)
                            setManufacturingOrderOpen(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Implement delete functionality
                            console.log('Delete order:', order.id)
                          }}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
