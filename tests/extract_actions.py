import os
import sys
import pandas as pd
import time

# Thêm thư mục gốc vào sys.path để nhận diện module core
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

def run_action_extraction():
    analyzer = HybridAnalyzer()
    csv_file = os.path.join(os.path.dirname(__file__), 'ground_truth.csv')
    txt_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'txt'))
    
    if not os.path.exists(csv_file):
        print(f"Không tìm thấy file {csv_file}")
        return

    # 1. ĐỌC VÀ TIỀN XỬ LÝ DỮ LIỆU
    print("--- Đang tải dữ liệu từ ground_truth.csv ---")
    df = pd.read_csv(csv_file)
    
    # Chỉ giữ lại các dòng có dữ liệu 'role'
    df = df.dropna(subset=['role'])
    
    # Forward fill cho cột file_name
    df['file_name'] = df['file_name'].ffill()
    
    print(f"\nBẮT ĐẦU TRÍCH XUẤT HÀNH ĐỘNG CHO {len(df)} TRƯỜNG HỢP...")
    print("="*100)
    print(f"{'STT':<4} | {'File Name':<30} | {'Role':<25} | {'Hành động trích xuất (AI)':<40}")
    print("-"*100)

    extracted_data = []

    for index, row in df.iterrows():
        file_name = str(row['file_name']).strip()
        # Thêm đuôi .txt nếu thiếu
        if not file_name.lower().endswith('.txt'):
            file_name += '.txt'
            
        role = str(row['role']).strip()
        expected_action = str(row.get('expected_action', 'N/A')).strip()
        
        file_path = os.path.join(txt_dir, file_name)
        
        if not os.path.exists(file_path):
            # Thử tìm file gần giống
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
        try:
            res = analyzer.analyze(file_path, target_name=role)
            suggested_action = res.get('action', {}).get('suggested', 'N/A')
            
            # Nếu loại C và hành động là mặc định, đổi thành "Xem để biết" theo yêu cầu
            if res.get('phan_loai') == 'C' and (suggested_action == "Theo dõi nội dung văn bản" or suggested_action == "N/A"):
                suggested_action = "Xem để biết"
                
            print(f"{index+1:<4} | {file_name[:30]:<30} | {role[:25]:<25} | {suggested_action[:40]:<40}")
            
            extracted_data.append({
                'file_name': file_name,
                'role': role,
                'expected_action': expected_action,
                'extracted_action': suggested_action,
                'phan_loai': res.get('phan_loai', 'C')
            })
            
        except Exception as e:
            print(f"{index+1:<4} | {file_name[:30]:<30} | {role[:25]:<25} | LỖI: {str(e)[:30]}")

    # Lưu kết quả ra file CSV mới
    output_df = pd.DataFrame(extracted_data)
    output_path = os.path.join(os.path.dirname(__file__), 'extracted_actions_results.csv')
    output_df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print("="*100)
    print(f"\n=> Đã lưu kết quả trích xuất tại: {output_path}")

if __name__ == "__main__":
    run_action_extraction()
