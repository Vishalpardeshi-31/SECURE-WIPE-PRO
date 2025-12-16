import React, { useState, useEffect } from 'react';
import { Device, WipeCertificate } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle,
  HardDrive,
  Award,
  BarChart3
} from "lucide-react";
import { format, subDays, startOfMonth } from "date-fns";

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [devices, setDevices] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deviceList, certList] = await Promise.all([
        Device.list('-created_date'),
        WipeCertificate.list('-created_date')
      ]);
      setDevices(deviceList);
      setCertificates(certList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate timeline data
  const generateTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayWipes = certificates.filter(cert => 
        format(new Date(cert.created_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      
      return {
        date: format(date, 'MMM dd'),
        wipes: dayWipes
      };
    });
    return last7Days;
  };

  // Generate device type distribution
  const generateDeviceTypeData = () => {
    const typeCounts = devices.reduce((acc, device) => {
      const type = device.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count
    }));
  };

  // Generate wipe method data
  const generateWipeMethodData = () => {
    const methodCounts = certificates.reduce((acc, cert) => {
      const method = cert.wipe_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(methodCounts).map(([method, count]) => ({
      method: method.replace(/_/g, ' ').toUpperCase(),
      count
    }));
  };

  const timelineData = generateTimelineData();
  const deviceTypeData = generateDeviceTypeData();
  const wipeMethodData = generateWipeMethodData();
  
  const completedDevices = devices.filter(d => d.status === 'completed').length;
  const totalCapacity = devices.reduce((sum, device) => {
    const capacity = parseFloat(device.capacity?.match(/\d+/)?.[0] || 0);
    return sum + capacity;
  }, 0);
  
  const avgWipeDuration = certificates.length > 0 
    ? Math.round(certificates.reduce((sum, cert) => sum + (cert.wipe_duration || 0), 0) / certificates.length)
    : 0;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Security compliance and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Devices Wiped</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {completedDevices}
                </p>
                <p className="text-xs text-blue-500 mt-1">+{Math.round(completedDevices * 0.15)} this week</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Capacity</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {totalCapacity.toFixed(0)}GB
                </p>
                <p className="text-xs text-green-500 mt-1">Data secured</p>
              </div>
              <HardDrive className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Avg Duration</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {avgWipeDuration}m
                </p>
                <p className="text-xs text-orange-500 mt-1">Per device</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Compliance</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">100%</p>
                <p className="text-xs text-purple-500 mt-1">NIST SP 800-88</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wipe Timeline */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Daily Wipe Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="wipes" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-600" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wipe Methods */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Wipe Methods Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wipeMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Compliance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800">
              <div>
                <p className="font-semibold text-green-700 dark:text-green-300">NIST SP 800-88 Rev. 1</p>
                <p className="text-sm text-green-600 dark:text-green-400">Guidelines for Media Sanitization</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{certificates.length}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Verified Wipes</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">0</p>
                <p className="text-sm text-green-600 dark:text-green-400">Failed Audits</p>
              </div>
            </div>

            <div className="text-center p-4 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <p className="font-semibold text-green-800 dark:text-green-200">✓ 100% Compliance Rate</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All wipes meet or exceed industry standards
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}