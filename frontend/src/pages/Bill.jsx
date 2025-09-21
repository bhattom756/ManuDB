import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BillOfMaterialsForm from '../components/BillForm'
import ConfirmDialog from '../components/ConfirmDialog'
import billsOfMaterialsData from '@/data/billsOfMaterials.json'
import toast from 'react-hot-toast'

const BillsOfMaterialsContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('card') // 'list' or 'card'
  const [showForm, setShowForm] = useState(false)
  const [editingBOM, setEditingBOM] = useState(null)
  const [billsOfMaterials, setBillsOfMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [bomToDelete, setBomToDelete] = useState(null)

  // Load initial data
  useEffect(() => {
    setBillsOfMaterials(billsOfMaterialsData.billsOfMaterials)
  }, [])

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

  const handleDeleteBOM = (bom) => {
    setBomToDelete(bom)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!bomToDelete) return

    try {
      setLoading(true)
      
      // Show loading toast
      toast.loading('Deleting bill of materials...', { id: 'delete-bom' })
      
      // Simulate API call to delete from database
      // In a real app, you would call your backend API here
      console.log('Deleting BOM from database:', bomToDelete.id)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from frontend state
      setBillsOfMaterials(prevBOMs => prevBOMs.filter(bom => bom.id !== bomToDelete.id))
      
      toast.success('Bill of materials deleted successfully', { id: 'delete-bom' })
    } catch (error) {
      console.error('Error deleting bill of materials:', error)
      toast.error('Failed to delete bill of materials', { id: 'delete-bom' })
    } finally {
      setLoading(false)
      setBomToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setBomToDelete(null)
  }

  const handleSaveBOM = async (formData) => {
    try {
      setLoading(true)
      
      if (editingBOM) {
        toast.loading('Updating bill of materials...', { id: 'save-bom' })
        console.log('Updating BOM in database:', formData)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        setBillsOfMaterials(prevBOMs => 
          prevBOMs.map(bom => 
            bom.id === editingBOM.id 
              ? { ...bom, ...formData, id: editingBOM.id }
              : bom
          )
        )
        toast.success('Bill of materials updated successfully', { id: 'save-bom' })
      } else {
        toast.loading('Creating bill of materials...', { id: 'save-bom' })
        console.log('Creating new BOM in database:', formData)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        const newId = `BOM-${String(billsOfMaterials.length + 1).padStart(3, '0')}`
        setBillsOfMaterials(prevBOMs => [...prevBOMs, { ...formData, id: newId }])
        toast.success('Bill of materials created successfully', { id: 'save-bom' })
      }
      handleCloseForm()
    } catch (error) {
      console.error('Error saving bill of materials:', error)
      toast.error('Failed to save bill of materials', { id: 'save-bom' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Bills of Materials</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">Manage product components and manufacturing specifications</p>
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
                  placeholder="Search by finished product..."
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
                  className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bills of Materials Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bills of Materials</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage product components and manufacturing specifications</p>
          </div>
          
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Finished Product</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Components</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBOMs.length > 0 ? (
                    filteredBOMs.map((bom) => (
                      <tr key={bom.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{bom.finishedProduct}</div>
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
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteBOM(bom)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 lg:px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                          {searchTerm ? 'No bills of materials found matching your search.' : 'No bills of materials available.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredBOMs.length > 0 ? (
                  filteredBOMs.map((bom) => (
                    <div key={bom.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{bom.finishedProduct}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{bom.reference}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                          <span className="text-gray-900 dark:text-white">{bom.quantity}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Components:</span>
                          <span className="text-gray-900 dark:text-white">{bom.components.length}</span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Components:</span>
                          <div className="mt-1 space-y-1">
                            {bom.components.slice(0, 2).map((component, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-300">
                                • {component.product} ({component.quantity})
                              </div>
                            ))}
                            {bom.components.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{bom.components.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button 
                          onClick={() => handleEditBOM(bom)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBOM(bom)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 text-sm">
                      {searchTerm ? 'No bills of materials found matching your search.' : 'No bills of materials available.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="flex justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Brisk Goat</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
          onSave={handleSaveBOM}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Bill of Materials"
        description={`Are you sure you want to delete "${bomToDelete?.finishedProduct}"?\n\nThis action cannot be undone and will permanently remove the bill of materials from your system.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default BillsOfMaterialsContent