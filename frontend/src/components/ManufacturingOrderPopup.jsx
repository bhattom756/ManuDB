import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ManufacturingOrderPopup = ({ isOpen, onClose }) => {
  const [activeStatus, setActiveStatus] = useState('Confirmed')
  const [activeTab, setActiveTab] = useState('workorders')
  const [formData, setFormData] = useState({
    orderId: 'MO-000001',
    finishedProduct: '',
    quantity: '',
    billOfMaterial: '',
    scheduleDate: '',
    assignee: ''
                                                                                                                                                                                                                                                                                        
  })

  // Work Orders data
  const [workOrders, setWorkOrders] = useState([
    {
      id: 1,
      operation: 'Assembly-1',
      workCenter: 'Work Center-1',
      duration: '60:00',
      realDuration: '00:00',
      status: 'To Do',
      isRunning: false,
      startTime: null
    }
  ])

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

  // Work Order timer functions
  const startTimer = (workOrderId) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: true, 
            startTime: Date.now(),
            status: 'In-progress'
          }
        : order
    ))
  }

  const pauseTimer = (workOrderId) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
            realDuration: calculateDuration(order.startTime, Date.now())
          }
        : order
    ))
  }

  const stopTimer = (workOrderId) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
            realDuration: calculateDuration(order.startTime, Date.now()),
            status: 'Done'
          }
        : order
    ))
  }

  const cancelWorkOrder = (workOrderId) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
            status: 'Cancelled'
          }
        : order
    ))
  }

  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return '00:00'
    const diff = endTime - startTime
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const addWorkOrderLine = () => {
    const newWorkOrder = {
      id: workOrders.length + 1,
      operation: `Operation-${workOrders.length + 1}`,
      workCenter: `Work Center-${workOrders.length + 1}`,
      duration: '00:00',
      realDuration: '00:00',
      status: 'To Do',
      isRunning: false,
      startTime: null
    }
    setWorkOrders(prev => [...prev, newWorkOrder])
  }

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-800',
      'In-progress': 'bg-blue-100 text-blue-800',
      'Done': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Blur Overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Manufacturing Order Popup */}
      <div className="fixed inset-4 bg-white rounded-lg shadow-2xl z-50 overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Manufacturing Order
            </h1>
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center space-x-3">
            {activeStatus === 'Confirmed' ? (
              <>
                <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2">
                  Produce
                </Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2">
                  Start
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2">
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleConfirm}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2"
              >
                Confirm
              </Button>
            )}
            <Button 
              onClick={handleBack}
              variant="outline"
              className="border-gray-300 hover:bg-gray-100 px-6 py-2"
            >
              Back
            </Button>
            {/* <div className="text-xs text-gray-500 ml-2">
              Back Button leads to main dashboard
            </div> */}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeStatus === status
                  ? 'bg-pink-100 text-pink-600 border-pink-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="p-6 bg-gray-50 h-full overflow-y-auto">
          {/* Order Details Section */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Order Identification & Product Details */}
              <div className="space-y-6">
                {/* Order Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Order Number
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-900 font-mono text-lg">{formData.orderId}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Always auto generate, when clicked on new and number should follow the sequence
                  </p>
                </div>

                {/* Finished Product */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Finished product *
                  </Label>
                  <Input
                    type="text"
                    placeholder="Select finished product"
                    value={formData.finishedProduct}
                    onChange={(e) => handleInputChange('finishedProduct', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Drop Down, many2one field, selection should be from product master.
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Quantity *
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-gray-700 font-medium">Units</span>
                  </div>
                </div>

                {/* Bill of Material */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Bill of Material
                  </Label>
                  <Input
                    type="text"
                    placeholder="Select bill of material"
                    value={formData.billOfMaterial}
                    onChange={(e) => handleInputChange('billOfMaterial', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Non Mandatory Field Drop Down, many2one Field, selection should be from Bill of materials master. 
                    If bill of material is selected first, it should auto populate the finished product, quantity, 
                    components and work orders based on bill of material selected.
                  </p>
                </div>
              </div>

              {/* Right Column - Scheduling & Assignment */}
              <div className="space-y-6">
                {/* Schedule Date */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Schedule Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Open calendar to allow user to select date
                  </p>
                </div>

                {/* Assignee */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Assignee
                  </Label>
                  <Input
                    type="text"
                    placeholder="Select assignee"
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Drop down of user for selection, many2one field
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Components and Work Orders Section */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'components'
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('workorders')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'workorders'
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Work Orders
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'components' ? (
                <div>
                  {/* Components Table Header */}
                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-3">
                    <div>Components</div>
                    <div>Availability</div>
                    <div>To Consume</div>
                    <div>Units</div>
                  </div>

                  {/* Add Product Button */}
                  <div className="mb-4">
                    <button className="text-pink-500 hover:text-pink-600 text-sm font-medium border border-pink-200 rounded px-3 py-1 hover:bg-pink-50">
                      Add a product
                    </button>
                  </div>

                  {/* Empty Rows */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 mb-3">
                      <div className="border-b border-gray-200 h-10"></div>
                      <div className="border-b border-gray-200 h-10"></div>
                      <div className="border-b border-gray-200 h-10"></div>
                      <div className="border-b border-gray-200 h-10"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {/* Work Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operations</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.operation}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.workCenter}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{order.duration}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-900">{order.realDuration}</span>
                                {order.status === 'To Do' && (
                                  <button
                                    onClick={() => startTimer(order.id)}
                                    className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
                                    title="Start Timer"
                                  >
                                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </button>
                                )}
                                {order.status === 'In-progress' && (
                                  <button
                                    onClick={() => pauseTimer(order.id)}
                                    className="w-6 h-6 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center text-white"
                                    title="Pause Timer"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                    </svg>
                                  </button>
                                )}
                                {order.status === 'In-progress' && (
                                  <button
                                    onClick={() => stopTimer(order.id)}
                                    className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
                                    title="Mark as Done"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                  </button>
                                )}
                                {order.status === 'To Do' && (
                                  <button
                                    onClick={() => cancelWorkOrder(order.id)}
                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                                    title="Cancel"
                                  >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add a line button */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                    <button 
                      onClick={addWorkOrderLine}
                      className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                    >
                      Add a line
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Timer and Status Controls:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <span>Start Button - Start Real Duration Timer</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                          </div>
                          <span>Pause Button - Pause the Real Duration Timer</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                          <span>Done - Stop Timer and mark as Done</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                          </div>
                          <span>Cancel - Mark operation as Cancelled</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {/* <h5 className="text-xs font-semibold text-gray-700 mb-2">Status Definitions:</h5> */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        <div><strong>To Do:</strong> When Operation is not yet started</div>
                        <div><strong>In-progress:</strong> When Operation real duration value is more than 1sec and not yet marked as done</div>
                        <div><strong>Done:</strong> When Done is clicked</div>
                        <div><strong>Cancelled:</strong> When Cancelled button is clicked</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManufacturingOrderPopup
