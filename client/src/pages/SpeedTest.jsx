import React, { useState } from 'react'
import { 
  Zap, 
  Download, 
  Upload, 
  Clock, 
  Activity,
  Play,
  RotateCcw,
  Wifi,
  CheckCircle
} from 'lucide-react'
import SpeedTestGauge from '../components/SpeedTestGauge'
import { useSocket } from '../hooks/useSocket'

const SpeedTest = () => {
  const { socket, connected } = useSocket()
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState('idle') // idle, ping, download, upload, complete
  const [results, setResults] = useState(null)
  const [progress, setProgress] = useState(0)

  const runSpeedTest = async () => {
    if (!connected || isRunning) return

    setIsRunning(true)
    setCurrentTest('ping')
    setProgress(0)
    setResults(null)

    try {
      // Simulate speed test phases
      const phases = [
        { name: 'ping', duration: 2000, label: 'Testing Ping...' },
        { name: 'download', duration: 8000, label: 'Testing Download Speed...' },
        { name: 'upload', duration: 6000, label: 'Testing Upload Speed...' }
      ]

      let totalProgress = 0
      const progressStep = 100 / phases.length

      for (const phase of phases) {
        setCurrentTest(phase.name)
        
        // Simulate progress for this phase
        const startTime = Date.now()
        const interval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const phaseProgress = Math.min((elapsed / phase.duration) * progressStep, progressStep)
          setProgress(totalProgress + phaseProgress)
        }, 100)

        await new Promise(resolve => setTimeout(resolve, phase.duration))
        clearInterval(interval)
        totalProgress += progressStep
        setProgress(totalProgress)
      }

      // Simulate final results
      const mockResults = {
        ping: Math.floor(Math.random() * 20) + 1,
        jitter: Math.floor(Math.random() * 5) + 1,
        download: Math.floor(Math.random() * 50) + 50,
        upload: Math.floor(Math.random() * 30) + 20,
        quality: 'Excellent',
        timestamp: new Date().toISOString()
      }

      setResults(mockResults)
      setCurrentTest('complete')
      setProgress(100)

    } catch (error) {
      console.error('Speed test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excellent': return 'text-success-600'
      case 'Good': return 'text-primary-600'
      case 'Fair': return 'text-warning-600'
      case 'Poor': return 'text-danger-600'
      default: return 'text-gray-600'
    }
  }

  const getCurrentSpeed = () => {
    if (!isRunning || !results) return 0
    
    switch (currentTest) {
      case 'download':
        return results?.download || Math.random() * 100
      case 'upload':
        return results?.upload || Math.random() * 50
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Internet Speed Test</h1>
        <p className="text-gray-600">Test your WiFi connection speed and quality</p>
      </div>

      {/* Main Speed Test Card */}
      <div className="card max-w-4xl mx-auto">
        {!isRunning && !results && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Test Your Speed</h2>
            <p className="text-gray-600 mb-8">Click the button below to start testing your internet connection</p>
            <button
              onClick={runSpeedTest}
              disabled={!connected}
              className="btn-primary text-lg px-8 py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Speed Test
            </button>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <SpeedTestGauge 
              speed={getCurrentSpeed()} 
              maxSpeed={currentTest === 'upload' ? 100 : 200}
              isActive={true}
            />
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentTest === 'ping' && 'Testing Connection...'}
                {currentTest === 'download' && 'Testing Download Speed...'}
                {currentTest === 'upload' && 'Testing Upload Speed...'}
              </h3>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-gray-600">Please wait while we test your connection...</p>
            </div>
          </div>
        )}

        {results && currentTest === 'complete' && (
          <div className="py-8">
            <div className="text-center mb-8">
              <SpeedTestGauge speed={results.download} maxSpeed={200} />
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">Your Speed Test Results</h3>
                <p className="text-gray-600 mt-2">
                  Connection & Line Quality Score: 
                  <span className={`font-semibold ml-2 ${getQualityColor(results.quality)}`}>
                    {results.quality}
                  </span>
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Download className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">DOWNLOAD</div>
                <div className="text-2xl font-bold text-gray-900">{results.download}</div>
                <div className="text-sm text-gray-500">Mbps</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">UPLOAD</div>
                <div className="text-2xl font-bold text-gray-900">{results.upload}</div>
                <div className="text-sm text-gray-500">Mbps</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-warning-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">PING</div>
                <div className="text-2xl font-bold text-gray-900">{results.ping}</div>
                <div className="text-sm text-gray-500">ms</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600 mb-1">JITTER</div>
                <div className="text-2xl font-bold text-gray-900">{results.jitter}</div>
                <div className="text-sm text-gray-500">ms</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <button
                onClick={runSpeedTest}
                disabled={!connected}
                className="btn-secondary mr-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Test Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Speed Test Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Speed Test Works</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Ping Test:</strong> Measures the response time to your server
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Download Test:</strong> Tests how fast you can receive data
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Upload Test:</strong> Tests how fast you can send data
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Jitter Test:</strong> Measures connection stability
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Speed Recommendations</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Web Browsing</span>
              <span className="font-medium text-gray-900">1-5 Mbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Video Streaming (HD)</span>
              <span className="font-medium text-gray-900">5-25 Mbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Video Streaming (4K)</span>
              <span className="font-medium text-gray-900">25+ Mbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gaming</span>
              <span className="font-medium text-gray-900">3-6 Mbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Video Calls</span>
              <span className="font-medium text-gray-900">1-4 Mbps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Large Downloads</span>
              <span className="font-medium text-gray-900">50+ Mbps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpeedTest