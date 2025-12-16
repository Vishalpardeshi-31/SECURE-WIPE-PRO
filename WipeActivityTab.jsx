import React, { useState, useEffect } from 'react';
import { WipeCertificate } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function WipeActivityTab() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      const certList = await WipeCertificate.list('-created_date');
      setCertificates(certList);
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  if (loading) return <div>Loading wipe activities...</div>;

  return (
    <Card className="border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle>Wipe Activity Log ({certificates.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate ID</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-mono text-xs">{cert.certificate_id}</TableCell>
                <TableCell>
                  <div>{cert.device_name}</div>
                  <div className="text-xs text-gray-500 font-mono">{cert.device_serial}</div>
                </TableCell>
                <TableCell>
                  <div>{cert.wiped_by_name}</div>
                  <div className="text-xs text-gray-500">{cert.wiped_by_email}</div>
                </TableCell>
                <TableCell>{format(new Date(cert.created_date), 'PPp')}</TableCell>
                <TableCell>
                  <Badge variant="outline">{cert.wipe_method?.replace(/_/g, ' ')}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}