// Global variables
let model = null;
let stream = null;
let isModelLoaded = false;

// DOM elements
const cameraFeed = document.getElementById('camera-feed');
const cameraCanvas = document.getElementById('camera-canvas');
const startCameraBtn = document.getElementById('start-camera');
const captureFrameBtn = document.getElementById('capture-frame');
const stopCameraBtn = document.getElementById('stop-camera');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewImage = document.getElementById('preview-image');
const uploadPreview = document.getElementById('upload-preview');
const detectUploadBtn = document.getElementById('detect-upload');
const loadingOverlay = document.getElementById('loading-overlay');

// Canvas elements for results
const yoloCanvas = document.getElementById('yolo-canvas');
const rcnnCanvas = document.getElementById('rcnn-canvas');
const hybridCanvas = document.getElementById('hybrid-canvas');

// Info elements
const yoloInfo = document.getElementById('yolo-info');
const rcnnInfo = document.getElementById('rcnn-info');
const hybridInfo = document.getElementById('hybrid-info');

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
        
        // Stop camera when switching to upload tab
        if (tabId === 'upload-tab' && stream) {
            stopCamera();
        }
    });
});

// Initialize the app
async function init() {
    try {
        showLoading('Loading AI model...');
        
        // Load TensorFlow.js model (COCO-SSD as a lightweight alternative)
        model = await cocoSsd.load();
        isModelLoaded = true;
        
        hideLoading();
        showNotification('Model loaded successfully!', 'success');
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        hideLoading();
        showNotification('Failed to load model: ' + error.message, 'error');
        console.error('Model loading error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Camera controls
    startCameraBtn.addEventListener('click', startCamera);
    captureFrameBtn.addEventListener('click', captureAndDetect);
    stopCameraBtn.addEventListener('click', stopCamera);
    
    // Upload functionality
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    detectUploadBtn.addEventListener('click', () => detectObjects(previewImage));
    
    // New image management buttons
    document.getElementById('change-image').addEventListener('click', changeImage);
    document.getElementById('remove-image').addEventListener('click', removeImage);
}

// Camera functions
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 360 },
                facingMode: 'environment'
            } 
        });
        
        cameraFeed.srcObject = stream;
        startCameraBtn.disabled = true;
        captureFrameBtn.disabled = false;
        stopCameraBtn.disabled = false;
        
        showNotification('Camera started successfully!', 'success');
        
    } catch (error) {
        showNotification('Failed to start camera: ' + error.message, 'error');
        console.error('Camera error:', error);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        cameraFeed.srcObject = null;
        
        startCameraBtn.disabled = false;
        captureFrameBtn.disabled = true;
        stopCameraBtn.disabled = true;
        
        showNotification('Camera stopped', 'info');
    }
}

async function captureAndDetect() {
    if (!stream) return;
    
    // Create canvas and draw video frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    
    ctx.drawImage(cameraFeed, 0, 0);
    
    // Create image element from canvas
    const img = new Image();
    img.src = canvas.toDataURL();
    
    await detectObjects(img);
}

// Upload functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f0f2ff';
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = 'white';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// New image management functions
function changeImage() {
    // Trigger file input click to select a new image
    fileInput.click();
    showNotification('Select a new image', 'info');
}

function removeImage() {
    // Clear the current image and show upload area
    previewImage.src = '';
    uploadPreview.style.display = 'none';
    uploadArea.style.display = 'block';
    
    // Clear file input
    fileInput.value = '';
    
    // Clear detection results
    clearCanvases();
    updateInfo('No detections yet', 'yolo');
    updateInfo('No detections yet', 'rcnn');
    updateInfo('No detections yet', 'hybrid');
    
    showNotification('Image removed', 'info');
}

// Object detection
async function detectObjects(imageElement) {
    if (!isModelLoaded) {
        showNotification('Model not loaded yet', 'error');
        return;
    }
    
    try {
        showLoading('Detecting objects...');
        
        // Wait for image to load
        await new Promise((resolve) => {
            if (imageElement.complete) {
                resolve();
            } else {
                imageElement.onload = resolve;
            }
        });
        
        // Perform detection
        const predictions = await model.detect(imageElement);
        
        // Process results
        processDetections(predictions, imageElement);
        
        hideLoading();
        showNotification('Detection completed!', 'success');
        
    } catch (error) {
        hideLoading();
        showNotification('Detection failed: ' + error.message, 'error');
        console.error('Detection error:', error);
    }
}

// Process detection results
function processDetections(predictions, imageElement) {
    // Clear previous results
    clearCanvases();
    
    if (predictions.length === 0) {
        updateInfo('No objects detected', 'yolo');
        updateInfo('No objects detected', 'rcnn');
        updateInfo('No objects detected', 'hybrid');
        return;
    }
    
    // Simulate different detection methods (YOLO, RCNN, Hybrid)
    // In a real implementation, you would use different models
    
    // YOLO-like detection (faster, less accurate)
    const yoloPredictions = predictions.filter(p => p.score > 0.3);
    drawDetections(yoloCanvas, imageElement, yoloPredictions, '#00ff00');
    updateInfo(`Detected ${yoloPredictions.length} objects (YOLO)`, 'yolo');
    
    // RCNN-like detection (slower, more accurate)
    const rcnnPredictions = predictions.filter(p => p.score > 0.5);
    drawDetections(rcnnCanvas, imageElement, rcnnPredictions, '#ff0000');
    updateInfo(`Detected ${rcnnPredictions.length} objects (RCNN)`, 'rcnn');
    
    // Hybrid detection (combine both)
    const hybridPredictions = [...new Set([...yoloPredictions, ...rcnnPredictions])];
    drawDetections(hybridCanvas, imageElement, hybridPredictions, '#0000ff');
    updateInfo(`Detected ${hybridPredictions.length} objects (Hybrid)`, 'hybrid');
}

// Draw detections on canvas
function drawDetections(canvas, imageElement, predictions, color) {
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = imageElement.naturalWidth || imageElement.videoWidth || 640;
    canvas.height = imageElement.naturalHeight || imageElement.videoHeight || 360;
    
    // Draw image
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Draw bounding boxes
    predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;
        
        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const label = `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`;
        const labelWidth = ctx.measureText(label).width + 10;
        const labelHeight = 20;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
        
        // Draw label text
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(label, x + 5, y - 5);
    });
}

// Clear all canvases
function clearCanvases() {
    [yoloCanvas, rcnnCanvas, hybridCanvas].forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

// Update info display
function updateInfo(message, type) {
    const infoElement = document.getElementById(`${type}-info`);
    infoElement.innerHTML = `<p>${message}</p>`;
}

// Utility functions
function showLoading(message) {
    loadingOverlay.querySelector('p').textContent = message;
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 1001;
        max-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #28a745;
    }
    
    .notification-error {
        border-left: 4px solid #dc3545;
    }
    
    .notification-info {
        border-left: 4px solid #17a2b8;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i {
        color: #28a745;
    }
    
    .notification-error i {
        color: #dc3545;
    }
    
    .notification-info i {
        color: #17a2b8;
    }
`;
document.head.appendChild(notificationStyles);

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility change to stop camera when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && stream) {
        stopCamera();
    }
});
