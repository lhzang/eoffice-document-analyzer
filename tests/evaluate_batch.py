import os
import json
import sys
import time
import csv
from glob import glob

# Thêm thư mục gốc vào sys.path để nhận diện module core
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

def run_batch_evaluation():
    analyzer = HybridAnalyzer()
    
    txt_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'txt'))
    txt_files = glob(os.path.join(txt_dir, '*.txt'))
    
    # Định nghĩa các role cần test cho mọi văn bản (hoặc bạn có thể tạo một file CSV config riêng)
    test_roles = [
        "Ban Tài chính - Kế hoạch",
        "Đỗ Bá Lâm",
        "Phòng đào tạo",
        "Ban Lãnh đạo"
    ]
    
    output_csv = os.path.join(os.path.dirname(__file__), 'evaluation_results.csv')
    
    print(f"BẮT ĐẦU ĐÁNH GIÁ TỰ ĐỘNG {len(txt_files)} FILE...")
    print(f"Kết quả sẽ được lưu tại: {output_csv}\n")
    
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['File', 'Role', 'Tier Used', 'Process Time (s)', 'Type', 'Priority', 'Score', 'Action', 'Reason'])
        
        for file_path in txt_files:
            file_name = os.path.basename(file_path)
            print(f"Đang xử lý: {file_name}")
            
            for role in test_roles:
                start_time = time.time()
                
                try:
                    res = analyzer.analyze(file_path, target_name=role)
                    end_time = time.time()
                    process_time = round(end_time - start_time, 2)
                    
                    tier_used = res.get('tier_used', 'Unknown')
                    
                    writer.writerow([
                        file_name,
                        role,
                        tier_used,
                        process_time,
                        res['action']['type'],
                        res['priority_label'],
                        res['priority_score'],
                        res['action']['suggested'],
                        res['reason']
                    ])
                    
                    print(f"  - {role}: {tier_used} ({process_time}s)")
                except Exception as e:
                    print(f"  - {role}: LỖI - {str(e)}")
                    writer.writerow([file_name, role, 'Error', 0, 'Error', 'Error', 0, 'Error', str(e)])
                    
    print("\nHOÀN THÀNH ĐÁNH GIÁ!")

if __name__ == "__main__":
    run_batch_evaluation()
