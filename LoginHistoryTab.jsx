import React, { useState, useEffect } from 'react';
import { UserLogin } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function LoginHistoryTab() {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogins = async () => {
      setLoading(true);
      const loginData = await UserLogin.list('-login_timestamp');
      setLogins(loginData);
      setLoading(false);
    };
    fetchLogins();
  }, []);

  if (loading) return <div>Loading login history...</div>;

  return (
    <Card className="border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle>Recent Login Activity ({logins.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Login Time</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Device / Browser</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logins.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="font-medium">{log.user_full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{log.user_email}</div>
                </TableCell>
                <TableCell>
                  {format(new Date(log.login_timestamp), 'PPpp')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">{log.ip_address}</Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {log.user_agent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}