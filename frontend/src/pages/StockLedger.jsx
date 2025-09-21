import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StockLedgerForm from '../components/StockLedgerForm'
import ConfirmDialog from '../components/ConfirmDialog'
import stockLedgerData from '@/data/stockLedger.json'
import toast from 'react-hot-toast'

const StockLedger = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('card') // 'list' or 'card'
  const [showForm, setShowForm] = useState(false)
  const [editingStockItem, setEditingStockItem] = useState(null)
  const [stockItems, setStockItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Load initial data
  useEffect(() => {
    setStockItems(stockLedgerData.stockItems)
  }, [])

  const filteredStockItems = stockItems.filter(item => 
    (item.productName || item.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.unitOfMeasure || item.unit || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewStockItem = () => {
    setEditingStockItem(null)
    setShowForm(true)
  }

  const handleEditStockItem = (stockItem) => {
    setEditingStockItem(stockItem)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStockItem(null)
  }

  const handleDeleteStockItem = (item) => {
    setItemToDelete(item)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      setLoading(true)
      
      // Show loading toast
      toast.loading('Deleting stock item...', { id: 'delete-item' })
      
      // Simulate API call to delete from database
      // In a real app, you would call your backend API here
      console.log('Deleting item from database:', itemToDelete.id)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from frontend state
      setStockItems(prevItems => prevItems.filter(stockItem => stockItem.id !== itemToDelete.id))
      
      toast.success('Stock item deleted successfully', { id: 'delete-item' })
    } catch (error) {
      console.error('Error deleting stock item:', error)
      toast.error('Failed to delete stock item', { id: 'delete-item' })
    } finally {
      setLoading(false)
      setItemToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setItemToDelete(null)
  }

  const handleSaveStockItem = async (formData) => {
    try {
      setLoading(true)
      
      if (editingStockItem) {
        // Update existing item
        console.log('Updating item in database:', formData)
        
        // Show loading toast
        toast.loading('Updating stock item...', { id: 'save-item' })
        
        // Simulate API call to update in database
        // In a real app, you would call your backend API here
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update in frontend state
        setStockItems(prevItems => 
          prevItems.map(item => 
            item.id === editingStockItem.id 
              ? { ...item, ...formData, id: editingStockItem.id }
              : item
          )
        )
        
        toast.success('Stock item updated successfully', { id: 'save-item' })
      } else {
        // Create new item
        console.log('Creating new item in database:', formData)
        
        // Show loading toast
        toast.loading('Creating stock item...', { id: 'save-item' })
        
        // Simulate API call to create in database
        // In a real app, you would call your backend API here
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Generate new ID (in real app, this would come from the backend)
        const newId = `ST-${String(stockItems.length + 1).padStart(3, '0')}`
        
        // Add to frontend state
        setStockItems(prevItems => [...prevItems, { ...formData, id: newId }])
        
        toast.success('Stock item created successfully', { id: 'save-item' })
      }
      
      handleCloseForm()
    } catch (error) {
      console.error('Error saving stock item:', error)
      toast.error('Failed to save stock item', { id: 'save-item' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Stock Ledger</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">Manage inventory and track stock levels</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleNewStockItem}
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
                  placeholder="Search by product name, SKU, or unit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allow user to search based on Product, unit</p> */}
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

        {/* Stock Ledger Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Ledger</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track inventory levels and stock movements</p>
          </div>
          
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opening Stock</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Value</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reorder Level</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStockItems.length > 0 ? (
                    filteredStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.productName || item.product}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">{item.sku || '-'}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.productType === 'raw-material' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            item.productType === 'finished-good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            item.productType === 'consumable' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.productType === 'raw-material' ? 'Raw Material' :
                             item.productType === 'finished-good' ? 'Finished Good' :
                             item.productType === 'consumable' ? 'Consumable' : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.unitOfMeasure || item.unit}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.unitCost)}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.openingStock || item.onHand}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(item.totalValue)}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.category || '-'}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{item.reorderLevel || '-'}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditStockItem(item)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteStockItem(item)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 lg:px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                          {searchTerm ? 'No stock items found matching your search.' : 'No stock items available.'}
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
                {filteredStockItems.length > 0 ? (
                  filteredStockItems.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.productName || item.product}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-mono">{item.sku || 'No SKU'}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            item.productType === 'raw-material' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            item.productType === 'finished-good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            item.productType === 'consumable' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.productType === 'raw-material' ? 'Raw Material' :
                             item.productType === 'finished-good' ? 'Finished Good' :
                             item.productType === 'consumable' ? 'Consumable' : 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Unit:</span>
                          <span className="text-gray-900 dark:text-white">{item.unitOfMeasure || item.unit}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Unit Cost:</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(item.unitCost)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Opening Stock:</span>
                          <span className="text-gray-900 dark:text-white">{item.openingStock || item.onHand}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Total Value:</span>
                          <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(item.totalValue)}</span>
                        </div>
                        
                        {item.category && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Category:</span>
                            <span className="text-gray-900 dark:text-white">{item.category}</span>
                          </div>
                        )}
                        
                        {item.reorderLevel && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Reorder Level:</span>
                            <span className="text-gray-900 dark:text-white">{item.reorderLevel}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button 
                          onClick={() => handleEditStockItem(item)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteStockItem(item)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 text-sm">
                      {searchTerm ? 'No stock items found matching your search.' : 'No stock items available.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Branding */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>Adorable Wallaby</span>
          </div>
        </div>
      </div>

      {/* Stock Ledger Form Modal */}
      {showForm && (
        <StockLedgerForm 
          isOpen={showForm}
          onClose={handleCloseForm}
          editingStockItem={editingStockItem}
          onSave={handleSaveStockItem}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Stock Item"
        description={`Are you sure you want to delete "${itemToDelete?.productName || itemToDelete?.product}"?\n\nThis action cannot be undone and will permanently remove the item from your inventory.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default StockLedger