import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";

export default function PDFCertificateGenerator({ certificate, device }) {
  const handlePrint = () => {
    // Base64 encoded SVG for the SecureWipe Pro logo (Shield with a checkmark)
    const logoBase64 = "PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwzIDV2NmMwIDUuNTUgMy44NCAxMC43NCA5IDEyIDUuMTYtMS4yNiA5LTYuNDUgOS0xMlY1TDEyIDN6IiBmaWxsPSIjMjU2M2ViIi8+PHBhdGggZD0iTTE2LjU5IDcuNThMMTAgMTQuMTdsLTMuNTktMy41OEw1IDEybDUgNSA4LTgtMS40MS0xLjQyeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=";
    const logoDataUri = `data:image/svg+xml;base64,${logoBase64}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SecureWipe Pro Certificate - ${certificate.certificate_id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto+Mono:wght@400;500&display=swap');
          
          body { 
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif; 
            line-height: 1.5;
            color: #1e293b;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .page {
            width: 210mm;
            height: 297mm;
            page-break-after: always;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 15mm;
            box-sizing: border-box;
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            opacity: 0.05;
            z-index: 1;
            pointer-events: none;
          }
          .watermark img {
            width: 500px;
            height: 500px;
          }
          .certificate-container {
            flex-grow: 1;
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 10mm;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
            background: linear-gradient(135deg, rgba(240, 245, 255, 0.8) 0%, rgba(226, 232, 240, 0.8) 100%);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-img {
            width: 40px;
            height: 40px;
          }
          .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: #1e3a8a;
          }
          .title {
            font-size: 24px;
            color: #1e40af;
            margin: 10px 0 5px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 14px;
            color: #475569;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-section {
            background: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 12px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 12px;
          }
          .label {
            color: #475569;
          }
          .value {
            font-weight: 600;
            text-align: right;
          }
          .hash-section {
            margin-top: auto;
            padding: 15px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
          }
          .hash-title {
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 8px;
            font-size: 12px;
          }
          .hash-value {
            font-family: 'Roboto Mono', monospace;
            word-break: break-all;
            font-size: 10px;
            line-height: 1.4;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          
          @media print {
            body, .page {
              margin: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="watermark">
            <img src="${logoDataUri}" alt="Watermark" />
          </div>
          <div class="certificate-container">
            <div class="header">
              <div class="logo-container">
                <img src="${logoDataUri}" alt="SecureWipe Pro Logo" class="logo-img" />
                <span class="logo-text">SecureWipe Pro</span>
              </div>
              <div class="title">Certificate of Data Sanitization</div>
              <div class="subtitle">NIST SP 800-88 Compliant • Cryptographically Verified</div>
            </div>
            
            <div class="info-grid">
              <div class="info-section">
                <div class="section-title">Device Information</div>
                <div class="info-item"><span class="label">Name:</span><span class="value">${device?.name || 'N/A'}</span></div>
                <div class="info-item"><span class="label">Serial:</span><span class="value">${device?.serial_number || 'N/A'}</span></div>
                <div class="info-item"><span class="label">Type:</span><span class="value">${device?.type || 'N/A'}</span></div>
                <div class="info-item"><span class="label">Capacity:</span><span class="value">${device?.capacity || 'N/A'}</span></div>
              </div>
              <div class="info-section">
                <div class="section-title">Wipe Details</div>
                <div class="info-item"><span class="label">Method:</span><span class="value">${certificate.wipe_method?.replace(/_/g, ' ').toUpperCase()}</span></div>
                <div class="info-item"><span class="label">Standard:</span><span class="value">${certificate.compliance_standard}</span></div>
                <div class="info-item"><span class="label">Passes:</span><span class="value">${certificate.passes_completed || 1}</span></div>
                <div class="info-item"><span class="label">Duration:</span><span class="value">${certificate.wipe_duration} min</span></div>
              </div>
              <div class="info-section">
                <div class="section-title">Verification</div>
                <div class="info-item"><span class="label">Certificate ID:</span><span class="value">${certificate.certificate_id}</span></div>
                <div class="info-item"><span class="label">Completed On:</span><span class="value">${format(new Date(certificate.created_date), 'yyyy-MM-dd')}</span></div>
                <div class="info-item"><span class="label">Completed At:</span><span class="value">${format(new Date(certificate.created_date), 'HH:mm:ss z')}</span></div>
              </div>
              <div class="info-section">
                <div class="section-title">Technician</div>
                <div class="info-item"><span class="label">Name:</span><span class="value">${certificate.wiped_by_name}</span></div>
                <div class="info-item"><span class="label">Email:</span><span class="value">${certificate.wiped_by_email}</span></div>
                <div class="info-item"><span class="label">Organization:</span><span class="value">${certificate.organization}</span></div>
              </div>
            </div>
            
            <div class="hash-section">
              <div class="hash-title">Cryptographic Verification Hash (SHA-256)</div>
              <div class="hash-value">${certificate.verification_hash}</div>
            </div>
            
            <div class="footer">
              This certificate verifies that the device listed has been sanitized in accordance with the standards specified.
              <br/>
              Generated by SecureWipe Pro • verify.securewipe.pro
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <Button onClick={handlePrint} className="bg-red-600 hover:bg-red-700 text-white flex-1">
      <Printer className="w-4 h-4 mr-2" />
      Print / Save PDF
    </Button>
  );
}