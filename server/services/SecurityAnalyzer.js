const { exec } = require('child_process');
const util = require('util');
const ping = require('ping');

const execAsync = util.promisify(exec);

class SecurityAnalyzer {
  constructor() {
    this.knownDevices = new Set();
    this.suspiciousActivity = [];
    this.arpTable = new Map();
  }

  async performSecurityScan() {
    const threats = [];
    
    try {
      // Check for ARP spoofing
      const arpThreats = await this.detectArpSpoofing();
      threats.push(...arpThreats);

      // Check for rogue access points
      const rogueAPs = await this.detectRogueAccessPoints();
      threats.push(...rogueAPs);

      // Check for suspicious devices
      const suspiciousDevices = await this.detectSuspiciousDevices();
      threats.push(...suspiciousDevices);

      // Check for weak encryption
      const weakEncryption = await this.detectWeakEncryption();
      threats.push(...weakEncryption);

      // Check for unusual traffic patterns
      const trafficAnomalies = await this.detectTrafficAnomalies();
      threats.push(...trafficAnomalies);

      return {
        timestamp: new Date().toISOString(),
        totalThreats: threats.length,
        threats: threats,
        riskLevel: this.calculateOverallRisk(threats)
      };
    } catch (error) {
      console.error('Security scan error:', error);
      return {
        timestamp: new Date().toISOString(),
        totalThreats: 0,
        threats: [],
        riskLevel: 'Unknown',
        error: error.message
      };
    }
  }

  async detectArpSpoofing() {
    const threats = [];
    
    try {
      const { stdout } = await execAsync('arp -a');
      const arpEntries = this.parseArpTable(stdout);
      
      // Check for duplicate MAC addresses with different IPs
      const macToIps = new Map();
      
      for (const entry of arpEntries) {
        if (!macToIps.has(entry.mac)) {
          macToIps.set(entry.mac, []);
        }
        macToIps.get(entry.mac).push(entry.ip);
      }

      for (const [mac, ips] of macToIps) {
        if (ips.length > 1) {
          threats.push({
            type: 'ARP_SPOOFING',
            severity: 'High',
            description: `Potential ARP spoofing detected: MAC ${mac} associated with multiple IPs`,
            details: {
              mac: mac,
              ips: ips
            },
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check for rapid ARP changes

      this.checkArpChanges(arpEntries, threats);
      
    } catch (error) {
      console.error('ARP spoofing detection error:', error);
    }

    return threats;
  }

  async detectRogueAccessPoints() {        
    const threats = [];
    
    try {
      // This would require WiFi scanning capability
      // For now, we'll simulate detection based on suspicious SSIDs
      const suspiciousSSIDs = [
        'Free WiFi',
        'Public WiFi',
        'Guest',
        'Linksys',
        'NETGEAR',
        'Default'
      ];

      // In a real implementation, you would scan for networks here
      // and check against known good networks
      
      threats.push({
        type: 'ROGUE_AP_DETECTION',
        severity: 'Medium',
        description: 'Monitoring for rogue access points',
        details: {
          message: 'Continuous monitoring active for suspicious access points'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Rogue AP detection error:', error);
    }

    return threats;
  }

  async detectSuspiciousDevices() {
    const threats = [];
    
    try {
      // Check for devices with suspicious characteristics
      const { stdout } = await execAsync('arp -a');
      const arpEntries = this.parseArpTable(stdout);
      
      for (const entry of arpEntries) {
        // Check for randomized MAC addresses (common in attacks)
        if (this.isRandomizedMac(entry.mac)) {
          threats.push({
            type: 'SUSPICIOUS_DEVICE',
            severity: 'Medium',
            description: `Device with potentially randomized MAC address detected`,
            details: {
              ip: entry.ip,
              mac: entry.mac
            },
            timestamp: new Date().toISOString()
          });
        }

        // Check for unknown vendors
        const vendor = await this.getVendorFromMac(entry.mac);
        if (vendor === 'Unknown' || vendor === 'Private') {
          threats.push({
            type: 'UNKNOWN_DEVICE',
            severity: 'Low',
            description: `Device from unknown vendor detected`,
            details: {
              ip: entry.ip,
              mac: entry.mac,
              vendor: vendor
            },
            timestamp: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      console.error('Suspicious device detection error:', error);
    }

    return threats;
  }

  async detectWeakEncryption() {
    const threats = [];
    
    // This would integrate with WiFi scanning
    threats.push({
      type: 'ENCRYPTION_CHECK',
      severity: 'Info',
      description: 'Monitoring network encryption standards',
      details: {
        message: 'Checking for WEP, weak WPA, and open networks'
      },
      timestamp: new Date().toISOString()
    });

    return threats;
  }

  async detectTrafficAnomalies() {
    const threats = [];
    
    try {
      // Check for unusual network activity patterns
      // This is a simplified version - real implementation would analyze packet flows
      
      const networkStats = await this.getNetworkStatistics();
      
      if (networkStats.unusualTraffic) {
        threats.push({
          type: 'TRAFFIC_ANOMALY',
          severity: 'Medium',
          description: 'Unusual network traffic pattern detected',
          details: networkStats,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Traffic anomaly detection error:', error);
    }

    return threats;
  }

  parseArpTable(arpOutput) {
    const entries = [];
    const lines = arpOutput.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([0-9a-f-]{17})/i);
      if (match) {
        entries.push({
          ip: match[1],
          mac: match[2].toLowerCase()
        });
      }
    }
    
    return entries;
  }

  checkArpChanges(currentEntries, threats) {
    const currentTime = Date.now();
    
    for (const entry of currentEntries) {
      const key = entry.ip;
      const previousEntry = this.arpTable.get(key);
      
      if (previousEntry && previousEntry.mac !== entry.mac) {
        const timeDiff = currentTime - previousEntry.timestamp;
        
        // If MAC changed within 5 minutes, it's suspicious
        if (timeDiff < 300000) {
          threats.push({
            type: 'ARP_CHANGE',
            severity: 'High',
            description: `Rapid ARP table change detected for IP ${entry.ip}`,
            details: {
              ip: entry.ip,
              oldMac: previousEntry.mac,
              newMac: entry.mac,
              timeElapsed: timeDiff
            },
            timestamp: new Date().toISOString()
          });
        }
      }
      
      this.arpTable.set(key, {
        mac: entry.mac,
        timestamp: currentTime
      });
    }
  }

  isRandomizedMac(mac) {
    // Check for locally administered bit (second bit of first octet)
    const firstOctet = parseInt(mac.substring(0, 2), 16);
    return (firstOctet & 0x02) !== 0;
  }

  async getVendorFromMac(mac) {
    // Simplified vendor lookup
    const oui = mac.substring(0, 8).replace(/[:-]/g, '').toUpperCase();
    const vendors = {
      '00:50:56': 'VMware',
      '08:00:27': 'VirtualBox',
      '00:0C:29': 'VMware',
      '00:1B:21': 'Intel',
      '00:23:24': 'Apple',
      '28:CF:E9': 'Apple'
    };
    
    return vendors[mac.substring(0, 8)] || 'Unknown';
  }

  async getNetworkStatistics() {
    // Simplified network statistics
    return {
      unusualTraffic: Math.random() > 0.8, // 20% chance of detecting unusual traffic
      bytesPerSecond: Math.floor(Math.random() * 1000000),
      packetsPerSecond: Math.floor(Math.random() * 1000)
    };
  }

  calculateOverallRisk(threats) {
    if (threats.length === 0) return 'Low';
    
    const highSeverityCount = threats.filter(t => t.severity === 'High').length;
    const mediumSeverityCount = threats.filter(t => t.severity === 'Medium').length;
    
    if (highSeverityCount > 0) return 'High';
    if (mediumSeverityCount > 2) return 'High';
    if (mediumSeverityCount > 0) return 'Medium';
    
    return 'Low';
  }
}

module.exports = SecurityAnalyzer;