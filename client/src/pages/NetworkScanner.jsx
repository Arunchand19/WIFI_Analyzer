import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  Shield, 
  Signal, 
  Lock, 
  Unlock, 
  AlertTriangle,
  RefreshCw,
  Eye,
  MapPin
} from 'lucide-react'
import { useSocket } from '../hooks/useSocket'

const NetworkScanner = () => {
  const { networks, scanNetworks, connected } = useSocket()
  const [scanning, setScanning] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const [sortBy, setSortBy] = useState('signal_level')
  const [filterBy, setFilterBy] = useState('all')

  const handleScan = async () => {
    setScanning(true)
    scanNetworks()
    setTimeout(() => setScanning(false), 3000)
  }

  const getSecurityIcon = (security) => {
    if (!security || security.includes('None')) {
      return <Unlock className="w-4 h-4 text-danger-500" />
    }
    return <Lock className="w-4 h-4 text-success-500" />
  }

  const getSecurityColor = (security) => {                         //security privacy frontend
    if (!security || security.includes('None')) return 'danger'
    if (security.includes('WEP')) return 'danger'
    if (security.includes('WPA3')) return 'success'
    if (security.includes('WPA2')) return 'success'
    if (security.includes('WPA')) return 'warning'
    return 'gray'
  }

  const getSignalStrength = (level) => {
    if (level > -50) return { strength: 'Excellent', color: 'success', bars: 4 }
    if (level > -60) return { strength: 'Good', color: 'success', bars: 3 }
    if (level > -70) return { strength: 'Fair', color: 'warning', bars: 2 }
    return { strength: 'Poor', color: 'danger', bars: 1 }
  }

  const getThreatLevelColor = (level) => {
    switch (level) {
      case 'Low': return 'success'
      case 'Medium': return 'warning'
      case 'High': return 'danger'
      default: return 'gray'
    }
  }

  const sortedNetworks = [...networks].sort((a, b) => {
    switch (sortBy) {
      case 'signal_level':
        return b.signal_level - a.signal_level
      case 'ssid':
        return a.ssid.localeCompare(b.ssid)
      case 'security':
        return (a.security || '').localeCompare(b.security || '')
      case 'channel':
        return a.channel - b.channel
      default:
        return 0
    }
  })

  const filteredNetworks = sortedNetworks.filter(network => {
    switch (filterBy) {
      case 'secure':
        return network.security && !network.security.includes('None')
      case 'open':
        return !network.security || network.security.includes('None')
      case 'high_threat':
        return network.threat_level === 'High'
      default:
        return true
    }
  })

  const SignalBars = ({ level }) => {
    const signal = getSignalStrength(level)
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4].map(bar => (
          <div
            key={bar}
            className={`w-1 ${bar <= signal.bars ? `bg-${signal.color}-500` : 'bg-gray-300'}`}
            style={{ height: `${bar * 3 + 2}px` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WiFi Network Scanner</h1>
          <p className="text-gray-600 mt-1">Discover and analyze nearby wireless networks</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={!connected || scanning}
          className="btn-primary mt-4 sm:mt-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan Networks'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Networks</p>
              <p className="text-2xl font-bold text-primary-600">{networks.length}</p>
            </div>
            <Wifi className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Networks</p>
              <p className="text-2xl font-bold text-danger-600">
                {networks.filter(n => !n.security || n.security.includes('None')).length}
              </p>
            </div>
            <Unlock className="w-8 h-8 text-danger-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Secure Networks</p>
              <p className="text-2xl font-bold text-success-600">
                {networks.filter(n => n.security && !n.security.includes('None')).length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-success-600" />
          </div>
        </div>
        
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Threat</p>
              <p className="text-2xl font-bold text-danger-600">
                {networks.filter(n => n.threat_level === 'High').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-danger-600" />
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="signal_level">Signal Strength</option>
                <option value="ssid">Network Name</option>
                <option value="security">Security Type</option>
                <option value="channel">Channel</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All Networks</option>
                <option value="secure">Secure Only</option>
                <option value="open">Open Only</option>
                <option value="high_threat">High Threat</option>
              </select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredNetworks.length} of {networks.length} networks
          </div>
        </div>
      </div>

      {/* Networks List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Networks</h3>
        
        {filteredNetworks.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No networks found. Click "Scan Networks" to discover nearby WiFi networks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Network</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Signal</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Security</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Channel</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Frequency</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Threat Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNetworks.map((network, index) => {
                  const signal = getSignalStrength(network.signal_level)
                  const securityColor = getSecurityColor(network.security)
                  const threatColor = getThreatLevelColor(network.threat_level)
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {getSecurityIcon(network.security)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {network.ssid || 'Hidden Network'}
                            </p>
                            <p className="text-xs text-gray-500">{network.bssid}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <SignalBars level={network.signal_level} />
                          <div>
                            <p className={`text-sm font-medium text-${signal.color}-600`}>
                              {signal.strength}
                            </p>
                            <p className="text-xs text-gray-500">{network.signal_level} dBm</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`status-indicator status-${securityColor}`}>
                          {network.security || 'Open'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {network.encryption_strength}
                        </p>
                      </td>
                      
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{network.channel}</p>
                      </td>
                      
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">{network.frequency} MHz</p>
                      </td>
                      
                      <td className="py-3 px-4">
                        <span className={`status-indicator status-${threatColor}`}>
                          {network.threat_level}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedNetwork(network)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Network Details Modal */}
      {selectedNetwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Network Details</h3>
                <button
                  onClick={() => setSelectedNetwork(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">SSID</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.ssid || 'Hidden'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">BSSID</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.bssid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Security</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.security || 'Open'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Encryption</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.encryption_strength}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Channel</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.channel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Frequency</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.frequency} MHz</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Signal Level</label>
                  <p className="text-sm text-gray-900">{selectedNetwork.signal_level} dBm</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Threat Level</label>
                  <span className={`status-indicator status-${getThreatLevelColor(selectedNetwork.threat_level)}`}>
                    {selectedNetwork.threat_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkScanner