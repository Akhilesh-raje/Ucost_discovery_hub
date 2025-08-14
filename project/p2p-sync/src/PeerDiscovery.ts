/**
 * UC Discovery Hub - Peer Discovery System
 * Discovers and connects devices across different networks without cloud dependency
 */

import { EventEmitter } from 'events';
import dgram from 'dgram';
import { WebRTCConnection } from './WebRTCConnection';
import { EncryptionManager } from '../security/EncryptionManager';

export interface PeerInfo {
  id: string;
  host: string;
  port: number;
  type: 'lan' | 'internet' | 'manual';
  lastSeen: number;
  capabilities?: string[];
  publicKey?: string;
  isServer?: boolean;
}

export interface DiscoveryConfig {
  serviceName: string;
  servicePort: number;
  broadcastInterval: number;
  discoveryTimeout: number;
  stunServers: string[];
}

export class PeerDiscovery extends EventEmitter {
  private peers: Map<string, PeerInfo> = new Map();
  private isServer: boolean = false;
  private serverAddress?: string;
  private config: DiscoveryConfig;
  private encryption: EncryptionManager;
  private webrtcConnection: WebRTCConnection;
  private broadcastTimer?: NodeJS.Timeout;
  private discoveryTimer?: NodeJS.Timeout;
  private socket?: dgram.Socket;

  constructor(config: DiscoveryConfig) {
    super();
    this.config = config;
    this.encryption = new EncryptionManager();
    this.webrtcConnection = new WebRTCConnection();
    this.setupWebRTCListeners();
  }

  /**
   * Start the discovery process
   */
  async startDiscovery(): Promise<void> {
    console.log('Starting peer discovery...');
    
    // Start LAN discovery
    await this.startLANDiscovery();
    
    // Start internet discovery
    await this.startInternetDiscovery();
    
    // Start manual discovery (QR codes, etc.)
    this.startManualDiscovery();
    
    // Check if we should become server
    setTimeout(() => {
      this.checkServerElection();
    }, this.config.discoveryTimeout);
  }

  /**
   * Start LAN discovery using mDNS/Bonjour
   */
  private async startLANDiscovery(): Promise<void> {
    try {
      // Use mDNS for local network discovery
      const mdns = require('mdns');
      const browser = mdns.createBrowser(mdns.tcp(this.config.serviceName));
      
      browser.on('serviceUp', (service: any) => {
        console.log(`LAN peer discovered: ${service.host}:${service.port}`);
        this.addPeer({
          id: `${service.host}:${service.port}`,
          host: service.host,
          port: service.port,
          type: 'lan',
          lastSeen: Date.now(),
          capabilities: this.parseCapabilities(service.txtRecord)
        });
      });
      
      browser.on('serviceDown', (service: any) => {
        console.log(`LAN peer disconnected: ${service.host}:${service.port}`);
        this.removePeer(`${service.host}:${service.port}`);
      });
      
      browser.start();
      
      // Also start UDP broadcast for immediate discovery
      this.startUDPBroadcast();
      
    } catch (error) {
      console.error('Failed to start LAN discovery:', error);
    }
  }

  /**
   * Start internet discovery using STUN/TURN servers
   */
  private async startInternetDiscovery(): Promise<void> {
    try {
      // Use STUN servers to discover peers across internet
      for (const stunServer of this.config.stunServers) {
        await this.discoverPeersViaSTUN(stunServer);
      }
      
      // Start periodic internet discovery
      this.discoveryTimer = setInterval(() => {
        this.performInternetDiscovery();
      }, 30000); // Every 30 seconds
      
    } catch (error) {
      console.error('Failed to start internet discovery:', error);
    }
  }

  /**
   * Discover peers via STUN server
   */
  private async discoverPeersViaSTUN(stunServer: string): Promise<void> {
    try {
      // Create WebRTC connection to STUN server
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: stunServer }]
      });
      
      // Create data channel for peer discovery
      const dataChannel = peerConnection.createDataChannel('discovery');
      
      dataChannel.onopen = () => {
        // Send discovery message
        dataChannel.send(JSON.stringify({
          type: 'discovery',
          peerId: this.generatePeerId(),
          capabilities: ['ai', 'sync', 'reports'],
          publicKey: this.encryption.getPublicKey()
        }));
      };
      
      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'discovery-response') {
          this.addPeer({
            id: message.peerId,
            host: message.host,
            port: message.port,
            type: 'internet',
            lastSeen: Date.now(),
            capabilities: message.capabilities,
            publicKey: message.publicKey
          });
        }
      };
      
      // Create offer and send to STUN server
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
    } catch (error) {
      console.error(`Failed to discover peers via ${stunServer}:`, error);
    }
  }

  /**
   * Start manual discovery (QR codes, USB, etc.)
   */
  private startManualDiscovery(): void {
    // Listen for manual connections
    this.emit('manual-discovery-ready', {
      peerId: this.generatePeerId(),
      publicKey: this.encryption.getPublicKey(),
      capabilities: ['ai', 'sync', 'reports']
    });
  }

  /**
   * Start UDP broadcast for immediate LAN discovery
   */
  private startUDPBroadcast(): void {
    try {
      this.socket = dgram.createSocket('udp4');
      
      this.socket.on('message', (msg, rinfo) => {
        try {
          const message = JSON.parse(msg.toString());
          if (message.type === 'discovery-broadcast') {
            this.addPeer({
              id: message.peerId,
              host: rinfo.address,
              port: message.port,
              type: 'lan',
              lastSeen: Date.now(),
              capabilities: message.capabilities,
              publicKey: message.publicKey
            });
            
            // Respond with our info
            this.sendDiscoveryResponse(rinfo.address, rinfo.port);
          }
        } catch (error) {
          console.error('Failed to parse discovery message:', error);
        }
      });
      
      this.socket.bind();
      
      // Start broadcasting our presence
      this.broadcastTimer = setInterval(() => {
        this.broadcastPresence();
      }, this.config.broadcastInterval);
      
    } catch (error) {
      console.error('Failed to start UDP broadcast:', error);
    }
  }

  /**
   * Broadcast our presence on the network
   */
  private broadcastPresence(): void {
    if (!this.socket) return;
    
    const message = JSON.stringify({
      type: 'discovery-broadcast',
      peerId: this.generatePeerId(),
      port: this.config.servicePort,
      capabilities: ['ai', 'sync', 'reports'],
      publicKey: this.encryption.getPublicKey(),
      isServer: this.isServer
    });
    
    this.socket.send(message, 0, message.length, 5353, '224.0.0.251');
  }

  /**
   * Send discovery response to a peer
   */
  private sendDiscoveryResponse(host: string, port: number): void {
    if (!this.socket) return;
    
    const message = JSON.stringify({
      type: 'discovery-response',
      peerId: this.generatePeerId(),
      port: this.config.servicePort,
      capabilities: ['ai', 'sync', 'reports'],
      publicKey: this.encryption.getPublicKey(),
      isServer: this.isServer
    });
    
    this.socket.send(message, 0, message.length, port, host);
  }

  /**
   * Add a discovered peer
   */
  private addPeer(peerInfo: PeerInfo): void {
    const existingPeer = this.peers.get(peerInfo.id);
    
    if (existingPeer) {
      // Update existing peer
      existingPeer.lastSeen = peerInfo.lastSeen;
      existingPeer.capabilities = peerInfo.capabilities;
      existingPeer.publicKey = peerInfo.publicKey;
      existingPeer.isServer = peerInfo.isServer;
    } else {
      // Add new peer
      this.peers.set(peerInfo.id, peerInfo);
      this.emit('peer-discovered', peerInfo);
      
      // Try to connect to the peer
      this.connectToPeer(peerInfo);
    }
  }

  /**
   * Remove a disconnected peer
   */
  private removePeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      this.peers.delete(peerId);
      this.emit('peer-disconnected', peer);
    }
  }

  /**
   * Connect to a discovered peer
   */
  private async connectToPeer(peerInfo: PeerInfo): Promise<void> {
    try {
      console.log(`Attempting to connect to peer: ${peerInfo.host}:${peerInfo.port}`);
      
      const connected = await this.webrtcConnection.connectToPeer(peerInfo);
      
      if (connected) {
        console.log(`Successfully connected to peer: ${peerInfo.id}`);
        this.emit('peer-connected', peerInfo);
      } else {
        console.log(`Failed to connect to peer: ${peerInfo.id}`);
      }
    } catch (error) {
      console.error(`Error connecting to peer ${peerInfo.id}:`, error);
    }
  }

  /**
   * Check if we should become the server
   */
  private checkServerElection(): void {
    const activePeers = Array.from(this.peers.values()).filter(peer => 
      Date.now() - peer.lastSeen < 60000 // Peers seen in last minute
    );
    
    if (activePeers.length === 0) {
      // No peers found, become server
      this.becomeServer();
    } else {
      // Check if any existing peer is a server
      const existingServer = activePeers.find(peer => peer.isServer);
      
      if (!existingServer) {
        // No server found, become server
        this.becomeServer();
      } else {
        console.log(`Server found: ${existingServer.id}`);
        this.emit('server-found', existingServer);
      }
    }
  }

  /**
   * Become the server for this network
   */
  private becomeServer(): void {
    this.isServer = true;
    this.serverAddress = this.getLocalIP();
    
    console.log(`Becoming server at ${this.serverAddress}`);
    this.emit('server-elected', this.serverAddress);
    
    // Start advertising as server
    this.advertiseAsServer();
  }

  /**
   * Advertise this device as a server
   */
  private advertiseAsServer(): void {
    try {
      const mdns = require('mdns');
      const ad = mdns.createAdvertisement(mdns.tcp(this.config.serviceName), this.config.servicePort, {
        name: 'ucost-server',
        txt: {
          version: '1.0.0',
          capabilities: 'ai,sync,reports',
          isServer: 'true',
          publicKey: this.encryption.getPublicKey()
        }
      });
      ad.start();
      
      console.log('Started advertising as server');
    } catch (error) {
      console.error('Failed to advertise as server:', error);
    }
  }

  /**
   * Get local IP address
   */
  private getLocalIP(): string {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
    
    return '127.0.0.1';
  }

  /**
   * Generate unique peer ID
   */
  private generatePeerId(): string {
    return `peer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse capabilities from service record
   */
  private parseCapabilities(txtRecord: any): string[] {
    if (!txtRecord) return [];
    
    const capabilities: string[] = [];
    
    if (txtRecord.ai) capabilities.push('ai');
    if (txtRecord.sync) capabilities.push('sync');
    if (txtRecord.reports) capabilities.push('reports');
    
    return capabilities;
  }

  /**
   * Setup WebRTC event listeners
   */
  private setupWebRTCListeners(): void {
    this.webrtcConnection.on('peer-connected', (peerId: string) => {
      console.log(`WebRTC connected to peer: ${peerId}`);
      this.emit('webrtc-connected', peerId);
    });
    
    this.webrtcConnection.on('peer-disconnected', (peerId: string) => {
      console.log(`WebRTC disconnected from peer: ${peerId}`);
      this.emit('webrtc-disconnected', peerId);
    });
    
    this.webrtcConnection.on('message', (peerId: string, message: any) => {
      this.emit('peer-message', peerId, message);
    });
  }

  /**
   * Get all discovered peers
   */
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get active peers (seen in last minute)
   */
  getActivePeers(): PeerInfo[] {
    const now = Date.now();
    return Array.from(this.peers.values()).filter(peer => 
      now - peer.lastSeen < 60000
    );
  }

  /**
   * Check if we are the server
   */
  isServerNode(): boolean {
    return this.isServer;
  }

  /**
   * Get server address
   */
  getServerAddress(): string | undefined {
    return this.serverAddress;
  }

  /**
   * Stop discovery
   */
  stopDiscovery(): void {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
    }
    
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
    }
    
    if (this.socket) {
      this.socket.close();
    }
    
    console.log('Discovery stopped');
  }

  /**
   * Perform periodic internet discovery
   */
  private async performInternetDiscovery(): Promise<void> {
    for (const stunServer of this.config.stunServers) {
      await this.discoverPeersViaSTUN(stunServer);
    }
  }
}

// Default configuration
export const defaultDiscoveryConfig: DiscoveryConfig = {
  serviceName: 'ucost',
  servicePort: 3000,
  broadcastInterval: 5000, // 5 seconds
  discoveryTimeout: 10000, // 10 seconds
  stunServers: [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302'
  ]
}; 