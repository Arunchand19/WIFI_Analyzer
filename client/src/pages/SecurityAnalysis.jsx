import React, { useState } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Scan,
  Clock,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react'
import { useSocket } from '../hooks/useSocket'

const SecurityAnalysis = () => {
  const { securityResults, performSecurityScan, connected } = useSocket()
  const [scanning, setScanning] = useState(false)
  const [selectedThreat, setSelectedThreat] = useState(null)

  const handleScan = async () => {
    setScanning(true)
    performSecurityScan()
    setTimeout(() => setScanning(false), 4000)
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <XCircle className="w-5 h-5 text-danger-500" />
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-danger-500" />
      case 'Medium':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-warning-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-success-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'danger'
      case 'High': return 'danger'
      case 'Medium': return 'warning'
      case 'Low': return 'warning'
      default: return 'success'
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'High': return 'danger'
      case 'Medium': return 'warning'
      case 'Low': return 'success'
      default: return 'gray'
    }
  }

  const ThreatCard = ({ threat, onClick }) => (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(threat)}
    >
      <div className="flex items-start space-x-3">
        {getSeverityIcon(threat.severity)}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{threat.type.replace(/_/g, ' ')}</h4>
            <span className={`status-indicator status-${getSeverityColor(threat.severity)}`}>
              {threat.severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{threat.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(threat.timestamp).toLocaleString()}
          </p>
        </div>
        <Eye className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Analysis</h1>
          <p className="text-gray-600 mt-1">Comprehensive network security monitoring and threat detection</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={!connected || scanning}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Scan className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Security Scan'}
        </button>
      </div>

      {/* Scanning Status */}
      {scanning && (
        <div className="card">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-primary-600 animate-pulse" />
            <div>
              <p className="font-medium text-gray-900">Security Scan in Progress</p>
              <p className="text-sm text-gray-600">Analyzing network for security threats and vulnerabilities...</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Overview */}
      {securityResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Threats</p>
                <p className="text-2xl font-bold text-danger-600">{securityResults.totalThreats}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Level</p>
                <p className={`text-2xl font-bold text-${getRiskLevelColor(securityResults.riskLevel)}-600`}>
                  {securityResults.riskLevel}
                </p>
              </div>
              <Shield className={`w-8 h-8 text-${getRiskLevelColor(securityResults.riskLevel)}-600`} />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-danger-600">
                  {securityResults.threats?.filter(t => t.severity === 'Critical').length || 0}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-danger-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Scan</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(securityResults.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Threat Severity Distribution */}
      {securityResults && securityResults.threats && securityResults.threats.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Severity Distribution</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Critical', 'High', 'Medium', 'Low'].map(severity => {
              const count = securityResults.threats.filter(t => t.severity === severity).length
              const color = getSeverityColor(severity)
              
              return (
                <div key={severity} className={`p-4 bg-${color}-50 border border-${color}-200 rounded-lg text-center`}>
                  <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-2`}>
                    {getSeverityIcon(severity)}
                  </div>
                  <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
                  <p className={`text-sm font-medium text-${color}-700`}>{severity}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Security Threats */}
      {securityResults && securityResults.threats && securityResults.threats.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Security Threats ({securityResults.threats.length})
          </h3>
          
          <div className="space-y-3">
            {securityResults.threats.map((threat, index) => (
              <ThreatCard 
                key={index} 
                threat={threat} 
                onClick={setSelectedThreat}
              />
            ))}
          </div>
        </div>
      ) : securityResults && (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Security Threats Detected</h3>
          <p className="text-gray-600">
            Your network appears to be secure. The security scan found no immediate threats or vulnerabilities.
          </p>
        </div>
      )}

      {/* Security Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
        
        <div className="space-y-3">
          {[
            'Enable WPA3 encryption on all wireless networks',
            'Regularly update firmware on network devices',
            'Use strong, unique passwords for all devices',
            'Enable network access control (NAC)',
            'Monitor network traffic for anomalies',
            'Implement network segmentation',
            'Keep security software up to date',
            'Regular security audits and penetration testing'
          ].map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Monitoring Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Monitoring Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Threat Detection</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>ARP spoofing detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Rogue access point detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Suspicious device monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Traffic anomaly detection</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Security Analysis</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Encryption strength assessment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Vulnerability scanning</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Network topology analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Real-time monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Threat Details Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getSeverityIcon(selectedThreat.severity)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedThreat.type.replace(/_/g, ' ')}
                    </h3>
                    <span className={`status-indicator status-${getSeverityColor(selectedThreat.severity)}`}>
                      {selectedThreat.severity} Severity
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedThreat.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Detected At</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedThreat.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {selectedThreat.details && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Technical Details</label>
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedThreat.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Scan Results */}
      {!securityResults && !scanning && (
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Security Scan Results</h3>
          <p className="text-gray-600 mb-4">
            Run a security scan to analyze your network for potential threats and vulnerabilities.
          </p>
          <button 
            onClick={handleScan}
            disabled={!connected}
            className="btn-primary"
          >
            <Scan className="w-4 h-4 mr-2" />
            Start Security Scan
          </button>
        </div>
      )}
    </div>
  )
}

export default SecurityAnalysis