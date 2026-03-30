const si = require('systeminformation');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class TrafficMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.trafficHistory = [];
    this.deviceTraffic = new Map();
    this.callbacks = [];
  }

  startMonitoring(callback) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.callbacks.push(callback);

    this.monitoringInterval = setInterval(async () => {
      try {
        const trafficData = await this.collectTrafficData();
        
        // Store in history
        this.trafficHistory.push(trafficData);
        
        // Keep only last 100 entries
        if (this.trafficHistory.length > 100) {
          this.trafficHistory.shift();
        }

        // Notify all callbacks
        this.callbacks.forEach(cb => cb(trafficData));
        
      } catch (error) {
        console.error('Traffic monitoring error:', error);
      }
    }, 2000); // Update every 2 seconds
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.callbacks = [];
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async collectTrafficData() {
    const timestamp = new Date().toISOString();
    
    // Get network statistics
    const networkStats = await si.networkStats();
    const networkInterfaces = await si.networkInterfaces();
    
    // Get active network connections
    const connections = await this.getActiveConnections();
    
    // Calculate bandwidth usage
    const bandwidthData = this.calculateBandwidth(networkStats);
    
    // Analyze traffic by protocol
    const protocolStats = await this.analyzeProtocols();
    
    // Get top applications using network
    const appUsage = await this.getApplicationUsage();

    return {
      timestamp,
      interfaces: networkInterfaces.map(iface => ({
        name: iface.iface,
        ip4: iface.ip4,
        mac: iface.mac,
        speed: iface.speed,
        operstate: iface.operstate,
        type: iface.type
      })),
      networkStats: networkStats.map(stat => ({
        iface: stat.iface,
        operstate: stat.operstate,
        rx_bytes: stat.rx_bytes,
        tx_bytes: stat.tx_bytes,
        rx_sec: stat.rx_sec,
        tx_sec: stat.tx_sec,
        rx_dropped: stat.rx_dropped,
        tx_dropped: stat.tx_dropped,
        rx_errors: stat.rx_errors,
        tx_errors: stat.tx_errors
      })),
      bandwidth: bandwidthData,
      connections: connections,
      protocols: protocolStats,
      applications: appUsage,
      summary: {
        totalConnections: connections.length,
        totalBandwidth: bandwidthData.total,
        uploadSpeed: bandwidthData.upload,
        downloadSpeed: bandwidthData.download,
        packetsPerSecond: bandwidthData.packetsPerSecond
      }
    };
  }

  calculateBandwidth(networkStats) {
    let totalRx = 0;   //total received bytes
    let totalTx = 0;   //total transmitted bytes
    let totalRxSec = 0;
    let totalTxSec = 0;

    networkStats.forEach(stat => {
      if (stat.operstate === 'up' && !stat.iface.includes('Loopback')) {
        totalRx += stat.rx_bytes || 0;
        totalTx += stat.tx_bytes || 0;
        totalRxSec += stat.rx_sec || 0;
        totalTxSec += stat.tx_sec || 0;
      }
    });

    return {
      total: totalRx + totalTx,    //packets calculation total bytes
      download: totalRxSec,
      upload: totalTxSec,
      downloadBytes: totalRx,
      uploadBytes: totalTx,
      packetsPerSecond: Math.floor((totalRxSec + totalTxSec) / 1500) // Approximate packets
    };
  }

  async getActiveConnections() {
    try {
      const { stdout } = await execAsync('netstat -an');
      const connections = this.parseNetstatOutput(stdout);
      return connections;
    } catch (error) {
      console.error('Failed to get connections:', error);
      return [];
    }
  }

  parseNetstatOutput(output) {
    const connections = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      
      if (parts.length >= 4 && (parts[0] === 'TCP' || parts[0] === 'UDP')) {
        const [protocol, localAddress, foreignAddress, state] = parts;
        
        connections.push({
          protocol,
          localAddress,
          foreignAddress,
          state: state || 'N/A',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return connections;
  }

  async analyzeProtocols() {
    try {
      // Get protocol statistics from netstat
      const { stdout } = await execAsync('netstat -s');
      const protocolStats = this.parseProtocolStats(stdout);       //Protocol packet parsing setup
      
      return protocolStats;
    } catch (error) {
      console.error('Failed to analyze protocols:', error);
      return {
        tcp: { packets: 0, bytes: 0 },
        udp: { packets: 0, bytes: 0 },
        icmp: { packets: 0, bytes: 0 },
        http: { requests: 0 },
        https: { requests: 0 },
        dns: { queries: 0 }
      };
    }
  }

  parseProtocolStats(output) {
    const stats = {
      tcp: { packets: 0, bytes: 0, connections: 0 },      //Packet counters initialization
      udp: { packets: 0, bytes: 0, datagrams: 0 },
      icmp: { packets: 0, bytes: 0, messages: 0 },  //internet control message protocol
      ip: { packets: 0, bytes: 0 }
    };

    const lines = output.split('\n');
    let currentProtocol = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.includes('TCP Statistics')) {
        currentProtocol = 'tcp';
      } else if (trimmed.includes('UDP Statistics')) {
        currentProtocol = 'udp';
      } else if (trimmed.includes('ICMP Statistics')) {
        currentProtocol = 'icmp';
      } else if (trimmed.includes('IP Statistics')) {
        currentProtocol = 'ip';
      }

      if (currentProtocol && trimmed.match(/\d+/)) {
        const numbers = trimmed.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          const value = parseInt(numbers[0]);            // Packet detection in netstat output
          
          if (trimmed.toLowerCase().includes('segment') || trimmed.toLowerCase().includes('packet')) {
            stats[currentProtocol].packets += value;   //Packet count extraction
          } else if (trimmed.toLowerCase().includes('byte')) {
            stats[currentProtocol].bytes += value;
          }
        }
      }
    }

    return stats;
  }

  async getApplicationUsage() {
    try {
      // Get process network usage (simplified)
      const processes = await si.processes();
      
      const networkProcesses = processes.list
        .filter(proc => proc.name && proc.cpu > 0)
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 10)
        .map(proc => ({
          name: proc.name,
          pid: proc.pid,
          cpu: proc.cpu,
          memory: proc.memory,
          command: proc.command
        }));

      return networkProcesses;
    } catch (error) {
      console.error('Failed to get application usage:', error);
      return [];
    }
  }

  getTrafficHistory() {
    return this.trafficHistory;
  }

  getDeviceTraffic(deviceId) {
    return this.deviceTraffic.get(deviceId) || [];
  }

  categorizeTraffic(connections) {
    const categories = {
      web: 0,
      streaming: 0,
      gaming: 0,
      file_transfer: 0,
      email: 0,
      other: 0
    };

    connections.forEach(conn => {
      const port = this.extractPort(conn.foreignAddress);
      
      if ([80, 443, 8080, 8443].includes(port)) {
        categories.web++;
      } else if ([1935, 554, 5004].includes(port)) {
        categories.streaming++;
      } else if (port >= 27000 && port <= 27100) {
        categories.gaming++;
      } else if ([21, 22, 990, 989].includes(port)) {
        categories.file_transfer++;
      } else if ([25, 110, 143, 993, 995].includes(port)) {
        categories.email++;
      } else {
        categories.other++;
      }
    });

    return categories;
  }

  extractPort(address) {
    const parts = address.split(':');
    return parseInt(parts[parts.length - 1]) || 0;
  }
}

module.exports = TrafficMonitor;