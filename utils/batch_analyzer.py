import os
import json
import pandas as pd
import sys
import os
# Thêm thư mục core vào sys.path để import được các module lõi
core_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'core'))
if core_path not in sys.path:
    sys.path.append(core_path)

from hybrid_analyzer import HybridAnalyzer
from datetime import datetime

def batch_process(txt_dir, output_excel, output_json):
    analyzer = HybridAnalyzer()
    all_results = []
    
    # Lấy danh sách tất cả các file .txt
    files = [f for f in os.listdir(txt_dir) if f.endswith('.txt')]
    total_files = len(files)
    
    print(f"--- BẮT ĐẦU QUÉT {total_files} FILE VĂN BẢN ---")
    print(f"Thời gian bắt đầu: {datetime.now().strftime('%H:%M:%S')}")
    
    for i, filename in enumerate(files):
        file_path = os.path.join(txt_dir, filename)
        print(f"[{i+1}/{total_files}] Đang xử lý: {filename}...")
        
        try:
            result = analyzer.analyze(file_path)
            result['file_name'] = filename
            all_results.append(result)
            
            # Lưu dự phòng vào JSON sau mỗi 5 file để tránh mất dữ liệu nếu bị ngắt quãng
            if (i + 1) % 5 == 0:
                with open(output_json, 'w', encoding='utf-8') as jf:
                    json.dump(all_results, jf, indent=4, ensure_ascii=False)
                    
        except Exception as e:
            print(f"!! LỖI khi xử lý file {filename}: {e}")
            all_results.append({
                "file_name": filename,
                "error": str(e)
            })

    # Xuất ra Excel
    print("\n--- ĐANG XUẤT BÁO CÁO EXCEL ---")
    
    # Làm phẳng dữ liệu cho Excel
    flattened_data = []
    for res in all_results:
        if "error" in res:
            flattened_data.append(res)
            continue
            
        item = {
            "file_name": res.get("file_name"),
            "target_name": res.get("target_name"),
            "priority_score": res.get("priority_score"),
            "priority_label": res.get("priority_label"),
            "action_type": res.get("action", {}).get("type"),
            "suggested_action": res.get("action", {}).get("suggested"),
            "deadline": res.get("action", {}).get("deadline"),
            "reason": res.get("reason"),
            "tier2_used": res.get("metadata", {}).get("tier2_used"),
            "processing_time": res.get("metadata", {}).get("processing_time_sec")
        }
        flattened_data.append(item)
        
    df = pd.DataFrame(flattened_data)
    
    df.to_excel(output_excel, index=False)
    print(f"Thành công! Đã lưu báo cáo tại: {output_excel}")
    print(f"Bản sao lưu JSON tại: {output_json}")
    print(f"Thời gian kết thúc: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    DATA_DIR = r"d:\study\DoAn_eOffice\data\txt"
    OUTPUT_XLSX = r"d:\study\DoAn_eOffice\data\batch_analysis_results.xlsx"
    OUTPUT_JSON = r"d:\study\DoAn_eOffice\data\batch_analysis_temp.json"
    
    batch_process(DATA_DIR, OUTPUT_XLSX, OUTPUT_JSON)
