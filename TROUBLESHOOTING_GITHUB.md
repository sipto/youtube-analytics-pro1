# 🔧 Troubleshooting GitHub Deployment

Panduan lengkap untuk mengatasi masalah umum saat deploy ke GitHub Pages.

## 🚨 Common Problems & Solutions

### 1. GitHub Actions Failed ❌

#### **Problem:** Red X di Actions tab, workflow gagal

#### **Diagnosis:**
```bash
# Check error di Actions tab
1. Go to repository → Actions
2. Click failed workflow
3. Click failed job
4. Read error message
```

#### **Common Solutions:**

**A. Build Error - Missing Dependencies**
```bash
Error: Cannot find module 'xyz'
```
**Solution:**
- Check `package.json` has all dependencies
- Add missing dependency: `npm install xyz`
- Commit and push updated `package.json`

**B. Build Error - Script Not Found**
```bash
Error: npm ERR! missing script: build:web
```
**Solution:**
- Add script to `package.json`:
```json
{
  "scripts": {
    "build:web": "vite build --outDir dist-web"
  }
}
```

**C. Permission Error**
```bash
Error: Permission denied
```
**Solution:**
- Go to Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"

---

### 2. Website Shows 404 Error 🚫

#### **Problem:** `https://username.github.io/repo-name` shows 404

#### **Diagnosis:**
```bash
1. Check if gh-pages branch exists
2. Check if index.html exists in gh-pages
3. Check GitHub Pages settings
```

#### **Solutions:**

**A. GitHub Pages Not Enabled**
- Go to Settings → Pages
- Set Source to "Deploy from a branch"
- Set Branch to "gh-pages"
- Set Folder to "/ (root)"

**B. Wrong Branch Selected**
- Ensure `gh-pages` branch is selected
- If `gh-pages` doesn't exist, re-run GitHub Actions

**C. Propagation Delay**
- Wait 10-20 minutes for DNS propagation
- Clear browser cache (Ctrl+F5)
- Try incognito/private browsing

**D. Wrong Base Path**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: './', // For GitHub Pages
  build: {
    outDir: 'dist-web',
  },
});
```

---

### 3. Routing Issues (SPA Problems) 🔄

#### **Problem:** Direct URLs return 404, only homepage works

#### **Solutions:**

**A. Add _redirects File**
Create `dist-web/_redirects`:
```
/*    /index.html   200
```

**B. Add 404.html**
Create `public/404.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <script>
    window.location.href = '/repo-name/';
  </script>
</head>
<body>Redirecting...</body>
</html>
```

**C. Update Router Base**
In React Router setup:
```typescript
<Router basename="/repo-name">
  {/* routes */}
</Router>
```

---

### 4. API Keys Not Working 🔑

#### **Problem:** Login fails, search doesn't work

#### **Diagnosis:**
```bash
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
```

#### **Solutions:**

**A. HTTPS Required**
- Ensure using `https://` not `http://`
- GitHub Pages automatically provides HTTPS

**B. CORS Issues**
- YouTube API requires HTTPS for browser requests
- Check API key permissions in Google Cloud Console

**C. API Key Restrictions**
- Go to Google Cloud Console
- APIs & Services → Credentials
- Edit API key → Application restrictions
- Add GitHub Pages domain: `username.github.io`

**D. Environment Variables**
For sensitive API keys, use GitHub Secrets:
```yaml
# In .github/workflows/deploy.yml
env:
  VITE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
```

---

### 5. Slow Loading Performance 🐌

#### **Problem:** Website loads slowly

#### **Solutions:**

**A. Optimize Images**
```bash
# Compress images before upload
# Use WebP format
# Resize large images
```

**B. Remove Unused Dependencies**
```bash
npm run build:web
# Check bundle size in dist-web/
# Remove unused packages from package.json
```

**C. Enable Compression**
Add to `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
```

---

### 6. Mobile Responsive Issues 📱

#### **Problem:** Website doesn't work well on mobile

#### **Solutions:**

**A. Viewport Meta Tag**
Ensure in `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

**B. CSS Media Queries**
Check Tailwind responsive classes:
```css
/* Mobile first approach */
.class { /* mobile styles */ }
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

**C. Touch Interactions**
```css
/* Improve touch targets */
button {
  min-height: 44px;
  min-width: 44px;
}
```

---

### 7. Dark Mode Not Working 🌙

#### **Problem:** Theme toggle doesn't work

#### **Solutions:**

**A. Check Tailwind Dark Mode**
In `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ...
}
```

**B. Verify Theme Context**
Check if ThemeProvider wraps the app:
```typescript
<ThemeProvider>
  <App />
</ThemeProvider>
```

**C. LocalStorage Persistence**
Ensure theme persists across page reloads:
```typescript
useEffect(() => {
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
}, []);
```

---

### 8. Build Size Too Large 📦

#### **Problem:** Build takes too long or fails due to size

#### **Solutions:**

**A. Analyze Bundle Size**
```bash
npm run build:web
npx vite-bundle-analyzer dist-web
```

**B. Code Splitting**
```typescript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

**C. Remove Dev Dependencies**
```bash
# Don't include dev dependencies in production
npm install --production
```

---

### 9. Custom Domain Issues 🌐

#### **Problem:** Custom domain not working

#### **Solutions:**

**A. DNS Configuration**
```
Type: CNAME
Name: www
Value: username.github.io
TTL: 3600
```

**B. GitHub Settings**
- Settings → Pages → Custom domain
- Enter: `www.yourdomain.com`
- ✅ Enforce HTTPS

**C. CNAME File**
Create `public/CNAME`:
```
www.yourdomain.com
```

---

### 10. Search Console Errors 🔍

#### **Problem:** Google Search Console shows errors

#### **Solutions:**

**A. Add Sitemap**
Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://username.github.io/repo-name/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**B. Add robots.txt**
Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://username.github.io/repo-name/sitemap.xml
```

---

## 🛠️ Debugging Tools

### Browser DevTools
```bash
F12 → Console: Check for JavaScript errors
F12 → Network: Check failed requests
F12 → Application: Check localStorage/cookies
F12 → Lighthouse: Performance audit
```

### GitHub Tools
```bash
Actions Tab: Check build logs
Settings → Pages: Verify configuration
Insights → Traffic: Monitor visitors
Issues Tab: Track problems
```

### External Tools
```bash
GTmetrix: Performance testing
PageSpeed Insights: Google performance audit
SSL Labs: HTTPS security check
DNS Checker: Domain propagation
```

---

## 📞 Getting Help

### 1. GitHub Community
- [GitHub Community Forum](https://github.community/)
- Search existing discussions
- Ask specific questions with error logs

### 2. GitHub Docs
- [GitHub Pages Documentation](https://docs.github.com/pages)
- [GitHub Actions Documentation](https://docs.github.com/actions)

### 3. Stack Overflow
- Tag questions with: `github-pages`, `github-actions`, `vite`
- Include error messages and relevant code

### 4. Create Issue
- In your repository: Issues → New Issue
- Include:
  - Error message
  - Steps to reproduce
  - Browser/OS information
  - Screenshots if helpful

---

## ✅ Prevention Checklist

To avoid common issues:

- [ ] Test build locally before pushing
- [ ] Use consistent file naming (lowercase, no spaces)
- [ ] Keep dependencies updated
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness
- [ ] Check console for errors regularly
- [ ] Monitor GitHub Actions status
- [ ] Keep repository organized

---

**Remember:** Most deployment issues are fixable! Take your time, read error messages carefully, and don't hesitate to ask for help. 🚀**