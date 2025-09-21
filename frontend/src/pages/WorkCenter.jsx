import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import WorkCenterForm from '../components/WorkCenterForm'
import ConfirmDialog from '../components/ConfirmDialog'
import workCentersData from '@/data/workCenters.json'
import toast from 'react-hot-toast'

const WorkCentersContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('card') // 'list' or 'card'
  const [showForm, setShowForm] = useState(false)
  const [editingWorkCenter, setEditingWorkCenter] = useState(null)
  const [workCenters, setWorkCenters] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [workCenterToDelete, setWorkCenterToDelete] = useState(null)

  // Load initial data
  useEffect(() => {
    setWorkCenters(workCentersData.workCenters)
  }, [])

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

  const handleDeleteWorkCenter = (workCenter) => {
    setWorkCenterToDelete(workCenter)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!workCenterToDelete) return

    try {
      setLoading(true)
      
      // Show loading toast
      toast.loading('Deleting work center...', { id: 'delete-workcenter' })
      
      // Simulate API call to delete from database
      // In a real app, you would call your backend API here
      console.log('Deleting work center from database:', workCenterToDelete.id)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove from frontend state
      setWorkCenters(prevCenters => prevCenters.filter(center => center.id !== workCenterToDelete.id))
      
      toast.success('Work center deleted successfully', { id: 'delete-workcenter' })
    } catch (error) {
      console.error('Error deleting work center:', error)
      toast.error('Failed to delete work center', { id: 'delete-workcenter' })
    } finally {
      setLoading(false)
      setWorkCenterToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false)
    setWorkCenterToDelete(null)
  }

  const handleSaveWorkCenter = async (formData) => {
    try {
      setLoading(true)
      
      if (editingWorkCenter) {
        toast.loading('Updating work center...', { id: 'save-workcenter' })
        console.log('Updating work center in database:', formData)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        setWorkCenters(prevCenters => 
          prevCenters.map(center => 
            center.id === editingWorkCenter.id 
              ? { ...center, ...formData, id: editingWorkCenter.id }
              : center
          )
        )
        toast.success('Work center updated successfully', { id: 'save-workcenter' })
      } else {
        toast.loading('Creating work center...', { id: 'save-workcenter' })
        console.log('Creating new work center in database:', formData)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        const newId = `WC-${String(workCenters.length + 1).padStart(3, '0')}`
        setWorkCenters(prevCenters => [...prevCenters, { ...formData, id: newId }])
        toast.success('Work center created successfully', { id: 'save-workcenter' })
      }
      handleCloseForm()
    } catch (error) {
      console.error('Error saving work center:', error)
      toast.error('Failed to save work center', { id: 'save-workcenter' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Work Center</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">Manage work centers and their operational costs</p>
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
                  placeholder="Search by work center..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allow user to search based on work center</p> */}
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

        {/* Work Centers Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Centers</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage work center operations and costs</p>
          </div>
          
          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Work Center</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cost per hour
                      <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal mt-1">Hourly processing cost</span>
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Efficiency</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredWorkCenters.length > 0 ? (
                    filteredWorkCenters.map((center) => (
                      <tr key={center.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{center.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{center.description}</div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">Rs.{center.costPerHour}</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{center.capacity} units</div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-900 mr-2">{center.efficiency}%</div>
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteWorkCenter(center)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 lg:px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                          {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
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
                {filteredWorkCenters.length > 0 ? (
                  filteredWorkCenters.map((center) => (
                    <div key={center.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{center.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{center.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Cost/Hour:</span>
                          <span className="text-gray-900 dark:text-white">Rs.{center.costPerHour}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                          <span className="text-gray-900 dark:text-white">{center.capacity} units</span>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Efficiency:</span>
                            <span className="text-gray-900 dark:text-white">{center.efficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${center.efficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button 
                          onClick={() => handleEditWorkCenter(center)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteWorkCenter(center)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-gray-500 text-sm">
                      {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work Center Form Modal */}
      {showForm && (
        <WorkCenterForm 
          isOpen={showForm}
          onClose={handleCloseForm}
          editingWorkCenter={editingWorkCenter}
          onSave={handleSaveWorkCenter}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Work Center"
        description={`Are you sure you want to delete "${workCenterToDelete?.name}"?\n\nThis action cannot be undone and will permanently remove the work center from your system.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}

export default WorkCentersContent