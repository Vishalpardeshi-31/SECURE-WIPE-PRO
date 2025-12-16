
import React, { useState, useEffect, useCallback } from 'react';
import { Device, WipeCertificate, User, UserWipeSession } from '@/entities/all';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  HardDrive,
  CheckCircle,
  Loader2,
  FileText,
  BarChart3,
  FileLock
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import UserDeviceCard from "../components/user/UserDeviceCard";
import UserWipeProgress from "../components/user/UserWipeProgress";
import SelectiveWipeManager from "../components/user/SelectiveWipeManager";
import { advancedWipeEngine } from "../components/wiping/AdvancedWipeEngine";
import DeviceConnectionManager from '../components/device/DeviceConnectionManager';

export default function UserDashboard() {
  const [myDevices, setMyDevices] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [myWipeSessions, setMyWipeSessions] = useState([]);
  const [activeWipes, setActiveWipes] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("devices");

  const loadUserData = useCallback(async (user) => {
    if (!user) return;

    try {
      const [devices, certificates, sessions] = await Promise.all([
        Device.filter({ created_by: user.email }, '-created_date'),
        WipeCertificate.filter({ wiped_by_email: user.email }, '-created_date'),
        UserWipeSession.filter({ created_by: user.email }, '-created_date')
      ]);

      setMyDevices(devices);
      setMyCertificates(certificates);
      setMyWipeSessions(sessions);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadUserData(user);
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    initializeUser();
  }, [loadUserData]);

  const handleDeviceConnected = async (connectedDevice) => {
    // No longer using random assignment - using the configured device details
    await Device.create({
      name: connectedDevice.name,
      type: connectedDevice.type,
      os_type: connectedDevice.os_type,
      capacity: connectedDevice.capacity,
      serial_number: connectedDevice.device_id,
      status: "connected",
      is_ssd: connectedDevice.is_ssd || false,
      supports_hpa_dco: connectedDevice.supports_hpa_dco || false,
    });
    loadUserData(currentUser);
  };

  const startAdvancedWipe = async (device, wipeOptions) => {
    setActiveWipes(prev => new Set([...prev, device.id]));

    try {
      await Device.update(device.id, {
        status: 'wiping',
        progress: 0,
        wipe_started: new Date().toISOString(),
        wipe_method: wipeOptions.method,
        wipe_level: wipeOptions.level
      });

      const result = await advancedWipeEngine.startSecureWipe(
        device,
        wipeOptions,
        currentUser,
        (progress, status) => {
          setMyDevices(prevDevices =>
            prevDevices.map(d =>
              d.id === device.id ? {...d, progress, wipe_status: status} : d
            )
          );
        }
      );

      if (result.success) {
        const updatedDevice = await Device.update(device.id, {
          status: 'completed',
          wipe_completed: new Date().toISOString(),
          progress: 100
        });

        await WipeCertificate.create({
          certificate_id: `SWP-${Date.now()}`,
          device_id: device.id,
          device_name: device.name,
          device_serial: device.serial_number,
          wipe_method: wipeOptions.method,
          compliance_standard: 'NIST_SP800_88',
          verification_hash: result.verificationHash,
          qr_code_data: `verify:SWP-${Date.now()}:${result.verificationHash.substring(0, 8)}`,
          wiped_by_email: currentUser.email,
          wiped_by_name: currentUser.full_name,
          organization: 'SecureWipe Pro',
          wipe_duration: result.duration,
          passes_completed: result.passesCompleted
        });

        await UserWipeSession.create({
          device_id: device.id,
          wipe_type: wipeOptions.type || 'full_device',
          wipe_method: wipeOptions.method,
          verification_hash: result.verificationHash,
          status: 'completed',
          duration_minutes: result.duration
        });

        loadUserData(currentUser);
      }
    } catch (error) {
      console.error('Wipe failed:', error);
      await Device.update(device.id, { status: 'error' });
    } finally {
      setActiveWipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(device.id);
        return newSet;
      });
    }
  };

  const wipingDevices = myDevices.filter(d => d.status === 'wiping');
  const connectedDevices = myDevices.filter(d => d.status === 'connected');
  const completedDevices = myDevices.filter(d => d.status === 'completed');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My SecureWipe Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and wipe your personal devices securely.
        </p>
      </div>

      <DeviceConnectionManager onDeviceConnected={handleDeviceConnected} onDeviceDisconnected={() => loadUserData(currentUser)} />

      {wipingDevices.map((device) => (
        <UserWipeProgress
          key={device.id}
          device={device}
        />
      ))}

      <div>
        <h2 className="text-2xl font-bold mb-4">My Devices ({connectedDevices.length} Connected)</h2>
        {connectedDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedDevices.map((device) => (
              <UserDeviceCard
                key={device.id}
                device={device}
                onWipe={startAdvancedWipe}
                isWiping={activeWipes.has(device.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <HardDrive className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Devices Ready for Wiping</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Use the connection manager above to add a new device.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

       <div>
          <h2 className="text-2xl font-bold mb-4">Completed Wipes</h2>
          {completedDevices.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedDevices.map((device) => (
                  <UserDeviceCard
                    key={device.id}
                    device={device}
                    onWipe={() => {}}
                    isWiping={false}
                  />
                ))}
              </div>
          ) : (
             <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Wipes Completed Yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Wipe a device to see the results here.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
