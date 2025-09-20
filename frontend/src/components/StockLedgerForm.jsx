import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const StockLedgerForm = ({ isOpen, onClose, editingStockItem }) => {
  const [formData, setFormData] = useState({
    product: '',
    unitCost: '',
    unit: '',
    totalValue: '',
    onHand: '',
    freeToUse: '',
    incoming: '',
    outgoing: ''
  })

  const unitOptions = ['Unit', 'Piece', 'Kg', 'Meter', 'Liter', 'Box', 'Set']

  useEffect(() => {
    if (editingStockItem) {
      setFormData({
        product: editingStockItem.product || '',
        unitCost: editingStockItem.unitCost || '',
        unit: editingStockItem.unit || '',
        totalValue: editingStockItem.totalValue || '',
        onHand: editingStockItem.onHand || '',
        freeToUse: editingStockItem.freeToUse || '',
        incoming: editingStockItem.incoming || '',
        outgoing: editingStockItem.outgoing || ''
      })
    } else {
      setFormData({
        product: '',
        unitCost: '',
        unit: '',
        totalValue: '',
        onHand: '',
        freeToUse: '',
        incoming: '',
        outgoing: ''
      })
    }
  }, [editingStockItem])

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value }
    
    // Calculate total value when unit cost or on hand changes
    if (field === 'unitCost' || field === 'onHand') {
      const unitCost = field === 'unitCost' ? parseFloat(value) || 0 : parseFloat(newFormData.unitCost) || 0
      const onHand = field === 'onHand' ? parseFloat(value) || 0 : parseFloat(newFormData.onHand) || 0
      newFormData.totalValue = (unitCost * onHand).toString()
    }
    
    setFormData(newFormData)
  }

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving Stock Item:', formData)
    onClose()
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingStockItem ? 'Edit Stock Item' : 'New Stock Item'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingStockItem ? `Editing ${editingStockItem.product}` : 'Add a new item to stock ledger'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="product" className="text-sm font-medium text-gray-700">
                  Product
                </Label>
                <Input
                  id="product"
                  type="text"
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unitCost" className="text-sm font-medium text-gray-700">
                  Unit Cost
                </Label>
                <Input
                  id="unitCost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                  Unit
                </Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Selection field</p>
              </div>

              <div>
                <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                  Total Value
                </Label>
                <Input
                  id="totalValue"
                  type="text"
                  value={formData.totalValue ? formatCurrency(parseFloat(formData.totalValue)) : ''}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Readonly: on Hand * unit cost</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="onHand" className="text-sm font-medium text-gray-700">
                  On Hand
                </Label>
                <Input
                  id="onHand"
                  type="number"
                  value={formData.onHand}
                  onChange={(e) => handleInputChange('onHand', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="freeToUse" className="text-sm font-medium text-gray-700">
                  Free to Use
                </Label>
                <Input
                  id="freeToUse"
                  type="number"
                  value={formData.freeToUse}
                  onChange={(e) => handleInputChange('freeToUse', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="outgoing" className="text-sm font-medium text-gray-700">
                  Outgoing
                </Label>
                <Input
                  id="outgoing"
                  type="number"
                  value={formData.outgoing}
                  onChange={(e) => handleInputChange('outgoing', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="incoming" className="text-sm font-medium text-gray-700">
                  Incoming
                </Label>
                <Input
                  id="incoming"
                  type="number"
                  value={formData.incoming}
                  onChange={(e) => handleInputChange('incoming', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Product:</span>
                <span className="ml-2 font-medium">{formData.product || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Unit Cost:</span>
                <span className="ml-2 font-medium">{formData.unitCost ? formatCurrency(parseFloat(formData.unitCost)) : '₹0'}</span>
              </div>
              <div>
                <span className="text-gray-500">On Hand:</span>
                <span className="ml-2 font-medium">{formData.onHand || '0'}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Value:</span>
                <span className="ml-2 font-medium">{formData.totalValue ? formatCurrency(parseFloat(formData.totalValue)) : '₹0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockLedgerForm