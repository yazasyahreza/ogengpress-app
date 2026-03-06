# 🏍️ Ogeng Press - Smart POS & Inventory System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Electron](https://img.shields.io/badge/Electron-2B2E3A?style=for-the-badge&logo=electron&logoColor=9FEAF9)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

Ogeng Press Management System adalah aplikasi Kasir (Point of Sales) dan Manajemen Gudang khusus yang dibangun untuk memodernisasi pembukuan bengkel motor. 

Sistem ini dirancang untuk mengatasi masalah bengkel tradisional: **Sistem harus tetap berjalan tanpa kuota internet**, dan **Owner bengkel bisa memantau laba bersih secara terpisah dari kasir depan**.

---

## ✨ Fitur Utama (Key Features)

* **💻 Dual-Interface System:** Aplikasi Desktop (Electron) untuk Kasir Utama, dan Aplikasi Web Mobile (React) untuk akses Owner/Kasir di area gudang.
* **📡 Local Intranet Mode:** Sinkronisasi data antara PC dan HP secara *real-time* menggunakan jaringan Wi-Fi lokal tanpa memerlukan akses internet/cloud.
* **🤖 AI Mechanic Assistant:** Integrasi dengan Google Gemini AI untuk membantu pencarian spesifikasi sparepart motor dan identifikasi visual (mengenali barang lewat foto).
* **⚡ Optimistic UI Updates:** Memberikan pengalaman interaksi tanpa *loading* di aplikasi mobile saat mengelola data gudang.
* **📊 Laba Bersih & Analitik:** Pemisahan akses antara harga modal (rahasia owner) dan harga jual (publik kasir), lengkap dengan grafik perbandingan bulanan.

---

## 📸 Tampilan Aplikasi
<img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/86411f59-f1f1-425d-894f-71ae45c8b55b" />


> **Note:** (Silakan ganti link di bawah ini dengan link screenshot aplikasi Bos yang sebenarnya. Cara mudahnya: *drag & drop* gambar langsung ke area text editor GitHub ini).

| Desktop POS (Kasir) | Mobile Web (Gudang & Owner) |
| :---: | :---: |
| ![Kasir PC](link_gambar_kasir_pc_di_sini) | ![Gudang Mobile](link_gambar_gudang_hp_di_sini) |

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
