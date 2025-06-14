import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Firebase configuration - GANTI DENGAN CONFIG ANDA DARI FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
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

      // Check if Firebase is properly configured
      if (firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
        return {
          isValid: false,
          message: '⚠️ Firebase belum dikonfigurasi!\n\n📋 Langkah-langkah setup:\n1. Buka TUTORIAL_FIREBASE_FIRESTORE.md\n2. Ikuti semua langkah untuk setup Firebase project\n3. Dapatkan Firebase config dari project settings\n4. Update firebaseConfig di src/services/firebaseLicenseService.ts\n\n🔧 Ganti semua "YOUR_FIREBASE_..." dengan nilai yang benar dari Firebase Console.\n\n💡 Atau gunakan alternatif lain di SETUP_ALTERNATIVES.md',
        };
      }

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
            message: '🚫 Akses ditolak ke database Firebase.\n\n🔍 Kemungkinan penyebab:\n• Security Rules terlalu ketat\n• Collection "licenses" tidak ada\n• Project ID salah\n\n✅ Solusi:\n1. Buka Firebase Console → Firestore → Rules\n2. Pastikan rules membolehkan read untuk collection licenses\n3. Periksa kembali project ID di konfigurasi\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk panduan lengkap.'
          };
        } else if (error.message.includes('not-found')) {
          return {
            isValid: false,
            message: '🔍 Database atau collection tidak ditemukan.\n\n🔍 Kemungkinan penyebab:\n• Project ID salah\n• Collection "licenses" belum dibuat\n• Database belum diaktifkan\n\n✅ Solusi:\n1. Periksa project ID di firebaseConfig\n2. Buat collection "licenses" di Firestore\n3. Tambahkan minimal 1 document untuk testing\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk panduan lengkap.'
          };
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          return {
            isValid: false,
            message: '🌐 Masalah koneksi ke Firebase.\n\n🔍 Kemungkinan penyebab:\n• Koneksi internet bermasalah\n• Firebase project tidak aktif\n• API key tidak valid\n\n✅ Solusi:\n1. Periksa koneksi internet\n2. Verifikasi API key di Firebase Console\n3. Pastikan project Firebase masih aktif\n4. Coba refresh halaman\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk troubleshooting.'
          };
        } else if (error.message.includes('api-key-not-valid')) {
          return {
            isValid: false,
            message: '🔑 API Key Firebase tidak valid.\n\n✅ Solusi:\n1. Buka Firebase Console\n2. Project Settings → General\n3. Scroll ke "Your apps" → Web apps\n4. Copy Firebase config yang benar\n5. Update firebaseConfig di src/services/firebaseLicenseService.ts\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk panduan lengkap.'
          };
        }
      }
      
      return {
        isValid: false,
        message: `❌ Gagal validasi lisensi Firebase: ${error instanceof Error ? error.message : 'Unknown error'}\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk troubleshooting.\n💡 Atau coba alternatif lain di SETUP_ALTERNATIVES.md`
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
        message: 'Penambahan lisensi harus dilakukan melalui Firebase Console untuk keamanan.\n\n📖 Baca TUTORIAL_FIREBASE_FIRESTORE.md untuk cara menambah data.'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Method untuk test koneksi Firebase
  static async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY") {
        return {
          success: false,
          message: 'Firebase belum dikonfigurasi. Update firebaseConfig terlebih dahulu.'
        };
      }

      const licensesRef = collection(db, 'licenses');
      const querySnapshot = await getDocs(licensesRef);
      
      return {
        success: true,
        message: `✅ Koneksi Firebase berhasil! Ditemukan ${querySnapshot.size} dokumen di collection licenses.`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Gagal koneksi Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}