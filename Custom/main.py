import cv2
import torch
from ultralytics import YOLO
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.transforms import functional as F

# Load Models
yolo_model = YOLO("yolov5su.pt")  # YOLOv5 model
rcnn_model = fasterrcnn_resnet50_fpn(weights="DEFAULT")
rcnn_model.eval()

# Initialize camera
cap = cv2.VideoCapture(0)  # Use default camera (0)
if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

print("Camera opened successfully. Press 'q' to quit.")

while True:
    # Capture frame from camera
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture frame.")
        break
    
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # YOLO Detection
    yolo_results = yolo_model(frame)
    yolo_detections = []
    yolo_frame = frame.copy()

    for result in yolo_results[0].boxes:
        x1, y1, x2, y2 = map(int, result.xyxy[0].tolist())
        conf = result.conf.item()
        cls_idx = int(result.cls.item())
        label = yolo_model.names[cls_idx]
        yolo_detections.append((label, conf, (x1, y1, x2, y2)))
        cv2.rectangle(yolo_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(yolo_frame, f"YOLO: {label} ({conf:.2f})", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # Faster R-CNN Detection
    rcnn_frame = frame.copy()
    rcnn_detections = []
    input_tensor = F.to_tensor(frame_rgb).unsqueeze(0)

    with torch.no_grad():
        rcnn_outputs = rcnn_model(input_tensor)

    for idx, box in enumerate(rcnn_outputs[0]['boxes']):
        x1, y1, x2, y2 = map(int, box.tolist())
        score = rcnn_outputs[0]['scores'][idx].item()
        label = rcnn_outputs[0]['labels'][idx].item()
        if score > 0.5:  # Confidence threshold
            rcnn_detections.append((label, score, (x1, y1, x2, y2)))
            cv2.rectangle(rcnn_frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(rcnn_frame, f"RCNN: {label} ({score:.2f})", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    # IoU Function for Merging Predictions
    def calculate_iou(box1, box2):
        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])
        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])
        overlap_area = max(0, x2 - x1 + 1) * max(0, y2 - y1 + 1)
        box1_area = (box1[2] - box1[0] + 1) * (box1[3] - box1[1] + 1)
        box2_area = (box2[2] - box2[0] + 1) * (box2[3] - box2[1] + 1)
        return overlap_area / float(box1_area + box2_area - overlap_area)

    # Merge YOLO and RCNN Detections
    iou_threshold = 0.5
    merged_detections = []

    for yolo_cls, yolo_conf, yolo_bbox in yolo_detections:
        merged = False
        for rcnn_cls, rcnn_score, rcnn_bbox in rcnn_detections:
            if calculate_iou(yolo_bbox, rcnn_bbox) > iou_threshold:
                x1 = (yolo_bbox[0] + rcnn_bbox[0]) // 2
                y1 = (yolo_bbox[1] + rcnn_bbox[1]) // 2
                x2 = (yolo_bbox[2] + rcnn_bbox[2]) // 2
                y2 = (yolo_bbox[3] + rcnn_bbox[3]) // 2
                confidence = (yolo_conf + rcnn_score) / 2
                merged_detections.append((yolo_cls, confidence, (x1, y1, x2, y2)))
                merged = True
                break
        if not merged:
            merged_detections.append((yolo_cls, yolo_conf, yolo_bbox))

    # Apply Non-Maximum Suppression (NMS)
    def nms(detections, threshold):
        detections = sorted(detections, key=lambda x: x[1], reverse=True)
        filtered = []
        while detections:
            best = detections.pop(0)
            filtered.append(best)
            detections = [d for d in detections if calculate_iou(best[2], d[2]) < threshold]
        return filtered

    final_detections = nms(merged_detections, 0.5)

    # Draw Final Detections
    hybrid_frame = frame.copy()
    for cls, conf, (x1, y1, x2, y2) in final_detections:
        cv2.rectangle(hybrid_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
        cv2.putText(hybrid_frame, f"Hybrid: {cls} ({conf:.2f})", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # Display Results
    cv2.imshow("YOLO Only", yolo_frame)
    cv2.imshow("RCNN Only", rcnn_frame)
    cv2.imshow("Hybrid (YOLO + RCNN)", hybrid_frame)
    
    # Check for 'q' key to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Clean up
cap.release()
cv2.destroyAllWindows()
