import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  Wifi, 
  Bluetooth, 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Upload,
  Users,
  Activity
} from 'lucide-react';

interface MobileDevice {
  id: string;
  name: string;
  platform: 'Android' | 'iOS';
  connectionType: 'WiFi' | 'Bluetooth' | 'Direct';
  isConnected: boolean;
  lastSeen: Date;
  syncStatus: 'synced' | 'pending' | 'error';
  exhibitsCount: number;
}

export default function MobileAppManagement({ onBack }: { onBack: () => void }) {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockDevices: MobileDevice[] = [
      {
        id: '1',
        name: 'Samsung Galaxy S23',
        platform: 'Android',
        connectionType: 'WiFi',
        isConnected: true,
        lastSeen: new Date(),
        syncStatus: 'synced',
        exhibitsCount: 15
      },
      {
        id: '2',
        name: 'iPhone 15 Pro',
        platform: 'iOS',
        connectionType: 'Bluetooth',
        isConnected: true,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        syncStatus: 'pending',
        exhibitsCount: 8
      },
      {
        id: '3',
        name: 'Google Pixel 7',
        platform: 'Android',
        connectionType: 'Direct',
        isConnected: false,
        lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
        syncStatus: 'error',
        exhibitsCount: 0
      }
    ];
    setDevices(mockDevices);
  }, []);

  const startDeviceScan = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  const generateQRCode = () => {
    // Generate a mock QR code for app download
    const qrData = {
      type: 'app_download',
      url: 'https://ucost-discovery-hub.com/mobile-app',
      timestamp: Date.now()
    };
    setQrCode(JSON.stringify(qrData));
    setShowQR(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'WiFi':
        return <Wifi className="h-4 w-4 text-blue-500" />;
      case 'Bluetooth':
        return <Bluetooth className="h-4 w-4 text-purple-500" />;
      case 'Direct':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      default:
        return <Smartphone className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <Badge variant="default" className="bg-green-100 text-green-800">Synced</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mobile App Management</h1>
            <p className="text-gray-300 mt-2">Monitor and manage connected mobile devices</p>
          </div>
          <Button variant="outline" onClick={onBack} className="text-white border-gray-600 hover:bg-gray-800">
            ← Back to Admin Panel
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {devices.filter(d => d.isConnected).length}
              </div>
              <p className="text-sm text-gray-600">Active connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Total Exhibits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {devices.reduce((sum, d) => sum + d.exhibitsCount, 0)}
              </div>
              <p className="text-sm text-gray-600">Across all devices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {devices.filter(d => d.syncStatus === 'synced').length}/{devices.length}
              </div>
              <p className="text-sm text-gray-600">Devices synced</p>
            </CardContent>
          </Card>
        </div>

        {/* Device Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Connected Devices</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={startDeviceScan}
                  disabled={isScanning}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  {isScanning ? 'Scanning...' : 'Scan'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getConnectionIcon(device.connectionType)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-gray-600">{device.platform}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(device.syncStatus)}
                      {getStatusBadge(device.syncStatus)}
                      <Badge variant="outline">{device.exhibitsCount} exhibits</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* QR Code Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-teal-500" />
                QR Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Generate QR codes for mobile app downloads and device pairing
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={generateQRCode}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate App Download QR
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate Pairing QR
                  </Button>
                </div>

                {showQR && qrCode && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm font-medium mb-2">Generated QR Code Data:</p>
                    <code className="text-xs bg-white p-2 rounded border block overflow-x-auto">
                      {qrCode}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowQR(false)}
                    >
                      Hide
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-blue-500" />
              Connection Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">WiFi Discovery</label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bluetooth Discovery</label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Enabled</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-Sync</label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Manual</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 