import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import toast from 'react-hot-toast'

const StockLedgerForm = ({ isOpen, onClose, editingStockItem, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    productType: '',
    unitOfMeasure: '',
    unitCost: '',
    openingStock: '',
    totalValue: '',
    category: '',
    reorderLevel: '',
    description: ''
  })

  // Dropdown options
  const productTypeOptions = [
    { value: 'raw-material', label: 'Raw Material' },
    { value: 'finished-good', label: 'Finished Good' },
    { value: 'consumable', label: 'Consumable' }
  ]

  const unitOfMeasureOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'liters', label: 'Liters (L)' },
    { value: 'meters', label: 'Meters (m)' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'sets', label: 'Sets' },
    { value: 'units', label: 'Units' },
    { value: 'pounds', label: 'Pounds (lbs)' },
    { value: 'gallons', label: 'Gallons (gal)' }
  ]

  const categoryOptions = [
    { value: 'wood', label: 'Wood' },
    { value: 'paint', label: 'Paint' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'finished-product', label: 'Finished Product' },
    { value: 'tools', label: 'Tools' },
    { value: 'consumables', label: 'Consumables' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'electronics', label: 'Electronics' }
  ]

  useEffect(() => {
    if (editingStockItem) {
      setFormData({
        productName: editingStockItem.productName || editingStockItem.product || '',
        sku: editingStockItem.sku || '',
        productType: editingStockItem.productType || '',
        unitOfMeasure: editingStockItem.unitOfMeasure || editingStockItem.unit || '',
        unitCost: editingStockItem.unitCost || '',
        openingStock: editingStockItem.openingStock || editingStockItem.onHand || '',
        totalValue: editingStockItem.totalValue || '',
        category: editingStockItem.category || '',
        reorderLevel: editingStockItem.reorderLevel || '',
        description: editingStockItem.description || ''
      })
    } else {
      setFormData({
        productName: '',
        sku: '',
        productType: '',
        unitOfMeasure: '',
        unitCost: '',
        openingStock: '',
        totalValue: '',
        category: '',
        reorderLevel: '',
        description: ''
      })
    }
  }, [editingStockItem])

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    
    // Calculate total value when unit cost or opening stock changes
    if (field === 'unitCost' || field === 'openingStock') {
      const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : parseFloat(newFormData.unitCost) || 0
      const openingStock = field === 'openingStock' ? parseFloat(value) || 0 : parseFloat(newFormData.openingStock) || 0
      newFormData.totalValue = (unitCost * openingStock).toString()
    }
    
    setFormData(newFormData)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.productName.trim()) {
      toast.error('Product Name is required')
      return
    }
    if (!formData.sku.trim()) {
      toast.error('SKU/Code is required')
      return
    }
    if (!formData.productType) {
      toast.error('Product Type is required')
      return
    }
    if (!formData.unitOfMeasure) {
      toast.error('Unit of Measure is required')
      return
    }
    if (!formData.openingStock || formData.openingStock <= 0) {
      toast.error('Opening Stock must be greater than 0')
      return
    }

    // Call the parent's save handler
    if (onSave) {
      await onSave(formData)
    } else {
      // Fallback for backward compatibility
      console.log('Saving Stock Item:', formData)
      onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingStockItem ? 'Edit Stock Item' : 'New Stock Item'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editingStockItem ? `Editing ${editingStockItem.product}` : 'Add a new item to stock ledger'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name *
                </Label>
                <Input
                  id="productName"
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  placeholder="e.g. Wooden Leg"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="sku" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SKU / Code *
                </Label>
                <Input
                  id="sku"
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="e.g. LEG-001"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unique product identifier</p>
              </div>

              <div>
                <Label htmlFor="productType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Type *
                </Label>
                <Select
                  options={productTypeOptions}
                  value={formData.productType}
                  onChange={(value) => handleInputChange('productType', value)}
                  placeholder="Select product type"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit of Measure *
                </Label>
                <Select
                  options={unitOfMeasureOptions}
                  value={formData.unitOfMeasure}
                  onChange={(value) => handleInputChange('unitOfMeasure', value)}
                  placeholder="Select unit of measure"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unitCost" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit Cost
                </Label>
                <Input
                  id="unitCost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost per unit (optional)</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="openingStock" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opening Stock *
                </Label>
                <Input
                  id="openingStock"
                  type="number"
                  value={formData.openingStock}
                  onChange={(e) => handleInputChange('openingStock', e.target.value)}
                  placeholder="e.g. 100"
                  min="0"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Starting balance</p>
              </div>

              <div>
                <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Value
                </Label>
                <Input
                  id="totalValue"
                  type="text"
                  value={formData.totalValue ? formatCurrency(parseFloat(formData.totalValue)) : ''}
                  readOnly
                  className="mt-1 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-calculated: Opening Stock × Unit Cost</p>
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </Label>
                <Select
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value) => handleInputChange('category', value)}
                  placeholder="Select category"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional categorization</p>
              </div>

              <div>
                <Label htmlFor="reorderLevel" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reorder Level
                </Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                  placeholder="e.g. 20"
                  min="0"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alert when stock falls below this level</p>
              </div>
            </div>
          </div>

          {/* Description Field - Full Width */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional details about the product..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional notes and details</p>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Product:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.productName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.sku || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {productTypeOptions.find(opt => opt.value === formData.productType)?.label || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Unit Cost:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.unitCost ? formatCurrency(parseFloat(formData.unitCost)) : '₹0'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Opening Stock:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.openingStock || '0'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Total Value:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.totalValue ? formatCurrency(parseFloat(formData.totalValue)) : '₹0'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {categoryOptions.find(opt => opt.value === formData.category)?.label || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Reorder Level:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.reorderLevel || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockLedgerForm