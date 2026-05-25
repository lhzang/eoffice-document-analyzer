import os
import sys
import time

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

def interactive_test():
    analyzer = HybridAnalyzer()
    txt_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'txt'))
    
    # Lấy danh sách file txt
    files = [f for f in os.listdir(txt_dir) if f.endswith('.txt')]
    
    if not files:
        print("Không tìm thấy file .txt nào trong thư mục txt/")
        return

    print("\n" + "="*60)
    print(" CHƯƠNG TRÌNH TEST TƯƠNG TÁC eOFFICE ANALYZER ")
    print("="*60)

    while True:
        print("\nDANH SÁCH FILE CÓ SẴN:")
        for i, f in enumerate(files[:15]): # Hiển thị 15 file đầu tiên
            print(f"{i+1}. {f}")
        if len(files) > 15:
            print("... và nhiều file khác.")
            
        try:
            choice = input("\nChọn số thứ tự file (hoặc 'q' để thoát): ")
            if choice.lower() == 'q':
                break
            
            idx = int(choice) - 1
            selected_file = files[idx]
            file_path = os.path.join(txt_dir, selected_file)
            
            role = input(f"Nhập vai trò (Role) muốn phân tích trong file '{selected_file}': ")
            if not role:
                role = "Ban Giám đốc" # Mặc định
                
            print("\n" + "-"*50)
            print(f"ĐANG PHÂN TÍCH CHO: {role}")
            print("-"*50)
            
            start_time = time.time()
            res = analyzer.analyze(file_path, target_name=role)
            elapsed = time.time() - start_time
            
            print(f"\n[KẾT QUẢ]")
            print(f"- Loại ưu tiên: {res.get('phan_loai', 'C')} ({res.get('priority_label', 'N/A')})")
            print(f"- Hành động gợi ý: {res['action']['suggested']}")
            print(f"- Thời gian xử lý: {elapsed:.2f}s")
            print(f"- Tầng xử lý: Tier {res.get('tier_used', 'Unknown')}")
            print(f"- Lý do: {res.get('reason', 'N/A')}")
            
            print("\n" + "="*60)
            
        except Exception as e:
            print(f"\n[LỖI]: {e}")
            input("Nhấn Enter để tiếp tục...")

if __name__ == "__main__":
    interactive_test()
