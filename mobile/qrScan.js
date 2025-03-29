let html5QrCode = new Html5Qrcode("reader");
let result = document.getElementById('result');
let result2 = document.getElementById('result2');
const select = document.getElementById('cameraSelect');
const startButton = document.getElementById('startScan'); 
const stopButton = document.getElementById('stopScan');
const torchButton = document.getElementById("toggleTorch");
const beepSound = new Audio("beep.mp3");
beepSound.volume = 1;

torchButton.style.display = "none";
startButton.style.display = 'none';
let currentCameraId = null;
let videoTrack = null;

function startScanner(cameraId) {
    if (!cameraId) {
        console.error("ID kamera tidak valid!");
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { deviceId: cameraId } }).then(function(stream) {
        videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        if (capabilities.torch) {
            torchButton.style.display = "block";
        } else {
            torchButton.style.display = "none";
        }

        if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.stop().then(function() {
                console.log("Scanner dihentikan, memulai ulang dengan kamera:", cameraId);
                scanWithCamera(cameraId);
            }).catch(function(err) {
                console.error("Gagal menghentikan scanner:", err);
            });
        } else {
            scanWithCamera(cameraId);
        }
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
        result.innerText = decodedText;
        console.log(decodedResult);
        //html5QrCode.stop();
        }
    ).catch(function(err) { 
        console.error("Gagal memulai scanner: ", err)
    });
}

function stopScanner() {
    if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
        html5QrCode.stop().then(function() {
            console.log("Scanner dihentikan.");
        }).catch(err => {
            console.error("Gagal menghentikan scanner:", err);
        });
    } else {
        console.log("Scanner tidak sedang berjalan.");
    }
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

        startScanner(backCamera.id);

        select.addEventListener('change', function() {
            if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
                html5QrCode.stop().then(function() {
                    console.log("Scanner dihentikan. Mengganti ke kamera:", select.value);
                    startScanner(select.value);
                }).catch(function(err) { 
                    console.error("Gagal mengganti kamera: ", err); 
                });
            } else {
                startScanner(select.value);
            }        
        });
    } else {
        alert("⚠️ Tidak ada kamera yang terdeteksi. Pastikan izin kamera sudah diberikan!");
        result.innerText = "Tidak ada kamera yang terdeteksi.";
    }
}).catch(function(err) {
    console.error("Tidak dapat mengambil daftar kamera: ", err);
    alert("⚠️ Error mengakses kamera: " + err.message);
    result.innerText = "<b>Error: Tidak dapat mengakses kamera.</b>";
    select.style.display = 'none';
    stopButton.style.display = 'none'
});

function toggleTorch() {
    if (!currentCameraId) return;

    navigator.mediaDevices.getUserMedia({
        video: { deviceId: currentCameraId, advanced: [{ torch: !isTorchOn }] }
    }).then(stream => {
        let track = stream.getVideoTracks()[0];
        track.applyConstraints({ advanced: [{ torch: !isTorchOn }] });
        isTorchOn = !isTorchOn;
        torchButton.innerText = isTorchOn ? "💡 Matikan Senter" : "🔦 Nyalakan Senter";
    }).catch(err => console.error("Torch tidak didukung:", err));
}

stopButton.addEventListener('click', function() {
    stopScanner();
    stopButton.style.display = 'none';
    startButton.style.display = 'block';
});

startButton.addEventListener('click', function() {
    startScanner(select.value);
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
});

torchButton.addEventListener("click", toggleTorch);
