import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Download, 
  Upload, 
  Wifi, 
  Play, 
  Pause,
  BarChart3,
  PieChart,
  TrendingUp,
  Network
} from 'lucide-react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { useSocket } from '../hooks/useSocket'

const TrafficAnalyzer = () => {
  const { 
    trafficData, 
    startTrafficMonitoring, 
    stopTrafficMonitoring, 
    connected 
  } = useSocket()
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [trafficHistory, setTrafficHistory] = useState([])
  const [selectedInterface, setSelectedInterface] = useState('')

  useEffect(() => {
    if (trafficData) {
      setTrafficHistory(prev => {
        const newHistory = [...prev, {
          timestamp: new Date(trafficData.timestamp).toLocaleTimeString(),
          download: trafficData.bandwidth?.download || 0,
          upload: trafficData.bandwidth?.upload || 0,
          totalConnections: trafficData.connections?.length || 0,
          packetsPerSecond: trafficData.bandwidth?.packetsPerSecond || 0
        }]
        return newHistory.slice(-50) // Keep last 50 data points
      })
    }
  }, [trafficData])

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
    startTrafficMonitoring()
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    stopTrafficMonitoring()
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSec) => {
    return formatBytes(bytesPerSec) + '/s'
  }

  // Chart configurations
  const trafficChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Real-time Network Traffic'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatSpeed(value)
          }
        }
      }
    }
  }

  const trafficChartData = {
    labels: trafficHistory.map(item => item.timestamp),
    datasets: [
      {
        label: 'Download',
        data: trafficHistory.map(item => item.download),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Upload',
        data: trafficHistory.map(item => item.upload),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const protocolData = trafficData?.protocols ? {
    labels: ['TCP', 'UDP', 'ICMP', 'IP'],
    datasets: [
      {
        data: [
          trafficData.protocols.tcp?.packets || 0,
          trafficData.protocols.udp?.packets || 0,
          trafficData.protocols.icmp?.packets || 0,
          trafficData.protocols.ip?.packets || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  } : { labels: [], datasets: [] }

  const connectionsData = {
    labels: trafficHistory.map(item => item.timestamp),
    datasets: [
      {
        label: 'Active Connections',
        data: trafficHistory.map(item => item.totalConnections),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traffic Analyzer</h1>
          <p className="text-gray-600 mt-1">Real-time network traffic monitoring and analysis</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {!isMonitoring ? (
            <button 
              onClick={handleStartMonitoring}
              disabled={!connected}
              className="btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Monitoring
            </button>
          ) : (
            <button 
              onClick={handleStopMonitoring}
              className="btn-danger"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      {/* Monitoring Status */}
      {isMonitoring && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900">Traffic Monitoring Active</p>
              <p className="text-sm text-gray-600">Real-time analysis in progress</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Stats */}
      {trafficData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Download Speed</p>
                <p className="text-2xl font-bold text-success-600">
                  {formatSpeed(trafficData.bandwidth?.download || 0)}
                </p>
              </div>
              <Download className="w-8 h-8 text-success-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upload Speed</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatSpeed(trafficData.bandwidth?.upload || 0)}
                </p>
              </div>
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold text-warning-600">
                  {trafficData.connections?.length || 0}
                </p>
              </div>
              <Network className="w-8 h-8 text-warning-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Packets/sec</p>
                <p className="text-2xl font-bold text-purple-600">
                  {trafficData.bandwidth?.packetsPerSecond || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Traffic Over Time</h3>
          <div className="h-64">
            <Line data={trafficChartData} options={trafficChartOptions} />
          </div>
        </div>

        {/* Protocol Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={protocolData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Connections Chart */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Connections</h3>
        <div className="h-64">
          <Bar 
            data={connectionsData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Network Interfaces */}
      {trafficData?.interfaces && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Interfaces</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Interface</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">MAC Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Speed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                </tr>
              </thead>
              <tbody>
                {trafficData.interfaces.map((iface, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{iface.name}</td>
                    <td className="py-3 px-4 text-gray-700">{iface.ip4 || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{iface.mac || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{iface.speed ? `${iface.speed} Mbps` : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`status-indicator ${
                        iface.operstate === 'up' ? 'status-online' : 'status-offline'
                      }`}>
                        {iface.operstate || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{iface.type || 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Connections */}
      {trafficData?.connections && trafficData.connections.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Connections ({trafficData.connections.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Protocol</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Local Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Foreign Address</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">State</th>
                </tr>
              </thead>
              <tbody>
                {trafficData.connections.slice(0, 20).map((conn, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`status-indicator ${
                        conn.protocol === 'TCP' ? 'status-online' : 'status-warning'
                      }`}>
                        {conn.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{conn.localAddress}</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-sm">{conn.foreignAddress}</td>
                    <td className="py-3 px-4">
                      <span className={`status-indicator ${
                        conn.state === 'ESTABLISHED' ? 'status-online' : 'status-warning'
                      }`}>
                        {conn.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {trafficData.connections.length > 20 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing 20 of {trafficData.connections.length} connections
              </p>
            </div>
          )}
        </div>
      )}

      {/* Applications */}
      {trafficData?.applications && trafficData.applications.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Network Applications</h3>
          
          <div className="space-y-3">
            {trafficData.applications.map((app, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-500">PID: {app.pid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{app.cpu.toFixed(1)}% CPU</p>
                  <p className="text-xs text-gray-500">{app.memory.toFixed(1)}% Memory</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!trafficData && !isMonitoring && (
        <div className="card text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Traffic Data</h3>
          <p className="text-gray-600 mb-4">
            Start monitoring to see real-time network traffic analysis and statistics.
          </p>
          <button 
            onClick={handleStartMonitoring}
            disabled={!connected}
            className="btn-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Monitoring
          </button>
        </div>
      )}
    </div>
  )
}

export default TrafficAnalyzer