import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const BillOfMaterialsForm = ({ isOpen, onClose, editingBOM }) => {
  const [activeTab, setActiveTab] = useState('components') // 'components' or 'workorders'
  const [formData, setFormData] = useState({
    finishedProduct: '',
    quantity: '',
    reference: '',
    components: [],
    workOrders: []
  })

  const [newComponent, setNewComponent] = useState({
    product: '',
    toConsume: '',
    units: 'Units'
  })

  const [newWorkOrder, setNewWorkOrder] = useState({
    workCenter: '',
    expectedDuration: ''
  })

  useEffect(() => {
    if (editingBOM) {
      setFormData({
        finishedProduct: editingBOM.finishedProduct || '',
        quantity: editingBOM.quantity || '',
        reference: editingBOM.reference || '',
        components: editingBOM.components || [],
        workOrders: editingBOM.workOrders || []
      })
    } else {
      setFormData({
        finishedProduct: '',
        quantity: '',
        reference: '',
        components: [],
        workOrders: []
      })
    }
  }, [editingBOM])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddComponent = () => {
    if (newComponent.product && newComponent.toConsume) {
      setFormData(prev => ({
        ...prev,
        components: [...prev.components, { ...newComponent, toConsume: parseFloat(newComponent.toConsume) }]
      }))
      setNewComponent({ product: '', toConsume: '', units: 'Units' })
    }
  }

  const handleRemoveComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }))
  }

  const handleAddWorkOrder = () => {
    if (newWorkOrder.workCenter && newWorkOrder.expectedDuration) {
      setFormData(prev => ({
        ...prev,
        workOrders: [...prev.workOrders, { ...newWorkOrder }]
      }))
      setNewWorkOrder({ workCenter: '', expectedDuration: '' })
    }
  }

  const handleRemoveWorkOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      workOrders: prev.workOrders.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving BOM:', formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Bill of Materials</h2>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border-2 border-dashed border-blue-300"
            >
              Save
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* BOM ID */}
          <div className="flex items-center">
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 px-4 py-2 rounded-lg">
              <span className="text-lg font-bold text-gray-900">
                {editingBOM ? editingBOM.id : 'BOM-000001'}
              </span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="finishedProduct" className="text-sm font-medium text-gray-700 block mb-2">
                Finished product
              </Label>
              <div className="border-b-2 border-gray-300 pb-1">
                <Input
                  id="finishedProduct"
                  type="text"
                  value={formData.finishedProduct}
                  onChange={(e) => handleInputChange('finishedProduct', e.target.value)}
                  placeholder="Select from stock ledger"
                  className="border-0 p-0 focus:ring-0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Many2one field, fetch from stock ledger</p>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 block mb-2">
                Quantity
              </Label>
              <div className="flex items-center">
                <div className="border-b-2 border-gray-300 pb-1 flex-1">
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="1"
                    className="border-0 p-0 focus:ring-0"
                  />
                </div>
                <span className="ml-2 text-sm text-gray-600">Units</span>
              </div>
            </div>

            <div>
              <Label htmlFor="reference" className="text-sm font-medium text-gray-700 block mb-2">
                Reference
              </Label>
              <div className="border-b-2 border-gray-300 pb-1">
                <Input
                  id="reference"
                  type="text"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  placeholder="[8001]"
                  maxLength={8}
                  className="border-0 p-0 focus:ring-0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Text field, allow no more than 8 character</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'components'
                  ? 'border-blue-500 text-blue-600 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'workorders'
                  ? 'border-blue-500 text-blue-600 bg-gray-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Work Orders
            </button>
          </div>

          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Components</h3>
                <Button
                  onClick={handleAddComponent}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Add a product
                </Button>
              </div>

              {/* Add Component Form */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Product</Label>
                    <Input
                      type="text"
                      value={newComponent.product}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, product: e.target.value }))}
                      placeholder="Enter product name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">To consume</Label>
                    <Input
                      type="number"
                      value={newComponent.toConsume}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, toConsume: e.target.value }))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">numeric field, float value &gt;0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Units</Label>
                    <Input
                      type="text"
                      value={newComponent.units}
                      onChange={(e) => setNewComponent(prev => ({ ...prev, units: e.target.value }))}
                      placeholder="Units"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComponent}
                    disabled={!newComponent.product || !newComponent.toConsume}
                  >
                    Add Component
                  </Button>
                </div>
              </div>

              {/* Components List */}
              <div className="space-y-2">
                {formData.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{component.product}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">{component.toConsume}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">{component.units}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveComponent(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {formData.components.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p>No components added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Orders Tab */}
          {activeTab === 'workorders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Work Orders</h3>
                <Button
                  onClick={handleAddWorkOrder}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Add a line
                </Button>
              </div>

              {/* Add Work Order Form */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Work Center</Label>
                    <Input
                      type="text"
                      value={newWorkOrder.workCenter}
                      onChange={(e) => setNewWorkOrder(prev => ({ ...prev, workCenter: e.target.value }))}
                      placeholder="Enter work center"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Expected Duration</Label>
                    <Input
                      type="text"
                      value={newWorkOrder.expectedDuration}
                      onChange={(e) => setNewWorkOrder(prev => ({ ...prev, expectedDuration: e.target.value }))}
                      placeholder="2:00"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddWorkOrder}
                    disabled={!newWorkOrder.workCenter || !newWorkOrder.expectedDuration}
                  >
                    Add Work Order
                  </Button>
                </div>
              </div>

              {/* Work Orders List */}
              <div className="space-y-2">
                {formData.workOrders.map((workOrder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{workOrder.workCenter}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Duration: {workOrder.expectedDuration}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveWorkOrder(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {formData.workOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p>No work orders added yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Annotation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> On New Button, Create a template which can be used in manufacturing orders. 
              All fields of BOM should be populated on manufacturing order, if BOM is selected on manufacturing order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillOfMaterialsForm