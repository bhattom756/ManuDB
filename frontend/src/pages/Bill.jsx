import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/Sidebar'

export default function Bill() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedRows, setSelectedRows] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sample data for bills of materials
  const billsOfMaterials = [
    {
      id: 'BOM-000001',
      reference: 'BOM-000001',
      product: 'Dining Table',
      version: '1.0',
      status: 'Active',
      components: '5',
      totalCost: '$150.00',
      lastUpdated: '2024-01-15'
    },
    {
      id: 'BOM-000002',
      reference: 'BOM-000002',
      product: 'Drawer',
      version: '2.1',
      status: 'Draft',
      components: '3',
      totalCost: '$75.00',
      lastUpdated: '2024-01-14'
    }
  ]

  const statusCounts = {
    All: {
      Draft: 4,
      Active: 12,
      'In Review': 3,
      Archived: 2
    },
    My: {
      Draft: 2,
      Active: 8,
      'In Review': 1
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
      selectedRows.length === billsOfMaterials.length 
        ? [] 
        : billsOfMaterials.map(order => order.id)
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
              <div className="text-lg font-semibold">Bills of Materials</div>
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
            Bills of Materials
          </h1>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            New Bill of Materials
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Bills of Materials"
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
                      checked={selectedRows.length === billsOfMaterials.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-800 text-pink-500 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Version</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Components</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {billsOfMaterials.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(bill.id)}
                        onChange={() => handleRowSelect(bill.id)}
                        className="rounded border-gray-300 bg-white text-pink-500 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.product}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.version}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.status}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.components}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.totalCost}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.lastUpdated}</td>
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