// ============================================================================
// ALTERNATIF 1: AIRTABLE
// ============================================================================

export class AirtableLicenseService {
  private static readonly AIRTABLE_BASE_ID = 'YOUR_AIRTABLE_BASE_ID';
  private static readonly AIRTABLE_TABLE_NAME = 'Licenses';
  private static readonly AIRTABLE_API_KEY = 'YOUR_AIRTABLE_API_KEY';

  static async validateLicense(email: string, licenseCode: string) {
    try {
      const url = `https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/${this.AIRTABLE_TABLE_NAME}`;
      
      const response = await fetch(`${url}?filterByFormula=AND({Email}='${email}',{License Code}='${licenseCode}')`, {
        headers: {
          'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const record = data.records[0].fields;
        
        // Check status and expiry
        if (record.Status !== 'active') {
          return { isValid: false, message: 'Lisensi tidak aktif' };
        }
        
        const expiredDate = new Date(record['Expired Date']);
        if (expiredDate < new Date()) {
          return { isValid: false, message: 'Lisensi sudah expired' };
        }
        
        return {
          isValid: true,
          userData: {
            email: record.Email,
            licenseCode: record['License Code'],
            username: record.Username,
            status: record.Status,
            expiredDate: record['Expired Date']
          }
        };
      }
      
      return { isValid: false, message: 'Lisensi tidak ditemukan' };
    } catch (error) {
      return { isValid: false, message: 'Error validasi: ' + error };
    }
  }
}

// ============================================================================
// ALTERNATIF 2: SUPABASE
// ============================================================================

export class SupabaseLicenseService {
  private static readonly SUPABASE_URL = 'YOUR_SUPABASE_URL';
  private static readonly SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

  static async validateLicense(email: string, licenseCode: string) {
    try {
      const response = await fetch(`${this.SUPABASE_URL}/rest/v1/licenses?email=eq.${email}&license_code=eq.${licenseCode}`, {
        headers: {
          'apikey': this.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data && data.length > 0) {
        const license = data[0];
        
        if (license.status !== 'active') {
          return { isValid: false, message: 'Lisensi tidak aktif' };
        }
        
        const expiredDate = new Date(license.expired_date);
        if (expiredDate < new Date()) {
          return { isValid: false, message: 'Lisensi sudah expired' };
        }
        
        return {
          isValid: true,
          userData: {
            email: license.email,
            licenseCode: license.license_code,
            username: license.username,
            status: license.status,
            expiredDate: license.expired_date
          }
        };
      }
      
      return { isValid: false, message: 'Lisensi tidak ditemukan' };
    } catch (error) {
      return { isValid: false, message: 'Error validasi: ' + error };
    }
  }
}

// ============================================================================
// ALTERNATIF 3: FIREBASE FIRESTORE
// ============================================================================

export class FirebaseLicenseService {
  private static readonly FIREBASE_PROJECT_ID = 'YOUR_FIREBASE_PROJECT_ID';
  private static readonly FIREBASE_API_KEY = 'YOUR_FIREBASE_API_KEY';

  static async validateLicense(email: string, licenseCode: string) {
    try {
      // Query Firestore REST API
      const url = `https://firestore.googleapis.com/v1/projects/${this.FIREBASE_PROJECT_ID}/databases/(default)/documents/licenses`;
      
      const response = await fetch(`${url}?key=${this.FIREBASE_API_KEY}`);
      const data = await response.json();
      
      if (data.documents) {
        for (const doc of data.documents) {
          const fields = doc.fields;
          if (fields.email?.stringValue === email && fields.licenseCode?.stringValue === licenseCode) {
            
            if (fields.status?.stringValue !== 'active') {
              return { isValid: false, message: 'Lisensi tidak aktif' };
            }
            
            const expiredDate = new Date(fields.expiredDate?.stringValue);
            if (expiredDate < new Date()) {
              return { isValid: false, message: 'Lisensi sudah expired' };
            }
            
            return {
              isValid: true,
              userData: {
                email: fields.email?.stringValue,
                licenseCode: fields.licenseCode?.stringValue,
                username: fields.username?.stringValue,
                status: fields.status?.stringValue,
                expiredDate: fields.expiredDate?.stringValue
              }
            };
          }
        }
      }
      
      return { isValid: false, message: 'Lisensi tidak ditemukan' };
    } catch (error) {
      return { isValid: false, message: 'Error validasi: ' + error };
    }
  }
}

// ============================================================================
// ALTERNATIF 4: JSON FILE HOSTING (Sederhana)
// ============================================================================

export class JsonFileLicenseService {
  // Bisa menggunakan GitHub Gist, JSONBin, atau hosting file JSON lainnya
  private static readonly JSON_URL = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest';
  private static readonly API_KEY = 'YOUR_JSONBIN_API_KEY';

  static async validateLicense(email: string, licenseCode: string) {
    try {
      const response = await fetch(this.JSON_URL, {
        headers: {
          'X-Master-Key': this.API_KEY,
        },
      });

      const data = await response.json();
      const licenses = data.record.licenses || [];
      
      const license = licenses.find((l: any) => 
        l.email === email && l.licenseCode === licenseCode
      );
      
      if (license) {
        if (license.status !== 'active') {
          return { isValid: false, message: 'Lisensi tidak aktif' };
        }
        
        const expiredDate = new Date(license.expiredDate);
        if (expiredDate < new Date()) {
          return { isValid: false, message: 'Lisensi sudah expired' };
        }
        
        return {
          isValid: true,
          userData: license
        };
      }
      
      return { isValid: false, message: 'Lisensi tidak ditemukan' };
    } catch (error) {
      return { isValid: false, message: 'Error validasi: ' + error };
    }
  }
}

// ============================================================================
// ALTERNATIF 5: HARDCODED (Untuk Testing/Demo)
// ============================================================================

export class HardcodedLicenseService {
  private static readonly VALID_LICENSES = [
    {
      email: 'siptowidodo@gmail.com',
      licenseCode: 'SW2024PREMIUM',
      username: 'Sipto Widodo',
      status: 'active',
      expiredDate: '2025-12-31'
    },
    {
      email: 'demo@example.com',
      licenseCode: 'DEMO2024',
      username: 'Demo User',
      status: 'active',
      expiredDate: '2024-12-31'
    },
    {
      email: 'test@gmail.com',
      licenseCode: 'TEST123',
      username: 'Test User',
      status: 'active',
      expiredDate: '2025-06-30'
    }
  ];

  static async validateLicense(email: string, licenseCode: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const license = this.VALID_LICENSES.find(
      l => l.email === email && l.licenseCode === licenseCode
    );
    
    if (license) {
      if (license.status !== 'active') {
        return { isValid: false, message: 'Lisensi tidak aktif' };
      }
      
      const expiredDate = new Date(license.expiredDate);
      if (expiredDate < new Date()) {
        return { isValid: false, message: 'Lisensi sudah expired' };
      }
      
      return {
        isValid: true,
        userData: license
      };
    }
    
    return { isValid: false, message: 'Email atau kode lisensi tidak valid' };
  }
}