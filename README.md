# Senandung

Pemutar musik berbasis web dengan pencarian Audius, dukungan opsional untuk Jamendo, serta referensi chart Apple Music Indonesia. Koleksi pribadi dan playlist tersimpan di browser. Sumber audio menentukan ketersediaan setiap lagu.

## Menjalankan aplikasi

Gunakan Node.js 24 dan npm. Jalankan `npm ci`, buat file lokal `.env.local`, lalu isi `SENANDUNG_ACCESS_USER` dan `SENANDUNG_ACCESS_PASSWORD` dengan nama pengguna dan kata sandi acak unik sepanjang 24–256 karakter. `JAMENDO_CLIENT_ID` bersifat opsional. Simpan ketiga pengaturan sebagai variabel server pada host.

Jalankan `npm run dev` dan buka http://127.0.0.1:3000. Untuk produksi, jalankan `npm run build` dan `npm start` di belakang HTTPS. Untuk Vercel pilih Next.js, Node 24, dan Build Command `npm run build` agar seed SQLite berjalan sebelum kompilasi. Halaman dan API memerlukan login pribadi. Hapus data browser hanya jika siap kehilangan koleksi pada perangkat tersebut.

## Data dan atribusi

Seed membangun database katalog lokal dari manifest kosong. Pencarian, chart, sampul dan audio dimuat dari layanan sumber. Batas permintaan berlaku per proses. Halaman Kredit memuat atribusi provider, font, dan ikon. Lisensi font tersedia di `licenses/Inter-OFL.txt`.
