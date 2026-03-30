# WiFi Traffic Analyzer

A comprehensive WiFi network analysis tool with real-time monitoring, security threat detection, and malware scanning capabilities.

## 🚀 Features

### Core Features
- **WiFi Network Discovery** - Detects all nearby WiFi networks with detailed information
- **Connected Device Detection** - Lists all devices on the network with device fingerprinting
- **Real-time Traffic Monitoring** - Live bandwidth and connection analysis
- **Security Threat Detection** - Advanced threat detection and vulnerability assessment
- **Malware Scanner** - Comprehensive malware detection for network devices

### Security & Threat Detection
- **ARP Spoofing Detection** - Detects man-in-the-middle attacks
- **Rogue Access Point Detection** - Identifies suspicious access points
- **Intrusion Detection** - Monitors for unauthorized network access
- **Packet Inspection** - Deep packet analysis for security threats
- **Behavioral Analysis** - AI-powered anomaly detection

### Network Performance & Diagnostics
- **Signal Strength Analysis** - Real-time RSSI monitoring
- **Channel Overlap Analysis** - Identifies network congestion
- **Bandwidth Usage Monitoring** - Per-device traffic analysis
- **Latency Testing** - Network performance metrics
- **Protocol Analysis** - TCP/UDP/ICMP traffic breakdown

### Visualization & UI
- **Real-time Dashboards** - Interactive monitoring interfaces
- **Network Topology Maps** - Visual network relationships
- **Traffic Graphs** - Live bandwidth and connection charts
- **Security Reports** - Comprehensive threat analysis
- **Device Management** - Detailed device information and control

## 🛠 Tech Stack

### Frontend
- **React.js** with Vite for fast development
- **Tailwind CSS** for modern styling
- **Chart.js & Recharts** for data visualization
- **Socket.io Client** for real-time communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **Socket.io** for real-time communication
- **System Information** for hardware monitoring
- **Network Scanning** libraries for device discovery
- **Security Analysis** modules for threat detection

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Windows 10/11 (current version optimized for Windows)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WifiAnalzer
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Manual Installation

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start server and client separately**
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

## 🖥 Usage

### Dashboard
- View real-time network statistics
- Monitor system performance
- Track security threats
- Analyze network traffic

### Network Scanner
- Discover nearby WiFi networks
- Analyze signal strength and security
- Identify potential threats
- Filter and sort networks

### Device Monitor
- View all connected devices
- Monitor device activity
- Assess security risks
- Perform malware scans

### Security Analysis
- Run comprehensive security scans
- View threat details and recommendations
- Monitor for suspicious activity
- Generate security reports

### Traffic Analyzer
- Monitor real-time network traffic
- Analyze bandwidth usage
- View protocol distribution
- Track active connections

### Malware Scanner
- Scan devices for malware
- Detect suspicious ports
- Analyze behavioral patterns
- Generate security recommendations

## 🔧 Configuration

### Server Configuration
The server can be configured by modifying environment variables or the configuration files in the `server` directory.

### Client Configuration
Client settings can be modified in the Settings page of the application or by editing the configuration files in the `client/src` directory.

## 🚨 Security Features

### Threat Detection
- **ARP Spoofing** - Detects MAC address conflicts and rapid ARP changes
- **Rogue APs** - Identifies suspicious access points
- **Port Scanning** - Detects suspicious port activity
- **Traffic Anomalies** - Identifies unusual network patterns
- **Malware Signatures** - Detects known malware patterns

### Malware Detection
- **Suspicious Ports** - Scans for backdoor and trojan ports
- **Behavioral Analysis** - Detects unusual device behavior
- **DNS Analysis** - Identifies malicious domain queries
- **Traffic Patterns** - Detects data exfiltration attempts
- **C&C Communication** - Identifies command and control traffic

## 📊 Monitoring Capabilities

### Real-time Metrics
- Network bandwidth (upload/download)
- Active connections count
- Device response times
- System resource usage
- Security threat levels

### Historical Data
- Traffic patterns over time
- Device connection history
- Security incident logs
- Performance metrics
- Network topology changes

## 🔒 Privacy & Security

- All scanning is performed locally on your network
- No data is sent to external servers
- Network traffic analysis respects privacy
- Malware detection uses local signatures
- Security recommendations are generated locally

## 🐛 Troubleshooting

### Common Issues

1. **Server Connection Failed**
   - Ensure the server is running on port 3001
   - Check firewall settings
   - Verify network connectivity

2. **No Networks Found**
   - Check WiFi adapter is enabled
   - Run as administrator for enhanced scanning
   - Verify network interface selection

3. **Device Scan Empty**
   - Ensure you're connected to a network
   - Check network permissions
   - Try running with elevated privileges

4. **Malware Scan Fails**
   - Verify target device is reachable
   - Check network connectivity
   - Ensure proper permissions

## 📝 Development

### Project Structure
```
WifiAnalzer/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared utilities
└── README.md        # This file
```

### Development Commands
```bash
npm run dev          # Start both server and client
npm run server       # Start server only
npm run client       # Start client only
npm run build        # Build for production
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by professional network analysis tools
- Designed for cybersecurity professionals and enthusiasts
- Community-driven development

## 📞 Support

For support, issues, or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**⚠️ Disclaimer**: This tool is for educational and legitimate network analysis purposes only. Always ensure you have proper authorization before scanning networks that you do not own or administer.