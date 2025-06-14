# 🚀 GitHub Deployment Guide

Panduan lengkap untuk deploy **YouTube Analytics Pro** ke GitHub Pages dengan GitHub Actions.

## 📋 Prerequisites

- Akun GitHub
- Repository GitHub (public atau private dengan GitHub Pro)
- Git terinstall di komputer

## 🚀 Quick Deployment Steps

### 1. Create GitHub Repository

1. Buka [github.com](https://github.com)
2. Klik **"New repository"**
3. Repository name: `youtube-analytics-pro`
4. Description: `Platform analisis video YouTube profesional`
5. Set to **Public** (untuk GitHub Pages gratis)
6. ✅ Add README file
7. Klik **"Create repository"**

### 2. Clone & Setup Local Repository

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/youtube-analytics-pro.git
cd youtube-analytics-pro

# Copy semua file project ke folder ini
# (copy semua file dari project Bolt ke folder repository)

# Add semua file
git add .
git commit -m "Initial commit: YouTube Analytics Pro"
git push origin main
```

### 3. Enable GitHub Pages

1. Go to repository **Settings**
2. Scroll ke **Pages** section
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** (akan dibuat otomatis oleh GitHub Actions)
5. Folder: **/ (root)**
6. Klik **Save**

### 4. GitHub Actions akan Otomatis Deploy

Setelah push ke main branch:
1. GitHub Actions akan otomatis build aplikasi
2. Deploy ke branch `gh-pages`
3. GitHub Pages akan serve dari branch tersebut
4. URL akan tersedia di: `https://YOUR_USERNAME.github.io/youtube-analytics-pro`

## 🔧 Manual Deployment (Alternative)

Jika ingin deploy manual tanpa GitHub Actions:

```bash
# Build aplikasi
npm run build:web

# Install gh-pages package
npm install --save-dev gh-pages

# Add script ke package.json
"scripts": {
  "deploy": "gh-pages -d dist-web"
}

# Deploy
npm run deploy
```

## 📱 Access Your Deployed App

Setelah deployment berhasil:

**URL:** `https://YOUR_USERNAME.github.io/youtube-analytics-pro`

**Features:**
- ✅ HTTPS otomatis
- ✅ Global CDN
- ✅ Mobile responsive
- ✅ Auto-deploy saat push ke main
- ✅ Custom domain support

## 🎯 Custom Domain (Optional)

### Setup Custom Domain:

1. Beli domain (contoh: `youtubeanalytics.com`)
2. Add CNAME record di DNS:
   ```
   CNAME: www -> YOUR_USERNAME.github.io
   ```
3. Update file `CNAME` di repository:
   ```
   www.youtubeanalytics.com
   ```
4. Update `vite.config.ts`:
   ```typescript
   base: '/', // Untuk custom domain
   ```

## 🔧 Troubleshooting

### 1. GitHub Actions Gagal

Check **Actions** tab di repository untuk error details:
- Build errors: Fix di local, test dengan `npm run build:web`
- Permission errors: Check repository settings

### 2. 404 Error di GitHub Pages

- Pastikan `base: './'` di `vite.config.ts`
- Check file `_redirects` ada di `dist-web/`
- Pastikan branch `gh-pages` ada dan berisi file build

### 3. Routing Issues

Add file `404.html` di `public/` folder:
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // Redirect to index.html for SPA routing
    window.location.href = '/youtube-analytics-pro/';
  </script>
</head>
<body></body>
</html>
```

### 4. API Keys Not Working

- Pastikan menggunakan HTTPS URL
- Check browser console untuk CORS errors
- Verify API key permissions untuk domain GitHub Pages

## 📊 Monitoring & Analytics

### GitHub Insights:
- Repository **Insights** tab
- **Traffic** untuk visitor stats
- **Actions** untuk deployment history

### Performance:
- GitHub Pages otomatis menggunakan CDN
- Lighthouse score biasanya 90+
- Loading time < 3 detik

## 🚀 Continuous Deployment

Workflow yang sudah disetup akan:

1. **Trigger:** Setiap push ke `main` branch
2. **Build:** `npm run build:web`
3. **Deploy:** Upload ke `gh-pages` branch
4. **Live:** Otomatis update di GitHub Pages

### Update Aplikasi:
```bash
# Edit code
# Test local: npm run dev

# Deploy update
git add .
git commit -m "Update: description of changes"
git push origin main

# GitHub Actions akan otomatis deploy
```

## 🎉 Success Checklist

Setelah deployment berhasil:

- [ ] Repository created di GitHub
- [ ] Code pushed ke main branch
- [ ] GitHub Actions workflow running
- [ ] GitHub Pages enabled
- [ ] Site accessible di GitHub Pages URL
- [ ] All features working (login, search, export)
- [ ] Mobile responsive
- [ ] HTTPS working

## 📞 Support

Jika ada masalah:

1. Check **Actions** tab untuk build errors
2. Check **Issues** tab untuk known problems
3. Review **Settings > Pages** configuration
4. Test local build: `npm run build:web`

## 🌟 Benefits GitHub Pages

- ✅ **Free hosting** untuk public repositories
- ✅ **Custom domains** support
- ✅ **HTTPS** otomatis
- ✅ **Global CDN** untuk fast loading
- ✅ **Auto-deploy** dengan GitHub Actions
- ✅ **Version control** terintegrasi
- ✅ **Collaboration** features

**Ready to deploy! 🚀**