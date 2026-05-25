import os
import sys
import csv
import time

# Thêm thư mục gốc vào sys.path để nhận diện module core
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

def calculate_accuracy_metrics():
    # Kiểm tra xem đã cài thư viện scikit-learn chưa
    try:
        from sklearn.metrics import classification_report, accuracy_score
    except ImportError:
        print("[LỖI] Bạn chưa cài thư viện đo lường. Vui lòng chạy lệnh:")
        print("pip install scikit-learn")
        return

    analyzer = HybridAnalyzer()
    
    csv_file = os.path.join(os.path.dirname(__file__), 'ground_truth.csv')
    txt_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'txt'))
    
    if not os.path.exists(csv_file):
        print(f"Không tìm thấy file {csv_file}")
        return

    y_true_priority = []
    y_pred_priority = []
    
    print("\n" + "="*60)
    print(" BẮT ĐẦU CHẠY ĐÁNH GIÁ ĐỘ CHÍNH XÁC (EVALUATION)")
    print("="*60)

    # Đọc dữ liệu từ file CSV Ground Truth
    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            file_name = row['file_name'].strip()
            role = row['role'].strip()
            expected_priority = row['expected_priority'].strip()
            
            file_path = os.path.join(txt_dir, file_name)
            if not os.path.exists(file_path):
                print(f"Bỏ qua file không tồn tại: {file_name}")
                continue
                
            print(f"Đang test file: {file_name[:20]}... | Role: {role}")
            
            # CHẠY HỆ THỐNG AI ĐỂ LẤY DỰ ĐOÁN
            try:
                res = analyzer.analyze(file_path, target_name=role)
                predicted_priority = res.get('phan_loai', 'C')
                
                # Lưu vào mảng để tính toán
                y_true_priority.append(expected_priority)
                y_pred_priority.append(predicted_priority)
                
                print(f"  -> Thực tế (Expected): {expected_priority} | AI dự đoán (Predicted): {predicted_priority}")
            except Exception as e:
                print(f"  -> Lỗi khi phân tích: {e}")

    print("\n" + "="*60)
    print(" KẾT QUẢ ĐO LƯỜNG (METRICS)")
    print("="*60)
    
    if len(y_true_priority) > 0:
        acc = accuracy_score(y_true_priority, y_pred_priority)
        print(f"1. Độ chính xác tổng thể (Accuracy): {acc * 100:.2f}%")
        print("\n2. Báo cáo chi tiết (Precision, Recall, F1-Score) cho từng nhãn Độ ưu tiên:\n")
        
        # In bảng báo cáo chi tiết của scikit-learn
        report = classification_report(y_true_priority, y_pred_priority, zero_division=0)
        print(report)
    else:
        print("Không có dữ liệu hợp lệ để tính toán.")

if __name__ == "__main__":
    calculate_accuracy_metrics()
