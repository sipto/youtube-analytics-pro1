# 📊 Tutorial Airtable untuk Validasi Lisensi

Airtable adalah platform database yang mudah digunakan dengan interface seperti spreadsheet tapi memiliki API yang powerful. Tutorial ini akan memandu Anda setup validasi lisensi menggunakan Airtable.

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Setup Airtable Base](#setup-airtable-base)
3. [Konfigurasi Table](#konfigurasi-table)
4. [Mendapatkan API Key](#mendapatkan-api-key)
5. [Update Kode Aplikasi](#update-kode-aplikasi)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Persiapan

**Yang Anda butuhkan:**
- Akun Airtable (gratis)
- Browser modern
- Akses internet

**Estimasi waktu:** 10-15 menit

---

## 1️⃣ Setup Airtable Base

### Langkah 1: Buat Akun Airtable

1. **Daftar di Airtable**
   - Kunjungi [https://airtable.com](https://airtable.com)
   - Klik **"Sign up for free"**
   - Daftar dengan email atau Google account

2. **Verifikasi Email**
   - Check email untuk verifikasi
   - Klik link verifikasi

### Langkah 2: Buat Base Baru

1. **Create New Base**
   - Di dashboard Airtable, klik **"Create a base"**
   - Pilih **"Start from scratch"**
   - Nama base: `YouTube Analytics Pro - License Database`
   - Klik **"Create base"**

---

## 2️⃣ Konfigurasi Table

### Langkah 1: Setup Table Structure

1. **Rename Table**
   - Klik nama table default (biasanya "Table 1")
   - Ganti nama menjadi: `Licenses`

2. **Setup Columns**
   Buat kolom-kolom berikut:

   | Column Name | Field Type | Description |
   |-------------|------------|-------------|
   | Email | Single line text | Email pengguna |
   | License Code | Single line text | Kode lisensi unik |
   | Username | Single line text | Nama pengguna |
   | Status | Single select | active, inactive, suspended |
   | Expired Date | Date | Tanggal expired lisensi |
   | Created At | Created time | Waktu pembuatan (auto) |

3. **Konfigurasi Status Field**
   - Klik kolom "Status"
   - Pilih **"Single select"**
   - Tambahkan options:
     - `active` (warna hijau)
     - `inactive` (warna abu-abu)
     - `suspended` (warna merah)

### Langkah 2: Tambah Data Sample

Tambahkan beberapa record untuk testing:

**Record 1:**
- Email: `siptowidodo@gmail.com`
- License Code: `SW2024PREMIUM`
- Username: `Sipto Widodo`
- Status: `active`
- Expired Date: `2025-12-31`

**Record 2:**
- Email: `demo@example.com`
- License Code: `DEMO2024`
- Username: `Demo User`
- Status: `active`
- Expired Date: `2024-12-31`

**Record 3:**
- Email: `test@gmail.com`
- License Code: `TEST123`
- Username: `Test User`
- Status: `active`
- Expired Date: `2025-06-30`

---

## 3️⃣ Mendapatkan API Key

### Langkah 1: Generate Personal Access Token

1. **Buka Account Settings**
   - Klik avatar Anda di pojok kanan atas
   - Pilih **"Account"**

2. **Create Personal Access Token**
   - Scroll ke bagian **"Personal access tokens"**
   - Klik **"Create new token"**
   - Token name: `YouTube Analytics Pro`
   - Scopes: Pilih **"data.records:read"**
   - Access: Pilih base yang sudah dibuat
   - Klik **"Create token"**

3. **Copy Token**
   - **PENTING:** Copy token dan simpan dengan aman
   - Token hanya ditampilkan sekali!
   - Format: `patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### Langkah 2: Dapatkan Base ID

1. **Buka API Documentation**
   - Di base Airtable Anda, klik **"Help"** → **"API documentation"**
   - Atau kunjungi: `https://airtable.com/{BASE_ID}/api/docs`

2. **Copy Base ID**
   - Base ID ada di URL atau di bagian "Introduction"
   - Format: `appXXXXXXXXXXXXXX`

---

## 4️⃣ Update Kode Aplikasi

### Langkah 1: Update Airtable Service

Buka `src/services/airtableLicenseService.ts` dan update konfigurasi:

```typescript
export class AirtableLicenseService {
  // GANTI DENGAN DATA ANDA
  private static readonly AIRTABLE_BASE_ID = 'appXXXXXXXXXXXXXX'; // Base ID Anda
  private static readonly AIRTABLE_TABLE_NAME = 'Licenses';
  private static readonly AIRTABLE_API_KEY = 'patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Personal Access Token Anda

  // ... rest of the code
}
```

### Langkah 2: Update License Service

Buka `src/services/licenseService.ts` dan ganti dengan:

```typescript
// Import Airtable service
export { AirtableLicenseService as LicenseService } from './airtableLicenseService';
```

---

## 5️⃣ Testing

### Langkah 1: Test Aplikasi

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Test login dengan data sample:**
   - Email: `siptowidodo@gmail.com`
   - License Code: `SW2024PREMIUM`

### Langkah 2: Monitor di Airtable

1. **Buka base Airtable Anda**
2. **Check data di table Licenses**
3. **Monitor API usage di account settings**

---

## 6️⃣ Troubleshooting

### ❌ Error: "Invalid API key"

**Penyebab:** API key salah atau expired
**Solusi:**
1. Periksa Personal Access Token di Airtable account
2. Pastikan token masih aktif
3. Generate token baru jika perlu

### ❌ Error: "Base not found"

**Penyebab:** Base ID salah
**Solusi:**
1. Periksa Base ID di URL Airtable
2. Pastikan format `appXXXXXXXXXXXXXX`
3. Copy dari API documentation

### ❌ Error: "Table not found"

**Penyebab:** Nama table salah
**Solusi:**
1. Pastikan nama table adalah `Licenses`
2. Case sensitive!

### ❌ Error: "Permission denied"

**Penyebab:** Token tidak memiliki permission yang cukup
**Solusi:**
1. Buat token baru dengan scope `data.records:read`
2. Pastikan token memiliki akses ke base yang benar

---

## 🎯 Tips & Best Practices

### 1. **Security**
- Jangan expose API key di public repository
- Gunakan environment variables untuk production
- Rotate API key secara berkala

### 2. **Performance**
- Airtable memiliki rate limit: 5 requests/second
- Cache hasil validasi jika perlu
- Gunakan filterByFormula untuk query yang efisien

### 3. **Data Management**
- Gunakan views untuk filter data
- Set up automation untuk notifikasi
- Regular backup data

### 4. **Monitoring**
- Monitor API usage di account settings
- Set up alerts untuk usage yang tinggi
- Track error rates

---

## 💰 Biaya Airtable

### Free Plan:
- **Records:** 1,200 per base
- **API calls:** 1,000/month
- **Storage:** 2GB per base

### Pro Plan ($20/month):
- **Records:** 5,000 per base
- **API calls:** 100,000/month
- **Storage:** 5GB per base
- **Advanced features:** Gantt, calendar, etc.

**Estimasi untuk aplikasi lisensi:**
- 1000 validasi/hari = ~30,000 API calls/bulan
- Perlu Pro plan untuk usage tinggi

---

## 🔄 Menambah Lisensi Baru

### Cara 1: Manual via Airtable Interface
1. Buka base Airtable
2. Klik **"+"** untuk tambah record baru
3. Isi semua field yang diperlukan

### Cara 2: Import dari CSV
1. Siapkan file CSV dengan format yang benar
2. Di Airtable, klik **"..."** → **"Import data"**
3. Upload CSV dan map columns

### Cara 3: Via API (Advanced)
```javascript
// Contoh POST request untuk menambah record
const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/Licenses`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    records: [{
      fields: {
        'Email': 'newuser@example.com',
        'License Code': 'NEW2024',
        'Username': 'New User',
        'Status': 'active',
        'Expired Date': '2025-12-31'
      }
    }]
  })
});
```

---

## 📊 Keunggulan Airtable

- ✅ **User-friendly**: Interface seperti spreadsheet
- ✅ **Powerful API**: RESTful API yang mudah digunakan
- ✅ **Real-time**: Data sync secara real-time
- ✅ **Collaboration**: Tim bisa bekerja sama
- ✅ **Views**: Multiple views (Grid, Calendar, Kanban)
- ✅ **Automation**: Built-in automation features
- ✅ **Integration**: Integrasi dengan banyak tools

---

## ✅ Checklist Setup

- [ ] Akun Airtable dibuat
- [ ] Base baru dibuat
- [ ] Table "Licenses" dikonfigurasi
- [ ] Sample data ditambahkan
- [ ] Personal Access Token dibuat
- [ ] Base ID didapatkan
- [ ] Service code diupdate
- [ ] Testing berhasil
- [ ] Error handling ditest

---

**🎉 Selamat! Airtable sudah siap digunakan untuk validasi lisensi.**

Jika ada pertanyaan atau masalah, silakan check troubleshooting section atau hubungi support.