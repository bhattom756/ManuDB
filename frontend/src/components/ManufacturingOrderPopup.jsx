import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const ManufacturingOrderPopup = ({ isOpen, onClose }) => {
  const [activeStatus, setActiveStatus] = useState('Draft')
  const [formData, setFormData] = useState({
    orderId: 'MO-000001',
    finishedProduct: '',
    quantity: '',
    billOfMaterial: '',
    scheduleDate: '',
    assignee: ''
  })

  const statusTabs = ['Draft', 'Confirmed', 'In-Progress', 'To Close', 'Done']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleConfirm = () => {
    console.log('Manufacturing Order Confirmed:', formData)
    // TODO: Add API call to save manufacturing order
    onClose()
  }

  const handleBack = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Blur Overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Manufacturing Order Popup */}
      <div className="fixed inset-4 bg-white rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900">
            Manufacturing Order
          </h1>
          
          <div className="flex items-center space-x-4">
            {/* Play Icon */}
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            {/* Action Buttons based on status */}
            {activeStatus === 'Draft' ? (
              <>
                <Button 
                  onClick={handleConfirm}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  Confirm
                </Button>
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Back
                </Button>
              </>
            ) : (
              <>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  Produce
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Start
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Cancel
                </Button>
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Back
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeStatus === status
                  ? 'bg-pink-500 text-white border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6 bg-gray-50 h-full overflow-y-auto">
          {/* Manufacturing Order Details */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manufacturing Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Order ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-900 font-mono">{formData.orderId}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Always auto generate, when clicked on new and number should follow the sequence
                  </p>
                </div>

                {/* Finished Product */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Finished product *
                  </label>
                  <Input
                    type="text"
                    placeholder="Select finished product"
                    value={formData.finishedProduct}
                    onChange={(e) => handleInputChange('finishedProduct', e.target.value)}
                    className="border-b-2 border-gray-300 rounded-none bg-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Drop Down, manyZone field, selection should be from product master
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="border-b-2 border-gray-300 rounded-none bg-transparent flex-1"
                    />
                    <span className="text-gray-700">Units</span>
                  </div>
                </div>

                {/* Bill of Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill of Material
                  </label>
                  <Input
                    type="text"
                    placeholder="Select bill of material"
                    value={formData.billOfMaterial}
                    onChange={(e) => handleInputChange('billOfMaterial', e.target.value)}
                    className="border-b-2 border-gray-300 rounded-none bg-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Non Mandatory Field Drop Down, manyZone Field, selection should be from bills of materials master, 
                    if bill of material is selected first, it should auto populate the finished product, quantity, 
                    components and work orders based on bill of material selected
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Schedule Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                    className="border-b-2 border-gray-300 rounded-none bg-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Open calendar to allow user to select date
                  </p>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  <Input
                    type="text"
                    placeholder="Select assignee"
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    className="border-b-2 border-gray-300 rounded-none bg-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Drop down of user for selection, manyZone field
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Components and Work Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Components Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Components</h3>
              
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-2 mb-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                <div>Components</div>
                <div>Availability</div>
                <div>To Consume</div>
                <div>Units</div>
                <div>Consumed</div>
                <div>Units</div>
              </div>

              {/* Add Product Button */}
              <div className="mb-4">
                <button className="text-pink-500 hover:text-pink-600 text-sm font-medium">
                  Add a product
                </button>
              </div>

              {/* Empty Rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 mb-2">
                  <div className="border-b border-gray-200 h-8"></div>
                  <div className="border-b border-gray-200 h-8"></div>
                  <div className="border-b border-gray-200 h-8"></div>
                  <div className="border-b border-gray-200 h-8"></div>
                  <div className="border-b border-gray-200 h-8"></div>
                  <div className="border-b border-gray-200 h-8"></div>
                </div>
              ))}
            </div>

            {/* Work Orders Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Work Orders</h3>
              
              {/* Empty Rows */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="border-b border-gray-200 h-8 mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManufacturingOrderPopup
