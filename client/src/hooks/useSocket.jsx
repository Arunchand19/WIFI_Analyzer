import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [realTimeData, setRealTimeData] = useState(null)
  const [networks, setNetworks] = useState([])
  const [devices, setDevices] = useState([])
  const [trafficData, setTrafficData] = useState(null)
  const [securityResults, setSecurityResults] = useState(null)
  const [malwareResults, setMalwareResults] = useState(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setConnected(true)
      toast.success('Connected to WiFi Analyzer Server')
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      toast.error('Disconnected from server')
      console.log('Disconnected from server')
    })

    newSocket.on('real-time-data', (data) => {
      setRealTimeData(data)
    })

    newSocket.on('networks-found', (data) => {
      setNetworks(data)
      toast.success(`Found ${data.length} WiFi networks`)
    })

    newSocket.on('devices-found', (data) => {
      setDevices(data)
      toast.success(`Found ${data.length} connected devices`)
    })

    newSocket.on('traffic-data', (data) => {
      setTrafficData(data)
    })

    newSocket.on('security-results', (data) => {
      setSecurityResults(data)
      if (data.totalThreats > 0) {
        toast.error(`Security scan found ${data.totalThreats} threats`)
      } else {
        toast.success('Security scan completed - no threats found')
      }
    })

    newSocket.on('malware-results', (data) => {
      setMalwareResults(data)
      if (data.riskLevel === 'Critical' || data.riskLevel === 'High') {
        toast.error(`Malware scan: ${data.riskLevel} risk level detected`)
      } else {
        toast.success(`Malware scan completed - ${data.riskLevel} risk level`)
      }
    })

    newSocket.on('error', (error) => {
      toast.error(error.message || 'An error occurred')
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const scanNetworks = () => {
    if (socket) {
      socket.emit('scan-networks')
      toast.loading('Scanning WiFi networks...', { id: 'network-scan' })
    }
  }

  const scanDevices = () => {
    if (socket) {
      socket.emit('scan-devices')
      toast.loading('Scanning connected devices...', { id: 'device-scan' })
    }
  }

  const startTrafficMonitoring = () => {
    if (socket) {
      socket.emit('start-traffic-monitoring')
      toast.success('Traffic monitoring started')
    }
  }

  const stopTrafficMonitoring = () => {
    if (socket) {
      socket.emit('stop-traffic-monitoring')
      toast.success('Traffic monitoring stopped')
    }
  }

  const performSecurityScan = () => {
    if (socket) {
      socket.emit('security-scan')
      toast.loading('Performing security scan...', { id: 'security-scan' })
    }
  }

  const scanForMalware = (deviceIp) => {
    if (socket) {
      socket.emit('malware-scan', deviceIp)
      toast.loading(`Scanning ${deviceIp} for malware...`, { id: 'malware-scan' })
    }
  }

  const value = {
    socket,
    connected,
    realTimeData,
    networks,
    devices,
    trafficData,
    securityResults,
    malwareResults,
    scanNetworks,
    scanDevices,
    startTrafficMonitoring,
    stopTrafficMonitoring,
    performSecurityScan,
    scanForMalware
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}