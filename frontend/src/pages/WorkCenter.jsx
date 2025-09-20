import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/Sidebar'

export default function WorkCenter() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedRows, setSelectedRows] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sample data for work centers
  const workCenters = [
    {
      id: 'WC-000001',
      name: 'Assembly Line 1',
      type: 'Assembly',
      status: 'Active',
      capacity: '100%',
      efficiency: '95%',
      location: 'Building A',
      supervisor: 'John Smith'
    },
    {
      id: 'WC-000002',
      name: 'Cutting Station',
      type: 'Cutting',
      status: 'Maintenance',
      capacity: '0%',
      efficiency: '0%',
      location: 'Building B',
      supervisor: 'Jane Doe'
    }
  ]

  const statusCounts = {
    All: {
      Active: 8,
      Maintenance: 2,
      Inactive: 1,
      'Under Construction': 1
    },
    My: {
      Active: 5,
      Maintenance: 1
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
      selectedRows.length === workCenters.length 
        ? [] 
        : workCenters.map(order => order.id)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold">Work Center</div>
            </div>

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-400">
            Work Center
          </h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            New Work Center
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Work Centers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="mb-6">
          <div className="flex space-x-8">
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
                      checked={selectedRows.length === workCenters.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Capacity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Efficiency</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workCenters.map((center) => (
                  <tr key={center.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(center.id)}
                        onChange={() => handleRowSelect(center.id)}
                        className="rounded border-gray-300 bg-white text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.capacity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.efficiency}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{center.supervisor}</td>
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