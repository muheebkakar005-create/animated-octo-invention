# 🏥 AHSAN Pharmacy POS & Inventory Management System

> **A luxury, 100% offline, mobile-first Point of Sale (POS) and Multi-Category Inventory Management Suite with Android APK support.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/muheebkakar005-create/animated-octo-invention)
[![Platform](https://img.shields.io/badge/Platform-Web%20PWA%20%7C%20Android%20APK-emerald)](https://github.com/muheebkakar005-create/animated-octo-invention)
[![Offline](https://img.shields.io/badge/Database-100%25%20Offline%20IndexedDB-gold)](https://github.com/muheebkakar005-create/animated-octo-invention)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

---

## 📋 Overview

**AHSAN Pharmacy POS** is a modern retail and pharmacy management system designed specifically for mobile touchscreens, tablets, and desktop browsers. Built with zero external CDN dependencies, it functions **completely offline** using browser-native **IndexedDB** storage and compiles directly into a native **Android APK**.

Whether managing a small local pharmacy, general store, or large wholesale medical store with 10,000+ items, the system guarantees instant performance, real-time prefix-priority auto-search, and formatted thermal receipt printing.

---

## ✨ Key Features

### 1. 💾 100% Offline-First Architecture
- **Persistent Local Database:** Backed by **IndexedDB** with fallback support.
- **Zero Cloud Dependence:** Works in remote areas without internet or network connectivity.
- **One-Click Backup & Restore:** Export full encrypted `.JSON` store backups and transfer between devices.
- **CSV Data Export:** Export monthly/yearly sales performance and inventory ledgers into Excel-compatible CSVs.

### 2. 🎨 Luxury Mobile-First UI & Dual Themes
- **2-Tier App Header:** Clean architecture separating brand titles from quick action controls to prevent text crowding on compact screens.
- **Dual Luxury Palettes:**
  - **Light Mode:** Earthy Warm Sage, Taupe, and Sand (`#D6C7AE`).
  - **Night Mode:** Deep Obsidian (`#0B0908`), Espresso surfaces, and Champagne Gold accents (`#D4AF37`).
- **Vector SVG System:** Razor-sharp inline vector SVG icons across all buttons, cards, and bottom navigation.
- **Fixed Mobile Bottom Navigation:** Smooth tab switching (*Dashboard, Sell POS, Stock, History, Settings*).

### 3. 🔍 Smart Prefix-Priority Auto-Search
- **Instant Search Algorithm:** Typing any letter (e.g., `"I"`, `"Panadol"`, `"Pampers"`) immediately bubbles matching items to the **top of the screen**.
- **Keyboard / Barcode Scanner Ready:** Smooth integration with USB and Bluetooth barcode scanners.
- **Live Search Highlighting:** Visual `<mark>` highlight tags on query matches.

### 4. 📦 Multi-Category Inventory Management
Supports both unit-based and fractional blister/strip packaging across multiple retail categories:
- 💊 **Medicines & Tablets** (Fractional breakdown: Box $\rightarrow$ Strips $\rightarrow$ Loose Tablets)
- 👶 **Baby Care & Pampers** (Diapers, Baby wipes, Lotions)
- 🧴 **Cosmetics & Creams** (Face wash, Fair & Lovely, Moisturizers, Oils)
- 🧼 **Soaps & Body Hygiene** (Lifebuoy, Dettol, Lux, Shampoos)
- 🧪 **Syrups & Suspensions** (Cough syrups, Oral drops, Suspensions)
- 🩹 **Surgical & FMCG** (Syringes, Cannulas, Bandages, Cotton)

### 5. 🚀 10,000 Sample Product Database Generator
- Built-in generator producing **10,000 realistic Pakistani market products** with PKR pricing, lot batches, and multi-year expiry dates.
- High-performance pagination rendering 50 items per page with zero UI lag.

### 6. 🧾 POS Billing & Thermal Receipt Printing
- Instant cart calculations with live subtotal, custom percentage discounts, and net payable grand total.
- Multi-Payment support: **Cash**, **Credit Card**, **EasyPaisa / JazzCash**, and **Credit (Udhar)**.
- ESC/POS standard **58mm and 80mm thermal receipt printer** templates with automatic print triggering.

### 7. 📊 Dashboard Analytics & Alerts
- Real-time lifetime gross sales, net profit, profit margin percentage, and inventory retail vs. cost valuations.
- Automated alert banners for **expired medicines** and **near-expiry products ($\le 90$ days)**.
- Master PIN protection to lock POS screens during counter shifts.

---

## 🗂️ Project Structure

```
├── AHSAN_Pharmacy_POS.apk    # Pre-compiled standalone Android APK (~11.9 MB)
├── index.html                # Main application entry point (PWA & Web)
├── Pharmise mangment system.html # Standalone offline mirror
├── manifest.json             # PWA Web App Manifest
├── sw.js                     # Offline Service Worker cache engine
│
├── css/
│   ├── main.css              # Theme system (Light Sage / Dark Obsidian) & typography
│   ├── mobile.css            # Mobile bottom nav, auto-search popup, modals
│   └── print.css             # 58mm / 80mm thermal receipt & A4 bill print stylesheets
│
├── js/
│   ├── app.js                # Main application coordinator & route controller
│   ├── db.js                 # IndexedDB offline storage & backup engine
│   ├── generator.js          # 10,000 sample product database generator
│   ├── inventory.js          # Multi-category stock ledger & pagination
│   ├── pos.js                # Billing, cart management & prefix search
│   ├── dashboard.js          # Analytics metrics, profit calculations & alerts
│   └── settings.js           # Store profile, receipt footer & PIN security
│
└── android-app/              # Native Android Studio Gradle Project
    ├── app/                  # Android native module with WebView & PrintManager
    └── gradlew.bat           # Android build wrapper
```

---

## 🚀 Getting Started

### Method 1: Run in Browser (Zero Installation)
1. Clone the repository:
   ```bash
   git clone https://github.com/muheebkakar005-create/animated-octo-invention.git
   cd animated-octo-invention
   ```
2. Open `index.html` in any web browser (Chrome, Edge, Safari, Firefox).
3. Tap **"Load 10,000 Sample Products Database"** in Settings or add your own items.

### Method 2: Install as Android App (APK)
1. Download [AHSAN_Pharmacy_POS.apk](AHSAN_Pharmacy_POS.apk) directly from this repository.
2. Transfer the `.apk` file to your Android phone or tablet.
3. Tap the file to install (*enable "Install from Unknown Sources" if requested*).
4. Launch **AHSAN Pharmacy** from your home screen.

### Method 3: Build Android APK from Source
Ensure you have **JDK 17+** and **Android SDK 34+** installed:
```bash
cd android-app
gradlew.bat assembleDebug
```
The compiled APK will be output to `android-app/app/build/outputs/apk/debug/app-debug.apk`.

---

## ⚙️ Configuration & Customization

| Setting | Location | Description |
| :--- | :--- | :--- |
| **Pharmacy Name** | Settings Tab / `js/settings.js` | Change store name printed on receipts |
| **Store Phone & Address** | Settings Tab / `js/settings.js` | Update location and contact info |
| **Master Security PIN** | Settings Tab / `js/settings.js` | Set numeric PIN to lock POS screen |
| **Theme Toggle** | Top Header Button | Switch between Light (Sage) and Dark (Obsidian) |

---

## 👨‍💻 Author & Support

- **Lead Developer:** Muheeb Kakar
- **Contact / WhatsApp:** `+92 316 6829982`
- **Location:** Quetta, Balochistan, Pakistan
- **Repository:** [muheebkakar005-create/animated-octo-invention](https://github.com/muheebkakar005-create/animated-octo-invention)

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
