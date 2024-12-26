
    const messageScan = document.getElementById('message-scan');
    const resultDiv = document.getElementById('result');
    const readerDiv = document.getElementById('reader');
    const toggleScanFile = document.getElementById('toggleFileScan');
    const toggleFlashCamera = document.getElementById('flash-trigger'); // tombol untuk mengaktifkan/mematikan flash

    let html5QrCode; // Variabel untuk menyimpan instansi Html5Qrcode

    // Menyimpan status pemindaian kamera
    let isScanningFromCamera = false;

    // Cek kamera dan mulai pemindaian
    Html5Qrcode.getCameras().then((devices) => {
        if (devices && devices.length) {
            const cameraId = devices[0].id; 
            html5QrCode = new Html5Qrcode("reader");

            // Memulai pemindaian otomatis
            html5QrCode.start(
                cameraId, 
                {
                    fps: 30,    
                    qrbox: { width: 250, height: 250 }  
                },
                (decodedText, decodedResult) => {
                    handleQrCodeSuccess(decodedText, html5QrCode);
                },
                (errorMessage) => {
                    console.warn(`Kesalahan pemindaian: ${errorMessage}`);
                }
            ).catch((err) => {
                console.error(`Gagal memulai pemindaian: ${err}`);
                alert("Gagal mengakses kamera. Pastikan kamera tersedia dan izinkan akses.");
            });

            // Mengecek apakah perangkat mendukung torch (flash)
            if (html5QrCode.isTorchSupported()) {
                // Menampilkan tombol flash jika perangkat mendukung torch
                if (toggleFlashCamera) {
                    toggleFlashCamera.style.display = "block";

                    // Menambahkan event listener untuk tombol flash
                    toggleFlashCamera.addEventListener('click', () => {
                        if (html5QrCode.isTorchEnabled()) {
                            html5QrCode.disableTorch();
                        } else {
                            html5QrCode.enableTorch();
                        }
                    });
                }
            } else {
                // Menyembunyikan tombol flash jika perangkat tidak mendukung torch
                if (toggleFlashCamera) {
                    toggleFlashCamera.style.display = "none";
                }
            }
        } else {
            console.warn("Tidak ada kamera yang tersedia.");
            alert("Tidak ada kamera yang terdeteksi. Pastikan perangkat Anda memiliki kamera dan izin akses sudah diberikan.");
        }
    }).catch((err) => {
        console.error("Error mendapatkan kamera: ", err);
    });

    function handleQrCodeSuccess(decodedText, html5QrCode) {
        setTimeout(() => {
            if (messageScan) {
                messageScan.style.display = "none";
            }

            if (resultDiv) {
                resultDiv.style.display = "flex";
                resultDiv.innerHTML = `
                    <h2>QR Code Terdeteksi!</h2>
                    <p><a href="${decodedText}" target="_blank">${decodedText}</a></p>
                `;
            }

            // Hentikan pemindaian kamera setelah berhasil mendeteksi QR code
            if (html5QrCode && isScanningFromCamera) {
                html5QrCode.stop()
                    .then(() => {
                        console.log("Pemindaian dihentikan.");
                    }).catch((err) => {
                        console.error("Gagal menghentikan pemindaian: ", err);
                    });
            }

            if (readerDiv) {
                readerDiv.style.display = 'none';
            }

            if (toggleScanFile) {
                toggleScanFile.style.display = 'none';
            }

            html5QrCode.clear();
            isScanningFromCamera = false; // Mengubah status pemindaian kamera
        }, 500);
    }

    // SCAN DARI PERANGKAT
    const fileScanTrigger = document.getElementById('file-scan-trigger');
    const qrInputFile = document.getElementById('qr-input-file');

    fileScanTrigger.addEventListener('click', () => {
        // Pastikan untuk menghentikan pemindaian kamera sebelum memulai pemindaian file
        if (html5QrCode && isScanningFromCamera) {
            html5QrCode.stop()
                .then(() => {
                    console.log("Pemindaian kamera dihentikan.");
                    startFileScan(); // Memulai pemindaian file setelah pemindaian kamera dihentikan
                }).catch((err) => {
                    console.error("Gagal menghentikan pemindaian kamera: ", err);
                });
        } else {
            startFileScan(); // Langsung mulai pemindaian file jika kamera tidak aktif
        }
    });

    function startFileScan() {
        qrInputFile.click();
    }

    qrInputFile.addEventListener('change', function (event) {
        if (event.target.files.length === 0) {
            console.log("Tidak ada file yang dipilih.");
            return;
        }

        const imageFile = event.target.files[0];
        const html5QrCode = new Html5Qrcode("reader");

        html5QrCode
        .scanFile(imageFile, true)
        .then((decodedText) => {

            if (messageScan) {
                messageScan.style.display = "none";
            }

            if (resultDiv) {
                resultDiv.style.display = "flex";
                resultDiv.innerHTML = `
                    <h2>QR Code Terdeteksi!</h2>
                    <p><a href="${decodedText}" target="_blank">${decodedText}</a></p>
                `;
            }

            if (readerDiv) {
                readerDiv.style.display = 'none';
            }

            if (toggleScanFile) {
                toggleScanFile.style.display = 'none';
            }

            html5QrCode.stop()
                .then(() => {
                    console.log("Pemindaian dihentikan.");
                }).catch((err) => {
                    console.error("Gagal menghentikan pemindaian: ", err);
                });

            html5QrCode.clear();

        }).catch((err) => {
            // Gagal memindai kode QR
            console.error(`Kesalahan pemindaian: ${err}`);
            alert(`Kesalahan pemindaian: ${err}`);
        });
    });
