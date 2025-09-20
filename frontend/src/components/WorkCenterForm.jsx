import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const WorkCenterForm = ({ isOpen, onClose, editingWorkCenter }) => {
  const [formData, setFormData] = useState({
    name: '',
    costPerHour: '',
    description: '',
    capacity: '',
    efficiency: ''
  })

  useEffect(() => {
    if (editingWorkCenter) {
      setFormData({
        name: editingWorkCenter.name || '',
        costPerHour: editingWorkCenter.costPerHour || '',
        description: editingWorkCenter.description || '',
        capacity: editingWorkCenter.capacity || '',
        efficiency: editingWorkCenter.efficiency || ''
      })
    } else {
      setFormData({
        name: '',
        costPerHour: '',
        description: '',
        capacity: '',
        efficiency: ''
      })
    }
  }, [editingWorkCenter])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // Here you would typically save the data to your backend
    console.log('Saving Work Center:', formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingWorkCenter ? 'Edit Work Center' : 'New Work Center'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingWorkCenter ? `Editing ${editingWorkCenter.name}` : 'Create a new work center'}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Work Center Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Work Center -1"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="costPerHour" className="text-sm font-medium text-gray-700">
                Cost per Hour ($)
              </Label>
              <Input
                id="costPerHour"
                type="number"
                value={formData.costPerHour}
                onChange={(e) => handleInputChange('costPerHour', e.target.value)}
                placeholder="50"
                min="0"
                step="0.01"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Hourly processing cost</p>
            </div>

            <div>
              <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                Capacity (units)
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="8"
                min="1"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="efficiency" className="text-sm font-medium text-gray-700">
                Efficiency (%)
              </Label>
              <Input
                id="efficiency"
                type="number"
                value={formData.efficiency}
                onChange={(e) => handleInputChange('efficiency', e.target.value)}
                placeholder="95"
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter work center description..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Preview Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 font-medium">{formData.name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Cost/Hour:</span>
                <span className="ml-2 font-medium">${formData.costPerHour || '0'}</span>
              </div>
              <div>
                <span className="text-gray-500">Capacity:</span>
                <span className="ml-2 font-medium">{formData.capacity || '0'} units</span>
              </div>
              <div>
                <span className="text-gray-500">Efficiency:</span>
                <span className="ml-2 font-medium">{formData.efficiency || '0'}%</span>
              </div>
            </div>
            {formData.description && (
              <div className="mt-3">
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm text-gray-700 mt-1">{formData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkCenterForm