Langkah-Langkah Final untuk Aktivasi Optimasi
Sistem otomatisasi dan optimasi kecepatan sekarang hampir siap. Anda hanya perlu melakukan satu langkah konfigurasi terakhir di repositori GitHub Anda.

1. Dapatkan URL Web App yang Benar
Pastikan Anda telah men-deploy ulang skrip Code.gs Anda dengan perubahan terbaru. Setelah itu, dapatkan URL Web App Anda. URL tersebut akan terlihat seperti ini:

https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec

Tambahkan parameter ?action=getInitialData di akhir URL tersebut. URL lengkap yang akan Anda gunakan untuk sinkronisasi adalah:

https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec?action=getInitialData

2. Tambahkan URL sebagai "Secret" di GitHub
Ini adalah langkah paling penting untuk menjaga URL Anda tetap aman.

Buka repositori GitHub Anda.

Klik pada tab Settings.

Di menu sebelah kiri, navigasi ke Secrets and variables > Actions.

Klik tombol New repository secret.

Untuk Name, masukkan GAS_URL_FOR_SYNC (nama ini harus persis sama dengan yang ada di file sync_data.yml).

Untuk Secret, tempel (paste) URL lengkap yang Anda siapkan di Langkah 1.

Klik Add secret.

Selesai! Bagaimana Cara Kerjanya Sekarang?
Secara Otomatis: Setiap 6 jam, GitHub Actions akan berjalan, mengambil data terbaru dari Google Sheet Anda, dan memperbarui file data.json di repositori.

Secara Manual: Jika Anda baru saja mengubah data di Google Sheet dan ingin segera melihat perubahannya, Anda bisa memicu alur kerja ini secara manual:

Pergi ke tab Actions di repositori Anda.

Pilih workflow "Sinkronisasi Data dari Google Sheet".

Klik tombol Run workflow.

Bagaimana Saya Tahu Sistem Ini Berjalan?
Ada dua cara utama untuk memastikan sistem sinkronisasi otomatis Anda berfungsi:

1. Cek Log Eksekusi di Tab "Actions"
Ini adalah cara paling pasti untuk melihat apakah alur kerja (workflow) berjalan sesuai jadwal.

Buka repositori GitHub Anda dan klik tab Actions.

Di sisi kiri, Anda akan melihat nama alur kerja: "Sinkronisasi Data dari Google Sheet". Klik di situ.

Anda akan melihat daftar setiap eksekusi yang telah dijalankan. Eksekusi yang berhasil akan memiliki tanda centang hijau (✅). Jika gagal, akan ada tanda silang merah (❌).

Anda bisa mengklik salah satu eksekusi untuk melihat detail log langkah demi langkah, yang sangat berguna untuk troubleshooting jika terjadi masalah.

2. Cek Riwayat Commit
Jika sinkronisasi berhasil dan ada perubahan data, bot GitHub Actions akan secara otomatis membuat commit baru.

Pergi ke halaman utama repositori Anda (tab Code).

Di atas daftar file, ada tautan yang menunjukkan jumlah commit. Klik di situ.

Cari commit dengan pesan: "chore: Sinkronisasi data otomatis dari Google Sheet". Jika Anda melihat commit ini, itu artinya prosesnya telah berhasil berjalan dan memperbarui file data.json.

Setelah langkah-langkah ini selesai, aplikasi Anda akan memiliki kecepatan muat yang sangat tinggi pada setiap kunjungan, termasuk yang pertama kali.

Troubleshooting
Error: Permission denied to github-actions[bot] (Error 403)

Jika alur kerja Anda gagal pada langkah "Commit and push" dengan pesan error Permission denied atau 403, itu berarti bot Actions tidak memiliki izin untuk menulis file data.json kembali ke repositori Anda.

Solusi: Ubah izin alur kerja di pengaturan repositori.

Pergi ke tab Settings di repositori Anda.

Di menu kiri, pilih Actions > General.

Gulir ke bawah ke bagian "Workflow permissions".

Pilih opsi "Read and write permissions".

Klik Save.

Setelah menyimpan, jalankan kembali alur kerja secara manual dari tab Actions.
