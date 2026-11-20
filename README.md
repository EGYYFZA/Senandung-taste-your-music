# Senandung

Senandung adalah pemutar musik pribadi untuk rilisan independen Indonesia. Kamu bisa memutar album dari katalog, mendengarkan cuplikan Apple Music di beranda, dan menambahkan lagu dari tautan YouTube ke playlist. Pemutaran YouTube mengikuti izin sematan pemilik video.

## Menjalankan aplikasi

Gunakan Node.js 24 dan npm. Jalankan `npm ci --ignore-scripts`, buat file lokal `.env.local`, lalu isi `SENANDUNG_ACCESS_USER` dan `SENANDUNG_ACCESS_PASSWORD` dengan nama pengguna dan kata sandi acak unik sepanjang 24–256 karakter. Pada host, simpan kedua nilai sebagai variabel server. Gunakan `/login` untuk masuk.

Jalankan `npm run dev` dan buka http://127.0.0.1:3000. Untuk produksi, jalankan `npm run build` dan `npm start` di belakang HTTPS. Untuk Vercel pilih Next.js, Node 24, dan Build Command `npm run build` agar seed SQLite berjalan sebelum kompilasi. Halaman dan API memerlukan login pribadi. Hapus data browser hanya jika siap kehilangan koleksi pada perangkat tersebut.

## Data dan atribusi

Katalog pencarian membaca metadata dari `data/indonesian-releases.json`. Audio bersumber dari rilis Yes No Wave Music untuk pemutaran nonkomersial. Saat pengguna memilih cuplikan atau video, browser memuat pemutar resmi penyedia. Koleksi pribadi dan playlist tersimpan di browser. Halaman Kredit memuat atribusi penyedia, font, dan ikon. Lisensi font tersedia di `licenses/Inter-OFL.txt`.
