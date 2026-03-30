import React, { useState } from 'react'
import { 
  Monitor, 
  Smartphone, 
  Laptop, 
  Router, 
  Printer, 
  Tv,
  RefreshCw,
  Shield,
  Clock,
  Signal,
  Bug
} from 'lucide-react'
import { useSocket } from '../hooks/useSocket'

const DeviceMonitor = () => {
  const { devices, scanDevices, scanForMalware, connected } = useSocket()
  const [scanning, setScanning] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)

  const handleScan = async () => {
    setScanning(true)
    scanDevices()
    setTimeout(() => setScanning(false), 3000)
  }

  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile device':
        return <Smartphone className="w-6 h-6" />
      case 'computer':
        return <Laptop className="w-6 h-6" />
      case 'network device':
        return <Router className="w-6 h-6" />
      case 'printer':
        return <Printer className="w-6 h-6" />
      case 'media device':
        return <Tv className="w-6 h-6" />
      default:
        return <Monitor className="w-6 h-6" />
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'success'
      case 'Medium': return 'warning'
      case 'High': return 'danger'
      default: return 'gray'
    }
  }

  const formatLastSeen = (timestamp) => {
    const now = new Date()
    const lastSeen = new Date(timestamp)
    const diffMs = now - lastSeen
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Device Monitor</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze connected network devices</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={!connected || scanning}
          className="btn-primary mt-4 sm:mt-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan Devices'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-primary-600">{devices.length}</p>
            </div>
            <Monitor className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Devices</p>
              <p className="text-2xl font-bold text-success-600">
                {devices.filter(d => d.isOnline !== false).length}
              </p>
            </div>
            <Signal className="w-8 h-8 text-success-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-danger-600">
                {devices.filter(d => d.securityRisk === 'High').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-danger-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unknown Devices</p>
              <p className="text-2xl font-bold text-warning-600">
                {devices.filter(d => d.vendor === 'Unknown').length}
              </p>
            </div>
            <Monitor className="w-8 h-8 text-warning-600" />
          </div>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Devices</h3>
        
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No devices found. Click "Scan Devices" to discover connected devices.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedDevice(device)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      device.responseTime !== null ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {device.hostname !== 'Unknown' ? device.hostname : device.ip}
                      </h4>
                      <p className="text-sm text-gray-500">{device.deviceType}</p>
                    </div>
                  </div>
                  <span className={`status-indicator status-${getRiskColor(device.securityRisk)}`}>
                    {device.securityRisk}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono text-gray-900">{device.ip}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">MAC Address:</span>
                    <span className="font-mono text-gray-900">{device.mac}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="text-gray-900">{device.vendor}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="text-gray-900">
                      {device.responseTime ? `${device.responseTime}ms` : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="text-gray-900">{formatLastSeen(device.lastSeen)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      scanForMalware(device.ip)
                    }}
                    className="flex-1 text-xs bg-danger-100 text-danger-700 px-2 py-1 rounded hover:bg-danger-200 transition-colors"
                  >
                    <Bug className="w-3 h-3 inline mr-1" />
                    Scan for Malware
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    selectedDevice.responseTime !== null ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getDeviceIcon(selectedDevice.deviceType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedDevice.hostname !== 'Unknown' ? selectedDevice.hostname : selectedDevice.ip}
                    </h3>
                    <p className="text-gray-600">{selectedDevice.deviceType}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">IP Address</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedDevice.ip}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">MAC Address</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedDevice.mac}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Hostname</label>
                  <p className="text-sm text-gray-900">{selectedDevice.hostname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vendor</label>
                  <p className="text-sm text-gray-900">{selectedDevice.vendor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Device Type</label>
                  <p className="text-sm text-gray-900">{selectedDevice.deviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Security Risk</label>
                  <span className={`status-indicator status-${getRiskColor(selectedDevice.securityRisk)}`}>
                    {selectedDevice.securityRisk}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Response Time</label>
                  <p className="text-sm text-gray-900">
                    {selectedDevice.responseTime ? `${selectedDevice.responseTime}ms` : 'Offline'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Seen</label>
                  <p className="text-sm text-gray-900">{new Date(selectedDevice.lastSeen).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => scanForMalware(selectedDevice.ip)}
                  className="btn-danger"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Scan for Malware
                </button>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Types Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: 'Computer', icon: Laptop, count: devices.filter(d => d.deviceType === 'Computer').length },
            { type: 'Mobile Device', icon: Smartphone, count: devices.filter(d => d.deviceType === 'Mobile Device').length },
            { type: 'Network Device', icon: Router, count: devices.filter(d => d.deviceType === 'Network Device').length },
            { type: 'Printer', icon: Printer, count: devices.filter(d => d.deviceType === 'Printer').length },
            { type: 'Media Device', icon: Tv, count: devices.filter(d => d.deviceType === 'Media Device').length },
            { type: 'Other', icon: Monitor, count: devices.filter(d => !['Computer', 'Mobile Device', 'Network Device', 'Printer', 'Media Device'].includes(d.deviceType)).length }
          ].map(({ type, icon: Icon, count }) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">{count}</p>
              <p className="text-xs text-gray-600">{type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeviceMonitor