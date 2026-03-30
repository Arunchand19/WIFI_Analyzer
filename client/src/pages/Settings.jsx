import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Shield, 
  Bell, 
  Download,
  Upload,
  Save,
  RefreshCw,
  Info
} from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    // Scanning Settings
    scanInterval: 30,
    autoScan: true,
    deepScan: false,
    
    // Security Settings
    threatAlerts: true,
    malwareScanning: true,
    realTimeMonitoring: true,
    securityLevel: 'medium',
    
    // Network Settings
    interfaceSelection: 'auto',
    packetCapture: false,
    trafficLogging: true,
    
    // Notification Settings
    emailAlerts: false,
    soundAlerts: true,
    desktopNotifications: true,
    alertThreshold: 'medium',
    
    // Performance Settings
    maxDevices: 100,
    historyRetention: 30,
    updateFrequency: 2
  })

  const [saved, setSaved] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    console.log('Saving settings:', settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings({
      scanInterval: 30,
      autoScan: true,
      deepScan: false,
      threatAlerts: true,
      malwareScanning: true,
      realTimeMonitoring: true,
      securityLevel: 'medium',
      interfaceSelection: 'auto',
      packetCapture: false,
      trafficLogging: true,
      emailAlerts: false,
      soundAlerts: true,
      desktopNotifications: true,
      alertThreshold: 'medium',
      maxDevices: 100,
      historyRetention: 30,
      updateFrequency: 2
    })
  }

  const SettingCard = ({ title, description, children }) => (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const ToggleSetting = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const SelectSetting = ({ label, description, value, options, onChange }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const NumberSetting = ({ label, description, value, min, max, unit, onChange }) => (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      <div className="mt-2 flex items-center space-x-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24"
        />
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure WiFi Analyzer preferences and behavior</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button onClick={handleReset} className="btn-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Scanning Settings */}
      <SettingCard 
        title="Scanning Settings" 
        description="Configure network and device scanning behavior"
      >
        <ToggleSetting
          label="Auto Scan"
          description="Automatically scan for networks and devices on startup"
          value={settings.autoScan}
          onChange={(value) => handleSettingChange('autoScan', value)}
        />
        
        <NumberSetting
          label="Scan Interval"
          description="How often to automatically rescan (in seconds)"
          value={settings.scanInterval}
          min={10}
          max={300}
          unit="seconds"
          onChange={(value) => handleSettingChange('scanInterval', value)}
        />
        
        <ToggleSetting
          label="Deep Scan"
          description="Perform more thorough but slower scans"
          value={settings.deepScan}
          onChange={(value) => handleSettingChange('deepScan', value)}
        />
      </SettingCard>

      {/* Security Settings */}
      <SettingCard 
        title="Security Settings" 
        description="Configure security monitoring and threat detection"
      >
        <ToggleSetting
          label="Threat Alerts"
          description="Show alerts when security threats are detected"
          value={settings.threatAlerts}
          onChange={(value) => handleSettingChange('threatAlerts', value)}
        />
        
        <ToggleSetting
          label="Malware Scanning"
          description="Enable automatic malware detection on devices"
          value={settings.malwareScanning}
          onChange={(value) => handleSettingChange('malwareScanning', value)}
        />
        
        <ToggleSetting
          label="Real-time Monitoring"
          description="Continuously monitor network for security threats"
          value={settings.realTimeMonitoring}
          onChange={(value) => handleSettingChange('realTimeMonitoring', value)}
        />
        
        <SelectSetting
          label="Security Level"
          description="Set the sensitivity of security detection"
          value={settings.securityLevel}
          options={[
            { value: 'low', label: 'Low - Basic protection' },
            { value: 'medium', label: 'Medium - Balanced protection' },
            { value: 'high', label: 'High - Maximum protection' }
          ]}
          onChange={(value) => handleSettingChange('securityLevel', value)}
        />
      </SettingCard>

      {/* Network Settings */}
      <SettingCard 
        title="Network Settings" 
        description="Configure network interface and monitoring options"
      >
        <SelectSetting
          label="Network Interface"
          description="Select which network interface to monitor"
          value={settings.interfaceSelection}
          options={[
            { value: 'auto', label: 'Auto-detect' },
            { value: 'wifi', label: 'WiFi only' },
            { value: 'ethernet', label: 'Ethernet only' },
            { value: 'all', label: 'All interfaces' }
          ]}
          onChange={(value) => handleSettingChange('interfaceSelection', value)}
        />
        
        <ToggleSetting
          label="Packet Capture"
          description="Enable raw packet capture (requires admin privileges)"
          value={settings.packetCapture}
          onChange={(value) => handleSettingChange('packetCapture', value)}
        />
        
        <ToggleSetting
          label="Traffic Logging"
          description="Log network traffic data for analysis"
          value={settings.trafficLogging}
          onChange={(value) => handleSettingChange('trafficLogging', value)}
        />
      </SettingCard>

      {/* Notification Settings */}
      <SettingCard 
        title="Notification Settings" 
        description="Configure how you receive alerts and notifications"
      >
        <ToggleSetting
          label="Desktop Notifications"
          description="Show desktop notifications for important events"
          value={settings.desktopNotifications}
          onChange={(value) => handleSettingChange('desktopNotifications', value)}
        />
        
        <ToggleSetting
          label="Sound Alerts"
          description="Play sound when threats are detected"
          value={settings.soundAlerts}
          onChange={(value) => handleSettingChange('soundAlerts', value)}
        />
        
        <ToggleSetting
          label="Email Alerts"
          description="Send email notifications for critical threats"
          value={settings.emailAlerts}
          onChange={(value) => handleSettingChange('emailAlerts', value)}
        />
        
        <SelectSetting
          label="Alert Threshold"
          description="Minimum threat level to trigger notifications"
          value={settings.alertThreshold}
          options={[
            { value: 'low', label: 'Low and above' },
            { value: 'medium', label: 'Medium and above' },
            { value: 'high', label: 'High and critical only' },
            { value: 'critical', label: 'Critical only' }
          ]}
          onChange={(value) => handleSettingChange('alertThreshold', value)}
        />
      </SettingCard>

      {/* Performance Settings */}
      <SettingCard 
        title="Performance Settings" 
        description="Configure performance and resource usage"
      >
        <NumberSetting
          label="Maximum Devices"
          description="Maximum number of devices to track simultaneously"
          value={settings.maxDevices}
          min={10}
          max={1000}
          unit="devices"
          onChange={(value) => handleSettingChange('maxDevices', value)}
        />
        
        <NumberSetting
          label="History Retention"
          description="How long to keep historical data"
          value={settings.historyRetention}
          min={1}
          max={365}
          unit="days"
          onChange={(value) => handleSettingChange('historyRetention', value)}
        />
        
        <NumberSetting
          label="Update Frequency"
          description="How often to update real-time data"
          value={settings.updateFrequency}
          min={1}
          max={10}
          unit="seconds"
          onChange={(value) => handleSettingChange('updateFrequency', value)}
        />
      </SettingCard>

      {/* Application Info */}
      <SettingCard title="Application Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Version</label>
            <p className="text-sm text-gray-900">1.0.0</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Build Date</label>
            <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Server Status</label>
            <p className="text-sm text-success-600">Connected</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">License</label>
            <p className="text-sm text-gray-900">MIT License</p>
          </div>
        </div>
      </SettingCard>

      {/* Export/Import Settings */}
      <SettingCard 
        title="Backup & Restore" 
        description="Export or import your settings configuration"
      >
        <div className="flex space-x-4">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </button>
          <button className="btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            Import Settings
          </button>
        </div>
      </SettingCard>
    </div>
  )
}

export default Settings