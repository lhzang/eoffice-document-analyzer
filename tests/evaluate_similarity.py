import os
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util

def evaluate_similarity():
    csv_file = os.path.join(os.path.dirname(__file__), 'extracted_actions_results.csv')
    if not os.path.exists(csv_file):
        print(f"Không tìm thấy file {csv_file}")
        return

    print("--- Đang đọc dữ liệu từ extracted_actions_results.csv ---")
    df = pd.read_csv(csv_file)
    
    print("--- Đang tải mô hình SentenceTransformer (Lần đầu sẽ hơi lâu để tải mô hình) ---")
    # Sử dụng mô hình đa ngôn ngữ hỗ trợ tiếng Việt rất tốt và nhẹ (~400MB)
    model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
    
    print("--- Đang tính toán độ tương đồng ngữ nghĩa ---")
    expected_actions = df['expected_action'].fillna('Xem để biết').tolist()
    extracted_actions = df['extracted_action'].fillna('Xem để biết').tolist()
    
    # Tính embedding cho toàn bộ danh sách
    print("Đang tạo vector đặc trưng...")
    embeddings1 = model.encode(expected_actions, convert_to_tensor=True)
    embeddings2 = model.encode(extracted_actions, convert_to_tensor=True)
    
    # Tính cosine similarity cho từng cặp
    print("Đang so sánh...")
    similarities = []
    for i in range(len(df)):
        sim = util.cos_sim(embeddings1[i], embeddings2[i]).item()
        similarities.append(round(sim, 4))
        
    df['similarity_score'] = similarities
    
    # Ngưỡng chấp nhận (0.60 là mức khá an toàn cho việc đồng nghĩa trong tiếng Việt)
    threshold = 0.60
    df['is_match'] = df['similarity_score'] >= threshold
    
    # Tính Accuracy
    accuracy = df['is_match'].mean() * 100
    avg_sim = df['similarity_score'].mean()
    
    print("\n" + "="*60)
    print(f"KẾT QUẢ ĐÁNH GIÁ ĐỘ TƯƠNG ĐỒNG NGỮ NGHĨA (Ngưỡng >= {threshold})")
    print("="*60)
    print(f"Tổng số mẫu test: {len(df)}")
    print(f"Số mẫu khớp (True): {df['is_match'].sum()}")
    print(f"Số mẫu không khớp (False): {len(df) - df['is_match'].sum()}")
    print(f"Độ chính xác (Accuracy): {accuracy:.2f}%")
    print(f"Điểm tương đồng trung bình: {avg_sim:.4f}")
    print("="*60)
    
    # Lưu file kết quả mới
    output_file = os.path.join(os.path.dirname(__file__), 'evaluated_actions_results.csv')
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"==> Đã lưu kết quả chi tiết tại: {output_file}")
    
    # Hiển thị tất cả các mẫu sai để phân tích
    print("\n--- DANH SÁCH TẤT CẢ CÁC MẪU KHÔNG KHỚP ---")
    false_samples = df[df['is_match'] == False]
    for idx, row in false_samples.iterrows():
        print(f"\n[Dòng {idx+2}]")
        print(f" - Role     : {row['role']}")
        print(f" - Expected : {row['expected_action']}")
        print(f" - Extracted: {row['extracted_action']}")
        print(f" - Score    : {row['similarity_score']}")

if __name__ == "__main__":
    evaluate_similarity()
