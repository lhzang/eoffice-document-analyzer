import os
import json
import sys

root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if root_path not in sys.path:
    sys.path.append(root_path)

from core.hybrid_analyzer import HybridAnalyzer

def test_multi_roles():
    analyzer = HybridAnalyzer()
    
    # Một file mẫu thực tế chứa thông tin mới nhất
    test_file = r"d:\study\DoAn_eOffice\data\txt\20250819. QD vv thanh lap Hoi dong BGK Vong y tuong Cuoc thi Sang tao tre nam 2025.txt"
    
    # Tập trung test vào đối tượng thực trong văn bản mới
    roles_to_test = [
        "Ban Tài chính - Kế hoạch",       
        "Đỗ Bá Lâm",
        "Phòng đào tạo" 
    ]
    
    print(f"BẮT ĐẦU TEST PHÂN LOẠI THEO VAI TRÒ")
    print(f"File: {os.path.basename(test_file)}")
    print("-" * 60)
    
    results = {}
    for role in roles_to_test:
        print(f"\n>>> Đang phân tích cho: {role}...")
        res = analyzer.analyze(test_file, target_name=role)
        results[role] = {
            "Type": res['action']['type'],
            "Priority": res['priority_label'],
            "Score": res['priority_score'],
            "Action": res['action']['suggested'],
            "Reason": res['reason']
        }

    print("\n" + "="*80)
    print(f"{'VAI TRÒ':<25} | {'LOẠI':<5} | {'ƯU TIÊN':<12} | {'ĐIỂM':<5} | {'HÀNH ĐỘNG'}")
    print("-" * 80)
    for role, data in results.items():
        print(f"{role:<25} | {data['Type']:<5} | {data['Priority']:<12} | {data['Score']:<5} | {data['Action']}")
    print("="*80)

if __name__ == "__main__":
    test_multi_roles()
