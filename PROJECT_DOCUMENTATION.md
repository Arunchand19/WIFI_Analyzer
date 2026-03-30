# WiFi Analyzer - Node Libraries & Detection

## FRONTEND LIBRARIES
React, React Router, Socket.io Client, Axios, Chart.js, Recharts, Tailwind CSS, Moment.js

## BACKEND NODE MODULES
Express.js, Socket.io, Node-WiFi, Systeminformation, Ping, Child_process, CORS, Body-parser, Dotenv

## DETECTION ALGORITHMS & MODULES

Network Scanning (node-wifi, systeminformation, ping)
- WiFi: Scan networks, threat=Open/WEP(High), WPA(Med), WPA2/3(Low)
- Devices: Ping subnet, MAC from arp -a, identify vendor

Security Threats (child_process)
- ARP: MAC→Multiple IPs=Spoofing, MAC changed<5min=Suspicious
- MAC: (firstOctet&0x02)!=0=Randomized
- Encryption: Open/WEP=High, WPA=Med, WPA2/3=Low

Malware Detection (child_process, netstat)
- Ports: Check 50+ ports, Critical=1337,31337,12345,54321,6667
- Behavior: Conn>50=Scanning, Upload>80%=Exfiltration, Periodic=C&C
- DNS: Entropy>3.5=DGA, Query>1000=Flooding
- Traffic: Upload>80%=Theft, Encrypted>90%=Tunnel
- Risk: Critical>0=CRITICAL, High>1=HIGH, else MEDIUM/LOW

Traffic Monitoring (systeminformation, netstat)
- RX/TX bytes, bandwidth, TCP/UDP connections, protocols
- Categories: Web(80,443), Stream(1935,554), Game(27000-27100), Email(25,110,143,993,995)

Speed Testing (ping, axios, https)
- Ping: ≤20ms=Excellent, ≤50=Good, ≤100=Fair, >100=Poor
- Jitter: StdDev, ≤5=Excellent, ≤15=Good, ≤30=Fair, >30=Poor
- Download: 10MB test, Speed=(bytes×8)/(sec×1M), IQR filter
- Upload: 5MB to httpbin, Speed=(5M×8)/elapsed
- Quality: Ping40% + Jitter20% + Download25% + Upload15%

## DETECTION USES
Port Scanning→Backdoors | Behavioral→C&C | ARP→MITM | MAC→Spoofing | DNS→Malware domains | Traffic→Data theft | Encryption→Unsafe networks

**Algorithm:**
```javascript
1. Execute 'arp -a' command to retrieve ARP table
2. Parse ARP table output to extract:
   - IP addresses
   - Corresponding MAC addresses
3. Build MAC-to-IP mapping:
   - Check if single MAC address maps to multiple IPs
   - IF YES → Potential ARP spoofing detected
4. Check for rapid ARP changes:
   - Maintain historical ARP entries with timestamps
   - Compare current ARP table with previous state
   - IF IP's MAC address changed within 5 minutes → Suspicious
5. Return detected threats with severity levels
   - Severity: High (indicates MITM attacks)
```

**ARP Spoofing Detection Logic:**
- Multiple IPs for same MAC (MAC takeover)
- MAC address change within 5-minute window (ARP cache poisoning)
- Used in detecting Man-in-the-Middle (MITM) attacks

##### `detectRogueAccessPoints()`
**Function:** Identifies suspicious or malicious WiFi networks

**Algorithm:**
```javascript
1. Monitor for suspicious SSID patterns:
   - "Free WiFi"
   - "Public WiFi"
   - "Guest"
   - "Linksys", "NETGEAR", "Default"
2. Compare detected networks with known good networks
3. Check for SSID spoofing patterns
4. Identify networks with weak security (WEP, Open)
5. Flag networks with unusual characteristics
6. Return rogue AP alerts
```

##### `detectSuspiciousDevices()`
**Function:** Identifies devices with suspicious characteristics

**Algorithm:**
```javascript
1. Analyze MAC addresses for randomization:
   a. Check locally administered bit (bit 1 of first octet)
   b. IF set → Potentially randomized MAC (spoofing attempt)
   c. Severity: Medium
2. Identify unknown vendors:
   a. Query vendor database using MAC OUI
   b. IF vendor unknown/private → Potential threat
   c. Severity: Low
3. Cross-reference with whitelist of known devices
4. Flag unfamiliar devices for manual review
```

**MAC Address Randomization Detection:**
```
Local admin bit formula: (firstOctet & 0x02) != 0
If true → Locally administered (randomized) MAC address
```

##### `detectWeakEncryption()`
**Function:** Identifies networks with inadequate encryption

**Algorithm:**
```javascript
1. Check all detected WiFi networks for:
   - Open networks (no encryption)
   - WEP encryption (deprecated, cryptographically broken)
   - Weak WPA (early WPA without CCMP)
2. Flag networks using:
   - MD5 hashing (weak)
   - TKIP encryption (susceptible to attacks)
3. Recommend upgrade to WPA2/WPA3
```

##### `detectTrafficAnomalies()`
**Function:** Identifies unusual network traffic patterns

**Algorithm:**
```javascript
1. Collect network statistics using systeminformation
2. Analyze traffic patterns:
   - Excessive connection attempts
   - Unusual packet sizes
   - Abnormal traffic volume
   - Off-hours activity
3. Compare against baseline:
   - Normal traffic patterns
   - Expected device behavior
4. Flag deviations as anomalies
5. Generate severity based on deviation degree
```

---

### 3. MalwareDetector Service (`server/services/MalwareDetector.js`)

#### Purpose
Performs comprehensive malware detection using multiple analysis techniques.

#### Detection Methods

##### `scanDevice(deviceIp)`
**Function:** Complete malware scanning of a specific network device

**Libraries Used:** `ping`, `child_process` (PowerShell, netstat, telnet)

**Algorithm:**
```javascript
1. Initial reachability check:
   - Ping the target device
   - IF unreachable → Return "Device offline" alert
   
2. Port scanning (scanSuspiciousPorts):
   - Check 50+ common malware ports (see port list below)
   - For each port:
     a. Use PowerShell Test-NetConnection for Windows
     b. Fallback to telnet for compatibility
     c. Record open ports and threat level
   
3. Behavioral analysis:
   - Check for rapid connection attempts (scanning activity)
   - Analyze data transfer patterns
   - Detect beaconing behavior (C&C communication)
   
4. DNS analysis:
   - Collect DNS queries from device
   - Detect DGA (Domain Generation Algorithm) domains
   - Check against malicious domain database
   
5. Traffic pattern analysis:
   - Identify data exfiltration (high upload ratio)
   - Detect encrypted tunnels (VPN misuse)
   - Find off-hours activity
   
6. Risk calculation:
   - Count critical/high/medium threats
   - Calculate overall device risk level
   
7. Generate recommendations:
   - Based on detected threats
   - Provide remediation steps
```

##### Suspicious Ports Detection

**Port Categories:**

**Backdoor Ports:**
```javascript
1337, 31337       // Elite backdoors
12345, 54321      // NetBus, Back Orifice trojans
6400, 6670, 6771  // Various backdoors
7215, 9872-9874   // Malware-specific ports
```

**Trojan/Remote Access Ports:**
```javascript
1234, 2023, 3700  // Ultors, Ripper, Portal of Doom
6400, 40412       // Various trojans
20034, 21544      // Backdoor ports
```

**IRC (Botnet C&C) Ports:**
```javascript
6667-6669         // IRC protocol (botnet command & control)
```

**Port Severity Assessment:**
```javascript
Critical Ports: [1337, 31337, 12345, 54321, 6667]
High Risk Ports: [1234, 2023, 3700, 6400, 7215]
Medium Risk Ports: [All other suspicious ports]
```

**Port Checking Method:**
```
1. Primary: PowerShell Test-NetConnection
   - Command: Test-NetConnection -ComputerName <IP> -Port <PORT> -InformationLevel Quiet
   - Returns: True/False

2. Fallback: Telnet
   - Command: telnet <IP> <PORT>
   - Timeout: 3 seconds
   - Parses connection success/failure
```

##### `checkPort(ip, port)`
**Function:** Checks if a specific port is open on target device

**Method:** 
1. First attempt: PowerShell Test-NetConnection (Windows 8.1+)
2. Second attempt: Telnet (legacy compatibility)
3. Timeout: 3 seconds per port

##### `analyzeBehavior(deviceIp)`
**Function:** Detects suspicious device behavior patterns

**Algorithm:**
```javascript
1. Connection Attempt Analysis:
   - Use netstat -an to list all connections
   - Count established/attempt connections
   - IF > 50 connections → Potential network scanning
   - Severity: High

2. Data Transfer Pattern Analysis:
   - Analyze upload vs download ratio
   - IF upload ratio > 80% with large data → Exfiltration
   - Severity: Critical

3. Beaconing Detection:
   - Identify periodic connection attempts (C&C beacon)
   - Check consistency of connection timing
   - IF regular intervals detected → Command & Control communication
   - Severity: High
```

**Beaconing Pattern:**
```
Beaconing = Regular outbound connections at fixed intervals
Indicator of: C&C server communication, malware callback
Typical intervals: 5 min, 10 min, hourly, etc.
```

##### `analyzeDNSActivity(deviceIp)`
**Function:** Analyzes DNS queries for malicious patterns

**Algorithm:**
```javascript
1. Collect DNS queries made by device

2. DGA (Domain Generation Algorithm) Detection:
   a. Calculate character entropy of domain name
   b. Check for random character patterns (8+ random chars)
   c. Check for excessive numbers in domain
   d. IF entropy > 3.5 OR number-heavy → DGA domain
   e. Severity: High

3. Malicious Domain Detection:
   a. Query against known malicious domain database
   b. Known patterns: malware.com, botnet.net, c2server.org
   c. IF match found → Severity: Critical

4. Excessive DNS Queries:
   a. IF query count > 1000 → Potential DNS flooding/exfiltration
   b. Severity: Medium
```

**DGA Domain Detection Logic:**
```
Entropy = -Σ(p * log2(p)) where p = char frequency
High entropy (>3.5) = Random characters
Typical DGA pattern: 8+ random letters + .com
Examples: bkxyzpqr.com, mnopqrst.com
```

##### `analyzeTrafficPatterns(deviceIp)`
**Function:** Analyzes network traffic for data exfiltration and anomalies

**Algorithm:**
```javascript
1. Data Exfiltration Detection:
   - Calculate upload/download ratio
   - Total bytes transferred
   - IF upload ratio > 80% AND total > 100MB → Exfiltration
   - Severity: Critical

2. Encrypted Tunnel Detection:
   - Measure encrypted traffic percentage
   - IF > 90% encrypted traffic → Possible VPN/proxy abuse
   - Severity: Medium

3. Off-Hours Activity Detection:
   - Check activity during non-business hours
   - IF significant activity (>50%) after hours → Suspicious
   - Severity: Medium
```

##### Risk Level Calculation

**Algorithm:**
```javascript
if (Critical threats > 0) → Risk = "Critical"
else if (High threats > 1) → Risk = "High"
else if (High threats > 0 OR Medium threats > 2) → Risk = "Medium"
else → Risk = "Low"
```

##### Malware Signatures Database

**Known Malware Names:**
```javascript
Conficker, Zeus, Stuxnet, Flame, Duqu,
BlackEnergy, Carbanak, APT1, Lazarus,
WannaCry, Petya, NotPetya, Ryuk, Maze
```

**Suspicious Processes (Windows):**
```javascript
nc.exe, netcat.exe          // Network utilities (hacking tools)
psexec.exe                  // Remote process execution
mimikatz.exe                // Credential dumping
procdump.exe, pwdump.exe    // Memory/password dumping
fgdump.exe, gsecdump.exe    // SAM database dumping
wce.exe, cachedump.exe      // Windows credential extraction
lsadump.exe                 // LSA secrets dumping
```

---

### 4. TrafficMonitor Service (`server/services/TrafficMonitor.js`)

#### Purpose
Real-time network traffic monitoring and analysis.

#### Key Methods

##### `startMonitoring(callback)`
**Function:** Begins continuous network traffic monitoring

**Libraries Used:** `systeminformation`, `child_process` (netstat)

**Algorithm:**
```javascript
1. Start monitoring interval (2-second updates)
2. Continuously collect:
   - Network interface statistics
   - Active connections
   - Protocol statistics
   - Application network usage
3. Store in history (last 100 entries)
4. Invoke callback for real-time updates to frontend
5. Can be stopped via stopMonitoring()
```

##### `collectTrafficData()`
**Function:** Comprehensive traffic data collection

**Data Collected:**
```javascript
1. Network Interfaces:
   - Interface name (eth0, WiFi, etc.)
   - IP addresses (IPv4)
   - MAC address
   - Speed (Mbps)
   - Operational state (up/down)
   - Type (ethernet, wireless, etc.)

2. Network Statistics:
   - RX bytes (received)
   - TX bytes (transmitted)
   - RX/TX per second
   - Dropped packets
   - Error packets

3. Active Connections:
   - Protocol (TCP/UDP)
   - Local address:port
   - Remote address:port
   - Connection state

4. Protocol Statistics:
   - TCP: packets, bytes, connections
   - UDP: packets, bytes, datagrams
   - ICMP: packets, bytes, messages
   - IP: packets, bytes

5. Application Usage:
   - Top 10 network-using processes
   - Process name, PID, CPU%, memory

6. Summary Metrics:
   - Total active connections
   - Total bandwidth usage
   - Upload/download speeds
   - Packets per second
```

##### `calculateBandwidth(networkStats)`
**Function:** Calculates network bandwidth usage

**Algorithm:**
```javascript
1. Sum up RX/TX bytes from all active interfaces:
   - Exclude loopback interface
   - Only include interfaces with state = "up"
2. Calculate per-second rates:
   - RX/sec = received bytes per second
   - TX/sec = transmitted bytes per second
3. Estimate packets per second:
   - Average packet size ≈ 1500 bytes (MTU)
   - Packets/sec = (RX/sec + TX/sec) / 1500
4. Return bandwidth metrics
```

##### `getActiveConnections()`
**Function:** Lists all current network connections

**Libraries Used:** `child_process` (netstat)

**Algorithm:**
```javascript
1. Execute: netstat -an (Windows)
2. Parse output for each connection:
   - Protocol (TCP or UDP)
   - Local address:port
   - Remote address:port
   - Connection state (ESTABLISHED, LISTEN, TIME_WAIT, etc.)
3. Return connection array with timestamps
```

##### `analyzeProtocols()`
**Function:** Analyzes traffic broken down by protocol type

**Libraries Used:** `child_process` (netstat -s)

**Algorithm:**
```javascript
1. Execute: netstat -s (detailed protocol statistics)
2. Parse sections:
   - TCP Statistics
   - UDP Statistics
   - ICMP Statistics
   - IP Statistics
3. Extract for each protocol:
   - Packet count
   - Byte count
   - Connection count (TCP)
   - Datagram count (UDP)
   - Message count (ICMP)
4. Return protocol breakdown
```

**Protocol Details:**
```javascript
TCP (Transmission Control Protocol):
- Connection-oriented
- Reliable, ordered delivery
- Used by HTTP, HTTPS, FTP, SSH, Telnet

UDP (User Datagram Protocol):
- Connectionless
- Best-effort delivery
- Used by DNS, DHCP, streaming, gaming

ICMP (Internet Control Message Protocol):
- Network diagnostics
- Used by ping and traceroute
- Echo request/reply

IP (Internet Protocol):
- Fundamental protocol
- Provides routing and addressing
```

##### `categorizeTraffic(connections)`
**Function:** Classifies traffic by application type

**Port-Based Categories:**
```javascript
Web Traffic:
- Ports: 80 (HTTP), 443 (HTTPS), 8080, 8443

Streaming:
- Ports: 1935 (RTMP), 554 (RTSP), 5004 (RTP)

Gaming:
- Ports: 27000-27100 (Game server ranges)

File Transfer:
- Ports: 21 (FTP), 22 (SFTP), 990 (FTPS), 989

Email:
- Ports: 25 (SMTP), 110 (POP3), 143 (IMAP), 993 (IMAPS), 995 (POP3S)

Other:
- All remaining ports
```

---

### 5. SpeedTest Service (`server/services/SpeedTest.js`)

#### Purpose
Network speed and performance testing.

#### Key Methods

##### `runSpeedTest(progressCallback)`
**Function:** Comprehensive network speed and latency testing

**Libraries Used:** `child_process` (ping), `axios`, `https`, `http`

**Algorithm:**
```javascript
1. Ping Test (Phase: 10%):
   - Execute: ping -n 4 8.8.8.8
   - Parse average latency
   - Measure: milliseconds (ms)

2. Jitter Test (Phase: 25%):
   a. Send 5 sequential pings to 8.8.8.8
   b. Collect individual response times
   c. Calculate:
      - Mean = average of all pings
      - Variance = sum of squared differences from mean
      - Jitter = √variance (standard deviation)
   d. Measure: milliseconds (ms)

3. Download Speed Test (Phase: 40-75%):
   a. Concurrent testing from multiple servers:
      - Download HTTP test file (10MB)
      - Measure bytes transferred over time
   b. Sampling method:
      - Sample speed every 300ms
      - Calculate instantaneous speed: (bytes * 8) / (time * 1000000) Mbps
   c. Analysis:
      - Remove outliers using IQR (Interquartile Range)
      - Q1 = 25th percentile
      - Q3 = 75th percentile
      - IQR = Q3 - Q1
      - Keep values: [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
      - Use median of filtered samples
   d. Measure: Megabits per second (Mbps)

4. Upload Speed Test (Phase: 80-95%):
   a. Upload 5MB data to httpbin.org
   b. Send in 32KB chunks with 10ms delays
   c. Calculate upload speed
   d. Measure: Megabits per second (Mbps)

5. Quality Calculation (Phase: 100%):
   - Weighted scoring based on all metrics
   - Quality rating: Poor/Fair/Good/Excellent
```

##### `measurePing()`
**Function:** Measures latency to Google DNS

**Command:** `ping -n 4 8.8.8.8`
**Returns:** Average response time in milliseconds

**Interpretation:**
```
Ping ≤ 20ms    → Excellent (local network, very fast)
Ping ≤ 50ms    → Good (fast connection)
Ping ≤ 100ms   → Fair (moderate connection)
Ping > 100ms   → Poor (slow, laggy)
```

##### `measureJitter()`
**Function:** Measures ping consistency/variance

**Algorithm:**
```javascript
1. Send 5 consecutive pings
2. Record individual response times
3. Calculate variance:
   Variance = Σ(ping - mean)² / n
4. Calculate jitter as standard deviation:
   Jitter = √Variance
5. Measure: milliseconds (ms)

Lower jitter = more consistent, better quality
Higher jitter = variable latency, potential issues
```

**Interpretation:**
```
Jitter ≤ 5ms    → Excellent (very stable)
Jitter ≤ 15ms   → Good (stable)
Jitter ≤ 30ms   → Fair (moderate variance)
Jitter > 30ms   → Poor (unstable)
```

##### `measureDownloadSpeed(progressCallback)`
**Function:** Measures Internet download speed

**Algorithm:**
```javascript
1. Download 10MB test file from reliable server
2. Track progress every 300ms:
   - Current bytes downloaded
   - Time elapsed
   - Current speed calculation
3. Remove outlier samples:
   - Sort samples
   - Calculate Q1, Q3, IQR
   - Filter using 1.5*IQR method
4. Use median of filtered samples
5. Fallback: If insufficient samples, use overall average
6. Timeout: 12 seconds maximum
```

**Test Servers:**
```
http://ipv4.download.thinkbroadband.com/10MB.zip
http://speedtest.ftp.otenet.gr/files/test10Mb.db
https://ash-speed.hetzner.com/10MB.bin
```

**Speed Calculation:**
```
Speed (Mbps) = (bytes * 8) / (time_seconds * 1,000,000)
Example: 1,250,000 bytes in 1 second
= (1,250,000 * 8) / (1 * 1,000,000) = 10 Mbps
```

##### `measureUploadSpeed(progressCallback)`
**Function:** Measures Internet upload speed

**Algorithm:**
```javascript
1. Create 5MB test payload
2. Open HTTPS connection to httpbin.org/post
3. Send data in 32KB chunks
4. 10ms delay between chunks (prevent overwhelming server)
5. Calculate speed: (5MB * 8) / (elapsed_time_seconds)
6. Timeout: 20 seconds maximum
```

**Upload Speed Interpretation:**
```
Upload ≥ 50 Mbps   → Excellent
Upload ≥ 25 Mbps   → Good
Upload ≥ 10 Mbps   → Fair
Upload ≥ 5 Mbps    → Poor
Upload < 5 Mbps    → Very Poor
```

##### `calculateQuality(results)`
**Function:** Generates overall quality score

**Scoring Weights:**
```javascript
Ping (40% weight):
  ≤20ms → 40 pts
  ≤50ms → 30 pts
  ≤100ms → 20 pts
  >100ms → 10 pts

Jitter (20% weight):
  ≤5ms → 20 pts
  ≤15ms → 15 pts
  ≤30ms → 10 pts
  >30ms → 5 pts

Download Speed (25% weight):
  ≥100 Mbps → 25 pts
  ≥50 Mbps → 20 pts
  ≥25 Mbps → 15 pts
  ≥10 Mbps → 10 pts
  <10 Mbps → 5 pts

Upload Speed (15% weight):
  ≥50 Mbps → 15 pts
  ≥25 Mbps → 12 pts
  ≥10 Mbps → 8 pts
  ≥5 Mbps → 5 pts
  <5 Mbps → 2 pts

Total Score Interpretation:
≥85 → Excellent
70-84 → Good
50-69 → Fair
<50 → Poor
```

---

## Frontend Components & Features

### Page Components

#### 1. Dashboard (`client/src/pages/Dashboard.jsx`)
- Real-time network statistics
- System performance monitoring
- Security threat overview
- Network health indicator
- Quick statistics cards

#### 2. NetworkScanner (`client/src/pages/NetworkScanner.jsx`)
- WiFi network discovery
- Network list with signal strength
- Security assessment for each network
- SSID, BSSID, channel information
- Encryption type and strength display
- Threat level indicators

#### 3. DeviceMonitor (`client/src/pages/DeviceMonitor.jsx`)
- Lists connected devices on network
- Device details (IP, MAC, hostname, vendor)
- Response time/latency display
- Device type identification
- Security risk assessment
- Last seen timestamp

#### 4. SecurityAnalysis (`client/src/pages/SecurityAnalysis.jsx`)
- Security scan results
- Threat detection display
- ARP spoofing alerts
- Rogue AP warnings
- Suspicious device notifications
- Risk level summary

#### 5. MalwareScanner (`client/src/pages/MalwareScanner.jsx`)
- Target device selection
- Malware scan initiation
- Open ports detection
- Behavioral analysis results
- DNS threat analysis
- Threat categorization
- Risk level assessment
- Security recommendations

#### 6. TrafficAnalyzer (`client/src/pages/TrafficAnalyzer.jsx`)
- Real-time traffic graphs
- Protocol breakdown visualization
- Upload/download speeds
- Active connections display
- Bandwidth usage history
- Traffic categorization (Web, Streaming, Gaming, etc.)

#### 7. SpeedTest (`client/src/pages/SpeedTest.jsx`)
- Ping latency measurement
- Jitter calculation
- Download speed testing
- Upload speed testing
- Speed gauge visualization
- Quality rating display
- Test progress indicator

#### 8. Settings (`client/src/pages/Settings.jsx`)
- Application preferences
- Monitoring intervals
- Notification settings
- Network interface selection
- Scan frequency configuration

### UI Components

#### 1. Navbar (`client/src/components/Navbar.jsx`)
- Navigation menu
- Links to all pages
- Logo/branding
- Active page indicator
- Responsive design

#### 2. SpeedTestGauge (`client/src/components/SpeedTestGauge.jsx`)
- Visual gauge for speed display
- Color-coded speed ranges
- Animated needle indicator
- Speed labels (Poor, Fair, Good, Excellent)

### Custom Hooks

#### `useSocket` (`client/src/hooks/useSocket.jsx`)
- WebSocket connection management
- Real-time data streaming
- Event listener setup
- Connection state management
- Data caching

---

## Detection Methods & Mechanisms

### Method 1: Port-Based Malware Detection

**How It Works:**
1. Scans 50+ known malware ports
2. Uses PowerShell or Telnet to test port availability
3. Cross-references with malware port database
4. Assigns severity based on port risk level

**Advantages:**
- Fast detection
- Reliable for known malware
- Windows-native commands
- No special permissions needed

**Limitations:**
- Only detects known ports
- Malware on standard ports (80, 443) might be missed
- Requires network connectivity
- Blocked ports may appear closed

**Use Case:** Quick device screening for common trojans and backdoors

---

### Method 2: Behavioral Analysis

**How It Works:**
1. Monitors connection patterns
2. Analyzes data transfer ratios
3. Detects beaconing behavior (C&C communication)
4. Identifies unusual system activity

**Algorithms:**
```
Scanning Detection:
  IF connection_attempts > 50 → Potential scanner

Data Exfiltration:
  IF upload_ratio > 80% AND total_bytes > 100MB → Exfiltration

Beaconing:
  IF regular_connections_at_fixed_intervals → C&C communication

Off-Hours Activity:
  IF activity_after_business_hours > 50% → Suspicious
```

**Advantages:**
- Detects unknown/zero-day malware
- Behavioral indicators are malware-agnostic
- Can catch advanced persistent threats (APTs)
- Identifies data theft attempts

**Limitations:**
- Can produce false positives (legitimate high bandwidth usage)
- Requires baseline of normal behavior
- May not catch low-and-slow attacks
- Resource intensive

**Use Case:** Advanced threat detection beyond known signatures

---

### Method 3: Network-Level Detection (ARP Analysis)

**How It Works:**
1. Monitors ARP (Address Resolution Protocol) table
2. Detects MAC address conflicts
3. Identifies rapid ARP changes
4. Flags duplicate MAC-IP mappings

**Detection Triggers:**
```
ARP Spoofing:
  Single MAC address → Multiple IP addresses
  IP MAC address changes within 5 minutes

Attack Type Detected:
  Man-in-the-Middle (MITM)
  ARP Cache Poisoning
  Session Hijacking
```

**Advantages:**
- Detects MITM attacks in progress
- Works at network layer (very reliable)
- Real-time detection capability
- No special tools required (uses built-in arp command)

**Limitations:**
- Only detects active attacks
- Legitimate MAC address changes (NIC replacement) trigger alerts
- Limited to local network
- Doesn't identify attacker origin

**Use Case:** Protecting against local network attacks

---

### Method 4: DNS & Domain Analysis

**How It Works:**
1. Collects DNS queries made by device
2. Analyzes domain names for malware patterns
3. Compares against malicious domain database

**Detection Methods:**

**A. DGA (Domain Generation Algorithm) Detection:**
```
Algorithm:
  1. Calculate Shannon Entropy of domain name
     Entropy = -Σ(p_i * log2(p_i))
     where p_i = frequency of character i
  
  2. Check entropy threshold:
     IF entropy > 3.5 → Likely random domain
  
  3. Pattern matching:
     IF domain matches /[a-z]{8,}\.com/ → DGA pattern
     IF domain contains 3+ digits → Suspicious
  
  4. Decision:
     IF (high entropy OR number-heavy) → DGA domain

Interpretation:
  Legitimate domains: low entropy, readable words
  DGA domains: high entropy, random characters
  Examples:
    - Legitimate: google.com (entropy ≈ 2.4)
    - DGA: bkxyzpqr.com (entropy ≈ 3.9)
```

**B. Known Malicious Domain Detection:**
```
Compare domain against blacklist:
  - Botnet command servers
  - Phishing sites
  - Malware distribution centers
  - Known C&C domains
  
Match found → Critical threat alert
```

**C. DNS Query Volume Detection:**
```
IF query_count > 1000 in monitoring period:
  → Potential DNS flooding or data exfiltration
```

**Advantages:**
- Catches malware trying to reach C&C servers
- Can identify DGA-based malware (Conficker, Gameover Zeus, etc.)
- Detect phishing/scam domains
- Works without system-level access

**Limitations:**
- Requires DNS query logging capability
- False positives from legitimate high-volume queries
- Cannot see encrypted DNS (DoH - DNS over HTTPS)
- Requires updated malicious domain database

**Use Case:** Preventing malware callbacks and C&C communication

---

### Method 5: MAC Address Randomization Detection

**How It Works:**
1. Checks locally administered bit in MAC address
2. Identifies spoofed/randomized MAC addresses

**Detection Logic:**
```
MAC Address Format: XX:XX:XX:XX:XX:XX
                    ↑↑
                   First octet

Locally Administered Bit: Bit 1 (second bit) of first octet

Detection:
  firstOctet_binary = 0xAB
  localAdminBit = (0xAB & 0x02) != 0
  
  IF true → MAC address is locally administered (randomized)
  IF false → MAC address from manufacturer (genuine)

Example:
  00:1A:2B:3C:4D:5E → Genuine (bit 1 = 0)
  02:1A:2B:3C:4D:5E → Randomized (bit 1 = 1)
```

**Advantages:**
- Detects MAC spoofing attempts
- Quick check (bitwise operation)
- Identifies privacy-conscious devices (mobile phones)
- Can flag unauthorized devices

**Limitations:**
- Many legitimate devices use randomized MACs (security feature)
- Cannot distinguish between legitimate and malicious randomization
- No information about attacker identity

**Use Case:** Asset inventory and unauthorized device detection

---

### Method 6: Traffic Pattern Analysis

**How It Works:**
1. Monitors bandwidth usage patterns
2. Analyzes upload vs download ratios
3. Detects unusual traffic behaviors

**Detection Methods:**

**Data Exfiltration Detection:**
```
Algorithm:
  total_bytes = upload_bytes + download_bytes
  upload_ratio = upload_bytes / total_bytes
  
  IF (upload_ratio > 80% AND total_bytes > 100MB):
    → Potential data exfiltration
    Severity: Critical

Interpretation:
  Normal browsing: 70-80% download, 20-30% upload
  Exfiltration: 80%+ upload with large data volume
  Examples: stealing documents, photos, customer databases
```

**Encrypted Tunnel Detection:**
```
IF encrypted_traffic_ratio > 90%:
  → Possible VPN/proxy abuse
  Severity: Medium

This could indicate:
  - Legitimate VPN usage (often benign)
  - Tunneling to hide traffic
  - Circumventing network controls
```

**Off-Hours Activity Detection:**
```
normal_business_hours = 9 AM - 5 PM
activity_after_hours = activity during 5PM-9AM
off_hours_ratio = activity_after_hours / total_activity

IF off_hours_ratio > 50%:
  → Suspicious activity outside normal hours
  Severity: Medium

Context matters:
  - IT staff may work nights
  - Backup processes run after hours
  - International teams have different hours
```

**Advantages:**
- Detects data theft in progress
- Can identify suspicious automation
- Works with real network data
- Complements other detection methods

**Limitations:**
- High false positive rate (backup jobs, streaming services)
- Requires baseline of normal behavior
- Cannot identify what data is being transferred
- Encryption hides packet inspection

**Use Case:** Detecting insider threats and data exfiltration

---

## Security Threat Detection

### Threat Categories

#### 1. Critical Threats
- **Malware Detection:** Device appears to have active malware
- **Data Exfiltration:** Large-scale data being stolen
- **ARP Spoofing:** Man-in-the-middle attack in progress
- **Known Malicious Domain:** Device accessing C&C server

#### 2. High Threats
- **Suspicious Ports:** Multiple backdoor ports open
- **Beaconing Detected:** Regular C&C communication pattern
- **Network Scanning:** Device performing port/IP scanning
- **Rogue Access Point:** Fake network matching legitimate one

#### 3. Medium Threats
- **Weak Encryption:** WEP or weak WPA on network
- **Unknown Device:** Unidentified device on network
- **Encrypted Tunnel:** Suspicious VPN/proxy usage
- **Off-Hours Activity:** Unusual activity outside business hours
- **DGA Domain:** Potential malware domain generation

#### 4. Low Threats
- **Randomized MAC:** Privacy-conscious but potentially suspicious
- **Unknown Vendor:** Device from unrecognized manufacturer

### Risk Level Calculation Algorithm

```javascript
Risk Calculation:
  Critical threat count (ct), High (ht), Medium (mt)
  
  IF ct > 0:
    Risk = "Critical"
  ELSE IF ht > 1:
    Risk = "High"
  ELSE IF (ht > 0 OR mt > 2):
    Risk = "Medium"
  ELSE:
    Risk = "Low"

Color Coding:
  Critical → Red (#FF0000)
  High → Orange (#FFA500)
  Medium → Yellow (#FFFF00)
  Low → Green (#00FF00)
```

### Remediation Recommendations

**Algorithm:**
```javascript
IF open_ports.count > 10:
  → Recommend: "Consider closing unnecessary open ports"

IF suspicious_ports.count > 0:
  → Recommend: "Investigate suspicious port activity immediately"

IF threat.severity == "Critical":
  → Recommend: "Isolate device from network immediately"
  → Recommend: "Run full antivirus scan"
  → Recommend: "Check for unauthorized software"

IF DGA_domain_detected:
  → Recommend: "Block suspicious domains at DNS level"
  → Recommend: "Monitor network traffic for C&C communication"

Always:
  → Recommend: "Enable network monitoring and logging"
  → Recommend: "Keep security software updated"
```

---

## Performance & Network Monitoring

### Real-Time Metrics

**Collection Interval:** 2 seconds

**Metrics Collected:**
1. **Bandwidth Usage**
   - Download speed (Mbps)
   - Upload speed (Mbps)
   - Total throughput (bytes)
   - Packets per second

2. **Network Interfaces**
   - Active interfaces count
   - Interface states
   - IP addresses
   - MAC addresses
   - Speed capability

3. **System Resources**
   - CPU usage percentage
   - Memory usage (used/total)
   - Memory percentage
   - Process count

4. **Active Connections**
   - Connection count
   - TCP connections
   - UDP connections
   - Connection states

### Visualization & Reporting

#### Charts Used
1. **Line Charts (Recharts/Chart.js)**
   - Bandwidth over time
   - CPU/Memory usage trends
   - Latency measurements

2. **Bar Charts**
   - Protocol distribution (TCP, UDP, ICMP)
   - Traffic by application type
   - Device comparison

3. **Pie Charts**
   - Traffic categorization (Web, Streaming, Gaming, Email, File Transfer)
   - Connection state distribution

4. **Gauge Charts**
   - Speed test quality indicator
   - Network health percentage
   - Risk level visualization

### Historical Data Storage

**History Size:** Last 100 measurements (approximately 3-5 minutes at 2-second intervals)

**Stored Information:**
- Timestamps
- Bandwidth metrics
- Connection counts
- Active devices
- Protocol statistics
- Application usage

**Use Cases:**
- Trend analysis
- Performance over time
- Anomaly detection
- Capacity planning
- SLA compliance reporting

---

## Summary

This WiFi Analyzer is a comprehensive network security and monitoring solution that combines multiple detection methods:

1. **Port-based scanning** for known malware signatures
2. **Behavioral analysis** for unknown threats
3. **Network protocol analysis** (ARP, DNS, TCP/UDP)
4. **Traffic pattern recognition** for data exfiltration
5. **Device fingerprinting** for unauthorized access detection
6. **Performance monitoring** for network optimization

The system uses modern Node.js/Express backend with Socket.io for real-time communication, and React frontend with advanced charting for visualization. It provides enterprise-grade security monitoring capabilities in an easy-to-use package.

**Key Strengths:**
- Multi-layered detection approach
- Real-time monitoring and alerts
- Comprehensive network visibility
- User-friendly interface
- Automated threat assessment

**Best Practices:**
- Regular security scans
- Continuous traffic monitoring
- Baseline establishment for anomaly detection
- Regular threat intelligence updates
- Network segmentation implementation
