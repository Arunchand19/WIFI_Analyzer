const { exec } = require('child_process');
const util = require('util');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const execAsync = util.promisify(exec);

class SpeedTest {
  constructor() {
    this.isRunning = false;
    this.testResults = null;
  }

  async runSpeedTest(progressCallback) {
    if (this.isRunning) {
      throw new Error('Speed test already in progress');
    }

    this.isRunning = true;
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        ping: 0,
        jitter: 0,
        download: 0,
        upload: 0,
        quality: 'Excellent'
      };

      // Ping test
      if (progressCallback) progressCallback({ phase: 'ping', progress: 10 });
      results.ping = await this.measurePing();
      
      // Jitter test
      if (progressCallback) progressCallback({ phase: 'ping', progress: 25 });
      results.jitter = await this.measureJitter();
      
      // Use multiple concurrent tests for accuracy
      const downloadResults = await Promise.allSettled([
        this.measureDownloadSpeedAxios(progressCallback),
        this.measureDownloadSpeed(progressCallback)
      ]);
      
      if (progressCallback) progressCallback({ phase: 'upload', progress: 80 });
      results.upload = await this.measureUploadSpeed(progressCallback);
      
      // Get best results
      const validDownloads = downloadResults
        .filter(r => r.status === 'fulfilled' && r.value > 0)
        .map(r => r.value);
      
      results.download = validDownloads.length > 0 ? Math.max(...validDownloads) : 0;
      
      if (progressCallback) progressCallback({ phase: 'complete', progress: 100 });
      
      results.quality = this.calculateQuality(results);
      this.testResults = results;
      
      return results;
    } finally {
      this.isRunning = false;
    }
  }





  async measurePing() {
    try {
      const { stdout } = await execAsync('ping -n 4 8.8.8.8');
      const avgMatch = stdout.match(/Average = (\d+)ms/);
      return avgMatch ? parseInt(avgMatch[1]) : 0;
    } catch (error) {
      return 0;
    }
  }

  async measureJitter() {
    try {
      const pings = [];
      for (let i = 0; i < 5; i++) {
        const { stdout } = await execAsync('ping -n 1 8.8.8.8');
        const timeMatch = stdout.match(/time=(\d+)ms/);
        if (timeMatch) {
          pings.push(parseInt(timeMatch[1]));
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (pings.length < 2) return 0;
      
      const avg = pings.reduce((a, b) => a + b) / pings.length;
      const variance = pings.reduce((sum, ping) => sum + Math.pow(ping - avg, 2), 0) / pings.length;
      return Math.round(Math.sqrt(variance));
    } catch (error) {
      return 0;
    }
  }

  async measureDownloadSpeed(progressCallback) {
    return new Promise((resolve) => {
      // Use multiple reliable test files
      const testFiles = [
        { url: 'http://ipv4.download.thinkbroadband.com/10MB.zip', size: 10 * 1024 * 1024 },
        { url: 'http://speedtest.ftp.otenet.gr/files/test10Mb.db', size: 10 * 1024 * 1024 },
        { url: 'https://ash-speed.hetzner.com/10MB.bin', size: 10 * 1024 * 1024 }
      ];
      
      const testFile = testFiles[0]; // Use first reliable server
      const startTime = Date.now();
      let totalBytes = 0;
      let samples = [];
      let lastSampleTime = startTime;
      let lastSampleBytes = 0;
      
      const protocol = testFile.url.startsWith('https') ? https : http;
      
      const request = protocol.get(testFile.url, (response) => {
        response.on('data', (chunk) => {
          totalBytes += chunk.length;
          const now = Date.now();
          
          // Sample speed every 300ms for accuracy
          if (now - lastSampleTime >= 300) {
            const timeDiff = (now - lastSampleTime) / 1000;
            const bytesDiff = totalBytes - lastSampleBytes;
            
            if (timeDiff > 0 && bytesDiff > 0) {
              const speedMbps = (bytesDiff * 8) / (timeDiff * 1000000);
              samples.push(speedMbps);
            }
            
            lastSampleTime = now;
            lastSampleBytes = totalBytes;
            
            if (progressCallback) {
              const progress = 40 + Math.min(35, (totalBytes / testFile.size) * 35);
              progressCallback({ phase: 'download', progress });
            }
          }
        });

        response.on('end', () => {
          const totalDuration = (Date.now() - startTime) / 1000;
          
          let finalSpeed = 0;
          
          if (samples.length >= 3) {
            // Remove outliers and use median
            samples.sort((a, b) => a - b);
            const q1 = samples[Math.floor(samples.length * 0.25)];
            const q3 = samples[Math.floor(samples.length * 0.75)];
            const iqr = q3 - q1;
            const filtered = samples.filter(s => s >= q1 - 1.5 * iqr && s <= q3 + 1.5 * iqr);
            
            if (filtered.length > 0) {
              finalSpeed = filtered[Math.floor(filtered.length / 2)];
            }
          }
          
          // Fallback to overall average if no good samples
          if (finalSpeed === 0 && totalBytes > 0 && totalDuration > 0) {
            finalSpeed = (totalBytes * 8) / (totalDuration * 1000000);
          }
          
          resolve(Math.round(finalSpeed * 100) / 100);
        });
      });

      request.on('error', (error) => {
        console.error('Download test error:', error.message);
        resolve(0);
      });

      // Timeout after 12 seconds
      setTimeout(() => {
        request.destroy();
        
        if (samples.length > 0) {
          samples.sort((a, b) => a - b);
          const median = samples[Math.floor(samples.length / 2)];
          resolve(Math.round(median * 100) / 100);
        } else {
          resolve(0);
        }
      }, 12000);
    });
  }

  async measureUploadSpeed(progressCallback) {
    return new Promise((resolve) => {
      const testSize = 5 * 1024 * 1024; // 5MB
      const testData = Buffer.alloc(testSize, 'x');
      
      const options = {
        hostname: 'httpbin.org',
        port: 443,
        path: '/post',
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': testSize
        }
      };

      const startTime = Date.now();
      let uploadedBytes = 0;
      
      const request = https.request(options, (response) => {
        response.on('end', () => {
          const duration = (Date.now() - startTime) / 1000;
          const speedMbps = (testSize * 8) / (duration * 1000000);
          resolve(Math.round(speedMbps * 100) / 100);
        });
      });

      request.on('error', () => resolve(0));

      // Send data in controlled chunks
      const chunkSize = 32 * 1024; // 32KB chunks
      let offset = 0;
      
      const sendNextChunk = () => {
        if (offset >= testSize) {
          request.end();
          return;
        }
        
        const chunk = testData.slice(offset, Math.min(offset + chunkSize, testSize));
        request.write(chunk);
        uploadedBytes += chunk.length;
        offset += chunk.length;
        
        if (progressCallback) {
          const progress = 80 + (uploadedBytes / testSize) * 15;
          progressCallback({ phase: 'upload', progress: Math.min(95, progress) });
        }
        
        // Small delay to prevent overwhelming
        setTimeout(sendNextChunk, 10);
      };
      
      sendNextChunk();

      setTimeout(() => {
        request.destroy();
        resolve(0);
      }, 20000);
    });
  }

  async measureDownloadSpeedAxios(progressCallback) {
    const testUrls = [
      'https://speed.cloudflare.com/__down?bytes=50000000', // 50MB
      'http://ipv4.download.thinkbroadband.com/50MB.zip',
      'https://ash-speed.hetzner.com/100MB.bin'
    ];
    
    for (const testUrl of testUrls) {
      try {
        const startTime = Date.now();
        let downloadedBytes = 0;
        let maxSpeed = 0;
        
        const response = await axios({
          method: 'GET',
          url: testUrl,
          responseType: 'stream',
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        return new Promise((resolve) => {
          let samples = [];
          let intervalId;
          
          // Sample speed every 200ms
          intervalId = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed > 0 && downloadedBytes > 0) {
              const currentSpeed = (downloadedBytes * 8) / (elapsed * 1000000);
              samples.push(currentSpeed);
              maxSpeed = Math.max(maxSpeed, currentSpeed);
              
              if (progressCallback) {
                const progress = 40 + Math.min(35, elapsed / 8 * 35);
                progressCallback({ phase: 'download', progress });
              }
            }
          }, 200);
          
          response.data.on('data', (chunk) => {
            downloadedBytes += chunk.length;
          });
          
          response.data.on('end', () => {
            clearInterval(intervalId);
            
            // Use 90th percentile for more accurate results
            if (samples.length > 5) {
              samples.sort((a, b) => b - a);
              const p90Index = Math.floor(samples.length * 0.1);
              resolve(Math.round(samples[p90Index] * 100) / 100);
            } else {
              resolve(Math.round(maxSpeed * 100) / 100);
            }
          });
          
          response.data.on('error', () => {
            clearInterval(intervalId);
            resolve(0);
          });
          
          // Stop after 10 seconds
          setTimeout(() => {
            clearInterval(intervalId);
            response.data.destroy();
            resolve(Math.round(maxSpeed * 100) / 100);
          }, 10000);
        });
      } catch (error) {
        continue; // Try next URL
      }
    }
    return 0;
  }



  calculateQuality(results) {
    const { ping, jitter, download, upload } = results;
    
    let score = 0;
    
    // Ping scoring (40% weight)
    if (ping <= 20) score += 40;
    else if (ping <= 50) score += 30;
    else if (ping <= 100) score += 20;
    else score += 10;
    
    // Jitter scoring (20% weight)
    if (jitter <= 5) score += 20;
    else if (jitter <= 15) score += 15;
    else if (jitter <= 30) score += 10;
    else score += 5;
    
    // Download speed scoring (25% weight)
    if (download >= 100) score += 25;
    else if (download >= 50) score += 20;
    else if (download >= 25) score += 15;
    else if (download >= 10) score += 10;
    else score += 5;
    
    // Upload speed scoring (15% weight)
    if (upload >= 50) score += 15;
    else if (upload >= 25) score += 12;
    else if (upload >= 10) score += 8;
    else if (upload >= 5) score += 5;
    else score += 2;
    
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }

  getLastResults() {
    return this.testResults;
  }

  isTestRunning() {
    return this.isRunning;
  }
}

module.exports = SpeedTest;