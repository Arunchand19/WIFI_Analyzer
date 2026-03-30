const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const wifi = require('node-wifi');
const ping = require('ping');
const si = require('systeminformation');
const moment = require('moment');

const NetworkScanner = require('./services/NetworkScanner');
const SecurityAnalyzer = require('./services/SecurityAnalyzer');
const TrafficMonitor = require('./services/TrafficMonitor');
const MalwareDetector = require('./services/MalwareDetector');
const SpeedTest = require('./services/SpeedTest');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve React static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize WiFi
wifi.init({
  iface: null
});

// Services
const networkScanner = new NetworkScanner();
const securityAnalyzer = new SecurityAnalyzer();
const trafficMonitor = new TrafficMonitor();
const malwareDetector = new MalwareDetector();
const speedTest = new SpeedTest();

// Store active connections and data
let activeDevices = new Map();
let networkStats = {
  totalDevices: 0,
  totalTraffic: 0,
  securityThreats: 0,
  networkHealth: 100
};

// Socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Start real-time monitoring
  startRealTimeMonitoring(socket);

  socket.on('scan-networks', async () => {
    try {
      const networks = await networkScanner.scanWifiNetworks();
      socket.emit('networks-found', networks);
    } catch (error) {
      socket.emit('error', { message: 'Failed to scan networks', error: error.message });
    }
  });

  socket.on('scan-devices', async () => {
    try {
      const devices = await networkScanner.scanConnectedDevices();
      socket.emit('devices-found', devices);
    } catch (error) {
      socket.emit('error', { message: 'Failed to scan devices', error: error.message });
    }
  });

  socket.on('start-traffic-monitoring', () => {
    trafficMonitor.startMonitoring((data) => {
      socket.emit('traffic-data', data);
    });
  });

  socket.on('stop-traffic-monitoring', () => {
    trafficMonitor.stopMonitoring();
  });

  socket.on('security-scan', async () => {
    try {
      const threats = await securityAnalyzer.performSecurityScan();
      socket.emit('security-results', threats);
    } catch (error) {
      socket.emit('error', { message: 'Security scan failed', error: error.message });
    }
  });

  socket.on('malware-scan', async (deviceIp) => {
    try {
      const result = await malwareDetector.scanDevice(deviceIp);
      socket.emit('malware-results', result);
    } catch (error) {
      socket.emit('error', { message: 'Malware scan failed', error: error.message });
    }
  });

  socket.on('speed-test', async () => {
    try {
      const result = await speedTest.runSpeedTest();
      socket.emit('speed-test-results', result);
    } catch (error) {
      socket.emit('error', { message: 'Speed test failed', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    trafficMonitor.stopMonitoring();
  });
});

async function startRealTimeMonitoring(socket) {
  setInterval(async () => {
    try {
      // Network interface stats
      const networkStats = await si.networkStats();
      const networkInterfaces = await si.networkInterfaces();
      
      // System performance
      const cpu = await si.currentLoad();
      const memory = await si.mem();
      
      const realTimeData = {
        timestamp: moment().format(),
        networkStats: networkStats[0] || {},
        interfaces: networkInterfaces,
        cpu: cpu.currentLoad,
        memory: {
          used: memory.used,
          total: memory.total,
          percentage: (memory.used / memory.total) * 100
        },
        activeConnections: activeDevices.size
      };

      socket.emit('real-time-data', realTimeData);
    } catch (error) {
      console.error('Real-time monitoring error:', error);
    }
  }, 2000);
}

// REST API endpoints
app.get('/api/network-info', async (req, res) => {
  try {
    const networkInfo = await si.networkInterfaces();
    res.json(networkInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/system-info', async (req, res) => {
  try {
    const system = await si.system();
    const cpu = await si.cpu();
    const memory = await si.mem();
    
    res.json({
      system,
      cpu,
      memory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 WiFi Analyzer Server running on port ${PORT}`);
  console.log(`📡 Real-time monitoring active`);
});