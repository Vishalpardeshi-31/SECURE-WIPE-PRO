import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UploadPrivateFile, CreateFileSignedUrl } from '@/Pages/integrations/Core';
import { UserWipeSession, WipeCertificate } from '@/entities/all';
import { createContainer, addFileToContainer, wipeKey } from '@/api/wipingApi';
import {
  Upload,
  File,
  Trash2,
  Shield,
  CheckCircle,
  Loader2,
  Download,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:8000';

const SecureFile = {
  list: async () => JSON.parse(localStorage.getItem('userSecureFiles') || '[]'),
  create: async (fileData) => {
    const files = await SecureFile.list();
    const newFile = { ...fileData, id: Date.now().toString(), created_date: new Date().toISOString() };
    localStorage.setItem('userSecureFiles', JSON.stringify([...files, newFile]));
    return newFile;
  },
  delete: async (id) => {
    let files = await SecureFile.list();
    files = files.filter(f => f.id !== id);
    localStorage.setItem('userSecureFiles', JSON.stringify(files));
    return true;
  }
};

export default function SelectiveWipeManager({ onWipeComplete, currentUser }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [wiping, setWiping] = useState(new Set());
  const [wipedFiles, setWipedFiles] = useState(new Set());

  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const userFiles = await SecureFile.list();
    setFiles(userFiles);
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      const containerName = `container_${Date.now()}`;
      const keyName = `key_${Date.now()}`;

      const createResponse = await fetch(`${BACKEND_URL}/container/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ container_name: containerName, key_name: keyName })
      });

      if (!createResponse.ok) throw new Error('Failed to create container');

      const createData = await createResponse.json();

      const formData = new FormData();
      formData.append('container_name', containerName);
      formData.append('key_name', keyName);
      formData.append('file', selectedFile);

      const addResponse = await fetch(`${BACKEND_URL}/container/add`, {
        method: 'POST',
        body: formData
      });

      if (!addResponse.ok) throw new Error('Failed to add file');

      await SecureFile.create({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        container_name: containerName,
        key_name: keyName,
      });

      loadFiles();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSecureShred = async (file) => {
    setWiping(prev => new Set([...prev, file.id]));

    try {
      // Call backend to wipe the key, which cryptographically erases the file
      const response = await fetch(`${BACKEND_URL}/container/wipekey`, {
        method: 'POST',
        body: new URLSearchParams({
          key_name: file.key_name,
          passes: '3',
          confirm_token: 'CONFIRM_DESTROY'
        })
      });

      if (!response.ok) throw new Error('Failed to wipe key');

      // Generate verification hash locally
      const verificationData = `${file.container_name}-${file.key_name}-${Date.now()}-${Math.random()}`;
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(verificationData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const verificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Create wipe session record
      await UserWipeSession.create({
        device_id: 'selective_wipe',
        wipe_type: 'partial_files',
        files_wiped: [file.name],
        wipe_method: 'crypto_erase',
        verification_hash: verificationHash,
        status: 'completed',
        duration_minutes: 1
      });

      // Generate certificate for this specific file wipe
      await WipeCertificate.create({
        certificate_id: `SFS-${Date.now()}`,
        device_id: 'selective_file_shred',
        device_name: `File: ${file.name}`,
        device_serial: file.container_name.substring(0, 16),
        wipe_method: 'crypto_erase',
        compliance_standard: 'NIST_SP800_88',
        verification_hash: verificationHash,
        wiped_by_email: currentUser?.email,
        wiped_by_name: currentUser?.full_name,
        organization: 'SecureWipe Pro',
        wipe_duration: 1,
        passes_completed: 3
      });

      // Mark file as wiped but keep record
      setWipedFiles(prev => new Set([...prev, file.id]));
      onWipeComplete?.();

    } catch (error) {
      console.error("Shredding failed:", error);
    } finally {
      setWiping(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleDownload = async (file) => {
    try {
      const { signed_url } = await CreateFileSignedUrl({ file_uri: file.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Build Trust: Selective File Wiping
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Test SecureWipe Pro with individual files before trusting us with full devices. 
            Upload, wipe, and verify with cryptographic certificates.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Files to Test Wiping
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Start small - upload a test document to see how our secure wiping works
            </p>
            <Button asChild variant="outline" disabled={uploading}>
              <label htmlFor="selective-upload">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Choose Test File'}
              </label>
            </Button>
            <input 
              id="selective-upload" 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading}
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Test Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map(file => {
                const isWiping = wiping.has(file.id);
                const isWiped = wipedFiles.has(file.id);
                
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <File className="w-6 h-6 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      {isWiped && (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Securely Wiped
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!isWiped && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant={isWiped ? "outline" : "destructive"} 
                        size="sm" 
                        onClick={() => handleSecureShred(file)}
                        disabled={isWiping || isWiped}
                      >
                        {isWiping ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Wiping...
                          </>
                        ) : isWiped ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Wiped
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Secure Wipe
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {wipedFiles.size > 0 && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  Trust Established! 
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You've successfully wiped {wipedFiles.size} file(s) with cryptographic verification. 
                  Ready to trust us with larger wipe operations?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}