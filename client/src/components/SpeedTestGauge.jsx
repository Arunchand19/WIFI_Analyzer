import React from 'react'

const SpeedTestGauge = ({ speed, maxSpeed = 100, label = "Mbps", isActive = false }) => {
  const percentage = Math.min((speed / maxSpeed) * 100, 100)
  const angle = (percentage / 100) * 180 - 90
  
  const radius = 80
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-48 h-32 mx-auto">
      {/* Background Arc */}
      <svg
        className="w-full h-full transform -rotate-90"
        width="192"
        height="128"
        viewBox="0 0 192 128"
      >
        {/* Background semicircle */}
        <path
          d="M 24 104 A 72 72 0 0 1 168 104"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Progress semicircle */}
        <path
          d="M 24 104 A 72 72 0 0 1 168 104"
          fill="none"
          stroke={isActive ? "#3b82f6" : "#10b981"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Speed Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
        <div className="text-3xl font-bold text-gray-900">
          {speed.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>
      </div>
      
      {/* Speed markers */}
      <div className="absolute inset-0">
        {[0, 25, 50, 75, 100].map((mark) => {
          const markAngle = (mark / 100) * 180 - 90
          const x = 96 + 65 * Math.cos((markAngle * Math.PI) / 180)
          const y = 104 + 65 * Math.sin((markAngle * Math.PI) / 180)
          
          return (
            <div
              key={mark}
              className="absolute text-xs text-gray-500 font-medium"
              style={{
                left: `${x - 8}px`,
                top: `${y - 8}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {mark}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SpeedTestGauge