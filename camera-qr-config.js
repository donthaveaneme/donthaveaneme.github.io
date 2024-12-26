const messageScan = document.getElementById('message-scan');
const resultDiv = document.getElementById('result');
const readerDiv = document.getElementById('reader');
const toggleScanFile = document.getElementById('toggleFileScan');
const toggleFlashCamera = document.getElementById('flash-trigger'); // NONAKTIF
const cameraSelection = document.getElementById('cameraIdOption');

let html5QrCode;
let currentCameraId = null;
let isScanning = false;

function toggleDisplay(elements, displayStyle) {
    elements.forEach(el => {
        if (el) el.style.display = displayStyle;
    });
}

cameraSelection.addEventListener('change', (event) => {
    if (isScanning) {
        stopScanning().then(() => {
            currentCameraId = event.target.value;
            startScanWithCamera(currentCameraId);
        }).catch((err) => {
            console.error("Gagal menghentikan pemindaian:", err);
        });
    } else {
        currentCameraId = event.target.value;
        startScanWithCamera(currentCameraId);
    }
});

Html5Qrcode.getCameras().then((devices) => {
    if (devices && devices.length) {
        devices.forEach((device) => {
            const option = document.createElement('option');
            option.value = device.id;
            option.text = device.label || `Kamera ${device.id}`;
            cameraSelection.appendChild(option);
        });

        currentCameraId = devices[0].id;
        html5QrCode = new Html5Qrcode("reader");

        startScanWithCamera(currentCameraId);

        /*
        if (html5QrCode.isTorchSupported()) {
            if (toggleFlashCamera) {
                toggleFlashCamera.style.display = "block";

                toggleFlashCamera.addEventListener('click', () => {
                    if (html5QrCode.isTorchEnabled()) {
                        html5QrCode.disableTorch();
                    } else {
                        html5QrCode.enableTorch();
                    }
                });
            }
        } else {
            if (toggleFlashCamera) {
                toggleFlashCamera.style.display = "none";
            }
        }
            dinonaktifkan, sering bermasalah*/
    } else {
        console.warn("Tidak ada kamera yang tersedia.");
        alert("Tidak ada kamera yang terdeteksi. Pastikan perangkat Anda memiliki kamera dan izin akses sudah diberikan.");
    }
}).catch((err) => {
    console.error("Error mendapatkan kamera: ", err);
    alert("Tidak ada kamera yang tersedia, mohon atur kembali kamera di pengaturan situs kami");
});

function startScanWithCamera(cameraId) {
    if (html5QrCode) {
        isScanning = true;
        html5QrCode.start(
            cameraId, 
            {
                fps: 30,    
                qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
                handleQrCodeSuccess(decodedText);
            },
            (errorMessage) => {
                console.warn(`Kesalahan pemindaian: ${errorMessage}`);
            }
        ).catch((err) => {
            console.error(`Gagal memulai pemindaian: ${err}`);
            alert("Gagal mengakses kamera. Pastikan kamera tersedia dan izinkan akses.");
        });
    }
}

function handleQrCodeSuccess(decodedText) {
    setTimeout(() => {
        toggleDisplay([messageScan, readerDiv, toggleScanFile], 'none');

        if (resultDiv) {
            resultDiv.style.display = "flex";
            resultDiv.innerHTML = `
                <h2>QR Code Terdeteksi!</h2>
                <p><a href="${decodedText}" target="_blank">${decodedText}</a></p>
            `;
        }

        stopScanning();
    }, 500);
}

function stopScanning() {
    return new Promise((resolve, reject) => {
        if (html5QrCode && isScanning) {
            html5QrCode.stop().then(() => {
                console.log("Pemindaian dihentikan.");
                isScanning = false;
                resolve();
            }).catch((err) => {
                reject(err);
            });
        } else {
            resolve();
        }
    });
}

// SCAN DARI PERANGKAT
const fileScanTrigger = document.getElementById('file-scan-trigger');
const qrInputFile = document.getElementById('qr-input-file');

fileScanTrigger.addEventListener('click', () => {
    if (html5QrCode) {
        stopScanning().then(() => {
            startFileScan();
        }).catch((err) => {
            console.error("Gagal menghentikan pemindaian:", err);
        });
    } else {
        startFileScan();
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
        toggleDisplay([messageScan, readerDiv, toggleScanFile], 'none');

        if (resultDiv) {
            resultDiv.style.display = "flex";
            resultDiv.innerHTML = `
                <h2>QR Code Terdeteksi!</h2>
                <p><a href="${decodedText}" target="_blank">${decodedText}</a></p>
            `;
        }

        stopScanning();
    }).catch((err) => {
        console.error(`Kesalahan pemindaian: ${err}`);
        alert(`Kesalahan pemindaian: ${err}`);
    });
});
