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

Setelah langkah-langkah ini selesai, aplikasi Anda akan memiliki kecepatan muat yang sangat tinggi pada setiap kunjungan, termasuk yang pertama kali.
