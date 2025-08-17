import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

export interface CapacitorInfo {
  isNative: boolean;
  platform: string;
  deviceInfo: any;
  networkStatus: any;
}

export const useCapacitor = () => {
  const [capacitorInfo, setCapacitorInfo] = useState<CapacitorInfo>({
    isNative: false,
    platform: 'web',
    deviceInfo: null,
    networkStatus: null,
  });

  useEffect(() => {
    const initializeCapacitor = async () => {
      try {
        // Check if running on native platform
        const isNative = Capacitor.isNativePlatform();
        
        // Get platform info
        const platform = Capacitor.getPlatform();
        
        // Get device info
        const deviceInfo = await Device.getInfo();
        
        // Get network status
        const networkStatus = await Network.getStatus();
        
        // Set up status bar for mobile
        if (isNative) {
          try {
            await StatusBar.setStyle({ style: 'dark' });
            await StatusBar.setBackgroundColor({ color: '#1e40af' });
          } catch (error) {
            console.log('StatusBar not available:', error);
          }
        }
        
        setCapacitorInfo({
          isNative,
          platform,
          deviceInfo,
          networkStatus,
        });
      } catch (error) {
        console.error('Error initializing Capacitor:', error);
      }
    };

    initializeCapacitor();
  }, []);

  // Haptic feedback
  const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (capacitorInfo.isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  // Keyboard handling
  const hideKeyboard = async () => {
    if (capacitorInfo.isNative) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.log('Keyboard not available:', error);
      }
    }
  };

  // App lifecycle
  const addAppStateListener = (callback: (state: any) => void) => {
    if (capacitorInfo.isNative) {
      App.addListener('appStateChange', callback);
    }
  };

  const removeAppStateListener = () => {
    if (capacitorInfo.isNative) {
      App.removeAllListeners();
    }
  };

  // Network status monitoring
  const addNetworkListener = (callback: (status: any) => void) => {
    if (capacitorInfo.isNative) {
      Network.addListener('networkStatusChange', callback);
    }
  };

  const removeNetworkListener = () => {
    if (capacitorInfo.isNative) {
      Network.removeAllListeners();
    }
  };

  return {
    ...capacitorInfo,
    triggerHaptic,
    hideKeyboard,
    addAppStateListener,
    removeAppStateListener,
    addNetworkListener,
    removeNetworkListener,
  };
}; 