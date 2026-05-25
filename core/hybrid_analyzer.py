import os
import json
from openai import OpenAI
import time
import re
from core.tier1_rules import Tier1Analyzer

class HybridAnalyzer:
    def __init__(self, model_name='qwen2.5-7b-instruct'):
        self.tier1 = Tier1Analyzer()
        self.model_name = model_name
        self.client = OpenAI(
            base_url="http://localhost:1234/v1",
            api_key="lm-studio"
        )

    def format_minimalist_result(self, final_results, target_name, start_time, tier2_used=False):
        """
        Hàm phụ trợ để đóng gói kết quả theo chuẩn tối giản, trả về điểm ưu tiên dạng số thực
        tiệm cận vô tỉ từ 0 đến 1.0 (1.0 là tối đa) để so sánh và sắp xếp.
        """
        base_class_score = final_results.get('base_class_score', 0)
        role_weight = final_results.get('role_weight', 0)
        doc_weight = final_results.get('doc_weight', 0)
        confidence = final_results.get('confidence', 1.0 if not tier2_used else 0.8)

        # Tính toán urgency_weight liên tục dựa trên deadline, bám sát các mốc của guidance:
        # - Dưới 3 ngày: Trọng số 3.0 (giảm nhẹ từ 3.0 về 2.6 dựa trên ngày cụ thể)
        # - Từ 3 đến 7 ngày: Trọng số 2.0 (giảm nhẹ từ 2.0 về 1.6 dựa trên ngày cụ thể)
        # - Trên 7 ngày: Trọng số 1.0 (giảm tiệm cận về 0 dựa trên ngày cụ thể)
        # - Không deadline: Trọng số 0.0
        deadline = final_results.get('deadline')
        ngay_ban_hanh = final_results.get('ngay_ban_hanh')
        urgency_weight = 0.0

        if deadline:
            try:
                from datetime import datetime
                import math

                deadline_date = None
                for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
                    try:
                        deadline_date = datetime.strptime(deadline.strip(), fmt).date()
                        break
                    except ValueError:
                        continue

                if deadline_date:
                    base_date = None
                    if ngay_ban_hanh:
                        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%Y/%m/%d"):
                            try:
                                base_date = datetime.strptime(ngay_ban_hanh.strip(), fmt).date()
                                break
                            except ValueError:
                                continue
                    
                    if not base_date:
                        base_date = datetime.now().date()

                    diff_days = (deadline_date - base_date).days
                    
                    if diff_days <= 0:
                        urgency_weight = 3.0
                    elif diff_days < 3:
                        # Mốc < 3 ngày: Trọng số [2.61, 3.0] để tạo độ lệch so sánh
                        urgency_weight = 3.0 - 0.13 * diff_days
                    elif diff_days <= 7:
                        # Mốc từ 3 đến 7 ngày: Trọng số [1.68, 2.0] để tạo độ lệch so sánh
                        urgency_weight = 2.0 - 0.08 * (diff_days - 3)
                    else:
                        # Mốc trên 7 ngày: Trọng số [0.0, 1.0] giảm tiệm cận (dạng số vô tỉ)
                        urgency_weight = 1.0 / (1.0 + (diff_days - 7) * 0.04)
                else:
                    # Gán giá trị mặc định là 1.0 cho deadline dạng chuỗi chữ tự do
                    urgency_weight = 1.0
            except Exception:
                urgency_weight = 1.0

        # Tổng điểm thô (Tối đa = 3 + 3 + 2 = 8.0)
        raw_score = base_class_score + urgency_weight + doc_weight

        # Áp dụng công thức tính điểm ưu tiên chuẩn hóa (Max là 1.0)
        # Kết hợp thêm hệ số tin cậy confidence để làm lệch nhẹ các case trùng điểm
        scaled_score = (raw_score * (0.9 + 0.1 * confidence)) / 8.0
        scaled_score = max(0.0, min(1.0, scaled_score))

        # Sử dụng lũy thừa bậc sqrt(2) để đưa điểm số về dạng số vô tỉ tiệm cận (giảm trùng lặp)
        # mà vẫn bảo toàn thứ tự ưu tiên (monotonicity) và mốc 1.0 tuyệt đối.
        priority_score = (scaled_score) ** 1.41421356
        priority_score = round(priority_score, 8)

        # Phân loại độ ưu tiên dựa trên điểm số đã chuẩn hóa (sử dụng scaled_score trước lũy thừa để đồng bộ ngưỡng cũ)
        if scaled_score > 0.6:
            priority_label = "CAO"
        elif scaled_score >= 0.3:
            priority_label = "TRUNG BÌNH"
        else:
            priority_label = "THẤP"

        duration = time.time() - start_time
        
        # Mặc định lý do và hành động từ T1
        suggested_action = final_results.get('action')
        if not suggested_action:
            if final_results.get('phan_loai') == 'C':
                suggested_action = "Theo dõi nội dung văn bản"
            else:
                suggested_action = "N/A"

        # Độ tin cậy: T1 chắc chắn -> 1.0, T2 -> theo model
        confidence = final_results.get('confidence', 1.0 if not tier2_used else 0.8)

        return {
            "target_name": target_name,
            "priority_score": priority_score,
            "priority_label": priority_label,
            "tier_used": 2 if tier2_used else 1,
            "phan_loai": final_results.get('phan_loai', 'C'),
            "so_hieu": final_results.get('so_hieu'),
            "trich_yeu": final_results.get('trich_yeu'),
            "action": {
                "type": final_results.get('phan_loai', 'C'),
                "suggested": suggested_action,
                "deadline": final_results.get('deadline')
            },
            "reason": " | ".join(final_results.get('reason', [])),
            "confidence": confidence,
            "debug_factors": {
                "base": base_class_score,
                "role": role_weight,
                "urgency": urgency_weight,
                "doc": doc_weight
            },
            "metadata": {
                "processing_time_sec": round(duration, 2),
                "tier2_used": tier2_used
            }
        }

    def analyze(self, file_path, target_name=None):
        """
        Phân tích văn bản kết hợp Rule-based và LLM theo vai trò (Target Name)
        """
        start_time = time.time()
        
        # 1. Đọc nội dung file
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                full_content = f.read()
        except Exception as e:
            return {"error": f"Không thể đọc file: {e}"}

        # Chuẩn hóa các loại dấu gạch ngang về một chuẩn duy nhất (-) để tránh lỗi lệch khớp
        full_content = full_content.replace('–', '-').replace('—', '-')
        if target_name:
            target_name = target_name.replace('–', '-').replace('—', '-')

        # 2. Chạy Tầng 1 (Rule-based) trên TOÀN BỘ văn bản
        print(f"\n[TIER 1] Đang phân tích bằng tập luật cho: '{target_name}'...")
        t1_results = self.tier1.analyze(full_content, target_name=target_name)
        
        # 3. KIỂM TRA NGẮT SỚM (SHORT-CIRCUIT) ĐỂ TĂNG TỐC
        # Nếu Tầng 1 không tìm thấy đối tượng -> Không cần gọi AI
        if not t1_results.get('target_found', False):
            print(f"[TIER 1] Không tìm thấy đối tượng '{target_name}'. Chuyển thẳng về loại C.")
            t1_results['reason'].append("Đối tượng không được nhắc tới trong văn bản.")
            return self.format_minimalist_result(t1_results, target_name, start_time, tier2_used=False)

        # Nếu Tầng 1 đã cực kỳ chắc chắn là loại A (qua mục Kính gửi, đơn vị đề nghị hoặc Điều khoản thi hành)
        if t1_results.get('phan_loai') == 'A' and any(kw in r for kw in ["Kính gửi", "đề nghị", "thi hành"] for r in t1_results.get('reason', [])):
            print(f"[TIER 1] Đã nhận diện chắc chắn loại A qua cấu trúc văn bản. Bỏ qua Tầng 2.")
            return self.format_minimalist_result(t1_results, target_name, start_time, tier2_used=False)

        # 4. Chuẩn bị Context rút gọn cho LLM
        smart_content = self.get_smart_context(full_content, target_name)

        # 5. Chạy Tầng 2 (LLM)
        print(f"[TIER 2] Đang gọi LLM ({self.model_name}) cho '{target_name}'...")
        t2_results = self.call_tier2(smart_content, target_name)
        
        final_results = t1_results.copy()
        tier2_active = False
        
        if t2_results:
            tier2_active = True
            # AI có thể ghi đè hành động và lý do
            if t2_results.get('action'):
                final_results['action'] = t2_results.get('action')
                
            if t2_results.get('deadline'):
                final_results['deadline'] = t2_results.get('deadline')
            
            final_results['confidence'] = t2_results.get('confidence', 0.5)
            
            # Cập nhật loại từ AI
            t2_type = t2_results.get('type', 'C')
            if t2_type in ['A', 'B']:
                final_results['phan_loai'] = t2_type
                if t2_type == 'A':
                    final_results['base_class_score'] = 3
                    final_results['role_weight'] = 2
                elif t2_type == 'B':
                    final_results['base_class_score'] = 2
                    final_results['role_weight'] = 1
            
            if t2_results.get('reason'):
                final_results['reason'].append(f"AI: {t2_results['reason']}")

        return self.format_minimalist_result(final_results, target_name, start_time, tier2_used=tier2_active)

    def get_smart_context(self, text, target_name):
        """
        Trích xuất các đoạn văn bản quan trọng liên quan đến target_name
        """
        lines = text.splitlines()
        header = "\n".join(lines[:30])  # Lấy 30 dòng đầu
        footer = "\n".join(lines[-20:]) # Lấy 20 dòng cuối
        
        # Tìm các đoạn có chứa target_name
        matches = []
        # Chuyển target_name thành pattern linh hoạt
        parts = re.split(r'(\s+|-)', target_name)
        escaped_parts = []
        for part in parts:
            if not part:
                continue
            if part.isspace():
                escaped_parts.append(r'\s+')
            elif part == '-':
                escaped_parts.append(r'\s*-\s*')
            else:
                escaped_parts.append(re.escape(part))
        pattern = re.compile("".join(escaped_parts), re.IGNORECASE)
        
        for i, line in enumerate(lines):
            if pattern.search(line):
                # Lấy 3 dòng trước và 3 dòng sau
                start = max(0, i - 3)
                end = min(len(lines), i + 4)
                matches.append("\n".join(lines[start:end]))
        
        # Ghép lại thành context
        context = f"--- PHẦN ĐẦU VĂN BẢN ---\n{header}\n\n"
        if matches:
            context += "--- CÁC ĐOẠN TRỰC TIẾP NHẮC TỚI ĐỐI TƯỢNG ---\n"
            context += "\n...\n".join(matches[:10]) # Giới hạn 10 đoạn
            context += "\n\n"
        context += f"--- PHẦN CUỐI VĂN BẢN ---\n{footer}"
        
        return context

    def call_tier2(self, text, target_name):
        """
        Gọi Ollama để phân tích sâu cho một đối tượng cụ thể
        """
        prompt = f"""
        Bạn là chuyên gia hành chính eOffice. Phân tích văn bản sau đối với thực thể: '{target_name}'.
        Lưu ý: Văn bản có thể đã được lược bớt để hiển thị các đoạn quan trọng nhất.
        
        Yêu cầu trả về JSON chuẩn với các trường:
        1. "type": (A, B, C) 
           - A: '{target_name}' cần thực hiện hành động cụ thể (chủ trì, nộp báo cáo, tham gia...).
           - B: '{target_name}' cần phối hợp, theo dõi hoặc góp ý.
           - C: '{target_name}' chỉ nhận để biết, không có nhiệm vụ.
        2. "action": Mô tả hành động cụ thể mà '{target_name}' cần làm (dưới 15 từ).
        3. "deadline": Thời hạn (deadline) hoặc mốc thời gian hoàn thành công việc của '{target_name}' lấy từ văn bản (VD: "30/04/2026", "tháng 11 năm 2026"). Nếu không tìm thấy, trả về null.
        4. "reason": Giải thích ngắn gọn tại sao chọn loại đó.
        5. "confidence": Độ tin cậy của bạn (từ 0.0 đến 1.0).

        Chỉ trả về JSON, không giải thích gì thêm.

        Nội dung văn bản:
        {text}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=0
            )
            
            full_response = response.choices[0].message.content
            start = full_response.find('{')
            end = full_response.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = full_response[start:end]
                return json.loads(json_str)
            return None
        except Exception as e:
            print(f"[LỖI TIER 2]: {e}")
            return None

if __name__ == "__main__":
    analyzer = HybridAnalyzer()
    
    # Test với file cực dài (46k ký tự) mà bạn đã chỉ định
    test_file = r"d:\study\DoAn_eOffice\data\txt\01 Qd-PHE DUYET DM nhiem vu  CT Edge AI-1.txt"
    target = "Trường Công nghệ Thông tin và Truyền thông" 
    
    if os.path.exists(test_file):
        result = analyzer.analyze(test_file, target_name=target)
        print("\n" + "="*50)
        print(f"KẾT QUẢ PHÂN TÍCH CHO: {target}")
        print("="*50)
        print(json.dumps(result, indent=4, ensure_ascii=False))
    else:
        print(f"Không tìm thấy file: {test_file}")
