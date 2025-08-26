# ObjectDetection

A real-time object detection system that combines YOLO (You Only Look Once) and Faster R-CNN for enhanced detection accuracy. This project demonstrates the power of ensemble methods in computer vision by merging predictions from two state-of-the-art object detection models.

## 🚀 Features

- **Hybrid Detection**: Combines YOLO and Faster R-CNN predictions for improved accuracy
- **Real-time Processing**: Live camera feed with real-time object detection
- **Multiple Views**: Three display windows showing different detection methods
- **Smart Merging**: Uses IoU (Intersection over Union) to merge overlapping detections
- **Non-Maximum Suppression**: Eliminates duplicate detections for cleaner results
- **Interactive Interface**: Press 'q' to quit the application

## 🎯 Detection Methods

### 1. YOLO (You Only Look Once)
- **Color**: Green bounding boxes
- **Speed**: Fast inference for real-time applications
- **Accuracy**: Good for general object detection

### 2. Faster R-CNN
- **Color**: Blue bounding boxes  
- **Speed**: Slower but more accurate
- **Accuracy**: Excellent for precise object localization

### 3. Hybrid Approach
- **Color**: Red bounding boxes
- **Method**: Combines both models using IoU thresholding
- **Result**: Best of both worlds - speed and accuracy

## 🛠️ Requirements

- Python 3.8+
- OpenCV
- PyTorch
- Ultralytics
- Torchvision

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/divyanshsingh07/ObjectDetection.git
   cd ObjectDetection
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install torch torchvision ultralytics opencv-python
   ```

## 🚀 Usage

### Real-time Camera Detection
```bash
cd Code/yolo_project
source venv_new/bin/activate  # Use existing virtual environment
python main.py
```

### Alternative Version
```bash
cd Code/Custom
python main.py
```

## 🎮 Controls

- **Press 'q'**: Quit the application
- **Camera**: Automatically uses default camera (index 0)

## 📁 Project Structure

```
Code/
├── yolo_project/          # Main project directory
│   ├── main.py           # Main application with camera access
│   ├── initial.py        # Initial implementation
│   ├── venv_new/         # Virtual environment
│   └── yolov5su.pt       # YOLO model weights
├── Custom/                # Alternative implementation
│   ├── main.py           # Custom version with camera access
│   └── initial.py        # Initial custom implementation
├── data/                  # Training data (ignored by git)
├── vehicle dataset/       # Vehicle detection dataset (ignored by git)
└── .gitignore            # Git ignore rules
```

## 🔧 Technical Details

### Model Architecture
- **YOLO**: Single-stage detector for real-time performance
- **Faster R-CNN**: Two-stage detector for high accuracy
- **Ensemble**: Combines predictions using IoU-based merging

### Performance Optimization
- **GPU Acceleration**: Supports CUDA for faster inference
- **Batch Processing**: Efficient frame processing pipeline
- **Memory Management**: Proper cleanup of OpenCV windows

## 📊 Supported Objects

The system can detect various objects including:
- People
- Vehicles (cars, trucks, buses)
- Animals
- Common objects (chairs, tables, etc.)
- And many more COCO dataset classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ultralytics](https://github.com/ultralytics/ultralytics) for YOLO implementation
- [PyTorch](https://pytorch.org/) for deep learning framework
- [OpenCV](https://opencv.org/) for computer vision operations

## 📞 Contact

- **Author**: Divyansh Singh
- **GitHub**: [@divyanshsingh07](https://github.com/divyanshsingh07)
- **Project**: [ObjectDetection](https://github.com/divyanshsingh07/ObjectDetection)

---

⭐ **Star this repository if you find it helpful!**
