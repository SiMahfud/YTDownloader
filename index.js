const express = require('express');
const fs = require('fs');
const path = require('path');
const { YtDlp } = require('ytdlp-nodejs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const cookieParser = require('cookie-parser');

// Setup basic express server
const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Beri tahu fluent-ffmpeg lokasi binary ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Tentukan folder-folder yang akan digunakan
const outputFolder = './output';
const srcFolder = './src';

// Pastikan semua folder yang dibutuhkan ada
[outputFolder, srcFolder, 'temp'].forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
});

// Inisialisasi ytdlp
const ytdlp = new YtDlp({ ffmpegPath: ffmpegStatic });

// Variabel untuk menampung koneksi SSE
let sseClient = null;

// Fungsi untuk mengirim pesan ke client melalui SSE
function sendSseMessage(message) {
    if (sseClient) {
        sseClient.write(`data: ${JSON.stringify(message)}\n\n`);
    }
}

// Sajikan folder output secara statis
app.use('/output', express.static(outputFolder));

// API untuk mendapatkan daftar file milik client
app.get('/api/files', (req, res) => {
    const files = req.cookies.files ? JSON.parse(req.cookies.files) : [];
    res.json(files);
});

// API untuk menghapus file
app.post('/api/delete', (req, res) => {
    const { filename } = req.body;
    if (!filename) {
        return res.status(400).send('Filename is required.');
    }

    const currentFiles = req.cookies.files ? JSON.parse(req.cookies.files) : [];
    
    if (currentFiles.includes(filename)) {
        const filePath = path.join(outputFolder, filename);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
                return res.status(500).send('Failed to delete file.');
            }

            const updatedFiles = currentFiles.filter(f => f !== filename);
            res.cookie('files', JSON.stringify(updatedFiles), { maxAge: 900000 * 30, httpOnly: true });
            res.status(200).send('File deleted successfully.');
        });
    } else {
        res.status(403).send('You do not have permission to delete this file.');
    }
});


// Halaman utama untuk menampilkan pilihan
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk SSE
app.get('/events', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    sseClient = res;
    req.on('close', () => {
        sseClient = null;
    });
});

// Endpoint untuk download dari YouTube
app.post('/download', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL is required.');
    }

    sendSseMessage({ message: `Starting video download for: ${url}` });

    try {
        const videoInfo = await ytdlp.getInfoAsync(url);
        const sanitizedTitle = videoInfo.title.replace(/[^a-zA-Z0-9 ]/g, "");
        const outputFileName = `${sanitizedTitle}.mp4`;
        const outputPath = path.join(outputFolder, outputFileName);

        await ytdlp.downloadAsync(url, {
            format: 'bestvideo[height<=720][ext=mp4][vcodec^=avc]+bestaudio[ext=m4a][acodec^=mp4a]/bestvideo[height<=480]+bestaudio/best[height<=480]',
            recodeVideo: 'mp4',
            output: outputPath,
            onProgress: (progress) => {
                const message = `Downloading ${videoInfo.title}: ${progress.percent} complete at ${progress.currentSpeed}`;
                sendSseMessage({ message });
            },
        });

        const successMessage = {
            event: 'conversionComplete',
            filename: outputFileName,
            message: `Finished downloading: ${outputFileName}`
        };
        sendSseMessage(successMessage);
        console.log(`Finished downloading: ${outputFileName}`);

        if (!res.headersSent) {
            res.status(200).send('Download complete.');
        }

    } catch (error) {
        console.error(`Error downloading ${url}:`, error);
        sendSseMessage({ message: `Error downloading ${url}: ${error.message}` });
        if (!res.headersSent) {
            res.status(500).send('Failed to download video.');
        }
    }
});

// Endpoint untuk konversi YouTube ke MP3
app.post('/convert-to-mp3', async (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL is required.');
    }

    sendSseMessage({ message: `Starting MP3 conversion for: ${url}` });

    try {
        const videoInfo = await ytdlp.getInfoAsync(url);
        const sanitizedTitle = videoInfo.title.replace(/[^a-zA-Z0-9 ]/g, "");
        const tempFileName = `${sanitizedTitle}.${videoInfo.ext}`;
        const tempFilePath = path.join('temp', tempFileName);
        const outputFileName = `${sanitizedTitle}.mp3`;
        const outputPath = path.join(outputFolder, outputFileName);

        sendSseMessage({ message: `Downloading audio for: ${videoInfo.title}` });

        await ytdlp.downloadAsync(url, {
            format: 'bestaudio',
            output: tempFilePath,
        });

        sendSseMessage({ message: `Converting to ${outputFileName}` });

        ffmpeg(tempFilePath)
            .audioBitrate(128)
            .toFormat('mp3')
            .on('end', () => {
                const successMessage = {
                    event: 'conversionComplete',
                    filename: outputFileName,
                    message: `Finished converting: ${outputFileName}`
                };
                sendSseMessage(successMessage);
                console.log(`Finished converting: ${outputFileName}`);
                
                if (!res.headersSent) {
                    res.status(200).send('Conversion complete.');
                }

                fs.unlink(tempFilePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete temp file: ${tempFilePath}`, err);
                    }
                });
            })
            .on('error', (err) => {
                sendSseMessage({ message: `Error converting ${url}: ${err.message}` });
                console.error(`Error converting ${url}:`, err);
                if (!res.headersSent) {
                    res.status(500).send('Failed to convert video.');
                }
                fs.unlink(tempFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Failed to delete temp file on error: ${tempFilePath}`, unlinkErr);
                    }
                });
            })
            .save(outputPath);

    } catch (error) {
        console.error(`Error processing ${url}:`, error);
        sendSseMessage({ message: `Error processing ${url}: ${error.message}` });
        if (!res.headersSent) {
            res.status(500).send('Failed to process video.');
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});