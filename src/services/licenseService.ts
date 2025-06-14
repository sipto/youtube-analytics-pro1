// ============================================================================
// AIRTABLE SERVICE (Recommended - Easy to use)
// ============================================================================

// Import Airtable service sebagai default
export { AirtableLicenseService as LicenseService } from './airtableLicenseService';

// ============================================================================
// ALTERNATIF SERVICES - Uncomment salah satu jika ingin menggunakan
// ============================================================================

// OPSI 1: Firebase Firestore (Powerful, dari Google)
/*
export { FirebaseLicenseService as LicenseService } from './firebaseLicenseService';
*/

// OPSI 2: Google Sheets (Gratis, familiar)
/*
export interface LicenseData {
  email: string;
  licenseCode: string;
  username: string;
  status: string;
  expiredDate: string;
}

export class LicenseService {
  private static readonly GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

  static async validateLicense(email: string, licenseCode: string): Promise<{
    isValid: boolean;
    userData?: LicenseData;
    message?: string;
  }> {
    if (this.GOOGLE_APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      return {
        isValid: false,
        message: '⚠️ Google Apps Script belum dikonfigurasi!\n\n📋 Langkah-langkah setup:\n1. Buka SETUP_GOOGLE_SHEETS.md\n2. Ikuti semua langkah untuk membuat Google Sheet dan Apps Script\n3. Deploy Apps Script sebagai Web App\n4. Copy URL dan update di src/services/licenseService.ts\n\n🔧 Ganti "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE" dengan URL yang benar.\n\n💡 Atau gunakan alternatif lain di SETUP_ALTERNATIVES.md',
      };
    }

    try {
      const requestBody = {
        action: 'validateLicense',
        email: email,
        licenseCode: licenseCode,
      };

      const response = await fetch(this.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 404) {
          return {
            isValid: false,
            message: '❌ Google Apps Script tidak ditemukan (Error 404)\n\n🔍 Kemungkinan penyebab:\n• URL Apps Script salah\n• Apps Script belum di-deploy\n• Apps Script sudah dihapus\n\n✅ Solusi:\n1. Buka Google Apps Script project Anda\n2. Klik Deploy → Manage deployments\n3. Copy URL yang benar\n4. Update URL di src/services/licenseService.ts\n\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md',
          };
        } else if (response.status === 403) {
          return {
            isValid: false,
            message: '🚫 Akses ditolak (Error 403)\n\n🔍 Kemungkinan penyebab:\n• Setting "Who has access" bukan "Anyone"\n• Apps Script tidak di-deploy sebagai Web App\n\n✅ Solusi:\n1. Buka Google Apps Script project\n2. Klik Deploy → New deployment\n3. Type: Web app\n4. Execute as: Me\n5. Who has access: Anyone\n6. Deploy dan copy URL baru\n\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md',
          };
        } else {
          return {
            isValid: false,
            message: `❌ Server error (${response.status})\n\nDetail: ${errorText}\n\n📖 Periksa SETUP_GOOGLE_SHEETS.md untuk troubleshooting.\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md`,
          };
        }
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          isValid: false,
          message: '🌐 Tidak dapat terhubung ke Google Apps Script!\n\n🔍 Kemungkinan penyebab:\n• Koneksi internet bermasalah\n• Browser memblokir akses ke Google\n• URL Apps Script tidak valid\n• Apps Script belum di-deploy dengan benar\n\n✅ Langkah troubleshooting:\n1. Periksa koneksi internet\n2. Coba refresh halaman\n3. Pastikan URL Apps Script benar\n4. Baca SETUP_GOOGLE_SHEETS.md untuk setup lengkap\n\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md\n\n🔧 URL saat ini: ' + this.GOOGLE_APPS_SCRIPT_URL,
        };
      }
      
      return {
        isValid: false,
        message: `❌ Gagal validasi lisensi: ${error instanceof Error ? error.message : 'Unknown error'}\n\n📖 Baca SETUP_GOOGLE_SHEETS.md untuk panduan setup.\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md`,
      };
    }
  }
}
*/

// OPSI 3: Hardcoded (Untuk Demo/Testing)
/*
export interface LicenseData {
  email: string;
  licenseCode: string;
  username: string;
  status: string;
  expiredDate: string;
}

export class LicenseService {
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

  static async validateLicense(email: string, licenseCode: string): Promise<{
    isValid: boolean;
    userData?: LicenseData;
    message?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const license = this.VALID_LICENSES.find(
      l => l.email === email && l.licenseCode === licenseCode
    );
    
    if (license) {
      if (license.status !== 'active') {
        return { 
          isValid: false, 
          message: 'Lisensi tidak aktif atau telah dinonaktifkan.' 
        };
      }
      
      const expiredDate = new Date(license.expiredDate);
      if (expiredDate < new Date()) {
        return { 
          isValid: false, 
          message: `Lisensi sudah expired pada ${expiredDate.toLocaleDateString('id-ID')}.` 
        };
      }
      
      return {
        isValid: true,
        userData: license
      };
    }
    
    return { 
      isValid: false, 
      message: 'Email atau kode lisensi tidak valid.' 
    };
  }
}
*/