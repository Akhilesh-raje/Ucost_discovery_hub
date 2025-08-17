import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Smartphone, QrCode, Download, Users, Wifi, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MobileAppPanelProps {
  onBack: () => void;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'tablet';
  ipAddress: string;
  lastSeen: string;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
}

export default function MobileAppPanel({ onBack }: MobileAppPanelProps) {
  const [currentView, setCurrentView] = useState<'main' | 'qr-generator' | 'device-list'>('main');
  const [qrData, setQrData] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('https://ucost.uk.gov.in/mobile-app/download');
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([
    {
      id: 'mobile-001',
      name: 'Samsung Galaxy S21',
      type: 'mobile',
      ipAddress: '192.168.1.105',
      lastSeen: new Date().toISOString(),
      isOnline: true,
      syncStatus: 'completed',
    },
    {
      id: 'tablet-001',
      name: 'iPad Pro',
      type: 'tablet',
      ipAddress: '192.168.1.106',
      lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      isOnline: false,
      syncStatus: 'idle',
    },
  ]);

  const generateQRCode = () => {
    const qrData = {
      type: 'mobile_app_download',
      url: downloadUrl,
      device_id: 'kiosk-' + Date.now(),
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    };
    setQrData(JSON.stringify(qrData));
  };

  const getDeviceIcon = (type: string) => {
    return type === 'mobile' ? '📱' : '📱';
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case 'syncing':
        return 'Syncing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  if (currentView === 'qr-generator') {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setCurrentView('main')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mobile App
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
            <p className="text-muted-foreground">Generate QR codes for mobile app download</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <QrCode className="h-6 w-6 text-blue-500" />
                  QR Code Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="download-url">Download URL</Label>
                  <Input
                    id="download-url"
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    placeholder="https://ucost.uk.gov.in/mobile-app/download"
                  />
                </div>
                
                <Button onClick={generateQRCode} className="w-full">
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="h-6 w-6 text-green-500" />
                  Generated QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {qrData ? (
                  <>
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeSVG value={qrData} size={200} />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Scan this QR code with a mobile device to download the UCOST Discovery Hub app
                    </p>
                    <Button variant="outline" onClick={() => {
                      // Copy QR data to clipboard
                      navigator.clipboard.writeText(qrData);
                    }}>
                      Copy QR Data
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Click "Generate QR Code" to create a download QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'device-list') {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => setCurrentView('main')} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mobile App
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">Connected Mobile Devices</h1>
            <p className="text-muted-foreground">Manage mobile devices connected to this kiosk</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedDevices.map((device) => (
              <Card key={device.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-2xl">{getDeviceIcon(device.type)}</span>
                    <div>
                      <div className="font-semibold">{device.name}</div>
                      <div className="text-sm text-muted-foreground">{device.type}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`text-sm font-medium ${device.isOnline ? 'text-green-500' : 'text-red-500'}`}>
                      {device.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IP Address:</span>
                    <span className="text-sm font-mono">{device.ipAddress}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sync Status:</span>
                    <span className={`text-sm font-medium ${getSyncStatusColor(device.syncStatus)}`}>
                      {getSyncStatusText(device.syncStatus)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Seen:</span>
                    <span className="text-sm">
                      {new Date(device.lastSeen).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Wifi className="mr-1 h-3 w-3" />
                      Sync
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="mr-1 h-3 w-3" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{connectedDevices.length}</div>
                    <div className="text-sm text-muted-foreground">Total Devices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {connectedDevices.filter(d => d.isOnline).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Online Devices</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {connectedDevices.filter(d => d.syncStatus === 'syncing').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Syncing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {connectedDevices.filter(d => d.syncStatus === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 text-white hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Panel
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 text-white">Mobile App Management</h1>
          <p className="text-gray-300">Generate QR codes and manage mobile devices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('qr-generator')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <QrCode className="h-6 w-6 text-blue-500" />
                Generate QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Create QR codes for mobile app download and device connection.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('device-list')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-500" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and manage mobile devices connected to this kiosk.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-purple-500" />
                Download Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track mobile app downloads and usage statistics.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Downloads:</span>
                  <span className="text-sm font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month:</span>
                  <span className="text-sm font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Users:</span>
                  <span className="text-sm font-semibold">342</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-orange-500" />
                App Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Current mobile app version and update information.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Version:</span>
                  <span className="text-sm font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-sm font-semibold">2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Update Available:</span>
                  <span className="text-sm font-semibold text-green-500">No</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wifi className="h-6 w-6 text-cyan-500" />
                P2P Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">P2P connection status and network information.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">P2P Enabled:</span>
                  <span className="text-sm font-semibold text-green-500">Yes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Connected Devices:</span>
                  <span className="text-sm font-semibold">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Network Type:</span>
                  <span className="text-sm font-semibold">WiFi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Download className="h-6 w-6 text-indigo-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Quick actions for mobile app management.</p>
              <div className="mt-4 space-y-2">
                <Button size="sm" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Force Sync All
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  Broadcast Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 