# 🏍️ Ogeng Press - Smart POS & Inventory System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

Ogeng Press Management System adalah aplikasi Kasir (Point of Sales) dan Manajemen Gudang khusus yang dibangun untuk memodernisasi pembukuan bengkel motor. 

Sistem ini dirancang untuk mengatasi masalah bengkel tradisional: **Sistem harus tetap berjalan tanpa kuota internet**, **Owner bengkel bisa memantau laba bersih secara terpisah dari kasir depan**, **Pembukuan laporan yang sangat rapi**, dan **Fitur AI yang mempermudah mekanik**.

---

## ✨ Fitur Utama (Key Features)

* **💻 Dual-Interface System:** Aplikasi Desktop (Electron) untuk Kasir Utama, dan Aplikasi Web Mobile (React) untuk akses Owner/Kasir di area gudang.
* **📡 Local Intranet Mode:** Sinkronisasi data antara PC dan HP secara *real-time* menggunakan jaringan Wi-Fi lokal tanpa memerlukan akses internet/cloud.
* **🤖 AI Mechanic Assistant:** Integrasi dengan Google Gemini AI untuk membantu pencarian spesifikasi sparepart motor dan identifikasi visual (mengenali barang lewat foto).
* **⚡ Optimistic UI Updates:** Memberikan pengalaman interaksi tanpa *loading* di aplikasi mobile saat mengelola data gudang.
* **📊 Laba Bersih & Analitik:** Pemisahan akses antara harga modal (rahasia owner) dan harga jual (publik kasir), lengkap dengan grafik perbandingan bulanan.

---

## 📸 Tampilan Aplikasi

| Desktop POS (Kasir) | Mobile Web (Gudang & Owner) |
| :---: | :---: |
| ![Kasir PC](<img width="1919" height="944" alt="image" src="https://github.com/user-attachments/assets/add4e225-bb78-4d8f-ae58-085d6e375552" />
) | ![Gudang Mobile](<img width="720" height="1361" alt="image" src="https://github.com/user-attachments/assets/8d134047-994f-4644-9509-ed20df25213b" />
) |

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
