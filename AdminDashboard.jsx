import React, { useState, useEffect } from 'react';
import { Device, WipeCertificate, User } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Shield, 
  HardDrive, 
  CheckCircle, 
  AlertTriangle,
  Search,
  LogIn
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserManagementTab from '../components/admin/UserManagementTab';
import WipeActivityTab from '../components/admin/WipeActivityTab';
import LoginHistoryTab from '../components/admin/LoginHistoryTab';


export default function AdminDashboard() {
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deviceList, userList] = await Promise.all([
          Device.list('-updated_date'),
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

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10" />
          Administrator Control Center
        </h1>
        <p className="text-gray-300 text-lg">
          System-wide monitoring, user management, and activity logs.
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-3 h-14">
          <TabsTrigger value="users" className="h-10 text-base">
            <Users className="w-5 h-5 mr-2" /> User Management
          </TabsTrigger>
          <TabsTrigger value="activity" className="h-10 text-base">
            <HardDrive className="w-5 h-5 mr-2" /> Wipe Activity
          </TabsTrigger>
          <TabsTrigger value="logins" className="h-10 text-base">
            <LogIn className="w-5 h-5 mr-2" /> Login History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        <TabsContent value="activity">
          <WipeActivityTab />
        </TabsContent>
        <TabsContent value="logins">
          <LoginHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}