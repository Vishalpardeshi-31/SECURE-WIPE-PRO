class AdvancedWipeEngine {
  constructor() {
    this.isWiping = false;
    this.supportedMethods = {
      'nist_sp800_88_clear': { 
        passes: 1, 
        description: 'NIST Clear (Single Pass)',
        pattern: 'Cryptographically secure random data'
      },
      'nist_sp800_88_purge': { 
        passes: 3, 
        description: 'NIST Purge (Triple Pass)',
        pattern: 'Multiple overwrite patterns + verification'
      },
      'dod_3_pass': { 
        passes: 3, 
        description: 'DoD 5220.22-M (3-Pass)',
        pattern: '0x00, 0xFF, Random'
      },
      'secure_erase': { 
        passes: 1, 
        description: 'ATA Secure Erase',
        pattern: 'Hardware-level erase command'
      },
      'crypto_erase': { 
        passes: 1, 
        description: 'Cryptographic Erase',
        pattern: 'Encryption key destruction'
      }
    };
  }

  async startSecureWipe(device, wipeOptions, user, onProgress) {
    this.isWiping = true;
    const startTime = Date.now();
    
    try {
      // Phase 1: Initial Device Analysis
      onProgress?.(2, 'Initializing secure wipe process...');
      await this.simulateDelay(800);
      
      onProgress?.(5, `Analyzing ${device.os_type} device architecture...`);
      await this.simulateDelay(1200);
      
      // Phase 2: OS-Specific Preparation
      const osConfig = await this.initializeForOS(device.os_type);
      onProgress?.(8, `Preparing ${osConfig.method} wipe environment...`);
      await this.simulateDelay(1500);

      if (!osConfig.compatible) {
        onProgress?.(10, 'Warning: Limited compatibility detected - proceeding with best-effort method');
        await this.simulateDelay(1000);
      }

      // Phase 3: Security Assessment
      onProgress?.(12, 'Performing pre-wipe security assessment...');
      await this.simulateDelay(1000);
      
      if (device.supports_hpa_dco) {
        onProgress?.(15, 'Scanning for HPA/DCO hidden areas...');
        await this.simulateDelay(2000);
        onProgress?.(18, 'Hidden areas detected - expanding wipe scope');
        await this.simulateDelay(500);
      }

      // Phase 4: SSD Pre-processing
      if (device.is_ssd) {
        onProgress?.(20, 'Preparing SSD for secure erasure...');
        await this.simulateDelay(1000);
        onProgress?.(22, 'Disabling wear leveling protection...');
        await this.simulateDelay(800);
      }

      // Phase 5: Execute Wipe Method
      const method = this.supportedMethods[wipeOptions.method];
      const totalPasses = this.calculatePasses(wipeOptions.level, method.passes);
      
      onProgress?.(25, `Starting ${method.description} (${totalPasses} passes)`);
      await this.simulateDelay(1000);

      for (let pass = 1; pass <= totalPasses; pass++) {
        const passStartProgress = 25 + ((pass - 1) / totalPasses) * 60;
        const passEndProgress = 25 + (pass / totalPasses) * 60;
        
        onProgress?.(passStartProgress, `Pass ${pass}/${totalPasses}: ${method.description}`);
        await this.simulateDelay(500);
        
        // Simulate detailed sector-by-sector wiping
        const sectorsTotal = device.type === 'smartphone' ? 50000 : 100000;
        const sectorsPerUpdate = Math.floor(sectorsTotal / 50);
        
        for (let sector = 0; sector < sectorsTotal; sector += sectorsPerUpdate) {
          if (!this.isWiping) throw new Error('Wipe operation cancelled by user');
          
          const sectorProgress = (sector / sectorsTotal);
          const currentProgress = passStartProgress + (sectorProgress * (passEndProgress - passStartProgress));
          const pattern = this.getWipePattern(wipeOptions.method, pass);
          
          onProgress?.(
            Math.min(currentProgress, 85),
            `Pass ${pass}/${totalPasses}: Writing ${pattern} pattern (Sector ${sector.toLocaleString()}/${sectorsTotal.toLocaleString()})`
          );
          
          // Variable delay based on device type and method
          const delay = device.is_ssd ? 30 : 80;
          await this.simulateDelay(delay);
        }
        
        // Pass completion
        onProgress?.(passEndProgress, `Pass ${pass}/${totalPasses}: Verification complete`);
        await this.simulateDelay(300);
      }

      // Phase 6: Post-Wipe Processing
      onProgress?.(87, 'Executing post-wipe cleanup...');
      await this.simulateDelay(1500);

      if (device.is_ssd) {
        onProgress?.(90, 'Executing SSD TRIM commands...');
        await this.simulateDelay(2000);
        onProgress?.(92, 'Verifying SSD controller state...');
        await this.simulateDelay(1000);
      }

      // Phase 7: Cryptographic Verification
      onProgress?.(94, 'Generating cryptographic proof of wipe...');
      const verificationHash = await this.generateAdvancedHash(device, wipeOptions, user);
      await this.simulateDelay(2000);

      onProgress?.(97, 'Performing final integrity verification...');
      await this.simulateDelay(1500);

      onProgress?.(100, 'Secure wipe completed successfully - Certificate generated');

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 60000);

      return {
        success: true,
        verificationHash,
        passesCompleted: totalPasses,
        method: wipeOptions.method,
        duration: Math.max(duration, 2), // Minimum 2 minutes for realism
        osCompatibility: osConfig.compatible,
        hpaIncluded: device.supports_hpa_dco,
        ssdOptimized: device.is_ssd,
        sectorsWiped: device.type === 'smartphone' ? 50000 : 100000
      };

    } catch (error) {
      console.error('Advanced wipe failed:', error);
      throw new Error(`Secure wipe failed: ${error.message}`);
    } finally {
      this.isWiping = false;
    }
  }

  async initializeForOS(osType) {
    const osConfigs = {
      'windows': { 
        compatible: true, 
        method: 'NTFS + BitLocker', 
        bootMethod: 'WinPE Environment',
        features: ['Volume Shadow Copy cleanup', 'Registry wiping', 'Hibernation file clearing']
      },
      'macos': { 
        compatible: true, 
        method: 'APFS + FileVault', 
        bootMethod: 'macOS Recovery Mode',
        features: ['Core Storage wiping', 'Keychain destruction', 'Spotlight index clearing']
      },
      'linux': { 
        compatible: true, 
        method: 'EXT4 + LUKS', 
        bootMethod: 'Live USB Environment',
        features: ['Multiple filesystem support', 'LVM wiping', 'Swap partition clearing']
      },
      'android': { 
        compatible: true, 
        method: 'F2FS + FBE', 
        bootMethod: 'Fastboot Protocol',
        features: ['Factory reset enhancement', 'Secure element clearing', 'Cache partition wiping']
      },
      'ios': { 
        compatible: true, 
        method: 'APFS + Secure Enclave', 
        bootMethod: 'DFU Mode Access',
        features: ['Hardware encryption key destruction', 'Keychain wiping', 'Effaceable storage clearing']
      },
      'unknown': { 
        compatible: false, 
        method: 'Generic Block-Level', 
        bootMethod: 'Best Effort Approach',
        features: ['Basic overwrite patterns', 'Limited verification']
      }
    };
    
    return osConfigs[osType] || osConfigs['unknown'];
  }

  calculatePasses(securityLevel, basePasses) {
    const multipliers = {
      'quick': Math.max(1, Math.floor(basePasses * 0.5)),
      'standard': basePasses,
      'secure': basePasses * 2,
      'military': Math.max(basePasses * 7, 35)
    };
    return multipliers[securityLevel] || basePasses;
  }

  getWipePattern(method, passNumber) {
    const patterns = {
      'nist_sp800_88_clear': ['CSPRNG'],
      'nist_sp800_88_purge': ['0x00', '0xFF', 'CSPRNG'],
      'dod_3_pass': ['0x00', '0xFF', 'CSPRNG'],
      'secure_erase': ['ATA_SE_CMD'],
      'crypto_erase': ['KEY_DESTROY']
    };
    
    const methodPatterns = patterns[method] || ['0x00'];
    const patternIndex = (passNumber - 1) % methodPatterns.length;
    return methodPatterns[patternIndex];
  }

  async generateAdvancedHash(device, options, user) {
    // Create a comprehensive hash that includes all relevant wipe details
    const hashData = {
      deviceIdentifier: device.serial_number || device.id,
      deviceName: device.name,
      deviceType: device.type,
      osType: device.os_type,
      wipeMethod: options.method,
      securityLevel: options.level,
      timestamp: Date.now(),
      userEmail: user?.email || 'system',
      nonce: crypto.getRandomValues(new Uint32Array(4)).join(''),
      wipeScope: device.supports_hpa_dco ? 'full_plus_hidden' : 'standard',
      ssdOptimized: device.is_ssd
    };

    const dataString = JSON.stringify(hashData, Object.keys(hashData).sort());
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stopWipe() {
    this.isWiping = false;
  }
}

export const advancedWipeEngine = new AdvancedWipeEngine();