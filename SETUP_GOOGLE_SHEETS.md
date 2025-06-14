# Setup Google Sheets untuk Validasi Lisensi

## Langkah 1: Buat Google Sheet

1. Buka [Google Sheets](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "YouTube Riset Keyword SW - License Database"
3. Buat kolom-kolom berikut di baris pertama:

| A | B | C | D | E |
|---|---|---|---|---|
| Email | License Code | Username | Status | Expired Date |

## Langkah 2: Isi Data Sample

Tambahkan data berikut sebagai contoh:

| Email | License Code | Username | Status | Expired Date |
|-------|-------------|----------|--------|--------------|
| siptowidodo@gmail.com | SW2024PREMIUM | Sipto Widodo | active | 2025-12-31 |
| demo@example.com | DEMO2024 | Demo User | active | 2024-12-31 |

## Langkah 3: Buat Google Apps Script

1. Di Google Sheet, klik **Extensions** → **Apps Script**
2. Hapus kode default dan ganti dengan kode berikut:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'validateLicense') {
      return validateLicense(data.email, data.licenseCode);
    } else if (action === 'addLicense') {
      return addLicense(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        isValid: false,
        message: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        isValid: false,
        message: 'Server error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function validateLicense(email, licenseCode) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowEmail = row[0];
    const rowLicenseCode = row[1];
    const rowUsername = row[2];
    const rowStatus = row[3];
    const rowExpiredDate = row[4];
    
    if (rowEmail === email && rowLicenseCode === licenseCode) {
      // Check if license is active
      if (rowStatus !== 'active') {
        return ContentService
          .createTextOutput(JSON.stringify({
            isValid: false,
            message: 'Lisensi tidak aktif atau telah dinonaktifkan.'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Check if license is expired
      const expiredDate = new Date(rowExpiredDate);
      const today = new Date();
      
      if (expiredDate < today) {
        return ContentService
          .createTextOutput(JSON.stringify({
            isValid: false,
            message: 'Lisensi telah expired pada ' + expiredDate.toLocaleDateString('id-ID') + '.'
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      // Valid license
      return ContentService
        .createTextOutput(JSON.stringify({
          isValid: true,
          userData: {
            email: rowEmail,
            licenseCode: rowLicenseCode,
            username: rowUsername,
            status: rowStatus,
            expiredDate: rowExpiredDate
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // License not found
  return ContentService
    .createTextOutput(JSON.stringify({
      isValid: false,
      message: 'Email atau kode lisensi tidak ditemukan dalam database.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function addLicense(licenseData) {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  try {
    sheet.appendRow([
      licenseData.email,
      licenseData.licenseCode,
      licenseData.username,
      licenseData.status || 'active',
      licenseData.expiredDate
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Lisensi berhasil ditambahkan.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Gagal menambahkan lisensi: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function - you can run this to test the script
function testValidation() {
  const result = validateLicense('siptowidodo@gmail.com', 'SW2024PREMIUM');
  console.log(result.getContent());
}
```

## Langkah 4: Deploy Apps Script

1. Klik **Deploy** → **New deployment**
2. Pilih type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Klik **Deploy**
6. Copy **Web app URL** yang diberikan

## Langkah 5: Update Kode Aplikasi

1. Buka file `src/services/licenseService.ts`
2. Ganti `YOUR_SCRIPT_ID` dengan URL yang Anda dapatkan dari langkah 4
3. Contoh: 
   ```typescript
   private static readonly GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
   ```

## Langkah 6: Test Aplikasi

1. Jalankan aplikasi
2. Coba login dengan:
   - Email: `siptowidodo@gmail.com`
   - License Code: `SW2024PREMIUM`

## Menambah Lisensi Baru

Untuk menambah lisensi baru, tambahkan baris baru di Google Sheet dengan format:

| Email | License Code | Username | Status | Expired Date |
|-------|-------------|----------|--------|--------------|
| user@example.com | UNIQUE_CODE | User Name | active | 2025-12-31 |

## Keamanan

- Google Apps Script URL bersifat publik tapi hanya menerima POST request
- Data validasi dilakukan server-side di Google
- Tidak ada data sensitif yang tersimpan di frontend

## Troubleshooting

1. **Error 403**: Pastikan deployment setting "Who has access" = "Anyone"
2. **Error 404**: Periksa URL Apps Script sudah benar
3. **License not found**: Periksa ejaan email dan license code di Google Sheet
```