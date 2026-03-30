import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import NetworkScanner from './pages/NetworkScanner'
import DeviceMonitor from './pages/DeviceMonitor'
import SecurityAnalysis from './pages/SecurityAnalysis'

import MalwareScanner from './pages/MalwareScanner'
import Settings from './pages/Settings'
import SpeedTest from './pages/SpeedTest'
import { SocketProvider } from './hooks/useSocket'

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scanner" element={<NetworkScanner />} />
              <Route path="/devices" element={<DeviceMonitor />} />
              <Route path="/security" element={<SecurityAnalysis />} />

              <Route path="/malware" element={<MalwareScanner />} />
              <Route path="/speedtest" element={<SpeedTest />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </SocketProvider>
  )
}

export default App