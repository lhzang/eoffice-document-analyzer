import sys
import os

import sys
import os
# Thêm thư mục core vào sys.path để import được các module lõi
core_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'core'))
if core_path not in sys.path:
    sys.path.append(core_path)

from hybrid_analyzer import HybridAnalyzer

analyzer = HybridAnalyzer()
test_file = r"d:\study\DoAn_eOffice\data\txt\01 Qd-PHE DUYET DM nhiem vu  CT Edge AI-1.txt"
target = "Trường Công nghệ Thông tin và Truyền thông"

if os.path.exists(test_file):
    with open(test_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    smart_context = analyzer.get_smart_context(content, target)
    
    print(f"Original length: {len(content)}")
    print(f"Smart length: {len(smart_context)}")
    print("\n--- SMART CONTEXT PREVIEW ---")
    print(smart_context[:500])
    print("\n[...]\n")
    print(smart_context[len(smart_context)//2 - 250 : len(smart_context)//2 + 250])
    print("\n[...]\n")
    print(smart_context[-500:])
else:
    print("File not found")
