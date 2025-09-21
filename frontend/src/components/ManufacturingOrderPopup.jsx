import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { manufacturingOrderAPI, productAPI, bomAPI, workOrderAPI, workCenterAPI, userAPI } from '@/services/api'
import toast from 'react-hot-toast'

const ManufacturingOrderPopup = ({ isOpen, onClose, orderId = null }) => {
  // Manufacturing Order State Management
  const [moState, setMoState] = useState('DRAFT') // DRAFT, CONFIRMED, IN_PROGRESS, DONE, CANCELLED
  const [activeTab, setActiveTab] = useState('workorders')
  const [formData, setFormData] = useState({
    orderId: '',
    finishedProduct: '',
    quantity: '',
    billOfMaterial: '',
    scheduleDate: '',
    assignee: '',
    deadline: '',
    priority: 'MEDIUM'
  })

  // Generate order number on component mount
  useEffect(() => {
    if (isOpen && !orderId) {
      // Generate order number in format MO-000001, MO-000002, etc.
      const generateOrderNumber = () => {
        const existingOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
        const nextNumber = existingOrders.length + 1
        return `MO-${nextNumber.toString().padStart(6, '0')}`
      }
      
      setFormData(prev => ({
        ...prev,
        orderId: generateOrderNumber()
      }))
    }
  }, [isOpen, orderId])

  // Dynamic data states
  const [workOrders, setWorkOrders] = useState([])
  const [products, setProducts] = useState([])
  const [boms, setBoms] = useState([])
  const [workCentersData, setWorkCentersData] = useState([])
  const [users, setUsers] = useState([])
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newComponent, setNewComponent] = useState({
    productId: '',
    quantity: '',
    unit: 'Units'
  })

  // Real-time timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkOrders(prev => prev.map(order => {
        if (order.isRunning && order.startTime) {
          const now = Date.now()
          const elapsed = now - order.startTime
          const totalElapsed = (order.accumulatedTime || 0) + elapsed
          return {
            ...order,
            realDuration: formatDuration(totalElapsed)
          }
        }
        return order
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Manufacturing Order States
  const moStates = {
    DRAFT: { label: 'Draft', color: 'gray', editable: true },
    CONFIRMED: { label: 'Confirmed', color: 'blue', editable: false },
    IN_PROGRESS: { label: 'In Progress', color: 'yellow', editable: false },
    DONE: { label: 'Done', color: 'green', editable: false },
    CANCELLED: { label: 'Cancelled', color: 'red', editable: false }
  }

  // Sample data for dropdowns
  const finishedProducts = [
    { value: 'dining-table', label: 'Dining Table' },
    { value: 'office-chair', label: 'Office Chair' },
    { value: 'bookshelf', label: 'Bookshelf' },
    { value: 'coffee-table', label: 'Coffee Table' },
    { value: 'wardrobe', label: 'Wardrobe' },
    { value: 'desk', label: 'Desk' },
    { value: 'drawer', label: 'Drawer' },
    { value: 'cabinet', label: 'Cabinet' }
  ]

  const billOfMaterials = [
    { value: 'bom-dining-table', label: 'BOM - Dining Table (Wood + Hardware)' },
    { value: 'bom-office-chair', label: 'BOM - Office Chair (Frame + Cushion + Wheels)' },
    { value: 'bom-bookshelf', label: 'BOM - Bookshelf (Wood + Brackets)' },
    { value: 'bom-coffee-table', label: 'BOM - Coffee Table (Glass + Wood)' },
    { value: 'bom-wardrobe', label: 'BOM - Wardrobe (Wood + Hinges + Rails)' },
    { value: 'bom-desk', label: 'BOM - Desk (Wood + Drawers + Hardware)' }
  ]

  const workCentersFallback = [
    { value: 'wc-1', label: 'Work Center-1' },
    { value: 'wc-2', label: 'Work Center-2' },
    { value: 'wc-3', label: 'Work Center-3' },
    { value: 'wc-4', label: 'Work Center-4' },
    { value: 'wc-5', label: 'Work Center-5' }
  ]

  const assignees = [
    { value: 'john-doe', label: 'John Doe (Production Manager)' },
    { value: 'jane-smith', label: 'Jane Smith (Team Lead)' },
    { value: 'mike-wilson', label: 'Mike Wilson (Senior Technician)' },
    { value: 'sarah-johnson', label: 'Sarah Johnson (Quality Inspector)' },
    { value: 'david-brown', label: 'David Brown (Assembly Specialist)' },
    { value: 'lisa-garcia', label: 'Lisa Garcia (Machine Operator)' },
    { value: 'tom-anderson', label: 'Tom Anderson (Supervisor)' },
    { value: 'emma-davis', label: 'Emma Davis (Technician)' }
  ]

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true)
      
      // Check if user is authenticated
      const token = localStorage.getItem('token')
      
      if (!token) {
        // If not authenticated, use fallback data immediately
        console.log('No authentication token found, using fallback data')
        setProducts(finishedProducts)
        setBoms(billOfMaterials)
        setWorkCentersData(workCentersFallback)
        setUsers(assignees)
        setLoading(false)
        return
      }

      // Try to fetch from API, but don't fail if it doesn't work
      const [productsRes, bomsRes, workCentersRes, usersRes] = await Promise.all([
        productAPI.getProducts().catch(err => {
          console.warn('Error fetching products, using fallback:', err.message)
          return []
        }),
        bomAPI.getBOMs().catch(err => {
          console.warn('Error fetching BOMs, using fallback:', err.message)
          return []
        }),
        workCenterAPI.getWorkCenters().catch(err => {
          console.warn('Error fetching work centers, using fallback:', err.message)
          return []
        }),
        userAPI.getUsers().catch(err => {
          console.warn('Error fetching users, using fallback:', err.message)
          return []
        })
      ])
      
      // Use API data if available, otherwise fall back to hardcoded data
      setProducts(productsRes.length > 0 ? productsRes : finishedProducts)
      setBoms(bomsRes.length > 0 ? bomsRes : billOfMaterials)
      setWorkCentersData(workCentersRes.length > 0 ? workCentersRes : workCentersFallback)
      setUsers(usersRes.length > 0 ? usersRes : assignees)
      
      console.log('Data loaded successfully')
    } catch (error) {
      console.error('Error fetching initial data:', error)
      // Don't show error toast, just use fallback data
      setProducts(finishedProducts)
      setBoms(billOfMaterials)
      setWorkCentersData(workCentersFallback)
      setUsers(assignees)
    } finally {
      setLoading(false)
    }
  }

  // Fetch manufacturing order data
  const fetchManufacturingOrder = async () => {
    if (!orderId) return
    
    try {
      setLoading(true)
      const order = await manufacturingOrderAPI.getManufacturingOrder(orderId)
      
      setFormData({
        orderId: order.orderNumber || order.id,
        finishedProduct: order.productId || '',
        quantity: order.quantity || '',
        billOfMaterial: order.bomId || '',
        scheduleDate: order.startDate || '',
        assignee: order.assigneeId || '',
        deadline: order.deadline || '',
        priority: order.priority || 'MEDIUM'
      })
      
      setMoState(order.status || 'DRAFT')
      
      const workOrdersRes = await workOrderAPI.getWorkOrders({ manufacturingOrderId: orderId })
      setWorkOrders(workOrdersRes)
      
      // Load components if they exist
      if (order.components) {
        setComponents(order.components)
      }
    } catch (error) {
      console.error('Error fetching manufacturing order:', error)
      toast.error('Failed to fetch manufacturing order')
    } finally {
      setLoading(false)
    }
  }

  // Auto-populate BOM components and work orders
  const populateFromBOM = async (bomId, quantity) => {
    if (!bomId || !quantity) return
    
    try {
      // Find the selected BOM
      const selectedBOM = boms.find(bom => (bom.id || bom.value) === bomId)
      if (!selectedBOM) return
      
      // Simulate BOM components (in real app, this would come from API)
      const bomComponents = {
        'bom-dining-table': [
          { productId: 'wood-plank', productName: 'Wood Plank', quantity: 2, unit: 'Pieces' },
          { productId: 'screws', productName: 'Screws', quantity: 20, unit: 'Pieces' },
          { productId: 'varnish', productName: 'Varnish', quantity: 1, unit: 'Liters' }
        ],
        'bom-office-chair': [
          { productId: 'chair-frame', productName: 'Chair Frame', quantity: 1, unit: 'Pieces' },
          { productId: 'cushion', productName: 'Cushion', quantity: 1, unit: 'Pieces' },
          { productId: 'wheels', productName: 'Wheels', quantity: 5, unit: 'Pieces' }
        ]
      }
      
      // Auto-populate components
      const components = (bomComponents[bomId] || []).map(comp => ({
        id: Date.now() + Math.random(),
        productId: comp.productId,
        productName: comp.productName,
        quantity: comp.quantity * quantity,
        unit: comp.unit,
        availability: 'Available',
        toConsume: comp.quantity * quantity
      }))
      setComponents(components)
      
      // Auto-generate work orders based on BOM operations
      const workOrders = [
    {
      id: 1,
          operation: 'Assembly',
          workCenter: 'Assembly Station',
          duration: '02:00',
      realDuration: '00:00',
          status: 'PLANNED',
      isRunning: false,
          startTime: null,
          accumulatedTime: 0
        },
        {
          id: 2,
          operation: 'Quality Check',
          workCenter: 'QC Station',
          duration: '00:30',
          realDuration: '00:00',
          status: 'PLANNED',
          isRunning: false,
          startTime: null,
          accumulatedTime: 0
        },
        {
          id: 3,
          operation: 'Packaging',
          workCenter: 'Packaging Station',
          duration: '00:45',
          realDuration: '00:00',
          status: 'PLANNED',
          isRunning: false,
          startTime: null,
          accumulatedTime: 0
        }
      ]
      setWorkOrders(workOrders)
      
      toast.success('BOM components and work orders auto-populated')
    } catch (error) {
      console.error('Error populating from BOM:', error)
    }
  }

  // Format duration helper
  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate duration helper
  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return '00:00'
    const elapsed = endTime - startTime
    return formatDuration(elapsed)
  }

  // Initialize data on component mount
  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      if (orderId) {
        fetchManufacturingOrder()
      }
    }
  }, [isOpen, orderId])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-populate fields when BOM is selected
    if (field === 'billOfMaterial' && value) {
      const selectedBOM = billOfMaterials.find(bom => bom.value === value)
      if (selectedBOM) {
        // Auto-populate finished product based on BOM
        const productKey = selectedBOM.value.replace('bom-', '')
        const matchingProduct = finishedProducts.find(product => product.value === productKey)
        
        if (matchingProduct) {
          setFormData(prev => ({
            ...prev,
            finishedProduct: matchingProduct.value,
            quantity: '1' // Default quantity
          }))
        }
        
        // Auto-populate BOM components and work orders
        populateFromBOM(value, 1)
      }
    }
    
    // Auto-populate BOM when quantity changes (if BOM is already selected)
    if (field === 'quantity' && value && formData.billOfMaterial) {
      populateFromBOM(formData.billOfMaterial, parseInt(value) || 1)
    }
  }

  // State transition functions
  const confirmMO = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before confirming')
      return
    }
    
    try {
      setLoading(true)
      setMoState('CONFIRMED')
      
      // Reserve stock (simulate)
      toast.success('Manufacturing Order confirmed! Stock reserved.')
      
      // Auto-populate BOM if not already done
      if (formData.billOfMaterial && components.length === 0) {
        await populateFromBOM(formData.billOfMaterial, parseInt(formData.quantity) || 1)
      }
      
      // Update localStorage and notify dashboard
      updateLocalStorageMO('CONFIRMED')
      
    } catch (error) {
      console.error('Error confirming MO:', error)
      toast.error('Failed to confirm manufacturing order')
    } finally {
      setLoading(false)
    }
  }
  
  const startProduction = async () => {
    try {
      setLoading(true)
      setMoState('IN_PROGRESS')
      
      // Update work orders to PLANNED status
      setWorkOrders(prev => prev.map(wo => ({
        ...wo,
        status: 'PLANNED'
      })))
      
      toast.success('Production started! Work orders are now available for operators.')
      
      // Update localStorage and notify dashboard
      updateLocalStorageMO('IN_PROGRESS')
    } catch (error) {
      console.error('Error starting production:', error)
      toast.error('Failed to start production')
    } finally {
      setLoading(false)
    }
  }
  
  const pauseProduction = async () => {
    try {
      setLoading(true)
      
      // Pause all running work orders
      setWorkOrders(prev => prev.map(wo => {
        if (wo.isRunning) {
          const now = Date.now()
          const elapsed = now - wo.startTime
          const totalElapsed = (wo.accumulatedTime || 0) + elapsed
          return {
            ...wo,
            isRunning: false,
            accumulatedTime: totalElapsed,
            realDuration: formatDuration(totalElapsed)
          }
        }
        return wo
      }))
      
      toast.success('Production paused')
    } catch (error) {
      console.error('Error pausing production:', error)
      toast.error('Failed to pause production')
    } finally {
      setLoading(false)
    }
  }
  
  const markAsDone = async () => {
    try {
      setLoading(true)
      setMoState('DONE')
      
      // Update stock ledger (simulate)
      toast.success('Manufacturing Order completed! Stock updated.')
      
      // Mark all work orders as completed
      const completedWorkOrders = workOrders.map(wo => ({
        ...wo,
        status: 'COMPLETED',
        isRunning: false
      }))
      setWorkOrders(completedWorkOrders)
      
      // Update localStorage and notify dashboard
      updateLocalStorageMO('DONE', completedWorkOrders)
      
    } catch (error) {
      console.error('Error marking as done:', error)
      toast.error('Failed to mark as done')
    } finally {
      setLoading(false)
    }
  }

  // Save current state function
  const saveCurrentState = async () => {
    try {
      setIsSaving(true)
      
      // Save current state to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
      const orderData = {
        id: formData.orderId,
        finishedProduct: formData.finishedProduct,
        quantity: formData.quantity,
        billOfMaterial: formData.billOfMaterial,
        scheduleDate: formData.scheduleDate,
        assignee: formData.assignee,
        deadline: formData.deadline,
        priority: formData.priority,
        status: moState,
        components: components,
        workOrders: workOrders,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      const updatedOrders = existingOrders.filter(order => order.id !== formData.orderId)
      updatedOrders.push(orderData)
      localStorage.setItem('localManufacturingOrders', JSON.stringify(updatedOrders))
      
      toast.success('Current state saved successfully!')
    } catch (error) {
      console.error('Error saving current state:', error)
      toast.error('Failed to save current state')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete manufacturing order
  const handleDelete = async () => {
    try {
      setLoading(true)
      
      // Remove from localStorage
      const existingOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
      const updatedOrders = existingOrders.filter(order => order.id !== formData.orderId)
      localStorage.setItem('localManufacturingOrders', JSON.stringify(updatedOrders))
      
      toast.success('Manufacturing order deleted successfully!')
      onClose()
    } catch (error) {
      console.error('Error deleting manufacturing order:', error)
      toast.error('Failed to delete manufacturing order')
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }
  
  const cancelMO = async () => {
    if (window.confirm('Are you sure you want to cancel this manufacturing order?')) {
      try {
        setLoading(true)
        setMoState('CANCELLED')
        
        // Stop all running work orders
        setWorkOrders(prev => prev.map(wo => ({
          ...wo,
          status: 'CANCELLED',
          isRunning: false
        })))
        
        toast.success('Manufacturing Order cancelled')
        
        // Dispatch custom event to notify dashboard of update
        window.dispatchEvent(new CustomEvent('manufacturingOrderUpdated'))
      } catch (error) {
        console.error('Error cancelling MO:', error)
        toast.error('Failed to cancel manufacturing order')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleConfirm = () => {
    if (moState === 'DRAFT') {
      confirmMO()
    } else {
      handleSave()
    }
  }

  const handleBack = () => {
    onClose()
  }

  // Work Order timer functions
  const startTimer = async (workOrderId) => {
    try {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: true, 
            startTime: Date.now(),
              status: 'IN_PROGRESS'
          }
        : order
    ))
      
      toast.success('Work order started')
      
      // Check if all work orders are completed
      checkMOCompletion()
    } catch (error) {
      console.error('Error starting timer:', error)
      toast.error('Failed to start work order')
    }
  }

  const pauseTimer = async (workOrderId) => {
    try {
      const workOrder = workOrders.find(order => order.id === workOrderId)
      if (workOrder && workOrder.startTime) {
        const now = Date.now()
        const elapsed = now - workOrder.startTime
        const totalElapsed = (workOrder.accumulatedTime || 0) + elapsed
        
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
            status: 'ON_HOLD',
            accumulatedTime: totalElapsed,
            realDuration: formatDuration(totalElapsed)
          }
        : order
    ))
        
        // Update local state only - no API call needed for demo
        toast.success('Work order paused')
      }
    } catch (error) {
      console.error('Error pausing timer:', error)
      toast.error('Failed to pause work order')
    }
  }

  const stopTimer = async (workOrderId) => {
    try {
      const workOrder = workOrders.find(order => order.id === workOrderId)
      if (workOrder && workOrder.startTime) {
        const now = Date.now()
        const elapsed = now - workOrder.startTime
        const totalElapsed = (workOrder.accumulatedTime || 0) + elapsed
        
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
                accumulatedTime: totalElapsed,
                realDuration: formatDuration(totalElapsed),
                status: 'COMPLETED'
          }
        : order
    ))
        
        toast.success('Work order completed')
        
        // Check if all work orders are completed
        checkMOCompletion()
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
      toast.error('Failed to complete work order')
    }
  }

  const cancelWorkOrder = async (workOrderId) => {
    try {
    setWorkOrders(prev => prev.map(order => 
      order.id === workOrderId 
        ? { 
            ...order, 
            isRunning: false,
              status: 'CANCELLED'
          }
        : order
    ))
      
      toast.success('Work order cancelled')
    } catch (error) {
      console.error('Error cancelling work order:', error)
      toast.error('Failed to cancel work order')
    }
  }

  // Check if all work orders are completed and auto-transition MO to DONE
  const checkMOCompletion = () => {
    const allCompleted = workOrders.every(wo => wo.status === 'COMPLETED')
    const hasWorkOrders = workOrders.length > 0
    
    if (allCompleted && hasWorkOrders && moState === 'IN_PROGRESS') {
      setTimeout(() => {
        markAsDone()
      }, 1000) // Small delay to show the completion
    }
  }

  // Update localStorage with current MO state
  const updateLocalStorageMO = (newState, updatedWorkOrders = workOrders) => {
    if (!orderId) return // Only update if this is an existing order
    
    try {
      const existingOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
      const orderIndex = existingOrders.findIndex(order => order.id === orderId)
      
      console.log('Updating localStorage MO:', { orderId, newState, orderIndex, existingOrders })
      
      if (orderIndex !== -1) {
        existingOrders[orderIndex] = {
          ...existingOrders[orderIndex],
          status: newState,
          workOrders: updatedWorkOrders
        }
        localStorage.setItem('localManufacturingOrders', JSON.stringify(existingOrders))
        console.log('Updated order in localStorage:', existingOrders[orderIndex])
        window.dispatchEvent(new CustomEvent('manufacturingOrderUpdated'))
      } else {
        console.log('Order not found in localStorage:', orderId)
      }
    } catch (error) {
      console.error('Error updating localStorage:', error)
    }
  }

  // Form validation
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.finishedProduct) {
      newErrors.finishedProduct = 'Finished product is required'
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    if (!formData.scheduleDate) {
      newErrors.scheduleDate = 'Schedule date is required'
    }
    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save manufacturing order
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      setLoading(true)
      
      // Check if user is authenticated and has real API data
      const token = localStorage.getItem('token')
      const hasRealData = products.length > 0 && products[0].id && !products[0].value
      
      if (!token || !hasRealData) {
        // If not authenticated or using fallback data, save locally
        console.log('Saving locally - no auth token or using fallback data')
        
        // Find assignee name from the selected ID
        const selectedAssignee = users.find(user => (user.id || user.value) === formData.assignee)
        const assigneeName = selectedAssignee ? (selectedAssignee.name || selectedAssignee.label) : 'Unassigned'
        
        const localOrderData = {
          orderNumber: formData.orderId,
          productId: formData.finishedProduct,
          quantity: formData.quantity ? parseInt(formData.quantity) : 1,
          bomId: formData.billOfMaterial,
          startDate: formData.scheduleDate,
          assigneeId: formData.assignee,
          assignee: {
            id: formData.assignee,
            name: assigneeName
          },
          status: moState,
          components: components,
          workOrders: workOrders,
          id: Date.now(),
          createdAt: new Date().toISOString()
        }
        
        const existingOrders = JSON.parse(localStorage.getItem('localManufacturingOrders') || '[]')
        existingOrders.push(localOrderData)
        localStorage.setItem('localManufacturingOrders', JSON.stringify(existingOrders))
        
        // Dispatch custom event to notify dashboard of update
        window.dispatchEvent(new CustomEvent('manufacturingOrderUpdated'))
        
        toast.success('Manufacturing order saved locally')
        onClose()
        return
      }

      // Prepare order data with proper field mapping for API (only if we have real data)
      const orderData = {
        orderNumber: formData.orderId,
        productId: formData.finishedProduct || null,
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
        bomId: formData.billOfMaterial || null,
        startDate: formData.scheduleDate || new Date().toISOString().split('T')[0],
        assigneeId: formData.assignee || null,
        status: moState
        // Remove components and workOrders from API call for now
        // These might need to be created separately
      }

      console.log('Saving manufacturing order with data:', orderData)

      if (orderId) {
        // Update existing order
        await manufacturingOrderAPI.updateManufacturingOrder(orderId, orderData)
        toast.success('Manufacturing order updated successfully')
      } else {
        // Create new order
        const result = await manufacturingOrderAPI.createManufacturingOrder(orderData)
        console.log('Created manufacturing order:', result)
        toast.success('Manufacturing order created successfully')
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving manufacturing order:', error)
      console.error('Error details:', error.response?.data)
      
      // If it's an auth error, suggest login
      if (error.response?.status === 401) {
        toast.error('Please log in to save manufacturing orders')
      } else if (error.response?.status === 400) {
        // Show validation errors
        const errorData = error.response?.data
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => err.message || err.msg).join(', ')
          toast.error(`Validation failed: ${errorMessages}`)
        } else {
          toast.error(`Failed to save manufacturing order: ${errorData?.message || error.message}`)
        }
      } else {
        toast.error(`Failed to save manufacturing order: ${error.response?.data?.message || error.message}`)
      }
    } finally {
      setLoading(false)
    }
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

  // Component management functions
  const addComponent = () => {
    if (!newComponent.productId || !newComponent.quantity) {
      toast.error('Please select a product and enter quantity')
      return
    }

    const selectedProduct = products.find(p => (p.id || p.value) === newComponent.productId)
    const component = {
      id: Date.now(), // Use timestamp for unique ID
      productId: newComponent.productId,
      productName: selectedProduct?.name || selectedProduct?.label || 'Unknown Product',
      quantity: parseFloat(newComponent.quantity),
      unit: newComponent.unit,
      availability: 'Available', // This would come from inventory check
      toConsume: parseFloat(newComponent.quantity)
    }

    setComponents(prev => [...prev, component])
    
    setNewComponent({ productId: '', quantity: '', unit: 'Units' })
    setShowAddProduct(false)
    toast.success('Component added successfully')
  }

  const removeComponent = (componentId) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId))
    toast.success('Component removed')
  }

  const getStatusColor = (status) => {
    const colors = {
      'PLANNED': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'ON_HOLD': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'To Do': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'In-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  if (!isOpen) return null

  return (
    <>
      {/* Blur Overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Manufacturing Order Popup */}
      <div className="fixed inset-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading form data...</span>
            </div>
          </div>
        )}
        {/* Header Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Left side - Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Manufacturing Order
            </h1>
            {products.length > 0 && products[0].value && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
          
          {/* Right side - Action Buttons */}
          <div className="flex items-center space-x-3">
             {/* Current State Badge */}
             <div className={`px-3 py-1 rounded-full text-sm font-medium ${
               moState === 'DRAFT' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
               moState === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
               moState === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
               moState === 'DONE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
               'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
             }`}>
               {moStates[moState]?.label || moState}
             </div>
             
             {/* Action Buttons based on state */}
             {moState === 'DRAFT' && (
               <Button 
                 onClick={confirmMO}
                 className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2"
               >
                 Confirm Order
               </Button>
             )}
             
             {moState === 'CONFIRMED' && (
               <>
                 <Button 
                   onClick={startProduction}
                   className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2"
                 >
                   Start Production
                </Button>
                 <Button 
                   onClick={saveCurrentState}
                   disabled={isSaving}
                   className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2"
                 >
                   {isSaving ? 'Saving...' : 'Save State'}
                </Button>
                 <Button 
                   onClick={cancelMO}
                   className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2"
                 >
                  Cancel
                </Button>
              </>
             )}
             
             {moState === 'IN_PROGRESS' && (
               <>
              <Button 
                   onClick={pauseProduction}
                   className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white px-4 py-2"
              >
                   Pause Production
              </Button>
                 <Button 
                   onClick={saveCurrentState}
                   disabled={isSaving}
                   className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2"
                 >
                   {isSaving ? 'Saving...' : 'Save State'}
                 </Button>
                 <Button 
                   onClick={markAsDone}
                   className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2"
                 >
                   Mark as Done
                 </Button>
                 <Button 
                   onClick={cancelMO}
                   className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2"
                 >
                   Cancel
                 </Button>
               </>
             )}
             
             {moState === 'DONE' && (
               <div className="text-sm text-gray-600 dark:text-gray-400">
                 Order completed successfully
               </div>
             )}
             
             {moState === 'CANCELLED' && (
               <div className="text-sm text-gray-600 dark:text-gray-400">
                 Order cancelled
               </div>
            )}
            {orderId && (
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2"
              >
                Delete
              </Button>
            )}
            <Button 
              onClick={handleBack}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2"
            >
              Back
            </Button>
            {/* <div className="text-xs text-gray-500 ml-2">
              Back Button leads to main dashboard
            </div> */}
          </div>
        </div>

         {/* Manufacturing Order Progress */}
         <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-4">
               <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Manufacturing Order Progress</h3>
               <div className="flex items-center space-x-2">
                 {Object.entries(moStates).map(([state, config], index) => (
                   <div key={state} className="flex items-center">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                       moState === state ? 
                         `bg-${config.color}-500 text-white` :
                         index <= Object.keys(moStates).indexOf(moState) ?
                           `bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900 dark:text-${config.color}-200` :
                           'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                     }`}>
                       {index + 1}
                     </div>
                     <span className={`ml-2 text-xs ${
                       moState === state ? 'font-medium' : 'text-gray-500 dark:text-gray-400'
                     }`}>
                       {config.label}
                     </span>
                     {index < Object.keys(moStates).length - 1 && (
                       <div className={`w-8 h-0.5 mx-2 ${
                         index < Object.keys(moStates).indexOf(moState) ? 
                           `bg-${config.color}-300` : 
                           'bg-gray-200 dark:bg-gray-600'
                       }`} />
                     )}
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Progress Summary */}
             <div className="text-sm text-gray-600 dark:text-gray-400">
               {moState === 'DRAFT' && 'Ready for confirmation'}
               {moState === 'CONFIRMED' && 'Stock reserved, ready to start'}
               {moState === 'IN_PROGRESS' && `${workOrders.filter(wo => wo.status === 'COMPLETED').length}/${workOrders.length} work orders completed`}
               {moState === 'DONE' && 'All work orders completed'}
               {moState === 'CANCELLED' && 'Order cancelled'}
             </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto">
          {/* Order Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Order Identification & Product Details */}
              <div className="space-y-6">
                {/* Order Number */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Order Number
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    <span className="text-gray-900 dark:text-white font-mono text-lg">{formData.orderId}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Always auto generate, when clicked on new and number should follow the sequence
                  </p>
                </div>

                {/* Finished Product */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Finished product *
                  </Label>
                   <Select
                     options={products.map(product => ({
                       value: product.id || product.value,
                       label: product.name || product.label
                     }))}
                    value={formData.finishedProduct}
                     onChange={(value) => handleInputChange('finishedProduct', value)}
                     placeholder="Select finished product"
                     searchable={true}
                    className="w-full"
                     disabled={moState !== 'DRAFT'}
                  />
                  {errors.finishedProduct && (
                    <p className="text-red-500 text-sm mt-1">{errors.finishedProduct}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Drop Down, many2one field, selection should be from product master.
                  </p>
                </div>

                {/* Quantity */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Quantity *
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                       className={`flex-1 ${errors.quantity ? 'border-red-500' : ''}`}
                       disabled={moState !== 'DRAFT'}
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Units</span>
                  </div>
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                  )}
                </div>

                {/* Bill of Material */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Bill of Material
                  </Label>
                  <Select
                    options={boms.map(bom => ({
                      value: bom.id || bom.value,
                      label: bom.name ? `${bom.name} (${bom.version || 'v1.0'})` : bom.label
                    }))}
                    value={formData.billOfMaterial}
                    onChange={(value) => handleInputChange('billOfMaterial', value)}
                    placeholder="Select bill of material"
                    searchable={true}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                   <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Schedule Date *
                  </Label>
                  <Input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => handleInputChange('scheduleDate', e.target.value)}
                     className={`w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${errors.scheduleDate ? 'border-red-500' : ''}`}
                  />
                   {errors.scheduleDate && (
                     <p className="text-red-500 text-sm mt-1">{errors.scheduleDate}</p>
                   )}
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Open calendar to allow user to select date
                  </p>
                </div>

                 {/* Deadline */}
                <div>
                   <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                     Deadline
                  </Label>
                  <Input
                     type="date"
                     value={formData.deadline}
                     onChange={(e) => handleInputChange('deadline', e.target.value)}
                     className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                   />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                     Target completion date
                   </p>
                 </div>

                 {/* Priority */}
                 <div>
                   <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                     Priority
                   </Label>
                   <Select
                     options={[
                       { value: 'LOW', label: 'Low' },
                       { value: 'MEDIUM', label: 'Medium' },
                       { value: 'HIGH', label: 'High' },
                       { value: 'URGENT', label: 'Urgent' }
                     ]}
                     value={formData.priority}
                     onChange={(value) => handleInputChange('priority', value)}
                     placeholder="Select priority"
                    className="w-full"
                  />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                     Order priority level
                   </p>
                 </div>

                {/* Assignee */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Assignee *
                  </Label>
                  <Select
                    options={users.map(user => ({
                      value: user.id || user.value,
                      label: user.name ? `${user.name} (${user.role || 'User'})` : user.label
                    }))}
                    value={formData.assignee}
                    onChange={(value) => handleInputChange('assignee', value)}
                    placeholder="Select assignee"
                    searchable={true}
                    className={`w-full ${errors.assignee ? 'border-red-500' : ''}`}
                  />
                  {errors.assignee && (
                    <p className="text-red-500 text-sm mt-1">{errors.assignee}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Drop down of user for selection, many2one field
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Components and Work Orders Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('components')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'components'
                    ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setActiveTab('workorders')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'workorders'
                    ? 'text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                  <div className="grid grid-cols-5 gap-4 mb-4 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-3">
                    <div>Components</div>
                    <div>Availability</div>
                    <div>To Consume</div>
                    <div>Units</div>
                    <div>Actions</div>
                  </div>

                  {/* Add Product Button */}
                  <div className="mb-4">
                    <button 
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 text-sm font-medium border border-pink-200 dark:border-pink-700 rounded px-3 py-1 hover:bg-pink-50 dark:hover:bg-pink-900/30"
                    >
                      {showAddProduct ? 'Cancel' : 'Add a product'}
                    </button>
                  </div>

                  {/* Add Product Form */}
                  {showAddProduct && (
                    <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Product
                          </Label>
                          <Select
                            options={products.map(product => ({
                              value: product.id || product.value,
                              label: product.name || product.label
                            }))}
                            value={newComponent.productId}
                            onChange={(value) => setNewComponent(prev => ({ ...prev, productId: value }))}
                            placeholder="Select product"
                            searchable={true}
                            className="w-full"
                          />
                    </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            Quantity
                          </Label>
                          <Input
                            type="number"
                            value={newComponent.quantity}
                            onChange={(e) => setNewComponent(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder="Enter quantity"
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={addComponent}
                            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2"
                          >
                            Add Component
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Components List */}
                  {components.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No components added yet. Click "Add a product" to get started.
                    </div>
                  ) : (
                    components.map((component) => (
                      <div key={component.id} className="grid grid-cols-5 gap-4 mb-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{component.productName}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{component.availability}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{component.toConsume}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{component.unit}</div>
                        <div>
                          <button
                            onClick={() => removeComponent(component.id)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                    </div>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  {/* Work Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Operations</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Work Center</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Real Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {workOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{order.operation}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{order.workCenter}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{order.duration}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-900 dark:text-white font-mono font-bold">
                                  {order.realDuration || '00:00'}
                                </span>
                                 {order.status === 'PLANNED' && moState === 'IN_PROGRESS' && (
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
                                {order.status === 'IN_PROGRESS' && (
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
                                {order.status === 'ON_HOLD' && (
                                  <button
                                    onClick={() => startTimer(order.id)}
                                    className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white"
                                    title="Resume Timer"
                                  >
                                    <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </button>
                                )}
                                {order.status === 'IN_PROGRESS' && (
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
                                 {order.status === 'PLANNED' && moState !== 'IN_PROGRESS' && (
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
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                    <button 
                      onClick={addWorkOrderLine}
                      className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 text-sm font-medium"
                    >
                      Add a line
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Timer and Status Controls:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
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
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      {/* <h5 className="text-xs font-semibold text-gray-700 mb-2">Status Definitions:</h5> */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Manufacturing Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this manufacturing order? This action cannot be undone.
              <br />
              <strong>Order ID:</strong> {formData.orderId}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ManufacturingOrderPopup
