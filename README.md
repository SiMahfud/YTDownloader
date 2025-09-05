# YTDownloader

Selamat datang di YTDownloader! Ini adalah aplikasi web sederhana yang memungkinkan Anda untuk mengunduh video dari YouTube dan mengonversinya ke format lain seperti MP3, langsung dari browser Anda.

## Fitur Utama

*   **Unduh Video:** Cukup tempelkan URL video YouTube untuk mengunduhnya dalam berbagai pilihan kualitas.
*   **Konversi ke Audio:** Ekstrak dan unduh audio dari video dalam format MP3, cocok untuk playlist musik.
*   **Antarmuka Web Sederhana:** Tidak perlu instalasi yang rumit, antarmuka yang bersih dan mudah digunakan.

## Teknologi yang Digunakan

*   **Backend:** Node.js, Express.js
*   **Frontend:** HTML, CSS, JavaScript (Vanilla)
*   **Core Libraries:**
    *   `ytdl-core`: Untuk mengambil stream dan informasi video dari YouTube.
    *   `fluent-ffmpeg`: Untuk memproses dan mengonversi file video/audio.

## Prasyarat

Sebelum memulai, pastikan sistem Anda telah memenuhi prasyarat berikut:
*   [Node.js](https://nodejs.org/) (disarankan versi 14 atau lebih baru).
*   [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js).
*   **`ffmpeg`**: Sangat penting untuk fitur konversi. Unduh dari [situs resminya](https://ffmpeg.org/download.html) dan pastikan path eksekusinya terdaftar di *environment variable* sistem Anda agar bisa diakses dari terminal.

## Instalasi

1.  Clone repositori ini ke mesin lokal Anda.
    ```sh
    git clone https://github.com/SiMahfud/YTDownloader.git
    ```

2.  Masuk ke direktori proyek:
    ```sh
    cd YTDownloader
    ```

3.  Instal semua dependensi yang diperlukan dari `package.json`:
    ```sh
    npm install
    ```

## Penggunaan

1.  Jalankan server aplikasi dari direktori root proyek:
    ```sh
    npm start
    ```
    Perintah ini akan menjalankan `node index.js`.

2.  Buka browser favorit Anda dan akses alamat berikut:
    ```
    http://localhost:3000
    ```
    *(Port default adalah 3000. Anda bisa mengubahnya di dalam file `index.js` jika diperlukan).*

3.  Di halaman web, tempelkan URL video YouTube, pilih format yang diinginkan, dan klik tombol "Unduh". File hasil unduhan akan disimpan di direktori `output`.

## Struktur Proyek

```
YTDownloader/
├── node_modules/   # Direktori dependensi Node.js
├── output/         # Tempat menyimpan file video/audio hasil unduhan
├── temp/           # Direktori sementara untuk proses konversi
├── .gitignore      # Mengabaikan file/folder yang tidak perlu dilacak Git
├── converter.js    # Logika untuk menangani konversi file menggunakan ffmpeg
├── index.html      # Halaman antarmuka utama untuk pengguna
├── index.js        # Server Express utama, menangani routing dan logika unduhan
├── package.json    # Informasi proyek dan daftar dependensi
└── README.md       # Dokumentasi yang sedang Anda baca
```

## Kontribusi

Kontribusi untuk pengembangan proyek ini sangat diterima! Jika Anda ingin berkontribusi, silakan ikuti langkah-langkah berikut:

1.  **Fork** repositori ini.
2.  Buat **Branch** baru untuk fitur Anda (`git checkout -b fitur/NamaFiturBaru`).
3.  **Commit** perubahan yang Anda buat (`git commit -m '''Menambahkan FiturBaru'''`).
4.  **Push** ke branch tersebut (`git push origin fitur/NamaFiturBaru`).
5.  Buka **Pull Request**.

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi ISC](https://opensource.org/licenses/ISC).
