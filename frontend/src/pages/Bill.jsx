import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BillOfMaterialsForm from '../components/BillForm'

const BillsOfMaterialsContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
  const [showForm, setShowForm] = useState(false)
  const [editingBOM, setEditingBOM] = useState(null)

  // Sample Bills of Materials data
  const billsOfMaterials = [
    {
      id: 'BOM-000001',
      finishedProduct: 'Drawer',
      reference: '[8001]',
      quantity: 1,
      components: [
        { product: 'Wood Panel', quantity: 2 },
        { product: 'Screws', quantity: 8 }
      ],
      workOrders: [
        { operation: 'Assembly', workCenter: 'Assembly Line 1', duration: '2:00' }
      ]
    },
    {
      id: 'BOM-000002',
      finishedProduct: 'Office Chair',
      reference: '[8002]',
      quantity: 1,
      components: [
        { product: 'Seat Cushion', quantity: 1 },
        { product: 'Back Rest', quantity: 1 },
        { product: 'Base Frame', quantity: 1 }
      ],
      workOrders: [
        { operation: 'Assembly', workCenter: 'Assembly Line 2', duration: '3:30' }
      ]
    },
    {
      id: 'BOM-000003',
      finishedProduct: 'Dining Table',
      reference: '[8003]',
      quantity: 1,
      components: [
        { product: 'Table Top', quantity: 1 },
        { product: 'Table Legs', quantity: 4 },
        { product: 'Hardware Kit', quantity: 1 }
      ],
      workOrders: [
        { operation: 'Assembly', workCenter: 'Assembly Line 3', duration: '4:00' }
      ]
    }
  ]

  const filteredBOMs = billsOfMaterials.filter(bom => 
    bom.finishedProduct.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewBOM = () => {
    setEditingBOM(null)
    setShowForm(true)
  }

  const handleEditBOM = (bom) => {
    setEditingBOM(bom)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBOM(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bills of Materials</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage product components and manufacturing specifications</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleNewBOM}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg text-sm lg:text-base px-4 py-2 lg:px-6 lg:py-3"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New
              </Button>
            </div>
          </div>
        </div>

        {/* Search and View Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search by finished product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bills of Materials Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bills of Materials</h3>
            <p className="text-sm text-gray-600">Manage product components and manufacturing specifications</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finished Product</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Components</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBOMs.length > 0 ? (
                  filteredBOMs.map((bom) => (
                    <tr key={bom.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bom.finishedProduct}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bom.reference}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bom.quantity}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bom.components.length} components</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditBOM(bom)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 lg:px-6 py-12 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm ? 'No bills of materials found matching your search.' : 'No bills of materials available.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branding */}
        <div className="flex justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Brisk Goat</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Beneficial Stork</span>
          </div>
        </div>
      </div>

      {/* Bill of Materials Form Modal */}
      {showForm && (
        <BillOfMaterialsForm 
          isOpen={showForm}
          onClose={handleCloseForm}
          editingBOM={editingBOM}
        />
      )}
    </div>
  )
}

export default BillsOfMaterialsContent