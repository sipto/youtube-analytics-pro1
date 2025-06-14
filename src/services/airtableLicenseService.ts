export interface LicenseData {
  email: string;
  licenseCode: string;
  username: string;
  status: string;
  expiredDate: string;
}

export class AirtableLicenseService {
  // KONFIGURASI AIRTABLE - SUDAH LENGKAP!
  private static readonly AIRTABLE_BASE_ID = 'appaFVLWhcbMEAZom'; // Base ID dari URL yang Anda berikan
  private static readonly AIRTABLE_TABLE_NAME = 'Licenses';
  private static readonly AIRTABLE_API_KEY = 'patQmPka0UySB66kU.fd5f0156c8008729f7bde705bf31657744391847c445526ec3ff59cc7dca2a52'; // Personal Access Token Anda

  static async validateLicense(email: string, licenseCode: string): Promise<{
    isValid: boolean;
    userData?: LicenseData;
    message?: string;
  }> {
    try {
      console.log('🔍 Validating license with Airtable...');
      console.log('Email:', email);
      console.log('License Code:', licenseCode);

      // Build Airtable API URL with filter
      const filterFormula = `AND({Email}='${email}',{License Code}='${licenseCode}')`;
      const url = `https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/${this.AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(filterFormula)}`;
      
      console.log('🌐 Making request to Airtable API...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Airtable API error:', response.status, response.statusText);
        
        if (response.status === 401) {
          return {
            isValid: false,
            message: '🔑 Personal Access Token tidak valid!\n\n🔍 Kemungkinan penyebab:\n• Token salah atau typo\n• Token sudah expired\n• Token tidak memiliki permission yang cukup\n\n✅ Solusi:\n1. Buka Airtable Account Settings\n2. Generate Personal Access Token baru\n3. Pastikan scope "data.records:read" dipilih\n4. Pastikan token memiliki akses ke base ini\n5. Update AIRTABLE_API_KEY di kode\n\n🆔 Base ID yang digunakan: appaFVLWhcbMEAZom'
          };
        } else if (response.status === 404) {
          return {
            isValid: false,
            message: '🔍 Table tidak ditemukan!\n\n🔍 Kemungkinan penyebab:\n• Nama table bukan "Licenses"\n• Table sudah dihapus atau direname\n• Base structure berubah\n\n✅ Solusi:\n1. Buka base Airtable Anda\n2. Pastikan ada table bernama "Licenses"\n3. Atau update AIRTABLE_TABLE_NAME di kode sesuai nama table yang benar\n\n🆔 Base ID: appaFVLWhcbMEAZom\n📋 Table name: Licenses'
          };
        } else if (response.status === 403) {
          return {
            isValid: false,
            message: '🚫 Akses ditolak!\n\n🔍 Kemungkinan penyebab:\n• Personal Access Token tidak memiliki akses ke base ini\n• Token tidak memiliki permission "data.records:read"\n• Base sharing settings membatasi akses\n\n✅ Solusi:\n1. Buat Personal Access Token baru\n2. Pilih scope "data.records:read"\n3. Pastikan token memiliki akses ke base: appaFVLWhcbMEAZom\n4. Check base sharing settings\n\n🆔 Base ID: appaFVLWhcbMEAZom'
          };
        } else if (response.status === 422) {
          return {
            isValid: false,
            message: '❌ Request tidak valid!\n\n🔍 Kemungkinan penyebab:\n• Filter formula salah\n• Nama field tidak sesuai (Email, License Code)\n• Format data tidak valid\n\n✅ Solusi:\n1. Periksa nama kolom di Airtable:\n   - Email (Single line text)\n   - License Code (Single line text)\n   - Username (Single line text)\n   - Status (Single select)\n   - Expiry Date (Date)\n2. Pastikan case-sensitive sesuai\n\n🆔 Base ID: appaFVLWhcbMEAZom'
          };
        }
        
        const errorText = await response.text();
        return {
          isValid: false,
          message: `❌ Airtable API error (${response.status}): ${errorText}\n\n🆔 Base ID: appaFVLWhcbMEAZom\n📋 Table: Licenses`
        };
      }

      const data = await response.json();
      console.log('📄 Airtable response:', data);
      
      if (!data.records || data.records.length === 0) {
        console.log('❌ License not found in Airtable');
        return {
          isValid: false,
          message: 'Email atau kode lisensi tidak ditemukan dalam database.\n\n💡 Pastikan data sudah ada di Airtable base Anda.'
        };
      }

      // Get the first matching record
      const record = data.records[0];
      const fields = record.fields;
      
      console.log('📄 License data found:', fields);
      console.log('🔍 Status field value:', fields.Status);
      console.log('🔍 Status type:', typeof fields.Status);

      // DEBUGGING: Show all available fields
      console.log('📋 All fields in record:', Object.keys(fields));

      // Check if license is active - with better debugging
      const statusValue = fields.Status;
      if (!statusValue) {
        return {
          isValid: false,
          message: `❌ Field "Status" tidak ditemukan atau kosong!\n\n🔍 Data yang ditemukan:\n${JSON.stringify(fields, null, 2)}\n\n✅ Solusi:\n1. Buka Airtable base Anda\n2. Pastikan ada kolom "Status"\n3. Isi nilai "active" untuk lisensi yang valid\n4. Pastikan field type adalah "Single select"`
        };
      }

      if (statusValue !== 'active') {
        console.log('⚠️ License is not active:', statusValue);
        return {
          isValid: false,
          message: `Lisensi tidak aktif!\n\n📊 Status saat ini: "${statusValue}"\n📊 Status yang dibutuhkan: "active"\n\n✅ Solusi:\n1. Buka Airtable base Anda\n2. Edit record untuk email: ${email}\n3. Ubah Status menjadi "active"\n4. Save perubahan\n\n💡 Pastikan field Status adalah "Single select" dengan option "active"`
        };
      }

      // Check if license is expired - FIXED: Menggunakan "Expiry Date" sesuai dengan Airtable Anda
      const expiredDateValue = fields['Expiry Date'] || fields['Expired Date']; // Support both field names
      if (!expiredDateValue) {
        return {
          isValid: false,
          message: `❌ Field tanggal expired tidak ditemukan!\n\n🔍 Data yang ditemukan:\n${JSON.stringify(fields, null, 2)}\n\n✅ Solusi:\n1. Buka Airtable base Anda\n2. Pastikan ada kolom "Expiry Date" atau "Expired Date"\n3. Isi tanggal expired (format: YYYY-MM-DD)\n4. Pastikan field type adalah "Date"\n\n💡 Berdasarkan data Anda, gunakan nama kolom "Expiry Date"`
        };
      }

      const expiredDate = new Date(expiredDateValue);
      const today = new Date();
      
      if (expiredDate < today) {
        console.log('⏰ License expired:', expiredDate);
        return {
          isValid: false,
          message: `Lisensi telah expired pada ${expiredDate.toLocaleDateString('id-ID')}.\n\n📅 Tanggal expired: ${expiredDateValue}\n📅 Tanggal hari ini: ${today.toISOString().split('T')[0]}\n\n✅ Solusi:\n1. Buka Airtable base Anda\n2. Edit record untuk email: ${email}\n3. Update "Expiry Date" ke tanggal yang lebih baru\n4. Save perubahan`
        };
      }

      console.log('✅ License validation successful');
      return {
        isValid: true,
        userData: {
          email: fields.Email,
          licenseCode: fields['License Code'],
          username: fields.Username,
          status: fields.Status,
          expiredDate: expiredDateValue // Use the actual field value
        }
      };

    } catch (error) {
      console.error('❌ Airtable validation error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          isValid: false,
          message: '🌐 Tidak dapat terhubung ke Airtable!\n\n🔍 Kemungkinan penyebab:\n• Koneksi internet bermasalah\n• Browser memblokir akses ke Airtable\n• Airtable API sedang down\n• CORS policy issue\n\n✅ Langkah troubleshooting:\n1. Periksa koneksi internet\n2. Coba refresh halaman\n3. Disable ad blocker sementara\n4. Coba browser lain\n\n🆔 Base ID: appaFVLWhcbMEAZom'
        };
      } else if (error instanceof SyntaxError) {
        return {
          isValid: false,
          message: '📄 Response dari Airtable tidak valid!\n\n🔍 Kemungkinan penyebab:\n• API response bukan JSON\n• Airtable API berubah format\n• Network error saat parsing\n\n✅ Solusi:\n1. Coba lagi beberapa saat\n2. Periksa status Airtable di status.airtable.com\n3. Hubungi support jika masalah berlanjut\n\n🆔 Base ID: appaFVLWhcbMEAZom'
        };
      }
      
      return {
        isValid: false,
        message: `❌ Gagal validasi lisensi Airtable: ${error instanceof Error ? error.message : 'Unknown error'}\n\n🆔 Base ID: appaFVLWhcbMEAZom\n📖 Baca TUTORIAL_AIRTABLE_SETUP.md untuk troubleshooting.`
      };
    }
  }

  // Method untuk menambah lisensi baru (opsional, untuk admin)
  static async addLicense(licenseData: LicenseData): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const url = `https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/${this.AIRTABLE_TABLE_NAME}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': licenseData.email,
              'License Code': licenseData.licenseCode,
              'Username': licenseData.username,
              'Status': licenseData.status || 'active',
              'Expiry Date': licenseData.expiredDate // Updated to match your field name
            }
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          message: `Gagal menambahkan lisensi: ${errorText}`
        };
      }

      return {
        success: true,
        message: 'Lisensi berhasil ditambahkan ke Airtable.'
      };

    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Method untuk test koneksi Airtable
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const url = `https://api.airtable.com/v0/${this.AIRTABLE_BASE_ID}/${this.AIRTABLE_TABLE_NAME}?maxRecords=1`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `Gagal koneksi Airtable: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        message: `✅ Koneksi Airtable berhasil! Ditemukan ${data.records?.length || 0} record di table Licenses.`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Gagal koneksi Airtable: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}