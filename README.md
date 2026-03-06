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

* **DESKTOP**
1. <img width="1919" height="943" alt="image" src="https://github.com/user-attachments/assets/86411f59-f1f1-425d-894f-71ae45c8b55b" />
2. <img width="1919" height="952" alt="image" src="https://github.com/user-attachments/assets/fb09c76f-4e15-4198-8e54-b05c39cace92" />
3. <img width="1919" height="952" alt="image" src="https://github.com/user-attachments/assets/6ee52615-2e8c-4ce2-a942-46d4015fcb5d" />

* **MOBILE**
1. <img width="720" height="1343" alt="image" src="https://github.com/user-attachments/assets/8fd012c6-a53b-4e6c-b7b4-09f20f2d6ba0" />
2. <img width="720" height="1346" alt="image" src="https://github.com/user-attachments/assets/4945d5c3-5b4f-477b-9a27-8a3e9e8f0973" />
3. <img width="720" height="1352" alt="image" src="https://github.com/user-attachments/assets/407170b6-d2ff-4fe9-9ab5-6aabccc1b493" />
4. <img width="720" height="1361" alt="image" src="https://github.com/user-attachments/assets/b0fc7862-8159-4ff6-8300-ca462efcffc3" />
5. <img width="720" height="1344" alt="image" src="https://github.com/user-attachments/assets/91e1f00f-7e33-4058-b51d-7e9eac67a754" />
6. <img width="720" height="1343" alt="image" src="https://github.com/user-attachments/assets/6d3fd151-c9a5-40c5-a26b-3f33a77da028" />

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
