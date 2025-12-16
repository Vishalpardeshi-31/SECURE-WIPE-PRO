import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Clock, 
  HardDrive, 
  Loader2,
  Pause,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

export default function UserWipeProgress({ device }) {
  if (!device || device.status !== 'wiping') return null;

  const estimatedTimeRemaining = Math.max(0, Math.round((100 - (device.progress || 0)) * 2));
  const wipeStatusMessage = device.wipe_status || 'Processing...';

  return (
    <Card className='border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 ring-2 ring-orange-200'>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center animate-pulse">
              <Shield className="w-4 h-4 text-white" />
            </div>
            Secure Wipe in Progress
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Active
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <HardDrive className="w-8 h-8 text-orange-600" />
          <div className="flex-1">
            <h3 className="font-bold text-lg">{device.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {device.capacity} • Method: {device.wipe_method?.replace(/_/g, ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-3xl text-orange-600">{device.progress || 0}%</span>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              ~{estimatedTimeRemaining} min remaining
            </div>
          </div>
          
          <Progress 
            value={device.progress || 0} 
            className="h-4 bg-gray-200 dark:bg-gray-700"
          />
          
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">Status:</span>
              <span>{wipeStatusMessage}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
            <p className="font-semibold text-orange-600">
              {device.wipe_started && format(new Date(device.wipe_started), 'HH:mm')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Security Level</p>
            <p className="font-semibold">
              {device.wipe_level?.toUpperCase() || 'STANDARD'}
            </p>
          </div>
        </div>

        {device.supports_hpa_dco && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Including HPA/DCO hidden areas in wipe process
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" disabled>
            <Pause className="w-4 h-4 mr-2" />
            Pause Wipe
          </Button>
          <Button variant="destructive" className="flex-1" disabled>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Abort Wipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}