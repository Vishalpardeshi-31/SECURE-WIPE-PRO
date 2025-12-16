import React, { useState, useEffect, useCallback } from 'react';
import { WipeCertificate, Device, User } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Code,
  Calendar,
  Shield,
  Filter,
  CheckCircle2,
  Award,
  Clock,
  User as UserIcon,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import PDFCertificateGenerator from '../components/certificates/PDFCertificateGenerator';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [devices, setDevices] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const certFilter = user.role === 'admin' ? {} : { wiped_by_email: user.email };
      const certList = await WipeCertificate.filter(certFilter, '-created_date');
      
      // Filter out invalid device IDs (like 'secure_vault_file') before making API call
      const validDeviceIds = [...new Set(certList.map(c => c.device_id))]
        .filter(id => {
          // Check if it's a valid ObjectId format (24-character hex string)
          return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        });
      
      let deviceMap = {};
      if (validDeviceIds.length > 0) {
        try {
          const deviceList = await Device.filter({ id: { $in: validDeviceIds } });
          deviceMap = deviceList.reduce((acc, dev) => {
            acc[dev.id] = dev;
            return acc;
          }, {});
        } catch (error) {
          console.error('Error loading devices:', error);
          // Continue without devices if there's an error
        }
      }
      
      setDevices(deviceMap);
      setCertificates(certList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    const deviceId = urlParams.get('device');
    if (deviceId) setSearchTerm(deviceId);
  }, [loadData]);

  const filteredCertificates = certificates.filter(cert =>
    cert.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.device_serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.device_id?.includes(searchTerm)
  );

  const downloadJSON = (certificate) => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(certificate, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `SecureWipe-Pro-Certificate-${certificate.certificate_id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
     return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-10 h-10" />
              {currentUser?.role === 'admin' ? 'All Wipe Certificates' : 'My Wipe Certificates'}
            </h1>
            <p className="text-blue-100 text-lg">
              NIST SP 800-88 Compliant • Cryptographically Verified • Legally Valid
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{certificates.length}</div>
            <div className="text-blue-200">Total Certificates</div>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by device name, certificate ID, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg border-gray-200 dark:border-gray-700 rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {filteredCertificates.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {searchTerm ? 'No Matching Certificates' : 'No Certificates Generated Yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6 max-w-md">
                {searchTerm 
                  ? 'Try adjusting your search terms.'
                  : 'Wipe a device to generate your first certificate.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCertificates.map((certificate) => {
            // Get device info if available, otherwise use certificate data
            const device = devices[certificate.device_id] || {
              name: certificate.device_name,
              serial_number: certificate.device_serial,
              type: 'unknown',
              capacity: 'Unknown'
            };
            
            return (
              <Card key={certificate.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{certificate.device_name}</h3>
                          <p className="text-gray-500 font-mono text-sm">{certificate.certificate_id}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Wipe Method</p>
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            {certificate.wipe_method?.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Compliance</p>
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            {certificate.compliance_standard}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Technician</p>
                          <p className="font-semibold">{certificate.wiped_by_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Completed</p>
                          <p className="font-semibold">{format(new Date(certificate.created_date), 'PPP')}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2">Actions</h4>
                        <div className="flex gap-3">
                           <PDFCertificateGenerator certificate={certificate} device={device} />
                           <Button 
                             onClick={() => downloadJSON(certificate)}
                             variant="outline"
                             className="flex-1"
                           >
                             <Code className="w-4 h-4 mr-2" />
                             JSON
                           </Button>
                        </div>
                      </div>

                    </div>
                    <div className="md:w-1/3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Verification Details
                      </h4>
                      <div className="font-mono text-xs bg-white dark:bg-gray-800 p-3 rounded border break-all leading-relaxed">
                        {certificate.verification_hash}
                      </div>
                       <Button 
                        variant="outline"
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Verify Online
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}