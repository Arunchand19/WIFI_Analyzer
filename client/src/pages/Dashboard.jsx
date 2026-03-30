import React, { useEffect, useState } from 'react'
import { 
  Wifi, 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Download,
  Upload,
  Cpu,
  HardDrive
} from 'lucide-react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
} from 'chart.js'
import { useSocket } from '../hooks/useSocket'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

const Dashboard = () => {
  const { 
    realTimeData, 
    networks, 
    devices, 
    securityResults, 
    connected,
    scanNetworks,
    scanDevices,
    performSecurityScan
  } = useSocket()

  const [networkHistory, setNetworkHistory] = useState([])

  useEffect(() => {
    if (realTimeData) {
      setNetworkHistory(prev => {
        const newHistory = [...prev, {
          timestamp: new Date(realTimeData.timestamp).toLocaleTimeString(),
          download: realTimeData.networkStats.rx_sec || 0,
          upload: realTimeData.networkStats.tx_sec || 0,
          cpu: realTimeData.cpu || 0,
          memory: realTimeData.memory?.percentage || 0
        }]
        return newHistory.slice(-20) // Keep last 20 data points
      })
    }
  }, [realTimeData])

  // Auto-scan on component mount
  useEffect(() => {
    if (connected) {
      scanNetworks()
      scanDevices()
      performSecurityScan()
    }
  }, [connected])

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
  const networkTrafficOptions = {
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

  const networkTrafficData = {
    labels: networkHistory.map(item => item.timestamp),
    datasets: [
      {
        label: 'Download',
        data: networkHistory.map(item => item.download),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      },
      {
        label: 'Upload',
        data: networkHistory.map(item => item.upload),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  const systemResourcesData = {
    labels: ['CPU Usage', 'Memory Usage', 'Available'],
    datasets: [
      {
        data: [
          realTimeData?.cpu || 0,
          realTimeData?.memory?.percentage || 0,
          100 - (realTimeData?.cpu || 0) - (realTimeData?.memory?.percentage || 0)
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  }

  const securityThreatData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
    datasets: [
      {
        data: [
          securityResults?.threats?.filter(t => t.severity === 'Low').length || 0,
          securityResults?.threats?.filter(t => t.severity === 'Medium').length || 0,
          securityResults?.threats?.filter(t => t.severity === 'High').length || 0,
          securityResults?.threats?.filter(t => t.severity === 'Critical').length || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  }

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
          <span className="text-sm text-success-600">{trend}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Network Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and security analysis</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={scanNetworks}
            className="btn-primary"
            disabled={!connected}
          >
            <Wifi className="w-4 h-4 mr-2" />
            Scan Networks
          </button>
          <button 
            onClick={performSecurityScan}
            className="btn-secondary"
            disabled={!connected}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security Scan
          </button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!connected && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-warning-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-warning-800">Server Disconnected</h3>
              <p className="text-sm text-warning-700 mt-1">
                Unable to connect to the WiFi Analyzer server. Please ensure the server is running.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="WiFi Networks"
          value={networks.length}
          subtitle="Networks detected"
          icon={Wifi}
          color="primary"
        />
        <MetricCard
          title="Connected Devices"
          value={devices.length}
          subtitle="Active connections"
          icon={Users}
          color="success"
        />
        <MetricCard
          title="Security Threats"
          value={securityResults?.totalThreats || 0}
          subtitle={`Risk: ${securityResults?.riskLevel || 'Unknown'}`}
          icon={Shield}
          color={securityResults?.riskLevel === 'High' ? 'danger' : 'warning'}
        />
        <MetricCard
          title="Network Speed"
          value={realTimeData ? formatSpeed(realTimeData.networkStats?.rx_sec || 0) : '0 B/s'}
          subtitle="Download speed"
          icon={Activity}
          color="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Traffic Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Traffic</h3>
          <div className="h-64">
            <Line data={networkTrafficData} options={networkTrafficOptions} />
          </div>
        </div>

        {/* System Resources Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h3>
          <div className="h-64">
            <Doughnut 
              data={systemResourcesData} 
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

      {/* Security Threats and Network Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Threats */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Threat Distribution</h3>
          <div className="h-64">
            <Bar 
              data={securityThreatData}
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

        {/* System Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              </div>
              <span className="text-sm text-gray-900">
                {realTimeData?.cpu?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HardDrive className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
              </div>
              <span className="text-sm text-gray-900">
                {realTimeData?.memory ? 
                  `${formatBytes(realTimeData.memory.used)} / ${formatBytes(realTimeData.memory.total)}` 
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Download</span>
              </div>
              <span className="text-sm text-gray-900">
                {realTimeData ? formatSpeed(realTimeData.networkStats?.rx_sec || 0) : '0 B/s'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Upload</span>
              </div>
              <span className="text-sm text-gray-900">
                {realTimeData ? formatSpeed(realTimeData.networkStats?.tx_sec || 0) : '0 B/s'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard