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
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingWorkCenter ? 'Edit Work Center' : 'New Work Center'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {editingWorkCenter ? `Editing ${editingWorkCenter.name}` : 'Create a new work center'}
            </p>
          </div>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
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
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Work Center Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Work Center -1"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="costPerHour" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hourly processing cost</p>
            </div>

            <div>
              <Label htmlFor="capacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Capacity (units)
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="8"
                min="1"
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="efficiency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter work center description..."
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Preview Card */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Cost/Hour:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">${formData.costPerHour || '0'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.capacity || '0'} units</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Efficiency:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{formData.efficiency || '0'}%</span>
              </div>
            </div>
            {formData.description && (
              <div className="mt-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Description:</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{formData.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkCenterForm