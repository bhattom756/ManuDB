import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import toast from 'react-hot-toast'

const BillOfMaterialsForm = ({ isOpen, onClose, editingBOM, onSave, loading = false }) => {
  const [activeTab, setActiveTab] = useState('components') // 'components' or 'workorders'
  const [formData, setFormData] = useState({
    bomCode: '',
    finishedProduct: '',
    quantityProduced: 1,
    version: '',
    isActive: true,
    components: [],
    workOrders: []
  })

  const [newComponent, setNewComponent] = useState({
    product: '',
    quantityToConsume: '',
    uom: ''
  })

  const [newWorkOrder, setNewWorkOrder] = useState({
    operationName: '',
    workCenter: '',
    durationPerUnit: '',
    sequence: 1
  })

  // Sample data for dropdowns
  const finishedProducts = [
    { value: 'dining-table', label: 'Dining Table' },
    { value: 'office-chair', label: 'Office Chair' },
    { value: 'bookshelf', label: 'Bookshelf' },
    { value: 'coffee-table', label: 'Coffee Table' }
  ]

  const rawMaterials = [
    { value: 'wooden-leg', label: 'Wooden Leg', uom: 'pcs', unitCost: 25 },
    { value: 'wooden-top', label: 'Wooden Top', uom: 'pcs', unitCost: 150 },
    { value: 'screws', label: 'Screws', uom: 'pcs', unitCost: 2 },
    { value: 'varnish', label: 'Varnish', uom: 'bottle', unitCost: 50 },
    { value: 'wood-glue', label: 'Wood Glue', uom: 'tube', unitCost: 15 },
    { value: 'sandpaper', label: 'Sandpaper', uom: 'sheet', unitCost: 5 }
  ]

  const workCenters = [
    { value: 'assembly-line', label: 'Assembly Line', costPerHour: 30 },
    { value: 'paint-floor', label: 'Paint Floor', costPerHour: 25 },
    { value: 'packaging-line', label: 'Packaging Line', costPerHour: 20 },
    { value: 'quality-control', label: 'Quality Control', costPerHour: 35 }
  ]

  useEffect(() => {
    if (editingBOM) {
      setFormData({
        bomCode: editingBOM.bomCode || `BOM-${String(editingBOM.id || 1).padStart(5, '0')}`,
        finishedProduct: editingBOM.finishedProduct || '',
        quantityProduced: editingBOM.quantityProduced || 1,
        version: editingBOM.version || '',
        isActive: editingBOM.isActive !== undefined ? editingBOM.isActive : true,
        components: editingBOM.components || [],
        workOrders: editingBOM.workOrders || []
      })
    } else {
      // Generate new BOM code
      const newBomCode = `BOM-${String(Date.now()).slice(-5)}`
      setFormData({
        bomCode: newBomCode,
        finishedProduct: '',
        quantityProduced: 1,
        version: '',
        isActive: true,
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
    console.log('Adding component with data:', newComponent)
    console.log('Validation check:', {
      product: !!newComponent.product,
      quantityToConsume: !!newComponent.quantityToConsume,
      quantityValue: parseFloat(newComponent.quantityToConsume),
      quantityValid: parseFloat(newComponent.quantityToConsume) > 0
    })
    
    if (newComponent.product && newComponent.quantityToConsume && parseFloat(newComponent.quantityToConsume) > 0) {
      const selectedMaterial = rawMaterials.find(m => m.value === newComponent.product)
      const componentToAdd = { 
        ...newComponent, 
        quantityToConsume: parseFloat(newComponent.quantityToConsume),
        uom: selectedMaterial?.uom || 'pcs',
        unitCost: selectedMaterial?.unitCost || 0
      }
      console.log('Component to add:', componentToAdd)
      
      setFormData(prev => ({
        ...prev,
        components: [...prev.components, componentToAdd]
      }))
      setNewComponent({ product: '', quantityToConsume: '', uom: '' })
    } else {
      toast.error('Please fill in all component fields with valid values')
    }
  }

  const handleRemoveComponent = (index) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }))
  }

  const handleAddWorkOrder = () => {
    console.log('Adding work order with data:', newWorkOrder)
    console.log('Validation check:', {
      operationName: !!newWorkOrder.operationName,
      workCenter: !!newWorkOrder.workCenter,
      durationPerUnit: !!newWorkOrder.durationPerUnit,
      durationValue: parseFloat(newWorkOrder.durationPerUnit),
      durationValid: parseFloat(newWorkOrder.durationPerUnit) > 0
    })
    
    if (newWorkOrder.operationName && newWorkOrder.workCenter && newWorkOrder.durationPerUnit && parseFloat(newWorkOrder.durationPerUnit) > 0) {
      const selectedWorkCenter = workCenters.find(wc => wc.value === newWorkOrder.workCenter)
      setFormData(prev => {
        const newSequence = prev.workOrders.length + 1
        return {
          ...prev,
          workOrders: [...prev.workOrders, { 
            ...newWorkOrder, 
            durationPerUnit: parseFloat(newWorkOrder.durationPerUnit),
            costPerHour: selectedWorkCenter?.costPerHour || 0
          }]
        }
      })
      setNewWorkOrder({ 
        operationName: '', 
        workCenter: '', 
        durationPerUnit: '', 
        sequence: formData.workOrders.length + 2 
      })
    } else {
      toast.error('Please fill in all work order fields with valid values')
    }
  }

  const handleRemoveWorkOrder = (index) => {
    setFormData(prev => ({
      ...prev,
      workOrders: prev.workOrders.filter((_, i) => i !== index)
    }))
  }

  const calculateTotalCost = () => {
    const componentCost = formData.components.reduce((total, comp) => 
      total + (comp.quantityToConsume * (comp.unitCost || 0)), 0
    )
    
    const workOrderCost = formData.workOrders.reduce((total, wo) => 
      total + ((wo.durationPerUnit / 60) * (wo.costPerHour || 0)), 0
    )
    
    return componentCost + workOrderCost
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.finishedProduct) {
      toast.error('Finished Product is required')
      return
    }
    if (!formData.quantityProduced || parseFloat(formData.quantityProduced) <= 0) {
      toast.error('Quantity Produced must be greater than 0')
      return
    }
    if (!formData.components || formData.components.length === 0) {
      toast.error('At least one component is required')
      return
    }
    if (!formData.workOrders || formData.workOrders.length === 0) {
      toast.error('At least one work order is required')
      return
    }

    if (onSave) {
      await onSave(formData)
    } else {
      console.log('Saving BOM (fallback):', formData)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingBOM ? 'Edit Bill of Materials' : 'New Bill of Materials'}
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Header Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">BOM Header</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">BOM Code</Label>
                <Input
                  value={formData.bomCode}
                  disabled
                  className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Finished Product *</Label>
                <Select
                  options={finishedProducts}
                  value={formData.finishedProduct}
                  onChange={(value) => handleInputChange('finishedProduct', value)}
                  placeholder="Select finished product"
                  searchable={true}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity Produced *</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.quantityProduced}
                  onChange={(e) => handleInputChange('quantityProduced', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Version</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  placeholder="e.g., v1.0"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Is Active
              </Label>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'components'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Components ({formData.components.length})
              </button>
              <button
                onClick={() => setActiveTab('workorders')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'workorders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Work Orders ({formData.workOrders.length})
              </button>
            </div>

            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Raw Materials & Components</h4>
                </div>
                
                {/* Add Component Form */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product *</Label>
                      <Select
                        options={rawMaterials}
                        value={newComponent.product}
                        onChange={(value) => {
                          const selected = rawMaterials.find(m => m.value === value)
                          setNewComponent({
                            ...newComponent,
                            product: value,
                            uom: selected?.uom || ''
                          })
                        }}
                        placeholder="Select raw material"
                        searchable={true}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity to Consume *</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newComponent.quantityToConsume}
                        onChange={(e) => setNewComponent({ ...newComponent, quantityToConsume: e.target.value })}
                        placeholder="0.00"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">UoM</Label>
                      <Input
                        value={newComponent.uom}
                        disabled
                        className="bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddComponent}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Component
                  </Button>
                </div>

                {/* Components List */}
                <div className="space-y-2">
                  {formData.components.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <div>Product</div>
                      <div>Quantity</div>
                      <div>Unit Cost</div>
                      <div>Total Cost</div>
                    </div>
                  )}
                  {formData.components.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No components added yet
                    </div>
                  ) : (
                    formData.components.map((component, index) => {
                      console.log(`Rendering component ${index}:`, component)
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {rawMaterials.find(m => m.value === component.product)?.label || component.product}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                Qty: {component.quantityToConsume || 0} {component.uom || 'pcs'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Rs.{component.unitCost?.toFixed(2) || '0.00'} per {component.uom || 'pcs'}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                Total: Rs.{((component.quantityToConsume || 0) * (component.unitCost || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveComponent(index)}
                            variant="outline"
                            size="sm"
                            className="ml-4 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* Work Orders Tab */}
            {activeTab === 'workorders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Manufacturing Operations</h4>
                </div>
                
                {/* Add Work Order Form */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Operation Name *</Label>
                      <Input
                        value={newWorkOrder.operationName}
                        onChange={(e) => setNewWorkOrder({ ...newWorkOrder, operationName: e.target.value })}
                        placeholder="e.g., Assembly, Painting"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Center *</Label>
                      <Select
                        options={workCenters}
                        value={newWorkOrder.workCenter}
                        onChange={(value) => setNewWorkOrder({ ...newWorkOrder, workCenter: value })}
                        placeholder="Select work center"
                        searchable={true}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration per Unit (min) *</Label>
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={newWorkOrder.durationPerUnit}
                        onChange={(e) => setNewWorkOrder({ ...newWorkOrder, durationPerUnit: e.target.value })}
                        placeholder="60"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sequence</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newWorkOrder.sequence}
                        onChange={(e) => setNewWorkOrder({ ...newWorkOrder, sequence: parseInt(e.target.value) || 1 })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAddWorkOrder}
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    Add Work Order
                  </Button>
                </div>

                {/* Work Orders List */}
                <div className="space-y-2">
                  {formData.workOrders
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((workOrder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {workOrder.operationName}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {workCenters.find(wc => wc.value === workOrder.workCenter)?.label || workOrder.workCenter}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {workOrder.durationPerUnit} min
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Seq: {workOrder.sequence}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Rs.{((workOrder.durationPerUnit / 60) * (workOrder.costPerHour || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveWorkOrder(index)}
                        variant="outline"
                        size="sm"
                        className="ml-4 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calculated Fields */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Cost Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Total Component Cost:</span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  Rs.{formData.components.reduce((total, comp) => 
                    total + (comp.quantityToConsume * (comp.unitCost || 0)), 0
                  ).toFixed(2)}
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillOfMaterialsForm