# Object Detection Web Application

A modern, responsive web application for real-time object detection using your camera or uploaded images. Built with HTML, CSS, and JavaScript, featuring a beautiful UI and AI-powered detection capabilities.

## ✨ Features

- **📷 Camera Access**: Real-time object detection using your device's camera
- **🖼️ Image Upload**: Drag & drop or click to upload images for detection
- **🤖 AI Detection**: Uses TensorFlow.js with COCO-SSD model for accurate detection
- **🎨 Multiple Views**: Three detection methods (YOLO-style, RCNN-style, Hybrid)
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **🎯 Real-time Results**: Instant detection results with bounding boxes and labels
- **🔔 Notifications**: User-friendly notifications for all actions

## 🚀 Quick Start

### Option 1: Python Server (Recommended)
```bash
cd web_app
python server.py
```
The web app will automatically open in your default browser at `http://localhost:8000`

### Option 2: Any HTTP Server
```bash
cd web_app
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Use

### Camera Mode
1. Click the **Camera** tab
2. Click **Start Camera** to access your device camera
3. Position objects in view
4. Click **Capture & Detect** to analyze the current frame
5. View results in the three detection panels
6. Click **Stop Camera** when done

### Upload Mode
1. Click the **Upload Image** tab
2. Drag & drop an image or click to browse
3. Click **Detect Objects** to analyze the image
4. View detection results with bounding boxes

## 🔧 Technical Details

### Frontend Technologies
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Responsive design with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Modern async/await patterns
- **TensorFlow.js**: Client-side AI model loading and inference
- **COCO-SSD**: Pre-trained object detection model

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Performance Features
- **Lazy Loading**: Model loads only when needed
- **Canvas Optimization**: Efficient drawing and rendering
- **Memory Management**: Proper cleanup of camera streams
- **Responsive Images**: Optimized for different screen sizes

## 📱 Mobile Support

The web app is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Optimized camera controls
- Responsive grid layout
- Mobile-optimized buttons and controls

## 🔒 Privacy & Security

- **Client-side Processing**: All detection happens in your browser
- **No Data Upload**: Images are processed locally
- **Camera Permissions**: Only requests camera access when needed
- **Secure**: Uses HTTPS when served over secure connections

## 🎨 Customization

### Colors
The app uses a beautiful gradient theme that can be easily customized in `styles.css`:
```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Detection Thresholds
Adjust detection sensitivity in `script.js`:
```javascript
// YOLO-like detection (faster, less accurate)
const yoloPredictions = predictions.filter(p => p.score > 0.3);

// RCNN-like detection (slower, more accurate)
const rcnnPredictions = predictions.filter(p => p.score > 0.5);
```

## 🐛 Troubleshooting

### Camera Not Working
- Ensure your browser supports `getUserMedia`
- Check camera permissions in browser settings
- Try refreshing the page and granting permissions again

### Model Not Loading
- Check internet connection (model downloads from CDN)
- Try refreshing the page
- Check browser console for error messages

### Performance Issues
- Close other browser tabs
- Ensure hardware acceleration is enabled
- Use a modern browser version

## 🔮 Future Enhancements

- [ ] Custom model upload support
- [ ] Video file processing
- [ ] Real-time streaming detection
- [ ] Multiple camera support
- [ ] Export detection results
- [ ] Custom object training

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Enjoy detecting objects with AI! 🎉**
