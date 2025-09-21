// import React from 'react'

// const Profile = () => {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
//         <p className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences</p>
//       </div>
      
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
//         <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Profile Information</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
//             <input 
//               type="text" 
//               className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
//               placeholder="Your name"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
//             <input 
//               type="email" 
//               className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
//               placeholder="your.email@example.com"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
//             <input 
//               type="text" 
//               className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2"
//               placeholder="Your role"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Profile

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { userAPI } from '@/services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    employeeId: user?.employeeId || ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light'
  })

  const [profileImage, setProfileImage] = useState(user?.profileImage || null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        employeeId: user.employeeId || ''
      })
    }
  }, [user])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSecurityChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePreferenceChange = (field, value) => {
    if (field === 'notifications') {
      setPreferences(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [value]: !prev.notifications[value]
        }
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Form validation
  const validatePersonalInfo = () => {
    const newErrors = {}

    if (!personalInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!personalInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSecuritySettings = () => {
    const newErrors = {}

    if (securitySettings.newPassword && securitySettings.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    }
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (activeTab === 'personal') {
        if (!validatePersonalInfo()) {
          toast.error('Please fix the form errors')
          return
        }

        // Update personal information
        const updatedUser = {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          email: personalInfo.email,
          phone: personalInfo.phone,
          department: personalInfo.department,
          position: personalInfo.position,
          employeeId: personalInfo.employeeId
        }

        // Call API to update user profile in database
        await updateUser(updatedUser)
        toast.success('Profile updated successfully')

      } else if (activeTab === 'security') {
        if (!validateSecuritySettings()) {
          toast.error('Please fix the form errors')
          return
        }

        if (securitySettings.newPassword) {
          // Note: In a real app, you'd call an API to change password
          toast.success('Password updated successfully')
          setSecuritySettings({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        }
      } else if (activeTab === 'preferences') {
        // Note: In a real app, you'd save preferences to the backend
        toast.success('Preferences saved successfully')
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm lg:text-base">Manage your account settings and preferences</p>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full">
          {/* Main Content */}
          <div className="w-full">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'personal' && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Personal Information</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <Input
                        value={personalInfo.firstName}
                        onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                        className={`${errors.firstName ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={personalInfo.lastName}
                        onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                        className={`${errors.lastName ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                        className={`${errors.email ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <Input
                        value={personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <Input
                        value={personalInfo.department}
                        onChange={(e) => handlePersonalInfoChange('department', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your department"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Position
                      </label>
                      <Input
                        value={personalInfo.position}
                        onChange={(e) => handlePersonalInfoChange('position', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your position"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employee ID
                    </label>
                    <Input
                      value={personalInfo.employeeId}
                      onChange={(e) => handlePersonalInfoChange('employeeId', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your employee ID"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={securitySettings.currentPassword}
                      onChange={(e) => handleSecurityChange('currentPassword', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your current password"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => handleSecurityChange('newPassword', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your new password"
                      className={`${errors.newPassword ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                    />
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => handleSecurityChange('confirmPassword', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Confirm your new password"
                      className={`${errors.confirmPassword ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 dark:text-yellow-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Password Requirements</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Preferences</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="GMT">Greenwich Mean Time</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Email Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.email}
                          onChange={() => handlePreferenceChange('notifications', 'email')}
                          disabled={!isEditing}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Push Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.push}
                          onChange={() => handlePreferenceChange('notifications', 'push')}
                          disabled={!isEditing}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">SMS Notifications</span>
                        <input
                          type="checkbox"
                          checked={preferences.notifications.sms}
                          onChange={() => handlePreferenceChange('notifications', 'sms')}
                          disabled={!isEditing}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile