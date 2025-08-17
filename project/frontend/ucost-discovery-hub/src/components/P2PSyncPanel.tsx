import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Wifi, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  Link, 
  Link2, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Shield,
  Users,
  Database
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SimpleDevice {
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

export default function P2PSyncPanel({ onBack }: { onBack: () => void }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [peers, setPeers] = useState<SimpleDevice[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [myIP, setMyIP] = useState('192.168.1.100');
  const [manualIP, setManualIP] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  // Get local IP address
  useEffect(() => {
    getLocalIP();
  }, []);

  const getLocalIP = async () => {
    try {
      setMyIP('Detecting...');
      const response = await fetch('/api/auth/system/local-ip');
      if (response.ok) {
        const data = await response.json();
        setMyIP(data.ip);
        console.log('🌐 Local IP detected:', data.ip);
        
        // Show success toast
        toast({
          title: "IP Address Detected",
          description: `Your device IP: ${data.ip}`,
        });
      } else {
        throw new Error('Failed to get IP');
      }
    } catch (error) {
      console.log('❌ IP detection failed, using fallback');
      setMyIP('192.168.1.100'); // Fallback IP
      
      toast({
        title: "IP Detection Failed",
        description: "Using fallback IP address",
        variant: "destructive",
      });
    }
  };

  const refreshIP = async () => {
    await getLocalIP();
  };

  const startScanning = async () => {
    if (!isEnabled) return;
    
    setIsScanning(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Simulate finding authorized UCOST devices
      // In production, this would call the actual P2P discovery API
      setTimeout(() => {
        const foundPeers: SimpleDevice[] = [
          {
            id: '1',
            name: 'Kiosk 1 - Main Entrance',
            ip: '192.168.1.101',
            port: 5000,
            isConnected: false,
            isAuthorized: true,
            softwareVersion: '1.0.0',
            deviceType: 'kiosk',
            capabilities: ['exhibits', 'tours', 'analytics']
          },
          {
            id: '2', 
            name: 'Kiosk 2 - Science Wing',
            ip: '192.168.1.102',
            port: 5000,
            isConnected: false,
            isAuthorized: true,
            softwareVersion: '1.0.0',
            deviceType: 'kiosk',
            capabilities: ['exhibits', 'tours', 'analytics']
          },
          {
            id: '3',
            name: 'Mobile Device - Staff',
            ip: '192.168.1.103',
            port: 5000,
            isConnected: false,
            isAuthorized: true,
            softwareVersion: '1.0.0',
            deviceType: 'mobile',
            capabilities: ['exhibits', 'tours', 'analytics']
          },
          {
            id: '4',
            name: 'Admin Desktop - Office',
            ip: '192.168.1.104',
            port: 5000,
            isConnected: false,
            isAuthorized: true,
            softwareVersion: '1.0.0',
            deviceType: 'desktop',
            capabilities: ['exhibits', 'tours', 'analytics', 'admin']
          }
        ];
        
        setPeers(foundPeers);
        setIsScanning(false);
        setSuccessMessage(`Found ${foundPeers.length} authorized UCOST devices`);
        
        toast({
          title: "Device Discovery Complete",
          description: `Found ${foundPeers.length} authorized devices on the network`,
        });
      }, 3000);
    } catch (error) {
      setErrorMessage('Failed to scan for devices');
      setIsScanning(false);
    }
  };

  const connectToDevice = async (peerId: string) => {
    const peer = peers.find(p => p.id === peerId);
    if (!peer || !peer.isAuthorized) {
      setErrorMessage('Cannot connect to unauthorized device');
      return;
    }

    try {
      // Simulate connection verification
      setPeers(prev => prev.map(p => 
        p.id === peerId ? { ...p, isConnected: true } : p
      ));
      
      setSuccessMessage(`Connected to ${peer.name}`);
      toast({
        title: "Device Connected",
        description: `Successfully connected to ${peer.name}`,
      });
    } catch (error) {
      setErrorMessage(`Failed to connect to ${peer.name}`);
    }
  };

  const disconnectFromDevice = (peerId: string) => {
    setPeers(prev => prev.map(p => 
      p.id === peerId ? { ...p, isConnected: false } : p
    ));
    
    const peer = peers.find(p => p.id === peerId);
    if (peer) {
      setSuccessMessage(`Disconnected from ${peer.name}`);
    }
  };

  const syncAllDevices = async () => {
    const connectedPeers = peers.filter(p => p.isConnected && p.isAuthorized);
    if (connectedPeers.length === 0) {
      setErrorMessage('No authorized devices connected');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Simulate sync process
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsSyncing(false);
            
            // Update last sync time
            setPeers(prev => prev.map(p => 
              p.isConnected && p.isAuthorized ? { ...p, lastSync: new Date().toLocaleTimeString() } : p
            ));
            
            setSuccessMessage(`Successfully synced with ${connectedPeers.length} devices`);
            toast({
              title: "Sync Complete",
              description: `Successfully synchronized with ${connectedPeers.length} devices`,
            });
            
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    } catch (error) {
      setIsSyncing(false);
      setErrorMessage('Sync failed');
    }
  };

  const addManualDevice = async () => {
    if (!manualIP.trim()) {
      setErrorMessage('Please enter a valid IP address');
      return;
    }

    try {
      // Simulate manual device verification
      const newDevice: SimpleDevice = {
        id: `manual-${Date.now()}`,
        name: `Manual Device - ${manualIP}`,
        ip: manualIP,
        port: 5000,
        isConnected: false,
        isAuthorized: true,
        softwareVersion: '1.0.0',
        deviceType: 'desktop',
        capabilities: ['exhibits', 'tours', 'analytics']
      };

      setPeers(prev => [...prev, newDevice]);
      setManualIP('');
      setSuccessMessage(`Added manual device: ${manualIP}`);
      
      toast({
        title: "Device Added",
        description: `Successfully added manual device ${manualIP}`,
      });
    } catch (error) {
      setErrorMessage('Failed to add manual device');
    }
  };

  const copyIP = () => {
    navigator.clipboard.writeText(myIP);
    toast({
      title: "IP Copied",
      description: "IP address copied to clipboard",
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'kiosk': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getCapabilityBadges = (capabilities: string[]) => {
    return capabilities.map(cap => (
      <Badge key={cap} variant="secondary" className="text-xs">
        {cap}
      </Badge>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">P2P Network Sync</h1>
            <p className="text-gray-300 mt-2">Connect and synchronize with other UCOST Discovery Hub devices</p>
          </div>
          <Button variant="outline" onClick={onBack} className="text-white border-gray-600 hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Device Sync Control */}
          <div className="lg:col-span-1 space-y-6">
            {/* Network Status */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wifi className="h-5 w-5 text-blue-400" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Device IP Address</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${myIP !== 'Detecting...' && myIP !== '192.168.1.100' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-xs text-gray-400">
                        {myIP === 'Detecting...' ? 'Detecting...' : 
                         myIP === '192.168.1.100' ? 'Fallback' : 
                         'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-3 font-mono text-sm text-white">
                    {myIP}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyIP} className="flex-1 text-white border-gray-600 hover:bg-gray-700">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy IP
                    </Button>
                    <Button size="sm" variant="outline" onClick={refreshIP} className="flex-1 text-white border-gray-600 hover:bg-gray-700">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Network Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      myIP !== 'Detecting...' && myIP !== '192.168.1.100' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {myIP === 'Detecting...' ? 'Detecting' : 
                       myIP === '192.168.1.100' ? 'Limited' : 
                       'Connected'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Sync Control */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Wifi className="h-5 w-5 text-green-400" />
                  Device Sync Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Device Sync Enabled</span>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={setIsEnabled}
                  />
                </div>
                
                {isEnabled && (
                  <Button 
                    onClick={startScanning} 
                    disabled={isScanning}
                    className="w-full"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Scan for Devices
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Manual Device Entry */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Link className="h-5 w-5 text-blue-400" />
                  Add Manual Device
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Device IP Address</label>
                  <Input
                    placeholder="192.168.1.100"
                    value={manualIP}
                    onChange={(e) => setManualIP(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <Button onClick={addManualDevice} className="w-full">
                  Add Device
                </Button>
              </CardContent>
            </Card>

            {/* Sync Control */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5 text-purple-400" />
                  Sync Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={syncAllDevices}
                  disabled={!peers.some(p => p.isConnected) || isSyncing}
                  className="w-full"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Sync All Connected
                    </>
                  )}
                </Button>
                
                {isSyncing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>Sync Progress</span>
                      <span>{syncProgress}%</span>
                    </div>
                    <Progress value={syncProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Device List */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Discovered Devices
                  <Badge variant="secondary">{peers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isScanning && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-gray-300">Scanning network for UCOST devices...</p>
                  </div>
                )}

                {!isScanning && peers.length === 0 && (
                  <div className="text-center py-8">
                    <Wifi className="h-8 w-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-300">No devices found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Enable device sync and scan for devices
                    </p>
                  </div>
                )}

                {!isScanning && peers.length > 0 && (
                  <div className="space-y-4">
                    {peers.map((peer) => (
                      <div key={peer.id} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(peer.deviceType)}
                            <div>
                              <h3 className="font-medium text-white">{peer.name}</h3>
                              <p className="text-sm text-gray-400">
                                {peer.ip}:{peer.port} • v{peer.softwareVersion}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {peer.isAuthorized ? (
                              <Badge variant="default" className="bg-green-900 text-green-300">
                                <Shield className="h-3 w-3 mr-1" />
                                Authorized
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Unauthorized
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {getCapabilityBadges(peer.capabilities)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {peer.lastSync && (
                              <span className="text-xs text-gray-400">
                                Last sync: {peer.lastSync}
                              </span>
                            )}
                            
                            {peer.isConnected ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => disconnectFromDevice(peer.id)}
                                className="text-red-400 border-red-600 hover:bg-red-900"
                              >
                                <Link2 className="h-4 w-4 mr-1" />
                                Disconnect
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => connectToDevice(peer.id)}
                                disabled={!peer.isAuthorized}
                              >
                                <Link className="h-4 w-4 mr-1" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 rounded-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="fixed bottom-4 right-4 bg-green-900 border border-green-700 rounded-lg p-4 max-w-sm">
            <div className="flex items-center gap-2 text-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Success</span>
            </div>
            <p className="text-green-300 text-sm mt-1">{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
} 