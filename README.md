# 🏍️ Ogeng Press - Smart POS & Inventory System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

Ogeng Press Management System adalah aplikasi Kasir (Point of Sales) dan Manajemen Gudang khusus yang dibangun untuk memodernisasi pembukuan bengkel motor. 

Sistem ini dirancang untuk mengatasi masalah bengkel tradisional: **Sistem harus tetap berjalan tanpa kuota internet**, **Owner bengkel bisa memantau laba bersih secara terpisah dari kasir depan**, **Pencatatan laporan & stok yang sangat rapi**, **Dilengkapi dengan penggunaan Scanner pada kasir**, dan **Fitur AI yang mempermudah mekanik**.

---

## ✨ Fitur Utama (Key Features)

* **💻 Dual-Interface System:** Aplikasi Desktop (Electron) untuk Kasir Utama, dan Aplikasi Web Mobile (React) untuk akses Owner/Kasir di area gudang.
* **📡 Local Intranet Mode:** Sinkronisasi data antara PC dan HP secara *real-time* menggunakan jaringan Wi-Fi lokal tanpa memerlukan akses internet/cloud.
* **🏷️ Barcode Scanner Ready:** Mempercepat proses transaksi di Kasir PC dengan dukungan alat *scanner barcode* fisik dan fitur *Smart Search* untuk input barang instan.
* **🤖 AI Mechanic Assistant:** Integrasi dengan Google Gemini AI untuk membantu pencarian spesifikasi sparepart motor dan identifikasi visual (mengenali barang lewat foto).
* **⚡ Optimistic UI Updates:** Memberikan pengalaman interaksi tanpa *loading* di aplikasi mobile saat mengelola data gudang.
* **📊 Laba Bersih & Analitik:** Pemisahan akses antara harga modal (rahasia owner) dan harga jual (publik kasir), lengkap dengan grafik perbandingan bulanan.

---

## 📸 Tampilan Aplikasi

| Desktop | Mobile |
| :---: | :---: |
| ![Kasir PC] Dilengkapi Dengan Penggunaan Scanner<img width="1919" height="955" alt="image" src="https://github.com/user-attachments/assets/d5c640d9-87f3-4144-997e-aa027ad7c37a" /><br><br> ![Laporan PC] Tampilan Grafik Total Bulanan <img width="1919" height="944" alt="image" src="https://github.com/user-attachments/assets/d85d712f-c576-41de-ba58-ff83749b66ba" /> | ![Gudang Mobile] Tombol robot(AI) yang bisa di pindah-pindah <img width="720" height="1358" alt="image" src="https://github.com/user-attachments/assets/5bb67fd0-a439-4c07-8fac-b97429043795" /><br><br> ![Laporan Mobile] Tampilan Laporan Real Time <img width="720" height="1342" alt="image" src="https://github.com/user-attachments/assets/ed018501-e2ae-4173-b6c9-e5b85df3187e" /> | 

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

* **Frontend:** React.js, TypeScript, Vite
* **Desktop Wrapper:** Electron.js
* **Backend / Local Server:** Node.js, Express.js
* **Database:** SQLite (Better-SQLite3)
* **AI Integration:** Google Generative AI (Gemini 2.5 Flash)

---

## 🚀 Cara Menjalankan Aplikasi Lokal (Installation)

1. Clone repository ini:
   ```bash
   git clone [https://github.com/username-bos/ogengpress-app.git](https://github.com/username-bos/ogengpress-app.git)
2. Masuk ke direktori project:
   ```bash
   cd ogengpress-app
3. Install dependencies:
   ```bash
   npm install
4. Buat file .env di root folder dan masukkan API Key Gemini Anda:
   ```bash
   GEMINI_API_KEY=masukkan_api_key_gemini_anda_disini
5. Jalankan aplikasi (Development mode):
   ```bash
   npm run dev

Dibuat oleh Mochammad Syahreza Muslim - Didedikasikan untuk memajukan UMKM Bengkel Indonesia.
