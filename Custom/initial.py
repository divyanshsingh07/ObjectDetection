import torch
from ultralytics import YOLO
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision import transforms
import cv2
import os

# Initialize YOLOv5 and Faster R-CNN models
yolo_model = YOLO('yolov5su.pt')  # You can replace with any YOLO model
rcnn_model = fasterrcnn_resnet50_fpn(weights="FasterRCNN_ResNet50_FPN_Weights.DEFAULT")
rcnn_model.eval()

# Transformation to convert crops to tensors
transform = transforms.ToTensor()

# Function to prepare input for Faster R-CNN
def prepare_rcnn_input(yolo_results, frame):
    rcnn_inputs = []
    
    for det in yolo_results:
        if hasattr(det, 'boxes'):
            for box in det.boxes:
                # Extract bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # Crop the bounding box area from the frame
                crop = frame[y1:y2, x1:x2]
                
                # Convert crop to tensor and add batch dimension
                crop_tensor = transform(crop).unsqueeze(0)
                rcnn_inputs.append(crop_tensor)
        else:
            print("No boxes found in detection result.")
    
    return rcnn_inputs

# Path to the directory containing custom dataset images
dataset_dir = r'vehicle dataset/train/images'  # Set this to the path of your dataset folder

# Process each image in the custom dataset
for image_name in os.listdir(dataset_dir):
    # Load the image
    image_path = os.path.join(dataset_dir, image_name)
    frame = cv2.imread(image_path)
    if frame is None:
        print(f"Failed to load image {image_path}")
        continue

    # Run YOLO detection on the image
    yolo_results = yolo_model(frame)

    # Prepare inputs for Faster R-CNN
    rcnn_inputs = prepare_rcnn_input(yolo_results, frame)

    # Run Faster R-CNN on each cropped region
    for crop_tensor in rcnn_inputs:
        with torch.no_grad():
            rcnn_outputs = rcnn_model(crop_tensor)
        
        # Example: Drawing the bounding box coordinates from Faster R-CNN output
        for i, output in enumerate(rcnn_outputs):
            boxes = output['boxes']
            for box in boxes:
                x1, y1, x2, y2 = box.int().tolist()
                # Draw bounding box on the frame (optional)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

    # Display the processed image
    cv2.imshow('YOLO + Faster R-CNN Pipeline', frame)
    cv2.waitKey(0)  # Press any key to move to the next image

cv2.destroyAllWindows()


cap = cv2.VideoCapture(0)  # Open the webcam
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Run YOLO detection on the current frame
    yolo_results = yolo_model(frame)

    # Prepare inputs for Faster R-CNN
    rcnn_inputs = prepare_rcnn_input(yolo_results, frame)

    # Run Faster R-CNN on each cropped region
    for crop_tensor in rcnn_inputs:
        with torch.no_grad():
            rcnn_outputs = rcnn_model(crop_tensor)
        
        # Example: Printing the bounding box coordinates from Faster R-CNN output
        for i, output in enumerate(rcnn_outputs):
            boxes = output['boxes']
            for box in boxes:
                x1, y1, x2, y2 = box.int().tolist()
                # Draw bounding box on the frame (optional)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)

    # Display the output frame
    cv2.imshow('YOLO + Faster R-CNN Pipeline', frame)

    # Break on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()