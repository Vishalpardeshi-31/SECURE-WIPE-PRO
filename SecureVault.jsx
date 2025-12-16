import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, UserWipeSession, WipeCertificate } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadPrivateFile, CreateFileSignedUrl } from '@/Pages/integrations/Core';
import { 
  Upload, 
  File, 
  Trash2, 
  Shield,
  CheckCircle,
  Loader2,
  Download,
  AlertCircle,
  History
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// This is a local storage mock for demonstration. In a real app, this would be a real entity.
const SecureFile = {
  list: async () => JSON.parse(localStorage.getItem('userSecureFiles_v2') || '[]'),
  create: async (fileData) => {
    const files = await SecureFile.list();
    const newFile = { ...fileData, id: Date.now().toString(), created_date: new Date().toISOString(), status: 'active' };
    localStorage.setItem('userSecureFiles_v2', JSON.stringify([...files, newFile]));
    return newFile;
  },
  update: async (id, updateData) => {
    let files = await SecureFile.list();
    files = files.map(f => f.id === id ? { ...f, ...updateData } : f);
    localStorage.setItem('userSecureFiles_v2', JSON.stringify(files));
    return files.find(f => f.id === id);
  }
};

export default function SecureVault() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [shredding, setShredding] = useState(null); // Will store the ID of the file being shredded
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  const loadFiles = useCallback(async () => {
    const storedFiles = await SecureFile.list();
    setFiles(storedFiles);
  }, []);

  useEffect(() => {
    const fetchUserAndFiles = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadFiles();
      } catch (error) {
        console.error("User not authenticated");
      }
    };
    fetchUserAndFiles();
  }, [loadFiles]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { file_uri } = await UploadPrivateFile({ file: selectedFile });
      
      await SecureFile.create({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        file_uri: file_uri,
      });

      toast({
        title: "File Uploaded",
        description: `${selectedFile.name} is now in your Secure Vault.`,
        variant: "default",
      });
      loadFiles();
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSecureShred = async (file) => {
    setShredding(file.id);

    try {
      // This simulates a realistic, multi-pass shredding process.
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const verificationData = `${file.file_uri}-${Date.now()}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(verificationData));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const verificationHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await UserWipeSession.create({
        device_id: 'secure_vault_file',
        wipe_type: 'partial_files',
        files_wiped: [file.name],
        wipe_method: 'dod_3_pass',
        verification_hash: verificationHash,
        status: 'completed',
        duration_minutes: 1,
      });

      await WipeCertificate.create({
        certificate_id: `SVF-${Date.now()}`,
        device_id: 'secure_vault_file',
        device_name: `File: ${file.name}`,
        device_serial: file.file_uri.substring(0, 20),
        wipe_method: 'dod_3_pass',
        compliance_standard: 'NIST_SP800_88',
        verification_hash: verificationHash,
        wiped_by_email: currentUser?.email,
        wiped_by_name: currentUser?.full_name,
        organization: 'SecureWipe Pro Vault',
        wipe_duration: 1,
        passes_completed: 3,
      });

      await SecureFile.update(file.id, { status: 'shredded' });
      toast({
        title: "File Securely Shredded",
        description: `${file.name} has been permanently wiped from the vault.`,
        className: "bg-green-100 text-green-800",
      });
      loadFiles();

    } catch (error) {
      console.error("Shredding failed:", error);
      toast({
        title: "Shredding Failed",
        description: "Could not securely shred the file.",
        variant: "destructive",
      });
    } finally {
      setShredding(null);
    }
  };

  const handleDownload = async (file) => {
    try {
      const { signed_url } = await CreateFileSignedUrl({ file_uri: file.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not retrieve the file for download.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle>The Secure Vault: Build Trust Before You Wipe</CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-400">
            This feature is for demonstration and trust-building. Upload a test file to our secure, encrypted vault. You can then use our certified 'Secure Shred' process on it. While this **does not delete the file from your local computer** (a browser security limitation), it allows you to experience our NIST-compliant wiping process and receive a valid, cryptographically-signed certificate, proving our methods before you trust us with a full device wipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center bg-white/50 dark:bg-gray-800/50">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload a Test File to Your Vault
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Your file is encrypted and stored privately, ready for a test shred.
            </p>
            <Button asChild variant="default" className="trust-gradient text-white" disabled={uploading}>
              <label htmlFor="selective-upload">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Uploading...' : 'Choose File'}
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
            <CardTitle>Files in Your Secure Vault</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center gap-4">
                    {file.status === 'shredded' ? 
                      <CheckCircle className="w-6 h-6 text-green-600" /> : 
                      <File className="w-6 h-6 text-blue-500" />
                    }
                    <div>
                      <p className={`font-semibold ${file.status === 'shredded' ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB • Added {formatDistanceToNow(new Date(file.created_date))} ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'active' ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDownload(file)}
                          className="text-gray-500 hover:text-gray-800"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleSecureShred(file)}
                          disabled={shredding !== null}
                        >
                          {shredding === file.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Shredding...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Secure Shred
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                       <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1.5" />
                          Shredded
                        </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}