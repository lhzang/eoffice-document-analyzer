import os
import sys
import json
import sys
import os
# Thêm thư mục core vào sys.path để import được các module lõi
core_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'core'))
if core_path not in sys.path:
    sys.path.append(core_path)

from tier1_rules import Tier1Analyzer

# Ensure stdout handles UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def run_test_all(txt_dir):
    analyzer = Tier1Analyzer()
    txt_files = [f for f in os.listdir(txt_dir) if f.lower().endswith('.txt')]
    
    stats = {
        'total': len(txt_files),
        'identified': 0,
        'unidentified': 0,
        'counts': {}
    }
    
    results = []

    print(f"Bắt đầu phân tích {len(txt_files)} file...")

    for f_name in txt_files:
        path = os.path.join(txt_dir, f_name)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            res = analyzer.analyze(content)
            res['file_name'] = f_name
            results.append(res)
            
            label = res['loai_van_ban']
            if label != 'CHUA_XAC_DINH':
                stats['identified'] += 1
            else:
                stats['unidentified'] += 1
            
            stats['counts'][label] = stats['counts'].get(label, 0) + 1

    print("\n--- THỐNG KÊ KẾT QUẢ TẦNG 1 ---")
    print(f"Tổng số file: {stats['total']}")
    print(f"Đã nhận diện: {stats['identified']} ({stats['identified']/stats['total']*100:.2f}%)")
    print(f"Chưa nhận diện: {stats['unidentified']} ({stats['unidentified']/stats['total']*100:.2f}%)")
    print("\nChi tiết các loại:")
    for label, count in stats['counts'].items():
        print(f"- {label}: {count}")

    # Lưu kết quả ra file JSON để xem kỹ hơn
    output_path = os.path.join(os.path.dirname(txt_dir), "tier1_results.json")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
    print(f"\nĐã lưu danh sách chi tiết tại: {output_path}")

if __name__ == "__main__":
    TXT_DIR = r"d:\study\DoAn_eOffice\data\txt"
    run_test_all(TXT_DIR)
