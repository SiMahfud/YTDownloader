const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Memberitahu fluent-ffmpeg di mana lokasi binary ffmpeg dari paket ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegStatic);

// Tentukan path untuk folder input dan output
const inputFolder = './src';
const outputFolder = './output';

// Pastikan folder output ada
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Baca semua file di dalam folder input
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error("Tidak dapat membaca folder sumber:", err);
        return;
    }

    console.log(`Menemukan ${files.length} file untuk dikonversi.`);

    files.forEach(file => {
        const inputFile = path.join(inputFolder, file);
        const outputFile = path.join(outputFolder, `${path.parse(file).name}.mp4`); // Mengubah ekstensi ke .mp4

        console.log(`Memulai konversi: ${file} -> ${path.basename(outputFile)}`);

        ffmpeg(inputFile)
            .toFormat('mp4') // Tentukan format output di sini
            .videoCodec('libx264') // Atur codec video ke H.264 untuk kompatibilitas luas
            .audioCodec('aac') // Atur codec audio ke AAC
            .outputOptions('-pix_fmt yuv420p') // Atur format piksel untuk kompatibilitas player
            .on('end', () => {
                console.log(`Selesai konversi: ${file}`);
            })
            .on('error', (err) => {
                console.error(`Error saat konversi ${file}:`, err.message);
            })
            .save(outputFile);
    });
});