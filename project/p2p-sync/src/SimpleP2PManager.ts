/**
 * Simple P2P Manager for UCOST Discovery Hub
 * Easy-to-use peer-to-peer sync system
 * Only works with authorized UCOST Discovery Hub software
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface SimpleDevice {
  id: string;
  name: string;
  ip: string;
  port: number;
  isConnected: boolean;
  lastSync?: string;
  capabilities: string[];
  isAuthorized: boolean;
  softwareVersion: string;
  deviceType: 'kiosk' | 'mobile' | 'desktop';
}

export class SimpleP2PManager extends EventEmitter {
  private devices: Map<string, SimpleDevice> = new Map();
  private isEnabled: boolean = false;
  private myIP: string = '';
  private myPort: number = 5000;
  private scanInterval?: NodeJS.Timeout;
  private readonly SOFTWARE_ID = 'UCOST_DISCOVERY_HUB';
  private readonly SOFTWARE_VERSION = '1.0.0';
  private readonly DEVICE_ID = this.generateDeviceId();

  constructor() {
    super();
    this.getMyIP();
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Verify if a device is running UCOST Discovery Hub software
   */
  private async verifyDevice(ip: string, port: number): Promise<boolean> {
    try {
      // Send verification request to device
      const response = await fetch(`http://${ip}:${port}/api/verify-ucost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-UCOST-Software-ID': this.SOFTWARE_ID,
          'X-UCOST-Version': this.SOFTWARE_VERSION,
          'X-UCOST-Device-ID': this.DEVICE_ID
        },
        body: JSON.stringify({
          softwareId: this.SOFTWARE_ID,
          version: this.SOFTWARE_VERSION,
          deviceId: this.DEVICE_ID,
          capabilities: ['exhibits', 'tours', 'analytics']
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.isAuthorized === true && data.softwareId === this.SOFTWARE_ID;
      }
    } catch (error) {
      console.log(`Device ${ip}:${port} is not running UCOST Discovery Hub software`);
    }
    return false;
  }

  /**
   * Enable P2P sync
   */
  enable(): void {
    this.isEnabled = true;
    this.startScanning();
    this.emit('statusChanged', { enabled: true });
  }

  /**
   * Disable P2P sync
   */
  disable(): void {
    this.isEnabled = false;
    this.stopScanning();
    this.disconnectAll();
    this.emit('statusChanged', { enabled: false });
  }

  /**
   * Start scanning for authorized devices only
   */
  startScanning(): void {
    if (!this.isEnabled) return;

    // Simulate finding authorized UCOST devices on network
    setTimeout(async () => {
      const potentialDevices = [
        { ip: '192.168.1.101', name: 'Kiosk 1 - Main Entrance', type: 'kiosk' as const },
        { ip: '192.168.1.102', name: 'Kiosk 2 - Science Wing', type: 'kiosk' as const },
        { ip: '192.168.1.103', name: 'Mobile Device - Staff', type: 'mobile' as const },
        { ip: '192.168.1.104', name: 'Unknown Device', type: 'desktop' as const }
      ];

      for (const device of potentialDevices) {
        // Only add devices that are verified to be running UCOST software
        const isAuthorized = await this.verifyDevice(device.ip, 5000);
        
        if (isAuthorized) {
          this.addDevice({
            id: `device-${device.ip.replace(/\./g, '-')}`,
            name: device.name,
            ip: device.ip,
            port: 5000,
            isConnected: false,
            capabilities: ['exhibits', 'tours', 'analytics'],
            isAuthorized: true,
            softwareVersion: this.SOFTWARE_VERSION,
            deviceType: device.type
          });
        } else {
          console.log(`Device ${device.ip} is not running UCOST Discovery Hub software`);
        }
      }

      this.emit('devicesFound', this.getAuthorizedDevices());
    }, 2000);

    // Continue scanning for new authorized devices
    this.scanInterval = setInterval(async () => {
      if (this.isEnabled) {
        this.emit('scanning', { timestamp: Date.now() });
        
        // Periodically re-verify devices
        const devices = this.getDevices();
        for (const device of devices) {
          if (!device.isConnected) {
            const isStillAuthorized = await this.verifyDevice(device.ip, device.port);
            if (!isStillAuthorized) {
              this.removeDevice(device.id);
              this.emit('deviceRemoved', device);
            }
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop scanning
   */
  stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = undefined;
    }
  }

  /**
   * Connect to an authorized device
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device || !device.isAuthorized) {
      console.log('Cannot connect to unauthorized device');
      return false;
    }

    // Re-verify before connecting
    const isStillAuthorized = await this.verifyDevice(device.ip, device.port);
    if (!isStillAuthorized) {
      this.removeDevice(device.id);
      this.emit('deviceRemoved', device);
      return false;
    }

    device.isConnected = true;
    this.emit('deviceConnected', device);
    return true;
  }

  /**
   * Disconnect from a device
   */
  disconnectFromDevice(deviceId: string): boolean {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    device.isConnected = false;
    this.emit('deviceDisconnected', device);
    return true;
  }

  /**
   * Sync with all connected authorized devices
   */
  async syncAllDevices(): Promise<void> {
    const connectedDevices = this.getConnectedAuthorizedDevices();
    
    if (connectedDevices.length === 0) {
      this.emit('syncComplete', { 
        success: false, 
        message: 'No authorized devices connected' 
      });
      return;
    }

    this.emit('syncStarted', { deviceCount: connectedDevices.length });

    // Verify all devices are still authorized before syncing
    for (const device of connectedDevices) {
      const isStillAuthorized = await this.verifyDevice(device.ip, device.port);
      if (!isStillAuthorized) {
        this.disconnectFromDevice(device.id);
        this.removeDevice(device.id);
      }
    }

    const stillConnectedDevices = this.getConnectedAuthorizedDevices();
    
    // Simulate sync process with authorized devices only
    for (let i = 0; i < stillConnectedDevices.length; i++) {
      const device = stillConnectedDevices[i];
      
      // Update last sync time
      device.lastSync = new Date().toLocaleTimeString();
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.emit('syncProgress', { 
        device: device.name, 
        progress: ((i + 1) / stillConnectedDevices.length) * 100 
      });
    }

    this.emit('syncComplete', { 
      success: true, 
      deviceCount: stillConnectedDevices.length 
    });
  }

  /**
   * Add a device manually (must be verified)
   */
  async addManualDevice(ip: string, name?: string): Promise<SimpleDevice | null> {
    // Verify the device is running UCOST software
    const isAuthorized = await this.verifyDevice(ip, 5000);
    
    if (!isAuthorized) {
      this.emit('deviceRejected', { 
        ip, 
        reason: 'Device is not running UCOST Discovery Hub software' 
      });
      return null;
    }

    const device: SimpleDevice = {
      id: `manual-${Date.now()}`,
      name: name || `Manual Device - ${ip}`,
      ip,
      port: 5000,
      isConnected: false,
      capabilities: ['exhibits', 'tours'],
      isAuthorized: true,
      softwareVersion: this.SOFTWARE_VERSION,
      deviceType: 'desktop'
    };

    this.addDevice(device);
    return device;
  }

  /**
   * Get my IP address
   */
  private getMyIP(): void {
    // In a real implementation, this would get the actual IP
    this.myIP = '192.168.1.100';
  }

  /**
   * Add a device to the list
   */
  private addDevice(device: SimpleDevice): void {
    this.devices.set(device.id, device);
    this.emit('deviceAdded', device);
  }

  /**
   * Remove a device from the list
   */
  private removeDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      this.devices.delete(deviceId);
      this.emit('deviceRemoved', device);
    }
  }

  /**
   * Get all devices
   */
  getDevices(): SimpleDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get only authorized devices
   */
  getAuthorizedDevices(): SimpleDevice[] {
    return this.getDevices().filter(d => d.isAuthorized);
  }

  /**
   * Get connected authorized devices
   */
  getConnectedAuthorizedDevices(): SimpleDevice[] {
    return this.getAuthorizedDevices().filter(d => d.isConnected);
  }

  /**
   * Get my IP
   */
  getMyIP(): string {
    return this.myIP;
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Disconnect all devices
   */
  disconnectAll(): void {
    this.devices.forEach(device => {
      device.isConnected = false;
    });
    this.emit('allDevicesDisconnected');
  }

  /**
   * Get device by ID
   */
  getDevice(id: string): SimpleDevice | undefined {
    return this.devices.get(id);
  }

  /**
   * Get software verification info
   */
  getVerificationInfo() {
    return {
      softwareId: this.SOFTWARE_ID,
      version: this.SOFTWARE_VERSION,
      deviceId: this.DEVICE_ID
    };
  }
} 