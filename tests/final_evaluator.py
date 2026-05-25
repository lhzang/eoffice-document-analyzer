import os
import sys
import csv
import time
import pandas as pd
import numpy as np
from datetime import datetime

# Thêm thư mục gốc vào sys.path để nhận diện module core
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

def evaluate_system():
    # Thử import sklearn để tính toán metrics
    try:
        from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    except ImportError:
        print("[LỖI] Bạn cần cài scikit-learn: pip install scikit-learn pandas")
        return

    analyzer = HybridAnalyzer()
    csv_file = os.path.join(os.path.dirname(__file__), 'ground_truth.csv')
    txt_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'txt'))
    
    if not os.path.exists(csv_file):
        print(f"Không tìm thấy file {csv_file}")
        return

    # 1. ĐỌC VÀ TIỀN XỬ LÝ DỮ LIỆU
    print("--- Đang tải dữ liệu Test Cases ---")
    df = pd.read_csv(csv_file)
    
    # Chỉ giữ lại các dòng có dữ liệu 'role' (loại bỏ các dòng dư thừa ở cuối file CSV)
    df = df.dropna(subset=['role'])
    
    # Forward fill cho cột file_name
    df['file_name'] = df['file_name'].ffill()
    
    results = []
    
    print(f"\nBẮT ĐẦU ĐÁNH GIÁ {len(df)} TEST CASES...")
    print("="*80)
    print(f"{'STT':<4} | {'File Name':<30} | {'Role':<20} | {'Tier':<6} | {'Time':<6}")
    print("-"*80)

    for index, row in df.iterrows():
        file_name = str(row['file_name']).strip()
        # Thêm đuôi .txt nếu thiếu
        if not file_name.lower().endswith('.txt'):
            file_name += '.txt'
            
        role = str(row['role']).strip()
        expected_priority = str(row['expected_priority']).strip()
        
        file_path = os.path.join(txt_dir, file_name)
        
        if not os.path.exists(file_path):
            # Thử tìm file gần giống (không phân biệt hoa thường hoặc khoảng trắng thừa)
            found = False
            for f in os.listdir(txt_dir):
                if f.lower() == file_name.lower():
                    file_path = os.path.join(txt_dir, f)
                    found = True
                    break
            
            if not found:
                print(f"[{index+1:02}] KHÔNG TÌM THẤY FILE: {file_name}")
                continue

        # CHẠY PHÂN TÍCH
        start_time = time.time()
        try:
            # analyzer.analyze trả về: {phan_loai: 'A'/'B'/'C', action: {...}, tier_used: 1/2, ...}
            res = analyzer.analyze(file_path, target_name=role)
            elapsed = time.time() - start_time
            
            predicted_priority = res.get('phan_loai', 'C')
            tier_used = res.get('tier_used', 1)
            
            results.append({
                'file': file_name,
                'role': role,
                'expected': expected_priority,
                'predicted': predicted_priority,
                'tier': tier_used,
                'time': elapsed,
                'status': 'OK'
            })
            
            tier_str = f"Tier {tier_used}"
            print(f"{index+1:<4} | {file_name[:30]:<30} | {role[:20]:<20} | {tier_str:<6} | {elapsed:.2f}s")
            
        except Exception as e:
            print(f"{index+1:<4} | {file_name[:30]:<30} | {role[:20]:<20} | LỖI   | {str(e)[:20]}")
            results.append({
                'file': file_name,
                'role': role,
                'expected': expected_priority,
                'predicted': 'Error',
                'tier': 0,
                'time': 0,
                'status': f'Error: {str(e)}'
            })

    # 2. TÍNH TOÁN CÁC CHỈ SỐ
    res_df = pd.DataFrame(results)
    res_df = res_df[res_df['predicted'] != 'Error'] # Loại bỏ các case lỗi khi tính metric
    
    if res_df.empty:
        print("\n[!] Không có kết quả nào để tính toán.")
        return

    print("\n" + "="*30)
    print(" KẾT QUẢ ĐÁNH GIÁ TỔNG THỂ ")
    print("="*30)

    # Chỉ số Nhóm 1: Accuracy, Precision, Recall, F1
    y_true = res_df['expected']
    y_pred = res_df['predicted']
    
    acc = accuracy_score(y_true, y_pred)
    print(f"\n1. Accuracy (Độ chính xác tổng): {acc*100:.2f}%")
    
    print("\n2. Chi tiết theo từng nhãn (A=Khẩn, B=Cao, C=Bình thường):")
    report = classification_report(y_true, y_pred, labels=['A', 'B', 'C'], zero_division=0)
    print(report)

    # Chỉ số Nhóm 2: Performance
    avg_time = res_df['time'].mean()
    tier1_df = res_df[res_df['tier'] == 1]
    tier2_df = res_df[res_df['tier'] == 2]
    
    hit_rate_t1 = (len(tier1_df) / len(res_df)) * 100
    
    print("-" * 50)
    print(f"3. Latency (Thời gian trễ trung bình): {avg_time:.3f}s")
    if not tier1_df.empty:
        print(f"   - Tier 1 (Rule-based) trung bình: {tier1_df['time'].mean():.3f}s")
    if not tier2_df.empty:
        print(f"   - Tier 2 (LLM Llama3) trung bình: {tier2_df['time'].mean():.3f}s")
        
    print(f"\n4. Tier-1 Hit Rate: {hit_rate_t1:.2f}%")
    print(f"   (Hệ thống giải quyết được {len(tier1_df)}/{len(res_df)} văn bản bằng Rule-based, tiết kiệm chi phí AI)")
    print("-" * 50)

    # Lưu kết quả chi tiết ra CSV để xem lại
    output_path = os.path.join(os.path.dirname(__file__), 'evaluation_details.csv')
    res_df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"\n=> Đã lưu chi tiết kết quả từng case tại: evaluation_details.csv")

if __name__ == "__main__":
    evaluate_system()
