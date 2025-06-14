# 🔥 Tutorial Firebase Firestore untuk Validasi Lisensi

Firebase Firestore adalah database NoSQL yang powerful dan real-time dari Google. Tutorial ini akan memandu Anda step-by-step untuk setup validasi lisensi menggunakan Firebase Firestore.

## 📋 Daftar Isi
1. [Persiapan](#persiapan)
2. [Setup Firebase Project](#setup-firebase-project)
3. [Konfigurasi Firestore Database](#konfigurasi-firestore-database)
4. [Setup Security Rules](#setup-security-rules)
5. [Menambah Data Lisensi](#menambah-data-lisensi)
6. [Update Kode Aplikasi](#update-kode-aplikasi)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Persiapan

**Yang Anda butuhkan:**
- Akun Google
- Browser modern
- Akses internet

**Estimasi waktu:** 15-20 menit

---

## 1️⃣ Setup Firebase Project

### Langkah 1: Buat Firebase Project

1. **Buka Firebase Console**
   - Kunjungi [https://console.firebase.google.com](https://console.firebase.google.com)
   - Login dengan akun Google Anda

2. **Buat Project Baru**
   - Klik **"Create a project"** atau **"Add project"**
   - Masukkan nama project: `youtube-riset-keyword-sw`
   - Klik **Continue**

3. **Google Analytics (Opsional)**
   - Pilih **"Enable Google Analytics"** jika ingin analytics
   - Atau pilih **"Not right now"** untuk skip
   - Klik **Continue**

4. **Tunggu Project Dibuat**
   - Firebase akan setup project Anda
   - Klik **Continue** setelah selesai

### Langkah 2: Setup Web App

1. **Tambah Web App**
   - Di dashboard Firebase, klik ikon **"</>"** (Web)
   - App nickname: `YouTube Riset Keyword SW`
   - ✅ Centang **"Also set up Firebase Hosting"** (opsional)
   - Klik **Register app**

2. **Catat Firebase Config**
   - Copy konfigurasi yang ditampilkan:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdefghijklmnop"
   };
   ```
   - **PENTING:** Simpan config ini, akan digunakan nanti!

3. **Install Firebase SDK**
   - Klik **Continue to console**

---

## 2️⃣ Konfigurasi Firestore Database

### Langkah 1: Enable Firestore

1. **Buka Firestore Database**
   - Di sidebar Firebase Console, klik **"Firestore Database"**
   - Klik **"Create database"**

2. **Pilih Mode**
   - Pilih **"Start in test mode"** (untuk development)
   - Atau **"Start in production mode"** (untuk production)
   - Klik **Next**

3. **Pilih Location**
   - Pilih region terdekat (contoh: `asia-southeast1` untuk Asia Tenggara)
   - Klik **Done**

### Langkah 2: Buat Collection

1. **Start Collection**
   - Klik **"Start collection"**
   - Collection ID: `licenses`
   - Klik **Next**

2. **Tambah Document Pertama**
   - Document ID: `demo-license` (atau auto-generate)
   - Tambah fields berikut:

   | Field | Type | Value |
   |-------|------|-------|
   | email | string | `siptowidodo@gmail.com` |
   | licenseCode | string | `SW2024PREMIUM` |
   | username | string | `Sipto Widodo` |
   | status | string | `active` |
   | expiredDate | string | `2025-12-31` |
   | createdAt | timestamp | (auto) |

3. **Save Document**
   - Klik **Save**

---

## 3️⃣ Setup Security Rules

### Langkah 1: Konfigurasi Rules

1. **Buka Rules Tab**
   - Di Firestore Database, klik tab **"Rules"**

2. **Update Rules**
   - Ganti rules default dengan:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to licenses collection for validation
       match /licenses/{document} {
         allow read: if true;
         allow write: if false; // Prevent writes from client
       }
     }
   }
   ```

3. **Publish Rules**
   - Klik **Publish**

### Penjelasan Rules:
- `allow read: if true` - Membolehkan semua orang membaca data lisensi
- `allow write: if false` - Mencegah penulisan dari client (keamanan)
- Data hanya bisa diubah melalui Firebase Console

---

## 4️⃣ Menambah Data Lisensi

### Cara 1: Melalui Firebase Console

1. **Buka Collection licenses**
2. **Klik "Add document"**
3. **Tambah data berikut:**

**Document 1:**
```
Document ID: demo-user
Fields:
- email: "demo@example.com"
- licenseCode: "DEMO2024"
- username: "Demo User"
- status: "active"
- expiredDate: "2024-12-31"
```

**Document 2:**
```
Document ID: test-user
Fields:
- email: "test@gmail.com"
- licenseCode: "TEST123"
- username: "Test User"
- status: "active"
- expiredDate: "2025-06-30"
```

### Cara 2: Import dari JSON

1. **Siapkan file JSON:**
```json
{
  "licenses": [
    {
      "email": "siptowidodo@gmail.com",
      "licenseCode": "SW2024PREMIUM",
      "username": "Sipto Widodo",
      "status": "active",
      "expiredDate": "2025-12-31"
    },
    {
      "email": "demo@example.com",
      "licenseCode": "DEMO2024",
      "username": "Demo User",
      "status": "active",
      "expiredDate": "2024-12-31"
    }
  ]
}
```

2. **Import via Firebase CLI** (advanced)

---

## 5️⃣ Update Kode Aplikasi

### Langkah 1: Install Firebase SDK

```bash
npm install firebase
```

### Langkah 2: Buat Firebase Service

Buat file `src/services/firebaseLicenseService.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration - GANTI DENGAN CONFIG ANDA
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface LicenseData {
  email: string;
  licenseCode: string;
  username: string;
  status: string;
  expiredDate: string;
}

export class FirebaseLicenseService {
  static async validateLicense(email: string, licenseCode: string): Promise<{
    isValid: boolean;
    userData?: LicenseData;
    message?: string;
  }> {
    try {
      console.log('🔍 Validating license with Firebase Firestore...');
      console.log('Email:', email);
      console.log('License Code:', licenseCode);

      // Query Firestore for matching license
      const licensesRef = collection(db, 'licenses');
      const q = query(
        licensesRef,
        where('email', '==', email),
        where('licenseCode', '==', licenseCode)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ License not found in database');
        return {
          isValid: false,
          message: 'Email atau kode lisensi tidak ditemukan dalam database.'
        };
      }

      // Get the first matching document
      const doc = querySnapshot.docs[0];
      const licenseData = doc.data() as LicenseData;
      
      console.log('📄 License data found:', licenseData);

      // Check if license is active
      if (licenseData.status !== 'active') {
        console.log('⚠️ License is not active:', licenseData.status);
        return {
          isValid: false,
          message: 'Lisensi tidak aktif atau telah dinonaktifkan.'
        };
      }

      // Check if license is expired
      const expiredDate = new Date(licenseData.expiredDate);
      const today = new Date();
      
      if (expiredDate < today) {
        console.log('⏰ License expired:', expiredDate);
        return {
          isValid: false,
          message: `Lisensi telah expired pada ${expiredDate.toLocaleDateString('id-ID')}.`
        };
      }

      console.log('✅ License validation successful');
      return {
        isValid: true,
        userData: licenseData
      };

    } catch (error) {
      console.error('❌ Firebase validation error:', error);
      
      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('permission-denied')) {
          return {
            isValid: false,
            message: '🚫 Akses ditolak ke database. Periksa konfigurasi Firebase Security Rules.'
          };
        } else if (error.message.includes('not-found')) {
          return {
            isValid: false,
            message: '🔍 Database tidak ditemukan. Periksa konfigurasi Firebase project.'
          };
        } else if (error.message.includes('network')) {
          return {
            isValid: false,
            message: '🌐 Masalah koneksi internet. Silakan coba lagi.'
          };
        }
      }
      
      return {
        isValid: false,
        message: `❌ Gagal validasi lisensi: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Method untuk menambah lisensi baru (opsional, untuk admin)
  static async addLicense(licenseData: LicenseData): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Note: Ini memerlukan write permission di Security Rules
      // Sebaiknya dilakukan melalui Firebase Console atau Admin SDK
      console.log('⚠️ Adding license through client is not recommended for security');
      return {
        success: false,
        message: 'Penambahan lisensi harus dilakukan melalui Firebase Console untuk keamanan.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
```

### Langkah 3: Update License Service

Buka `src/services/licenseService.ts` dan ganti dengan:

```typescript
// Import Firebase service
export { FirebaseLicenseService as LicenseService } from './firebaseLicenseService';
```

---

## 6️⃣ Testing

### Langkah 1: Test Aplikasi

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Buka browser dan test login dengan:**
   - Email: `siptowidodo@gmail.com`
   - License Code: `SW2024PREMIUM`

### Langkah 2: Monitor di Firebase Console

1. **Buka Firebase Console**
2. **Klik "Firestore Database"**
3. **Monitor usage di tab "Usage"**

### Langkah 3: Test Error Cases

Test dengan data yang salah untuk memastikan error handling bekerja:
- Email salah
- License code salah
- License expired

---

## 7️⃣ Troubleshooting

### ❌ Error: "Permission denied"

**Penyebab:** Security rules terlalu ketat
**Solusi:**
1. Buka Firebase Console → Firestore → Rules
2. Pastikan rules membolehkan read:
   ```javascript
   match /licenses/{document} {
     allow read: if true;
   }
   ```

### ❌ Error: "Firebase not initialized"

**Penyebab:** Firebase config salah
**Solusi:**
1. Periksa kembali firebaseConfig di `firebaseLicenseService.ts`
2. Pastikan semua field terisi dengan benar

### ❌ Error: "Collection not found"

**Penyebab:** Collection 'licenses' belum dibuat
**Solusi:**
1. Buka Firebase Console → Firestore
2. Buat collection 'licenses' dengan document pertama

### ❌ Error: "Network error"

**Penyebab:** Masalah koneksi atau CORS
**Solusi:**
1. Periksa koneksi internet
2. Pastikan domain sudah terdaftar di Firebase project settings

---

## 🎯 Tips & Best Practices

### 1. **Security**
- Jangan expose Firebase config di public repository
- Gunakan environment variables untuk production
- Set up proper Security Rules

### 2. **Performance**
- Gunakan indexing untuk query yang kompleks
- Limit jumlah documents yang di-query
- Cache hasil validasi jika perlu

### 3. **Monitoring**
- Monitor usage di Firebase Console
- Set up alerts untuk usage yang tinggi
- Track error rates

### 4. **Backup**
- Export data secara berkala
- Set up automated backups
- Test restore procedures

---

## 💰 Biaya Firebase

### Free Tier (Spark Plan):
- **Reads:** 50,000/day
- **Writes:** 20,000/day
- **Deletes:** 20,000/day
- **Storage:** 1 GB
- **Network:** 10 GB/month

### Paid Tier (Blaze Plan):
- **Reads:** $0.06 per 100,000
- **Writes:** $0.18 per 100,000
- **Deletes:** $0.02 per 100,000
- **Storage:** $0.18/GB/month
- **Network:** $0.12/GB

**Estimasi untuk aplikasi lisensi:**
- 1000 validasi/hari = ~30,000 reads/bulan
- Masih dalam free tier!

---

## 🔄 Migrasi dari Google Sheets

Jika Anda sudah menggunakan Google Sheets:

1. **Export data dari Google Sheets ke CSV**
2. **Convert CSV ke JSON**
3. **Import ke Firestore menggunakan Firebase CLI**
4. **Update kode untuk menggunakan Firebase service**
5. **Test thoroughly**

---

## 📚 Resources Tambahan

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase CLI](https://firebase.google.com/docs/cli)

---

## ✅ Checklist Setup

- [ ] Firebase project dibuat
- [ ] Web app dikonfigurasi
- [ ] Firestore database diaktifkan
- [ ] Collection 'licenses' dibuat
- [ ] Security rules dikonfigurasi
- [ ] Sample data ditambahkan
- [ ] Firebase SDK diinstall
- [ ] Service code diupdate
- [ ] Testing berhasil
- [ ] Error handling ditest

---

**🎉 Selamat! Firebase Firestore sudah siap digunakan untuk validasi lisensi.**

Jika ada pertanyaan atau masalah, silakan check troubleshooting section atau hubungi support.