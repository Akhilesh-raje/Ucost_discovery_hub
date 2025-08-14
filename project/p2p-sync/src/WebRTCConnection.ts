/**
 * UC Discovery Hub - WebRTC Connection Manager
 * Handles P2P communication across different networks
 */

import { EventEmitter } from 'events';
import { EncryptionManager } from '../security/EncryptionManager';
import { PeerInfo } from './PeerDiscovery';

export interface WebRTCMessage {
  type: 'file-update' | 'ai-report' | 'sync-request' | 'sync-response' | 'ping' | 'pong';
  data: any;
  timestamp: number;
  messageId: string;
}

export interface ConnectionState {
  peerId: string;
  state: 'connecting' | 'connected' | 'disconnected' | 'failed';
  lastPing?: number;
  latency?: number;
}

export class WebRTCConnection extends EventEmitter {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private connectionStates: Map<string, ConnectionState> = new Map();
  private encryption: EncryptionManager;
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.encryption = new EncryptionManager();
  }

  /**
   * Connect to a peer using WebRTC
   */
  async connectToPeer(peerInfo: PeerInfo): Promise<boolean> {
    try {
      console.log(`Attempting WebRTC connection to ${peerInfo.host}:${peerInfo.port}`);

      // Create RTCPeerConnection with STUN/TURN servers
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      });

      // Setup connection event handlers
      this.setupConnectionHandlers(peerConnection, peerInfo.id);

      // Create data channel for sync
      const dataChannel = peerConnection.createDataChannel('sync', {
        ordered: true,
        maxRetransmits: 3
      });

      this.setupDataChannel(dataChannel, peerInfo.id);

      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false
      });

      await peerConnection.setLocalDescription(offer);

      // Store connection
      this.peerConnections.set(peerInfo.id, peerConnection);
      this.connectionStates.set(peerInfo.id, {
        peerId: peerInfo.id,
        state: 'connecting'
      });

      // Send offer to peer (via signaling server or direct)
      await this.sendOffer(peerInfo, offer);

      return true;
    } catch (error) {
      console.error(`Failed to connect to peer ${peerInfo.id}:`, error);
      this.connectionStates.set(peerInfo.id, {
        peerId: peerInfo.id,
        state: 'failed'
      });
      return false;
    }
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(peerConnection: RTCPeerConnection, peerId: string): void {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`ICE candidate for ${peerId}:`, event.candidate);
        // Send candidate to peer via signaling
        this.sendIceCandidate(peerId, event.candidate);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log(`ICE connection state for ${peerId}: ${state}`);
      
      const connectionState = this.connectionStates.get(peerId);
      if (connectionState) {
        if (state === 'connected' || state === 'completed') {
          connectionState.state = 'connected';
          this.startPingInterval(peerId);
        } else if (state === 'disconnected' || state === 'failed') {
          connectionState.state = 'disconnected';
          this.stopPingInterval(peerId);
        }
      }
    };

    peerConnection.ondatachannel = (event) => {
      console.log(`Data channel received from ${peerId}`);
      this.setupDataChannel(event.channel, peerId);
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(`Connection state for ${peerId}: ${state}`);
      
      if (state === 'connected') {
        this.emit('peer-connected', peerId);
      } else if (state === 'disconnected' || state === 'failed') {
        this.emit('peer-disconnected', peerId);
        this.cleanupConnection(peerId);
      }
    };
  }

  /**
   * Setup data channel for communication
   */
  private setupDataChannel(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened with ${peerId}`);
      this.connectionStates.set(peerId, {
        peerId,
        state: 'connected'
      });
      this.emit('peer-connected', peerId);
      this.startPingInterval(peerId);
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(peerId, message);
      } catch (error) {
        console.error(`Failed to parse message from ${peerId}:`, error);
      }
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed with ${peerId}`);
      this.connectionStates.set(peerId, {
        peerId,
        state: 'disconnected'
      });
      this.emit('peer-disconnected', peerId);
      this.stopPingInterval(peerId);
      this.cleanupConnection(peerId);
    };

    dataChannel.onerror = (error) => {
      console.error(`Data channel error with ${peerId}:`, error);
      this.connectionStates.set(peerId, {
        peerId,
        state: 'failed'
      });
    };

    this.dataChannels.set(peerId, dataChannel);
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(peerId: string, message: WebRTCMessage): void {
    console.log(`Received message from ${peerId}:`, message.type);

    switch (message.type) {
      case 'file-update':
        this.handleFileUpdate(peerId, message.data);
        break;
      case 'ai-report':
        this.handleAIReport(peerId, message.data);
        break;
      case 'sync-request':
        this.handleSyncRequest(peerId, message.data);
        break;
      case 'sync-response':
        this.handleSyncResponse(peerId, message.data);
        break;
      case 'ping':
        this.handlePing(peerId, message);
        break;
      case 'pong':
        this.handlePong(peerId, message);
        break;
      default:
        console.warn(`Unknown message type from ${peerId}:`, message.type);
    }

    this.emit('message', peerId, message);
  }

  /**
   * Handle file update from peer
   */
  private handleFileUpdate(peerId: string, data: any): void {
    console.log(`File update from ${peerId}:`, data.filename);
    this.emit('file-update', {
      peerId,
      filename: data.filename,
      hash: data.hash,
      data: data.data,
      timestamp: data.timestamp
    });
  }

  /**
   * Handle AI report from peer
   */
  private handleAIReport(peerId: string, data: any): void {
    console.log(`AI report from ${peerId}:`, data.reportId);
    this.emit('ai-report', {
      peerId,
      reportId: data.reportId,
      data: data.data,
      timestamp: data.timestamp
    });
  }

  /**
   * Handle sync request from peer
   */
  private handleSyncRequest(peerId: string, data: any): void {
    console.log(`Sync request from ${peerId}:`, data.files);
    this.emit('sync-request', {
      peerId,
      files: data.files
    });
  }

  /**
   * Handle sync response from peer
   */
  private handleSyncResponse(peerId: string, data: any): void {
    console.log(`Sync response from ${peerId}:`, data.files.length, 'files');
    this.emit('sync-response', {
      peerId,
      files: data.files
    });
  }

  /**
   * Handle ping from peer
   */
  private handlePing(peerId: string, message: WebRTCMessage): void {
    // Send pong response
    this.sendToPeer(peerId, {
      type: 'pong',
      data: { timestamp: message.timestamp },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    });
  }

  /**
   * Handle pong from peer
   */
  private handlePong(peerId: string, message: WebRTCMessage): void {
    const connectionState = this.connectionStates.get(peerId);
    if (connectionState) {
      const latency = Date.now() - message.data.timestamp;
      connectionState.latency = latency;
      connectionState.lastPing = Date.now();
    }
  }

  /**
   * Send message to specific peer
   */
  sendToPeer(peerId: string, message: WebRTCMessage): boolean {
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel && dataChannel.readyState === 'open') {
      try {
        const encryptedMessage = this.encryption.encryptMessage(
          JSON.stringify(message),
          peerId
        );
        dataChannel.send(encryptedMessage);
        return true;
      } catch (error) {
        console.error(`Failed to send message to ${peerId}:`, error);
        return false;
      }
    } else {
      console.warn(`No open data channel for peer ${peerId}`);
      return false;
    }
  }

  /**
   * Broadcast message to all connected peers
   */
  broadcast(message: WebRTCMessage): void {
    let sentCount = 0;
    this.dataChannels.forEach((dataChannel, peerId) => {
      if (dataChannel.readyState === 'open') {
        if (this.sendToPeer(peerId, message)) {
          sentCount++;
        }
      }
    });
    console.log(`Broadcasted message to ${sentCount} peers`);
  }

  /**
   * Send file update to all peers
   */
  broadcastFileUpdate(filename: string, hash: string, data: any): void {
    const message: WebRTCMessage = {
      type: 'file-update',
      data: {
        filename,
        hash,
        data,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };
    this.broadcast(message);
  }

  /**
   * Send AI report to all peers
   */
  broadcastAIReport(reportId: string, data: any): void {
    const message: WebRTCMessage = {
      type: 'ai-report',
      data: {
        reportId,
        data,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };
    this.broadcast(message);
  }

  /**
   * Request sync from specific peer
   */
  requestSync(peerId: string, files: string[]): boolean {
    const message: WebRTCMessage = {
      type: 'sync-request',
      data: { files },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };
    return this.sendToPeer(peerId, message);
  }

  /**
   * Send sync response to peer
   */
  sendSyncResponse(peerId: string, files: any[]): boolean {
    const message: WebRTCMessage = {
      type: 'sync-response',
      data: { files },
      timestamp: Date.now(),
      messageId: this.generateMessageId()
    };
    return this.sendToPeer(peerId, message);
  }

  /**
   * Start ping interval for connection monitoring
   */
  private startPingInterval(peerId: string): void {
    const interval = setInterval(() => {
      const message: WebRTCMessage = {
        type: 'ping',
        data: { timestamp: Date.now() },
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      };
      this.sendToPeer(peerId, message);
    }, 30000); // Ping every 30 seconds

    this.pingIntervals.set(peerId, interval);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(peerId: string): void {
    const interval = this.pingIntervals.get(peerId);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(peerId);
    }
  }

  /**
   * Cleanup connection resources
   */
  private cleanupConnection(peerId: string): void {
    this.stopPingInterval(peerId);
    this.dataChannels.delete(peerId);
    this.peerConnections.delete(peerId);
    this.connectionStates.delete(peerId);
  }

  /**
   * Send offer to peer (via signaling server)
   */
  private async sendOffer(peerInfo: PeerInfo, offer: RTCSessionDescriptionInit): Promise<void> {
    // This would typically go through a signaling server
    // For now, we'll simulate direct connection
    console.log(`Sending offer to ${peerInfo.host}:${peerInfo.port}`);
    
    // In a real implementation, you'd send this via HTTP/WebSocket
    // to a signaling server that the peer is listening to
  }

  /**
   * Send ICE candidate to peer
   */
  private sendIceCandidate(peerId: string, candidate: RTCIceCandidate): void {
    // Send ICE candidate via signaling server
    console.log(`Sending ICE candidate to ${peerId}:`, candidate);
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection state for a peer
   */
  getConnectionState(peerId: string): ConnectionState | undefined {
    return this.connectionStates.get(peerId);
  }

  /**
   * Get all connected peers
   */
  getConnectedPeers(): string[] {
    return Array.from(this.dataChannels.keys()).filter(peerId => {
      const dataChannel = this.dataChannels.get(peerId);
      return dataChannel && dataChannel.readyState === 'open';
    });
  }

  /**
   * Check if peer is connected
   */
  isPeerConnected(peerId: string): boolean {
    const dataChannel = this.dataChannels.get(peerId);
    return dataChannel ? dataChannel.readyState === 'open' : false;
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalPeers: number;
    connectedPeers: number;
    averageLatency: number;
  } {
    const totalPeers = this.connectionStates.size;
    const connectedPeers = this.getConnectedPeers().length;
    
    const latencies = Array.from(this.connectionStates.values())
      .map(state => state.latency)
      .filter(latency => latency !== undefined) as number[];
    
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length 
      : 0;

    return {
      totalPeers,
      connectedPeers,
      averageLatency
    };
  }

  /**
   * Disconnect from a peer
   */
  disconnectPeer(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
    }
    this.cleanupConnection(peerId);
    console.log(`Disconnected from peer: ${peerId}`);
  }

  /**
   * Disconnect from all peers
   */
  disconnectAll(): void {
    this.peerConnections.forEach((connection, peerId) => {
      connection.close();
    });
    
    this.dataChannels.clear();
    this.peerConnections.clear();
    this.connectionStates.clear();
    this.pingIntervals.forEach(interval => clearInterval(interval));
    this.pingIntervals.clear();
    
    console.log('Disconnected from all peers');
  }
} 