import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import WorkCenterForm from '../components/WorkCenterForm'

const WorkCentersContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'
  const [showForm, setShowForm] = useState(false)
  const [editingWorkCenter, setEditingWorkCenter] = useState(null)

  // Sample Work Centers data
  const workCenters = [
    {
      id: 'WC-001',
      name: 'Work Center -1',
      costPerHour: 50,
      description: 'Main assembly line for furniture production',
      capacity: 8,
      efficiency: 95
    },
    {
      id: 'WC-002',
      name: 'Work Center -2',
      costPerHour: 45,
      description: 'Quality control and finishing station',
      capacity: 6,
      efficiency: 92
    },
    {
      id: 'WC-003',
      name: 'Work Center -3',
      costPerHour: 60,
      description: 'Heavy machinery and cutting operations',
      capacity: 4,
      efficiency: 88
    },
    {
      id: 'WC-004',
      name: 'Work Center -4',
      costPerHour: 35,
      description: 'Packaging and shipping preparation',
      capacity: 10,
      efficiency: 98
    }
  ]

  const filteredWorkCenters = workCenters.filter(center => 
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewWorkCenter = () => {
    setEditingWorkCenter(null)
    setShowForm(true)
  }

  const handleEditWorkCenter = (workCenter) => {
    setEditingWorkCenter(workCenter)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingWorkCenter(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Work Center</h1>
              <p className="text-gray-600 mt-1 text-sm lg:text-base">Manage work centers and their operational costs</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleNewWorkCenter}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search by work center..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Allow user to search based on work center</p>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-1 lg:space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Work Centers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Work Centers</h3>
            <p className="text-sm text-gray-600">Manage work center operations and costs</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Center</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost per hour
                    <span className="block text-xs text-gray-400 font-normal mt-1">Hourly processing cost</span>
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkCenters.length > 0 ? (
                  filteredWorkCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{center.name}</div>
                          <div className="text-xs text-gray-500">{center.description}</div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${center.costPerHour}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{center.capacity} units</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900 mr-2">{center.efficiency}%</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${center.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditWorkCenter(center)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 lg:px-6 py-12 text-center">
                      <div className="text-gray-500 text-sm">
                        {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Work Center Form Modal */}
      {showForm && (
        <WorkCenterForm 
          isOpen={showForm}
          onClose={handleCloseForm}
          editingWorkCenter={editingWorkCenter}
        />
      )}
    </div>
  )
}

export default WorkCentersContent