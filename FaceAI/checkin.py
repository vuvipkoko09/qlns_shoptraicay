import cv2
import face_recognition
import os
import numpy as np
import requests
import time
from scipy.spatial import distance as dist
from flask import Flask, jsonify
from flask_cors import CORS
import json
from PIL import ImageFont, ImageDraw, Image # Import thêm PIL

# --- CẤU HÌNH ---
app = Flask(__name__)
CORS(app)

JAVA_API_URL = "http://localhost:8080/api/attendance/face-checkin"
IMAGE_FOLDER = "images"
FONT_PATH = "arial.ttf" # ⚠️ Đảm bảo bạn có file font này cùng thư mục, hoặc dẫn đường dẫn tuyệt đối

# Ngưỡng nhắm mắt
EYE_AR_THRESH = 0.25
EYE_AR_CONSEC_FRAMES = 2
WARMUP_SECONDS = 3.0 

known_face_encodings = []
known_face_ids = []

# --- HÀM VẼ CHỮ TIẾNG VIỆT ---
def draw_text_vietnamese(img, text, position, font_size=30, color=(0, 255, 0)):
    """
    Hàm vẽ chữ tiếng Việt lên ảnh OpenCV dùng PIL
    img: Ảnh OpenCV (numpy array)
    text: Nội dung chữ (Unicode)
    position: (x, y)
    font_size: Kích thước chữ
    color: Màu chữ (B, G, R) - OpenCV dùng BGR
    """
    try:
        # Chuyển từ OpenCV (BGR) sang PIL (RGB)
        cv2_im_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_im = Image.fromarray(cv2_im_rgb)
        
        draw = ImageDraw.Draw(pil_im)
        
        # Load font (Nếu không tìm thấy font thì dùng font mặc định - sẽ lỗi dấu)
        try:
            font = ImageFont.truetype(FONT_PATH, font_size)
        except:
            font = ImageFont.load_default()
            print("⚠️ Không tìm thấy file font! Chữ sẽ không có dấu.")

        # Vẽ chữ (PIL dùng màu RGB, nên cần đảo ngược color từ BGR -> RGB)
        draw.text(position, text, font=font, fill=(color[2], color[1], color[0]))

        # Chuyển ngược lại từ PIL sang OpenCV
        return cv2.cvtColor(np.array(pil_im), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print(f"Lỗi vẽ chữ: {e}")
        return img
# -----------------------------

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def load_known_faces():
    global known_face_encodings, known_face_ids
    known_face_encodings = []
    known_face_ids = []
    
    print("⏳ Đang tải lại dữ liệu khuôn mặt...")
    if not os.path.exists(IMAGE_FOLDER):
        os.makedirs(IMAGE_FOLDER)

    for filename in os.listdir(IMAGE_FOLDER):
        if filename.endswith((".jpg", ".png", ".jpeg")):
            path = os.path.join(IMAGE_FOLDER, filename)
            try:
                image = face_recognition.load_image_file(path)
                encodings = face_recognition.face_encodings(image)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    name = os.path.splitext(filename)[0]
                    known_face_ids.append(name)
                    print(f"✅ Đã học: ID {name}")
            except Exception as e:
                print(f"⚠️ Lỗi file {filename}: {e}")
    print(f"✨ Hoàn tất! Đã nạp {len(known_face_ids)} khuôn mặt.")

load_known_faces()

@app.route('/reload-faces', methods=['POST'])
def reload_faces():
    load_known_faces()
    return jsonify({"status": "success", "message": "Đã cập nhật dữ liệu khuôn mặt!"}), 200

def call_java_api(user_id):
    try:
        payload = {"userId": int(user_id)}
        resp = requests.post(JAVA_API_URL, json=payload, timeout=5)
        if resp.status_code == 200:
            return True, resp.text
        return False, resp.text 
    except Exception as e:
        return False, "Không thể kết nối đến Server Java."

@app.route('/start-scan', methods=['GET'])
def start_scan():
    video_capture = cv2.VideoCapture(0)
    if not video_capture.isOpened():
         return jsonify({"status": "error", "message": "Không tìm thấy Camera!"}), 500

    start_time = time.time()
    timeout = start_time + 45
    
    blink_counter = 0
    total_blinks = 0
    detected_user_id = None
    
    print("📷 Camera đang bật...")

    while time.time() < timeout:
        ret, frame = video_capture.read()
        if not ret: break

        elapsed_time = time.time() - start_time
        
        # Resize để xử lý nhanh
        small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        if elapsed_time > WARMUP_SECONDS:
            face_locations = face_recognition.face_locations(rgb_small_frame)
            if len(face_locations) > 0:
                face_landmarks_list = face_recognition.face_landmarks(rgb_small_frame, face_locations)
                for face_landmarks in face_landmarks_list:
                    leftEAR = eye_aspect_ratio(face_landmarks['left_eye'])
                    rightEAR = eye_aspect_ratio(face_landmarks['right_eye'])
                    ear = (leftEAR + rightEAR) / 2.0
                    
                    if ear < EYE_AR_THRESH:
                        blink_counter += 1
                    else:
                        if blink_counter >= EYE_AR_CONSEC_FRAMES:
                            total_blinks += 1
                        blink_counter = 0

                if detected_user_id is None:
                    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
                    if len(known_face_encodings) > 0 and len(face_encodings) > 0:
                        matches = face_recognition.compare_faces(known_face_encodings, face_encodings[0], tolerance=0.5)
                        if True in matches:
                            first_match_index = matches.index(True)
                            detected_user_id = known_face_ids[first_match_index]

            if total_blinks >= 1:
                if detected_user_id is not None:
                    # Dùng hàm vẽ tiếng Việt
                    frame = draw_text_vietnamese(frame, "ĐÃ XÁC NHẬN! ĐANG GỬI...", (50, 200), 40, (0, 255, 0))
                    cv2.imshow('Face AI Check-in', frame)
                    cv2.waitKey(500) 

                    success, msg = call_java_api(detected_user_id)
                    video_capture.release()
                    cv2.destroyAllWindows()
                    
                    if success:
                        return jsonify({"status": "success", "user_id": detected_user_id, "message": msg})
                    else:
                        try:
                            final_msg = json.loads(msg).get("message", msg)
                        except:
                            final_msg = msg
                        return jsonify({"status": "error", "message": final_msg}), 400
                else:
                    frame = draw_text_vietnamese(frame, "NGƯỜI LẠ! KHÔNG ĐƯỢC PHÉP", (50, 200), 40, (0, 0, 255))
                    cv2.imshow('Face AI Check-in', frame)
                    cv2.waitKey(1500)
                    video_capture.release()
                    cv2.destroyAllWindows()
                    return jsonify({"status": "error", "message": "⚠️ Khuôn mặt chưa được đăng ký!"}), 403

        # --- VẼ GIAO DIỆN TIẾNG VIỆT ---
        if elapsed_time <= WARMUP_SECONDS:
            countdown = int(WARMUP_SECONDS - elapsed_time) + 1
            frame = draw_text_vietnamese(frame, f"CHUẨN BỊ... {countdown}", (180, 240), 60, (255, 255, 0)) # Màu Cyan
            frame = draw_text_vietnamese(frame, "Giữ camera và nhìn thẳng", (50, 400), 30, (255, 255, 255))
        else:
            if detected_user_id:
                status_text = f"Xin chào: ID {detected_user_id}"
                color = (0, 255, 0) # Xanh lá
            else:
                status_text = "ĐANG QUÉT..." 
                color = (0, 0, 255) # Đỏ

            blink_text = f"Chớp mắt: {total_blinks}/1"
            
            # Thay thế cv2.putText bằng hàm mới
            frame = draw_text_vietnamese(frame, status_text, (10, 30), 30, color)
            frame = draw_text_vietnamese(frame, blink_text, (10, 70), 30, (255, 0, 0)) # Màu xanh dương
            
            if total_blinks < 1:
                 frame = draw_text_vietnamese(frame, "VUI LÒNG CHỚP MẮT!", (50, 440), 35, (0, 0, 255))

        cv2.imshow('Face AI Check-in', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()
    return jsonify({"status": "timeout", "message": "Hết thời gian!"}), 408

if __name__ == '__main__':
    app.run(port=5000, debug=True)