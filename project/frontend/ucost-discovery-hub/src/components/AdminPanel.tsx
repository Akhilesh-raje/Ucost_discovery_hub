import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowLeft, Smartphone, Wifi, Settings, Database, BarChart3, Users } from 'lucide-react';
import ExhibitUpload from './ExhibitUpload';

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<'dashboard' | 'upload'>('dashboard');

  if (view === 'upload') {
    return <ExhibitUpload onBack={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kiosk
          </Button>
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage exhibits and system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setView('upload')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Plus className="h-6 w-6 text-primary" />
                Upload New Exhibit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Add a new exhibit with images, descriptions, and metadata.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Wifi className="h-6 w-6 text-green-500" />
                P2P Network Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Connect and sync across devices.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-blue-500" />
                Mobile App Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage connected mobile devices.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-500" />
                Manage Exhibits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Edit, update, or remove existing exhibits.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-purple-500" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View visitor statistics and usage data.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-orange-500" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage admin users and access permissions.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-red-500" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure themes and preferences.</p>
              <Button variant="outline" className="mt-4 w-full" disabled>Coming Soon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 