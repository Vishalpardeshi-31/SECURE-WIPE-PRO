import React, { useState, useEffect } from 'react';
import { Device, WipeCertificate, User } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  HardDrive,
  CheckCircle,
  Users,
  Shield,
  Zap,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deviceList, userList] = await Promise.all([
          Device.list('-created_date'),
          User.list()
        ]);
        setDevices(deviceList);
        setUsers(userList);
      } catch (error) {
        console.error("Failed to load admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const config = {
      connected: { icon: Zap, color: 'text-blue-600 bg-blue-100', label: 'Connected' },
      wiping: { icon: Shield, color: 'text-orange-600 bg-orange-100', label: 'Wiping' },
      completed: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' },
      error: { icon: AlertTriangle, color: 'text-red-600 bg-red-100', label: 'Error' },
      disconnected: { icon: HardDrive, color: 'text-gray-600 bg-gray-100', label: 'Offline' }
    };
    const current = config[status] || config.disconnected;
    return (
      <Badge variant="outline" className={current.color}>
        <current.icon className="w-3 h-3 mr-1" />
        {current.label}
      </Badge>
    );
  };

  const stats = {
    total: devices.length,
    connected: devices.filter(d => d.status === 'connected').length,
    wiping: devices.filter(d => d.status === 'wiping').length,
    completed: devices.filter(d => d.status === 'completed').length
  };

  if (loading) {
    return <div className="p-6">Loading Admin Dashboard...</div>;
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administrator Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Global device and security posture for the entire organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Devices</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Connected</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.connected}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Wipes in Progress</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.wiping}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Wipes Completed</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.completed}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Devices in System</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Assigned User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell className="font-mono text-xs">{device.serial_number}</TableCell>
                  <TableCell>{device.created_by}</TableCell>
                  <TableCell>{getStatusBadge(device.status)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(device.updated_date))} ago</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}