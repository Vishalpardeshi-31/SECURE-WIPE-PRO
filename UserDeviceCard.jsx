
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPageUrl } from '@/utils';
import {
  Laptop,
  Smartphone,
  HardDrive,
  Shield,
  Settings,
  AlertTriangle,
  Apple,
  Monitor,
  CheckCircle,
  Loader2,
  FileText
} from "lucide-react";

const deviceIcons = {
  laptop: Laptop,
  desktop: Monitor,
  smartphone: Smartphone,
  tablet: Smartphone,
  external_drive: HardDrive,
  usb: HardDrive,
  ssd: HardDrive,
  hdd: HardDrive
};

const osIcons = {
  windows: Monitor,
  macos: Apple,
  linux: Monitor,
  android: Smartphone,
  ios: Apple
};

export default function UserDeviceCard({ device, onWipe, isWiping }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wipeOptions, setWipeOptions] = useState({
    method: 'nist_sp800_88_clear',
    level: 'standard',
    type: 'full_device'
  });

  const DeviceIcon = deviceIcons[device.type] || HardDrive;
  const OsIcon = osIcons[device.os_type] || Monitor;

  const handleWipe = () => {
    onWipe(device, wipeOptions);
  };

  const handleViewCertificate = () => {
    // Navigate to certificates page with a filter for this device
    window.location.href = createPageUrl(`Certificates?device=${device.id}`);
  };

  const getCompatibilityBadge = () => {
    if (device.os_type === 'unknown') {
      return <Badge variant="outline" className="text-yellow-600">Limited Support</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Fully Compatible</Badge>;
  };

  if (device.status === 'completed') {
    return (
        <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/20">
             <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{device.name}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{device.os_type}</p>
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <p className="text-sm text-green-700 dark:text-green-300">This device was securely wiped successfully.</p>
                <Button
                  onClick={handleViewCertificate}
                  variant="outline"
                  size="sm"
                  className="w-full hover:bg-green-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <DeviceIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <OsIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500 capitalize">{device.os_type}</span>
              </div>
            </div>
          </div>
          {getCompatibilityBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Capacity</p>
            <p className="font-semibold">{device.capacity}</p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <div className="flex items-center gap-1">
              <span className="font-semibold capitalize">{device.type}</span>
              {device.is_ssd && <Badge variant="outline" className="text-xs">SSD</Badge>}
            </div>
          </div>
        </div>

        {device.supports_hpa_dco && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700 dark:text-blue-300">HPA/DCO Support Available</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Wipe Method</label>
                <Select value={wipeOptions.method} onValueChange={(value) => setWipeOptions(prev => ({...prev, method: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nist_sp800_88_clear">NIST SP 800-88 (Clear)</SelectItem>
                    <SelectItem value="nist_sp800_88_purge">NIST SP 800-88 (Purge)</SelectItem>
                    <SelectItem value="dod_3_pass">DoD 5220.22-M (3-Pass)</SelectItem>
                    {device.is_ssd && <SelectItem value="crypto_erase">Cryptographic Erase</SelectItem>}
                    <SelectItem value="secure_erase">ATA Secure Erase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Security Level</label>
                <Select value={wipeOptions.level} onValueChange={(value) => setWipeOptions(prev => ({...prev, level: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (1 Pass)</SelectItem>
                    <SelectItem value="standard">Standard (3 Pass)</SelectItem>
                    <SelectItem value="secure">Secure (7 Pass)</SelectItem>
                    <SelectItem value="military">Military (35 Pass)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleWipe}
            disabled={isWiping}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg"
          >
            {isWiping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Wipe...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Start Secure Wipe
              </>
            )}
          </Button>
        </div>

        {device.os_type === 'unknown' && (
          <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Limited Compatibility</p>
              <p>Some advanced features may not be available for this device type.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
