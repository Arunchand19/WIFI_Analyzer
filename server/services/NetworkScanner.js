const wifi = require('node-wifi');
const ping = require('ping');
const si = require('systeminformation');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class NetworkScanner {
  constructor() {
    this.scanResults = new Map();
    this.deviceCache = new Map();
  }

  async scanWifiNetworks() {
    try {
      const networks = await wifi.scan();
      
      const enhancedNetworks = networks.map(network => ({
        ssid: network.ssid,
        bssid: network.bssid,
        mac: network.mac,
        channel: network.channel,
        frequency: network.frequency,
        signal_level: network.signal_level,
        quality: network.quality,

        security: network.security,    //security protocol used 
        security_flags: network.security_flags,

        mode: network.mode,
        timestamp: new Date().toISOString(),
        threat_level: this.assessThreatLevel(network),
        
        encryption_strength: this.getEncryptionStrength(network.security)   //network encryption strength
      }));

      return enhancedNetworks.sort((a, b) => b.signal_level - a.signal_level);
    } catch (error) {
      console.error('WiFi scan error:', error);
      return [];
    }
  }

  async scanConnectedDevices() {
    try {
      const devices = [];
      
      // Get network interfaces
      const interfaces = await si.networkInterfaces();
      const activeInterface = interfaces.find(iface => 
        iface.ip4 && !iface.internal && iface.operstate === 'up'
      );

      if (!activeInterface) {
        return devices;
      }

      const subnet = this.getSubnet(activeInterface.ip4);
      
      // Scan common device IPs first (faster results)
      const commonIPs = [
        subnet + '1',   // Router
        subnet + '2',   // Common device
        subnet + '100', // DHCP range start
        subnet + '101',
        subnet + '102',
        subnet + '103',
        subnet + '104',
        subnet + '105'
      ];
      
      // Quick scan of common IPs
      for (const ip of commonIPs) {
        try {
          const result = await this.pingDevice(ip);
          if (result.alive) {
            const deviceInfo = await this.getDeviceInfo(result.host);
            devices.push(deviceInfo);
          }
        } catch (error) {
          // Continue with next IP
        }
      }
      
      // Add current device
      const currentDevice = await this.getDeviceInfo(activeInterface.ip4);
      currentDevice.hostname = 'This Computer';
      currentDevice.deviceType = 'Computer';
      devices.push(currentDevice);

      return devices;
    } catch (error) {
      console.error('Device scan error:', error);
      return [];
    }
  }

  async pingDevice(host) {
    try {
      const result = await ping.promise.probe(host, {
        timeout: 1,
        extra: ['-n', '1']
      });
      return result;
    } catch (error) {
      return { host, alive: false };
    }
  }

  async getDeviceInfo(ip) {
    try {
      let hostname = 'Unknown';
      let mac = 'Unknown';
      let vendor = 'Unknown';

      // Get MAC address from ARP table (more reliable on Windows)
      try {
        const { stdout } = await execAsync(`arp -a`);
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes(ip)) {
            const macMatch = line.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);
            if (macMatch) {
              mac = macMatch[0].toLowerCase();
              vendor = this.getVendorFromMac(mac);
              break;
            }
          }
        }
      } catch (e) {
        // ARP lookup failed
      }

      // Try to get hostname
      try {
        const { stdout } = await execAsync(`ping -a -n 1 ${ip}`, { timeout: 2000 });
        const hostnameMatch = stdout.match(/Pinging ([^\s\[]+)/);
        if (hostnameMatch && hostnameMatch[1] !== ip) {
          hostname = hostnameMatch[1];
        }
      } catch (e) {
        // Hostname lookup failed
      }

      const responseTime = await this.getResponseTime(ip);
      const deviceType = this.guessDeviceType(hostname, mac, vendor);
      
      return {
        ip,
        hostname,
        mac,
        vendor,
        lastSeen: new Date().toISOString(),
        responseTime,
        deviceType,
        securityRisk: this.assessDeviceRisk(hostname, mac, vendor),
        isOnline: responseTime !== null
      };
    } catch (error) {
      return {
        ip,
        hostname: 'Unknown Device',
        mac: 'Unknown',
        vendor: 'Unknown',
        lastSeen: new Date().toISOString(),
        responseTime: null,
        deviceType: 'Unknown Device',
        securityRisk: 'Medium',
        isOnline: false
      };
    }
  }

  async getResponseTime(ip) {
    try {
      const result = await ping.promise.probe(ip, {
        timeout: 2,
        extra: ['-n', '1']
      });
      return result.alive ? Math.round(result.time) : null;
    } catch (error) {
      return null;
    }
  }

  getSubnet(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.`;
  }

  assessThreatLevel(network) {
    if (!network.security || network.security.includes('None')) {
      return 'High';
    }
    if (network.security.includes('WEP')) {
      return 'High';
    }
    if (network.security.includes('WPA')) {
      return 'Medium';
    }
    if (network.security.includes('WPA2') || network.security.includes('WPA3')) {
      return 'Low';
    }
    return 'Medium';
  }

  getEncryptionStrength(security) {            // determine encryption strength security protocol
    if (!security || security.includes('None')) return 'None';
    if (security.includes('WEP')) return 'Weak';     //Wired Equivalent Privacy
    if (security.includes('WPA3')) return 'Strong';
    if (security.includes('WPA2')) return 'Good';    //Wi-Fi Protected Access
    if (security.includes('WPA')) return 'Fair';
    return 'Unknown';
  }

  getVendorFromMac(mac) {
    if (!mac || mac === 'Unknown') return 'Unknown';
    
    const oui = mac.substring(0, 8).toUpperCase();
    const vendors = {
      '00:50:56': 'VMware',
      '08:00:27': 'VirtualBox',    //MAC addresses for virtual machines
      '00:0C:29': 'VMware',
      '00:1B:21': 'Intel',
      '00:23:24': 'Apple',
      '28:CF:E9': 'Apple',
      'AC:DE:48': 'Apple',
      '00:15:5D': 'Microsoft',
      '00:03:FF': 'Microsoft',
      'B8:27:EB': 'Raspberry Pi',
      'DC:A6:32': 'Raspberry Pi',
      '00:16:3E': 'Xen',
      '52:54:00': 'QEMU',
      '00:1C:42': 'Parallels',
      '00:0F:4B': 'Realtek',
      '94:DE:80': 'ASRock',
      '70:85:C2': 'Realtek'
    };
    
    return vendors[oui] || 'Unknown';
  }

  guessDeviceType(hostname, mac, vendor) {
    const name = hostname.toLowerCase();
    
    // Check hostname patterns
    if (name.includes('iphone') || name.includes('ipad') || name.includes('android')) return 'Mobile Device';
    if (name.includes('laptop') || name.includes('pc') || name.includes('desktop')) return 'Computer';
    if (name.includes('router') || name.includes('gateway') || name.includes('modem')) return 'Network Device';
    if (name.includes('printer') || name.includes('canon') || name.includes('hp') || name.includes('epson')) return 'Printer';
    if (name.includes('tv') || name.includes('roku') || name.includes('chromecast') || name.includes('firestick')) return 'Media Device';
    if (name.includes('alexa') || name.includes('echo') || name.includes('google') || name.includes('nest')) return 'Smart Device';
    
    // Check vendor patterns
    if (vendor) {
      const v = vendor.toLowerCase();
      if (v.includes('apple')) return 'Mobile Device';
      if (v.includes('intel') || v.includes('realtek')) return 'Computer';
      if (v.includes('raspberry')) return 'IoT Device';
      if (v.includes('vmware') || v.includes('virtualbox')) return 'Virtual Machine';
    }
    
    // Check MAC patterns
    if (mac && mac !== 'Unknown') {
      // Local/private MAC addresses often indicate mobile devices
      const firstOctet = parseInt(mac.substring(0, 2), 16);
      if ((firstOctet & 0x02) !== 0) return 'Mobile Device';
    }
    
    return 'Unknown Device';
  }

  assessDeviceRisk(hostname, mac, vendor) {
    if (vendor === 'Unknown' && mac === 'Unknown') return 'High';
    if (hostname.includes('unknown') || hostname === 'Unknown') return 'Medium';
    return 'Low';
  }
}

module.exports = NetworkScanner;