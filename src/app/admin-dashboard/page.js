'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SageAdminDashboard() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Dummy admin data
  const stats = {
    totalUsers: 12547,
    activeUsers: 8934,
    newUsers: 234,
    totalSearches: 89765,
    premiumUsers: 2341,
    revenue: 45789
  }

  const recentUsers = [
    { id: 1, name: 'John Smith', email: 'john@example.com', plan: 'Pro', joined: '2024-01-16', status: 'active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'Free', joined: '2024-01-15', status: 'active' },
    { id: 3, name: 'Mike Wilson', email: 'mike@example.com', plan: 'Enterprise', joined: '2024-01-15', status: 'inactive' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', plan: 'Pro', joined: '2024-01-14', status: 'active' }
  ]

  const systemHealth = {
    apiResponseTime: '234ms',
    uptime: '99.9%',
    activeConnections: 1247,
    errorRate: '0.02%'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'settings', label: 'Settings', icon: '🔧' }
  ]

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-opacity-10 bg-blue-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-sm opacity-75">Total Users</div>
        </div>
        <div className="bg-opacity-10 bg-green-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.activeUsers.toLocaleString()}</div>
          <div className="text-sm opacity-75">Active Users</div>
        </div>
        <div className="bg-opacity-10 bg-purple-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.newUsers}</div>
          <div className="text-sm opacity-75">New Today</div>
        </div>
        <div className="bg-opacity-10 bg-yellow-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalSearches.toLocaleString()}</div>
          <div className="text-sm opacity-75">Total Searches</div>
        </div>
        <div className="bg-opacity-10 bg-indigo-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{stats.premiumUsers.toLocaleString()}</div>
          <div className="text-sm opacity-75">Premium Users</div>
        </div>
        <div className="bg-opacity-10 bg-green-500 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">${stats.revenue.toLocaleString()}</div>
          <div className="text-sm opacity-75">Monthly Revenue</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map(user => (
              <div key={user.id} className="flex justify-between items-center p-3 bg-opacity-20 bg-gray-600 rounded">
                <div>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-sm opacity-75">{user.email}</div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs ${user.plan === 'Enterprise' ? 'bg-purple-600' : user.plan === 'Pro' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    {user.plan}
                  </div>
                  <div className="text-xs opacity-60 mt-1">{user.joined}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-opacity-10 bg-gray-500 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>API Response Time</span>
              <span className="text-green-400">{systemHealth.apiResponseTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime</span>
              <span className="text-green-400">{systemHealth.uptime}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Connections</span>
              <span className="text-blue-400">{systemHealth.activeConnections}</span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate</span>
              <span className="text-green-400">{systemHealth.errorRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">User Management</h3>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">Add User</button>
      </div>
      <div className="bg-opacity-10 bg-gray-500 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-opacity-20 bg-gray-600">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Plan</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(user => (
              <tr key={user.id} className="border-t border-gray-600">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.plan === 'Enterprise' ? 'bg-purple-600' : user.plan === 'Pro' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                  <button className="text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className={`${isDarkTheme ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen font-poppins`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="opacity-75">Manage users, analytics, and system settings</p>
          </div>
          <div className="flex gap-4">
            <Link href="/news-intelligence" className="text-blue-500 hover:underline">
              ← Back to News
            </Link>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {isDarkTheme ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-opacity-10 bg-gray-500 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-opacity-20 hover:bg-gray-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
              <p className="opacity-60">Advanced analytics and reporting tools coming soon...</p>
            </div>
          )}
          {activeTab === 'system' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">System Management</h3>
              <p className="opacity-60">System configuration and monitoring tools...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4">Admin Settings</h3>
              <p className="opacity-60">Global settings and configuration options...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 