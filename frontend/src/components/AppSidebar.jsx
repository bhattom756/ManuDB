import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarHeader,
} from "@/components/ui/sidebar"

// Modern menu items with distinct colored icons and role-based permissions
const menuItems = [
  {
    name: 'Manufacturing Orders',
    path: '/dashboard',
    icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    activeBg: 'bg-blue-50',
    roles: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER']
  },
  {
    name: 'Work Orders',
    path: '/workorders',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    activeBg: 'bg-green-50',
    roles: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER', 'OPERATOR']
  },
  {
    name: 'Bills of Materials',
    path: '/bill',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    activeBg: 'bg-purple-50',
    roles: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER']
  },
  {
    name: 'Work Centers',
    path: '/workcenter',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    activeBg: 'bg-orange-50',
    roles: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER', 'OPERATOR']
  },
  {
    name: 'Stock Ledger',
    path: '/stockledger',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    activeBg: 'bg-indigo-50',
    roles: ['BUSINESS_OWNER', 'INVENTORY_MANAGER', 'MANUFACTURING_MANAGER']
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    activeBg: 'bg-red-50',
    roles: ['BUSINESS_OWNER', 'MANUFACTURING_MANAGER', 'INVENTORY_MANAGER', 'OPERATOR']
  }
]

export function AppSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const handleItemClick = (item) => {
    navigate(item.path)
  }

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  return (
    <Sidebar className="border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          {/* Vite logo */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
            <svg className="h-5 w-5" width="31.88" height="32" viewBox="0 0 256 257" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="viteGradient1" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%">
                  <stop offset="0%" stopColor="#41D1FF"></stop>
                  <stop offset="100%" stopColor="#BD34FE"></stop>
                </linearGradient>
                <linearGradient id="viteGradient2" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%">
                  <stop offset="0%" stopColor="#FFEA83"></stop>
                  <stop offset="8.333%" stopColor="#FFDD35"></stop>
                  <stop offset="100%" stopColor="#FFA800"></stop>
                </linearGradient>
              </defs>
              <path fill="url(#viteGradient1)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path>
              <path fill="url(#viteGradient2)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Manufacturing Hub</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Master Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.name}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? `${item.activeBg} ${item.iconColor} shadow-sm`
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <button 
                      onClick={() => handleItemClick(item)}
                      className="flex w-full h-13 items-center gap-3"
                    >
                      {/* Colored icon container */}
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        location.pathname === item.path 
                          ? item.iconBg 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <svg 
                          className={`h-4 w-4 ${
                            location.pathname === item.path 
                              ? item.iconColor 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                      </div>
                      
                      {/* Menu item text */}
                      <span className="flex-1 text-left">{item.name}</span>
                      
                      {/* Count badge */}
                      {item.count && (
                        <SidebarMenuBadge className={`ml-auto ${
                          location.pathname === item.path
                            ? 'bg-white bg-opacity-20 text-current'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                          {item.count}
                        </SidebarMenuBadge>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
