import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  Users, 
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Plus,
  Copy,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface SimpleDevice {
  id: string;
  name: string;
  ip: string;
  isConnected: boolean;
  lastSync?: string;
  isAuthorized: boolean;
  softwareVersion: string;
  deviceType: 'kiosk' | 'mobile' | 'desktop';
}

interface P2PSyncPanelProps {
  onBack: () => void;
}

export default function P2PSyncPanel({ onBack }: P2PSyncPanelProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [peers, setPeers] = useState<SimpleDevice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [myIP, setMyIP] = useState('192.168.1.100');
  const [manualIP, setManualIP] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-start scanning when enabled
  useEffect(() => {
    if (isEnabled) {
      startScanning();
    }
  }, [isEnabled]);

  const startScanning = () => {
    setIsScanning(true);
    setErrorMessage('');
    
    // Simulate finding authorized UCOST devices only
    setTimeout(() => {
      const foundPeers: SimpleDevice[] = [
        {
          id: '1',
          name: 'Kiosk 1 - Main Entrance',
          ip: '192.168.1.101',
          isConnected: false,
          isAuthorized: true,
          softwareVersion: '1.0.0',
          deviceType: 'kiosk'
        },
        {
          id: '2', 
          name: 'Kiosk 2 - Science Wing',
          ip: '192.168.1.102',
          isConnected: false,
          isAuthorized: true,
          softwareVersion: '1.0.0',
          deviceType: 'kiosk'
        },
        {
          id: '3',
          name: 'Mobile Device - Staff',
          ip: '192.168.1.103',
          isConnected: false,
          isAuthorized: true,
          softwareVersion: '1.0.0',
          deviceType: 'mobile'
        }
      ];
      
      setPeers(foundPeers);
      setIsScanning(false);
    }, 3000);
  };

  const connectToDevice = async (peerId: string) => {
    const peer = peers.find(p => p.id === peerId);
    if (!peer || !peer.isAuthorized) {
      setErrorMessage('Cannot connect to unauthorized device');
      return;
    }

    // Simulate connection verification
    setPeers(prev => prev.map(p => 
      p.id === peerId ? { ...p, isConnected: true } : p
    ));
  };

  const disconnectFromDevice = (peerId: string) => {
    setPeers(prev => prev.map(p => 
      p.id === peerId ? { ...p, isConnected: false } : p
    ));
  };

  const syncAllDevices = () => {
    const connectedPeers = peers.filter(p => p.isConnected && p.isAuthorized);
    if (connectedPeers.length === 0) {
      setErrorMessage('No authorized devices connected');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setErrorMessage('');
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          
          // Update last sync time
          setPeers(prev => prev.map(p => 
            p.isConnected && p.isAuthorized ? { ...p, lastSync: new Date().toLocaleTimeString() } : p
          ));
          
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const addManualDevice = async () => {
    if (!manualIP.trim()) return;
    
    // Simulate verification - only authorized UCOST software can be added
    const isAuthorized = manualIP.includes('192.168.1'); // Simple check for demo
    
    if (!isAuthorized) {
      setErrorMessage('Device is not running UCOST Discovery Hub software');
      return;
    }
    
    const newPeer: SimpleDevice = {
      id: Date.now().toString(),
      name: `Manual Device - ${manualIP}`,
      ip: manualIP,
      isConnected: false,
      isAuthorized: true,
      softwareVersion: '1.0.0',
      deviceType: 'desktop'
    };
    
    setPeers(prev => [...prev, newPeer]);
    setManualIP('');
    setErrorMessage('');
  };

  const copyMyIP = () => {
    navigator.clipboard.writeText(myIP);
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'kiosk': return '🖥️';
      case 'mobile': return '📱';
      case 'desktop': return '💻';
      default: return '🖥️';
    }
  };

  const getDeviceTypeColor = (type: string) => {
    switch (type) {
      case 'kiosk': return 'bg-blue-500';
      case 'mobile': return 'bg-green-500';
      case 'desktop': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Device Sync</h1>
          <p className="text-muted-foreground">Connect and sync with other UCOST Discovery Hub devices</p>
        </div>

        {/* Security Notice */}
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Only devices running UCOST Discovery Hub software can connect and sync. 
            Unauthorized devices will be automatically rejected.
          </AlertDescription>
        </Alert>

        {/* Main Control */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Wifi className="h-6 w-6 text-primary" />
              Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Switch 
                  checked={isEnabled} 
                  onCheckedChange={setIsEnabled}
                />
                <span className="font-medium">
                  {isEnabled ? 'Device Sync Enabled' : 'Device Sync Disabled'}
                </span>
              </div>
              
              {isEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">My IP:</span>
                  <span className="font-mono text-sm">{myIP}</span>
                  <Button variant="ghost" size="sm" onClick={copyMyIP}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {isEnabled && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {peers.filter(p => p.isConnected && p.isAuthorized).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Connected</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {peers.filter(p => p.isAuthorized).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Authorized</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {peers.filter(p => p.lastSync && p.isAuthorized).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Synced</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {errorMessage && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Scan Button */}
        {isEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <RefreshCw className={`h-6 w-6 ${isScanning ? 'animate-spin' : ''}`} />
                Find Authorized Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={startScanning}
                  disabled={isScanning}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isScanning ? 'Scanning...' : 'Scan for Devices'}
                </Button>
                
                <Button 
                  onClick={syncAllDevices}
                  disabled={isSyncing || peers.filter(p => p.isConnected && p.isAuthorized).length === 0}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Sync All Connected
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Progress */}
        {isSyncing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 animate-pulse" />
                Syncing Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={syncProgress} className="mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Syncing exhibits and tours with authorized devices...</span>
                <span>{syncProgress}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Manual Device */}
        {isEnabled && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Plus className="h-6 w-6" />
                Add Authorized Device Manually
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter IP address of UCOST device (e.g., 192.168.1.100)"
                  value={manualIP}
                  onChange={(e) => setManualIP(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addManualDevice} disabled={!manualIP.trim()}>
                  Add Device
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only devices running UCOST Discovery Hub software will be accepted
              </p>
            </CardContent>
          </Card>
        )}

        {/* Device List */}
        {isEnabled && peers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                Authorized Devices ({peers.filter(p => p.isAuthorized).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {peers.filter(p => p.isAuthorized).map((peer) => (
                  <div key={peer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${peer.isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDeviceTypeIcon(peer.deviceType)}</span>
                        <div>
                          <div className="font-medium">{peer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {peer.ip} • v{peer.softwareVersion} • {peer.deviceType}
                            {peer.lastSync && ` • Last sync: ${peer.lastSync}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {peer.isConnected ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => disconnectFromDevice(peer.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => connectToDevice(peer.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Instructions */}
        {isEnabled && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How to Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <div className="font-medium">Enable Device Sync</div>
                    <div className="text-muted-foreground">Turn on the switch above to start finding authorized UCOST devices</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <div className="font-medium">Scan for Authorized Devices</div>
                    <div className="text-muted-foreground">Click "Scan for Devices" to find other UCOST Discovery Hub software</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <div className="font-medium">Connect & Sync</div>
                    <div className="text-muted-foreground">Click "Connect" on any authorized device, then "Sync All Connected" to share data</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 