# Vauza Hotel POS - User Documentation

Documentation tutorial penggunaan web aplikasi Vauza Hotel POS.

## Daftar Isi
1. [Input Client](#1-input-client)
2. [Input Hotel](#2-input-hotel)
3. [Add Order (Reservation)](#3-add-order-reservation)
4. [Add Payment](#4-add-payment)
5. [Monitoring Nusuk Agreement](#5-monitoring-nusuk-agreement)
6. [Add CL Supplier](#6-add-cl-supplier)
7. [Edit CL & Print CL](#7-edit-cl--print-cl)
8. [Print Receipt](#8-print-receipt)

---

### 1. Input Client
**Menu:** `Clients`
1. Klik menu **Clients** di sidebar sebelah kiri.
2. Klik tombol **+ NEW CLIENT**.
3. Isi form yang tersedia:
   - **Nama Client**: Nama lengkap klien atau perusahaan.
   - **No HP / Telp**: Nomor kontak yang bisa dihubungi.
   - **Email**: Alamat email klien (opsional jika tidak ada).
4. Klik tombol **CREATE CLIENT** untuk menyimpan.
5. Client baru akan muncul di daftar tabel.

### 2. Input Hotel
**Menu:** `Hotels`
1. Klik menu **Hotels** di sidebar.
2. Klik tombol **+ NEW HOTEL**.
3. Isi detail hotel:
   - **Nama Hotel**: Nama properti hotel.
   - **Kota/Lokasi**: Lokasi hotel (Cth: Makkah, Madinah).
4. Klik **CREATE HOTEL** untuk menyimpan.

### 3. Add Order (Reservation)
**Menu:** `Reservations`
1. Klik menu **Reservations**.
2. Klik tombol **+ NEW RESERVATION**.
3. Lengkapi Form Reservasi:
   - **Reservation ID**: Masukkan `No RSV` secara manual (unik).
   - **Client**: Pilih client dari dropdown.
   - **Hotel**: Pilih hotel dari dropdown.
   - **Checkin & Checkout**: Pilih tanggal masuk dan keluar.
   - **Rooms & Rates**:
     - Masukkan jumlah kamar (`Qty`) dan harga per malam (`Rate`) untuk tipe kamar (Double, Triple, Quad, dll).
   - **Meal Type**: Pilih tipe makanan (Breakfast Only, Full Board, dll).
   - **Deadline Payment**: Tentukan tanggal jatuh tempo pembayaran.
4. Klik **CREATE RESERVATION**. Reservasi akan tersimpan dengan status `New`.

### 4. Add Payment
Untuk menambahkan pembayaran pada reservasi yang sudah ada:

**Menu:** `Reservations`
1. Cari reservasi di tabel **Reservations**.
2. Klik tombol **Edit** (ikon pensil) pada baris reservasi tersebut.
3. Di dalam modal Edit, cari kolom input **Add Payment (SAR)**.
4. Masukkan nominal pembayaran yang diterima.
5. Anda juga bisa mengubah **Status Payment** menjadi `PARTIAL` atau `FULL PAYMENT`.
6. Klik **SAVE CHANGES**.
7. Nominal `Paid (SAR)` di tabel akan bertambah.

### 5. Monitoring Nusuk Agreement
Fitur ini digunakan untuk memonitor status agreement di sistem Nusuk.

**Menu:** `Nusuk Agreement`
1. Klik menu **Nusuk Agreement**.
2. Anda akan melihat dashboard status agreement (Total, Active, Expired, Pending).
3. Gunakan filter atau pencarian untuk menemukan agreement tertentu.
4. Klik tombol **+ New Agreement** jika ingin mencatat agreement baru ke dalam sistem.

### 6. Add CL Supplier
**Menu:** `Supply Hotel` (atau Reservasi terkait supply)
Fitur ini biasanya digunakan untuk mencatat pesanan ke pihak Supplier/Hotel (Vendor).

1. Klik menu **Supply Hotel**.
2. Klik **+ NEW SUPPLY**.
3. Isi data supply:
   - **Supplier**: Pilih atau input nama supplier.
   - **Hotel**, **Check In/Out**, **Room Details**.
   - **Buying Rate**: Harga beli dari supplier.
4. Klik **SAVE**. Data ini penting untuk menghitung profit margin (Selisih harga jual di Reservasi vs harga beli di Supply).

### 7. Edit CL & Print CL (Confirmation Letter)
**Menu:** `Reservations`
Confirmation Letter (CL) adalah dokumen bukti pemesanan untuk diberikan kepada Client atau Hotel.

**Cara Edit CL:**
1. Di menu **Reservations**, klik ikon **Edit** pada reservasi yang diinginkan.
2. Pastikan semua data kamar dan tamu sudah benar.
3. Klik **SAVE CHANGES**.

**Cara Print CL:**
1. Di tabel **Reservations**, klik ikon **Printer** (Print CL) pada baris reservasi.
2. Halaman baru akan terbuka menampilkan format **Confirmation Letter**.
3. Periksa tampilan.
4. Klik tombol **PRINT PDF** di pojok kanan atas atau gunakan `Ctrl + P` / `Cmd + P`.
5. Simpan sebagai PDF atau cetak ke printer.

### 8. Print Receipt (Kwitansi Pembayaran)
**Menu:** `Overview Order` atau akses langsung dari Reservasi (Tergantung implementasi custom Anda).

*Jika melalui Overview Order:*
1. Klik menu **Overview Order**.
2. Cari nama Client.
3. Klik tombol **Print Report**.
4. Halaman ini akan menampilkan rekap semua pesanan client tersebut beserta status pembayarannya.
5. Untuk mencetak kwitansi spesifik per pembayaran, biasanya dilakukan saat input payment atau melalui fitur invoice terpisah jika tersedia.
   *(Catatan: Saat ini fitur Print Receipt sering digabungkan dengan Confirmation Letter atau Overview Report untuk rekap total tagihan).*

---
*Dokumen ini dibuat otomatis untuk referensi penggunaan sistem Vauza Hotel POS.*
