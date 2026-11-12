# KudiCart Driver Partner App — Dependency & Reproducible Environment Guide

## 1. Runtime Standardization
- **Node.js:** `>=20.0.0 <23.0.0` (LTS, recommended: `v22.17.0`)
- **npm:** `>=10.0.0` (Pinned: `10.9.2`)
- **Framework:** React Native 0.72.6, React 18.2.0, Vite 8.3.0
- **Android Runtime:** Java 17 LTS (Corretto / OpenJDK 17), Android SDK Build-Tools 33.0.0/34.0.0
- **Configuration Files:** `.nvmrc`, `.node-version`, `.npmrc`, `package.json`

## 2. Port Architecture
- **Web App Port:** `3002` (prevents collision with Admin on 3000 and Backend on 3001)
- **Metro Bundler Port:** `8081`

## 3. First-Time Setup
```bash
npm ci
npm run validate:deps
```

## 4. Normal Daily Development
```bash
# Web preview
npm run web

# Android React Native start
npm run start
```
Do **not** run `npm install` on normal daily startup.

## 5. Adding/Updating Dependencies
```bash
npm install <package-name>
npm run validate:deps
npm run build
git add package.json package-lock.json
git commit -m "feat(deps): add <package-name>"
```
Colleague pulls and installs via:
```bash
git pull
npm ci
```

