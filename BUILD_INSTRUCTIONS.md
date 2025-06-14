# 🚀 Build Instructions - Web & Desktop Applications

Panduan lengkap untuk membangun **YouTube Analytics Pro** dalam 2 versi: **Web Application** dan **Desktop Application (EXE)**.

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **Git** (opsional)

## 🔧 Setup Development Environment

### 1. Install Dependencies

```bash
# Install semua dependencies
npm install

# Atau menggunakan yarn
yarn install
```

### 2. Install Electron Dependencies

```bash
# Install Electron dan tools untuk build desktop app
npm install --save-dev electron electron-builder concurrently wait-on
```

## 🌐 Web Application

### Development Mode

```bash
# Jalankan development server
npm run dev

# Aplikasi akan buka di http://localhost:5173
```

### Production Build

```bash
# Build untuk production (web)
npm run build:web

# File hasil build ada di folder: dist-web/
```

### Preview Production Build

```bash
# Preview hasil build
npm run preview
```

## 💻 Desktop Application (Electron)

### Development Mode

```bash
# Jalankan Electron app dalam development mode
npm run electron:dev

# Ini akan:
# 1. Start Vite dev server
# 2. Launch Electron app yang connect ke dev server
```

### Production Build

```bash
# Build desktop application
npm run build:desktop

# Ini akan:
# 1. Build web app ke dist-web/
# 2. Package dengan Electron
# 3. Buat installer di dist-electron/
```

### Build Specific Platform

```bash
# Build untuk Windows saja
npm run dist -- --win

# Build untuk macOS saja  
npm run dist -- --mac

# Build untuk Linux saja
npm run dist -- --linux
```

## 📦 Output Files

### Web Application
- **Folder:** `dist-web/`
- **Files:** HTML, CSS, JS files siap deploy
- **Deploy ke:** Netlify, Vercel, GitHub Pages, dll

### Desktop Application
- **Folder:** `dist-electron/`
- **Windows:** `YouTube Analytics Pro Setup 1.0.0.exe`
- **macOS:** `YouTube Analytics Pro-1.0.0.dmg`
- **Linux:** `YouTube Analytics Pro-1.0.0.AppImage`

## 🎯 Platform-Specific Instructions

### Windows (EXE)

```bash
# Build Windows installer
npm run build:desktop

# Output: dist-electron/YouTube Analytics Pro Setup 1.0.0.exe
# Size: ~150-200MB (includes Chromium)
```

**Features:**
- ✅ NSIS installer dengan wizard
- ✅ Desktop shortcut
- ✅ Start menu entry
- ✅ Uninstaller
- ✅ Auto-updater ready

### macOS (DMG)

```bash
# Build macOS app (perlu macOS untuk build)
npm run build:desktop

# Output: dist-electron/YouTube Analytics Pro-1.0.0.dmg
```

**Features:**
- ✅ Signed app (jika ada certificate)
- ✅ Drag-to-Applications installer
- ✅ Retina display support
- ✅ Universal binary (Intel + Apple Silicon)

### Linux (AppImage)

```bash
# Build Linux app
npm run build:desktop

# Output: dist-electron/YouTube Analytics Pro-1.0.0.AppImage
```

**Features:**
- ✅ Portable executable
- ✅ No installation required
- ✅ Works on most Linux distros
- ✅ Desktop integration

## 🔧 Configuration

### Electron Builder Config

File `package.json` sudah dikonfigurasi dengan:

```json
{
  "build": {
    "appId": "com.siptowidodo.youtube-analytics-pro",
    "productName": "YouTube Analytics Pro",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist-web/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "electron/assets/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "electron/assets/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "electron/assets/icon.png"
    }
  }
}
```

### Vite Config untuk Electron

```typescript
// vite.config.ts
export default defineConfig({
  base: './', // Important untuk Electron
  build: {
    outDir: 'dist-web',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
```

## 🚀 Deployment

### Web Application

#### Netlify
```bash
# Build
npm run build:web

# Deploy folder: dist-web/
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages
```bash
# Build
npm run build:web

# Push dist-web/ ke gh-pages branch
```

### Desktop Application

#### Manual Distribution
1. Build aplikasi: `npm run build:desktop`
2. Upload installer ke website/cloud storage
3. Share download link

#### Auto-Update (Advanced)
1. Setup update server
2. Configure electron-updater
3. Automatic updates untuk users

## 🔍 Troubleshooting

### Common Issues

#### 1. Electron Build Gagal
```bash
# Clear cache dan rebuild
rm -rf node_modules dist-electron dist-web
npm install
npm run build:desktop
```

#### 2. Icon Tidak Muncul
- Pastikan icon files ada di `electron/assets/`
- Format: `.ico` (Windows), `.icns` (macOS), `.png` (Linux)
- Size: 256x256px atau lebih

#### 3. App Tidak Start
```bash
# Check Electron main process
npm run electron

# Check console untuk error messages
```

#### 4. Build Size Terlalu Besar
- Electron app memang besar (~150MB) karena include Chromium
- Untuk reduce size, gunakan `electron-builder` optimization
- Consider web app untuk distribusi yang lebih ringan

### Performance Tips

#### Development
- Gunakan `npm run electron:dev` untuk hot reload
- Enable DevTools untuk debugging
- Monitor memory usage

#### Production
- Minify dan optimize assets
- Enable code splitting
- Use production build untuk testing

## 📊 Comparison: Web vs Desktop

| Feature | Web App | Desktop App |
|---------|---------|-------------|
| **Size** | ~5MB | ~150MB |
| **Installation** | No install | Install required |
| **Updates** | Instant | Manual/Auto |
| **Performance** | Good | Excellent |
| **Offline** | Limited | Full support |
| **OS Integration** | Limited | Full access |
| **Distribution** | URL sharing | File download |
| **Security** | Browser sandbox | Full system access |

## 🎯 Recommendations

### For End Users
- **Web App**: Quick testing, shared computers
- **Desktop App**: Daily use, better performance

### For Distribution
- **Web App**: Easy sharing, instant access
- **Desktop App**: Professional use, offline capability

### For Development
- Start with web app development
- Add Electron wrapper when needed
- Test both versions regularly

## 📝 Scripts Summary

```bash
# Development
npm run dev              # Web dev server
npm run electron:dev     # Electron dev mode

# Building
npm run build:web        # Web production build
npm run build:desktop    # Desktop app build
npm run build           # Web build (default)

# Utilities
npm run preview         # Preview web build
npm run lint           # Code linting
npm run electron       # Run Electron (production mode)
```

## 🎉 Success!

Setelah mengikuti panduan ini, Anda akan memiliki:

✅ **Web Application** - Siap deploy ke hosting manapun
✅ **Desktop Application** - File installer untuk Windows/Mac/Linux
✅ **Development Environment** - Setup untuk development kedua versi
✅ **Build Pipeline** - Automated build process

**Happy coding! 🚀**