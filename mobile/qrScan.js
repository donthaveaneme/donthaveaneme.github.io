let html5QrCode = new Html5Qrcode("reader");
let result = document.getElementById('result');
let messageScan = document.getElementById('messageScan');
//let result2 = document.getElementById('result2');
const select = document.getElementById('cameraSelect');
const startButton = document.getElementById('startScan'); 
const stopButton = document.getElementById('stopScan');
const torchButton = document.getElementById("toggleTorch");
const fileInputBtn = document.getElementById('fileInputBtn');
const fileInput = document.getElementById('fileInput');
const beepSound = new Audio("beep.mp3");
beepSound.volume = 1;

select.style.display = 'none';
torchButton.style.display = "none";
stopButton.style.display = 'none';
fileInputBtn.style.display = 'none';

let currentCameraId = null;
let videoTrack = null;
let isTorchOn = false;

function startScanner(cameraId) {
    if (!cameraId) {
        console.error("ID kamera tidak valid!");
        return;
    }

    currentCameraId = cameraId;

    navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } }).then(function(stream) {
        videoTrack = stream.getVideoTracks()[0];

        if ('torch' in videoTrack.getSettings() || 'torch' in videoTrack.getCapabilities()) {
            torchButton.style.display = "block";
        } else {
            torchButton.style.display = "none";
        }

        scanWithCamera(cameraId);
    }).catch(err => console.error("Gagal mengakses kamera:", err));
}

function scanWithCamera(cameraId) {
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        showTorchButtonIfSupported: false //tidak tampilin tombol bawaan
    };

    html5QrCode.start(
        cameraId, 
        config, 
        function(decodedText, decodedResult) {
        beepSound.play().catch(function(err) { 
            console.error("Audio gagal diputar: ", err)
        });
        result.value = decodedText;
        result.dispatchEvent(new Event("input"));
        //console.log(decodedResult);
        }
    ).catch(function(err) { 
        console.error("Gagal memulai scanner: ", err)
    });
}

function forceStopCamera() {
    if (videoTrack) {
        videoTrack.stop();
        console.log("Track video berhasil dihentikan.");
        videoTrack = null; // Hapus referensi agar bisa dipakai ulang
    } else {
        console.warn("Tidak ada track video yang aktif.");
    }
}

function stopScanner() {
    return new Promise(function(resolve, reject) {
        if (!html5QrCode || typeof html5QrCode.getState !== "function") {
            console.log("Scanner tidak sedang berjalan.");
            resolve();
            return;
        }
        
        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.stop().then(function() {
                    console.log("Scanner dihentikan.");
                    forceStopCamera();
                    resolve();
                })
                .catch(function(err) {
                    console.error("Gagal menghentikan scanner:", err);
                    forceStopCamera();
                    reject(err);
                });
        } else {
            console.log("Scanner tidak sedang berjalan.");
            forceStopCamera();
            resolve();
        }
    });
}


Html5Qrcode.getCameras().then(function(devices) {
    if (devices.length > 0) {
        let backCamera = devices.find(function(device) {
            return (device.label.toLowerCase().includes("back") || 
                    device.label.toLowerCase().includes("rear") || 
                    device.label.toLowerCase().includes("environment")) && 
                    device.label.toLowerCase().includes("0"); // Prioritaskan jika ada angka "0"
        }) || 
        
        devices.find(function(device) {
            return device.label.toLowerCase().includes("back") || 
                   device.label.toLowerCase().includes("rear") || 
                   device.label.toLowerCase().includes("environment");
        }) || 
        
        devices[0];
        
        devices.forEach(function(device) {
            let option = document.createElement('option');
            option.value = device.id;
            option.text = device.label || `Kamera ${select.length + 1}`;
            select.appendChild(option);
        });

        select.value = backCamera.id;

        select.addEventListener('change', function() {
            stopScanner();
            startScanner(select.value);
        });
    } else {
        alert("⚠️ Tidak ada kamera yang terdeteksi.");
        messageScan.innerText = "Tidak ada kamera yang terdeteksi.";
    }
}).catch(function(err) {
    console.error("Tidak dapat mengambil daftar kamera: ", err);
    messageScan.innerText = "Error: Tidak dapat mengakses kamera.";
    select.style.display = 'none';
    stopButton.style.display = 'none'
});

fileInputBtn.addEventListener("click", function() {
    fileInput.click();
});

fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        scanQRCodeFromFile(file);
    }
});

function scanQRCodeFromFile(file) {
    stopScanner().then(function() {
        html5QrCode = new Html5Qrcode("reader"); 

        html5QrCode.scanFile(file, true)
            .then(function(decodedText)  {
                beepSound.play().catch(function(err) { console.error("Audio gagal diputar: ", err) });
                result.value = decodedText;
                result.dispatchEvent(new Event("input"));

                startButton.style.display = 'block';
                stopButton.style.display = 'none';
                fileInputBtn.style.display = 'none';
            })
            .catch(function(err) {
                messageScan.innerText = `Gagal memindai kode QR: ${err}`;
            });
    }).catch(function(err) {
        console.error("Gagal menghentikan scanner sebelum pemindaian file:", err);
    });
}


function toggleTorch() {
    if (!videoTrack) {
        console.error("Tidak ada video track untuk mengontrol senter.");
        return;
    }

    const capabilities = videoTrack.getCapabilities();
    if (!capabilities.torch) {
        console.error("Perangkat ini tidak mendukung torch.");
        return;
    }

    isTorchOn = !isTorchOn;
    
    videoTrack.applyConstraints({
        advanced: [{ torch: isTorchOn }]
    }).then(function() {
        if (isTorchOn) {
            torchButton.innerText = "💡 Matikan Senter";
        } else {
            torchButton.innerText = "🔦 Nyalakan Senter";
        }
    }).catch(function(err) {
        console.error("Gagal mengaktifkan senter:", err);
    });    
}

stopButton.addEventListener('click', function() {
    stopScanner();
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
    fileInputBtn.style.display = 'none';
    select.style.display = 'none';
});

startButton.addEventListener('click', function() {
    stopScanner().then(function() {
        if (!html5QrCode || typeof html5QrCode.getState !== "function") {
            html5QrCode = new Html5Qrcode("reader");
        }
        startScanner(select.value);
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
        fileInputBtn.style.display = 'block';
        select.style.display = 'block';
    }).catch(function(err) {
        console.error("Gagal memulai ulang scanner:", err);
    });
});

torchButton.addEventListener("click", toggleTorch);
