import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Wifi, 
  Shield, 
  Activity, 
  Scan, 
  Monitor, 
  Bug, 
  Settings, 
  Menu, 
  X,
  Radio,
  Zap
} from 'lucide-react'
import { useSocket } from '../hooks/useSocket'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { connected } = useSocket()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Network Scanner', href: '/scanner', icon: Scan },
    { name: 'Device Monitor', href: '/devices', icon: Monitor },
    { name: 'Security Analysis', href: '/security', icon: Shield },
    { name: 'Malware Scanner', href: '/malware', icon: Bug },
    { name: 'Speed Test', href: '/speedtest', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">WiFi Analyzer</h1>
              <p className="text-xs text-gray-500">Network Security & Monitoring</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`} />
              <span className={`text-sm font-medium ${connected ? 'text-success-700' : 'text-danger-700'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Mobile Connection Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`} />
                <span className={`text-sm font-medium ${connected ? 'text-success-700' : 'text-danger-700'}`}>
                  {connected ? 'Server Connected' : 'Server Disconnected'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar