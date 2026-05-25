import re
import os
import sys

# Ensure stdout handles UTF-8 for Vietnamese printing
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

class Tier1Analyzer:
    def __init__(self):
        # Định nghĩa các mẫu Regex cho các trường dữ liệu quan trọng
        self.patterns = {
            'loai_van_ban': {
                'QUYET_DINH': r'(?i)QUYẾT\s+ĐỊNH',
                'CHI_THI': r'(?i)CHỈ\s+THỊ',
                'TO_TRINH': r'(?i)TỜ\s+TRÌNH',
                'NGHI_QUYET': r'(?i)NGHỊ\s+QUYẾT',
                'THONG_BAO': r'(?i)THÔNG\s+BÁO',
                'CONG_VAN': r'(?i)CÔNG\s+VĂN',
                'KE_HOACH': r'(?i)KẾ\s+HOẠCH'
            },
            'so_hieu': r'(?i)Số\s*:\s*([^\n\r]+)',
            'ngay_ban_hanh': r'(?i)(?:Hà\s+Nội,?\s+)?ngày\s+(\d+)\s+tháng\s+(\d+)\s+năm\s+(\d+)',
            'do_khan': r'(?i)(Hỏa\s+tốc|Thượng\s+khẩn|Khẩn)',
            # Regex cho deadline - Cực kỳ quan trọng theo định hướng của thầy
            'deadline': [
                r'(?i)trước\s+ngày\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
                r'(?i)chậm\s+nhất\s+ngày\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
                r'(?i)hạn\s+cuối\s+ngày\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
                r'(?i)đến\s+hết\s+ngày\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})'
            ]
        }

        # Bản đồ viết tắt cho các đơn vị
        self.acronym_map = {
            'TCNS': 'Ban Tổ chức - Nhân sự',
            'TCKH': 'Ban Tài chính - Kế hoạch',
            'VPDH': 'Văn phòng Đại học',
            'P. Đào tạo': 'Phòng Đào tạo',
            'P. KHCN': 'Phòng Khoa học Công nghệ',
            'Văn phòng': 'Văn phòng Đại học',
            'VT': 'Văn thư',
            'BM': 'Bộ môn',
            'TT': 'Trung tâm',
            'KHTH': 'Kế hoạch Tổng hợp'
        }

        # Trọng số loại văn bản (DocumentWeight) theo công thức thầy cho
        self.document_weights = {
            'QUYET_DINH': 2,
            'CHI_THI': 2,
            'CONG_VAN': 2, # "Công văn, yêu cầu"
            'KE_HOACH': 1,
            'THONG_BAO': 0,
            'CHUA_XAC_DINH': 0
        }

        # Bộ từ điển từ khóa phân loại hành động (Cải tiến mở rộng)
        self.action_keywords = {
            'A': [
                r'chủ trì', r'đầu mối', r'chỉ đạo', r'phê duyệt', 
                r'chịu trách nhiệm chính', r'giao cho', r'báo cáo', 
                r'gửi', r'ký duyệt', r'phu trách', r'đảm nhiệm', r'trực tiếp'
            ],
            'B': [
                r'phối hợp', r'thi hành', r'thực hiện', r'triển khai', 
                r'hỗ trợ', r'cho ý kiến', r'góp ý', r'đôn đốc', 
                r'giám sát', r'tham mưu', r'hướng dẫn'
            ]
        }

    def get_core_name(self, target_name):
        """
        Bóc tách tên lõi một cách thông minh:
        - Giữ nguyên tiền tố với 'Phòng', 'Văn phòng', 'Trung tâm' để tránh nhầm lẫn (VD: Phòng Đào tạo).
        - Có thể cắt tiền tố 'Ban', 'Trường', 'Viện' vì tên sau đó thường đặc thù hơn.
        """
        safe_to_strip = [r'^Ban\s+', r'^Trường\s+', r'^Viện\s+', r'^Khoa\s+']
        keep_prefix = [r'^Phòng\s+', r'^Văn\s+phòng\s+', r'^Trung\s+tâm\s+']
        
        # Nếu thuộc nhóm cần giữ, trả về nguyên bản
        for p in keep_prefix:
            if re.search(p, target_name, re.IGNORECASE):
                return target_name
                
        # Nếu thuộc nhóm an toàn, tiến hành bóc tách
        core_name = target_name
        for p in safe_to_strip:
            if re.search(p, target_name, re.IGNORECASE):
                core_name = re.sub(p, '', target_name, flags=re.IGNORECASE).strip()
                break
        return core_name

    def analyze(self, text, target_name=None):
        """
        Phân tích văn bản dựa trên Rule-based và Target Name (với cơ chế linh hoạt)
        """
        # Chuẩn hóa các loại dấu gạch ngang về một chuẩn duy nhất (-)
        text = text.replace('–', '-').replace('—', '-')
        if target_name:
            target_name = target_name.replace('–', '-').replace('—', '-')

        results = {
            'loai_van_ban': 'CHUA_XAC_DINH',
            'so_hieu': None,
            'ngay_ban_hanh': None,
            'do_khan': 'THUONG',
            'deadline': None,
            'phan_loai': 'C',
            'action': None,
            'reason': [],
            'base_class_score': 0,
            'doc_weight': 0,
            'urgency_weight': 0,
            'role_weight': 0,
            'target_found': False,
            'trich_yeu': None
        }

        lines = text.splitlines()
        header_text = "\n".join(lines[:100])
        footer_text = "\n".join(lines[-50:])
        
        # 1. Xác định loại văn bản & DocumentWeight
        for label, pattern in self.patterns['loai_van_ban'].items():
            match = re.search(pattern, header_text)
            if match:
                results['loai_van_ban'] = label
                results['doc_weight'] = self.document_weights.get(label, 0)
                
                # Trích xuất trích yếu nội dung (ngay sau Tên loại văn bản)
                after = header_text[match.end():]
                trich_yeu_lines = []
                for line in after.splitlines():
                    line = line.strip()
                    if not line:
                        continue
                    if line.isupper() and len(line) > 5:
                        break
                    if line.startswith("Căn cứ") or line.startswith("Theo đề nghị") or line.startswith("Kính gửi"):
                        break
                    trich_yeu_lines.append(line)
                
                if trich_yeu_lines:
                    results['trich_yeu'] = " ".join(trich_yeu_lines)
                break

        # 2. Trích xuất số hiệu
        match_so_hieu = re.search(self.patterns['so_hieu'], header_text)
        if match_so_hieu:
            so_hieu_val = match_so_hieu.group(1).strip()
            end_pos = match_so_hieu.end()
            remaining_text = header_text[end_pos:]
            
            next_lines = remaining_text.splitlines()
            for line in next_lines[:5]:  # xem tối đa 5 dòng tiếp theo
                line_stripped = line.strip()
                if not line_stripped:
                    continue
                
                # Dừng nếu gặp các tiêu đề lớn khác hoặc dòng quá dài (không phải ký hiệu)
                if any(kw in line_stripped.upper() for kw in ["CỘNG HÒA", "ĐỘC LẬP", "QUYẾT ĐỊNH"]) or len(line_stripped) > 20:
                    break
                    
                # Trường hợp 1: dòng tiếp theo bắt đầu bằng '/' (ví dụ "/QĐ-ĐHBK")
                if line_stripped.startswith('/'):
                    if not so_hieu_val.endswith('/'):
                        so_hieu_val = so_hieu_val + line_stripped
                    else:
                        so_hieu_val = so_hieu_val + line_stripped[1:]
                    break
                    
                # Trường hợp 2: Số hiệu cũ đã có '/' ở cuối và dòng tiếp theo là phần còn lại (ví dụ "QĐ-ĐHBK")
                elif so_hieu_val.endswith('/') and not '/' in line_stripped:
                    so_hieu_val = so_hieu_val + line_stripped
                    break
                    
                # Trường hợp 3: Dòng tiếp theo chứa dấu '/' ở giữa (ví dụ "QĐ/ĐHBK")
                elif '/' in line_stripped:
                    if not so_hieu_val.endswith('/'):
                        so_hieu_val = so_hieu_val + '/' + line_stripped
                    else:
                        so_hieu_val = so_hieu_val + line_stripped
                    break
                    
                # Trường hợp 4: Không có dấu '/' nào ở ranh giới nhưng dòng tiếp theo giống ký hiệu (ví dụ "QĐ-ĐHBK")
                elif re.match(r'^[a-zA-Z0-9-ĐĐđđ]+$', line_stripped):
                    if not so_hieu_val.endswith('/'):
                        so_hieu_val = so_hieu_val + '/' + line_stripped
                    else:
                        so_hieu_val = so_hieu_val + line_stripped
                    break
                    
            so_hieu_val = re.sub(r'\s*/\s*', '/', so_hieu_val)
            results['so_hieu'] = so_hieu_val

        # 3. Trích xuất ngày ban hành
        match_ngay = re.search(self.patterns['ngay_ban_hanh'], header_text)
        if match_ngay:
            day, month, year = match_ngay.groups()
            results['ngay_ban_hanh'] = f"{year}-{month.zfill(2)}-{day.zfill(2)}"

        # 4. Trích xuất Deadline
        for p in self.patterns['deadline']:
            m = re.search(p, text)
            if m:
                d, m, y = m.groups()
                results['deadline'] = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
                results['urgency_weight'] = 1 
                results['reason'].append(f"Tìm thấy deadline: {results['deadline']}")
                break

        # 5. Kiểm tra độ khẩn
        match_khan = re.search(self.patterns['do_khan'], header_text)
        if match_khan:
            results['do_khan'] = match_khan.group(1).upper()
            if results['do_khan'] in ['HỎA TỐC', 'THƯỢNG KHẨN']:
                results['urgency_weight'] = max(results['urgency_weight'], 2)

        # 6. PHÂN TÍCH THEO TARGET NAME (Cải tiến đa luồng: Tên đầy đủ, Tên lõi, Viết tắt)
        if target_name:
            possible_names = [target_name]
            core_name = self.get_core_name(target_name)
            if core_name != target_name:
                possible_names.append(core_name)
            
            # Tìm các viết tắt tương ứng từ acronym_map
            for acronym, full_name in self.acronym_map.items():
                if full_name.lower() in target_name.lower() or target_name.lower() in full_name.lower():
                    possible_names.append(acronym)
            
            # Xây dựng Search Pattern linh hoạt
            patterns = []
            for name in possible_names:
                parts = re.split(r'(\s+|-)', name)
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
                patterns.append("".join(escaped_parts))
            search_pattern = rf"(?i)\b({'|'.join(patterns)})\b"
            
            # 6.2 Kiểm tra trong "Nơi nhận" ở Footer
            if not results['target_found'] or results['phan_loai'] == 'C':
                if re.search(search_pattern, footer_text):
                    results['target_found'] = True
                    results['reason'].append(f"Tìm thấy '{target_name}' trong 'Nơi nhận'.")
                    if results['phan_loai'] == 'C':
                        results['role_weight'] = max(results['role_weight'], 0.5)

            # 6.3 Kiểm tra ngữ cảnh trong thân bài (Directives: Điều 1, Điều 2...)
            if not results['target_found'] or results['phan_loai'] != 'A':
                # Tìm khắp văn bản
                for match in re.finditer(search_pattern, text):
                    results['target_found'] = True
                    start, end = match.start(), match.end()
                    # Lấy ngữ cảnh xung quanh (Thu hẹp lại để tránh dính từ khóa của Điều khác)
                    context = text[max(0, start - 150):min(len(text), end + 150)]
                    
                    # 6.3.1 Quy tắc phân tách ngữ cảnh thủ tục (Procedural Context Rule)
                    # Nếu nằm trong Điều khoản thi hành -> Mặc định là loại B
                    is_procedural = False
                    thi_hanh_patterns = [
                        r'(?i)chịu\s+trách\s+nhiệm\s+thi\s+hành',
                        r'(?i)thi\s+hành\s+Quyết\s+định\s+này',
                        r'(?i)Điều\s+\d+.*?thi\s+hành'
                    ]
                    
                    for p in thi_hanh_patterns:
                        if re.search(p, context, re.DOTALL):
                            is_procedural = True
                            break
                    
                    if is_procedural and results['phan_loai'] != 'A':
                        results['phan_loai'] = 'B'
                        results['base_class_score'] = 2
                        results['role_weight'] = 1
                        results['action'] = "Phối hợp thi hành quyết định theo điều khoản cuối."
                        results['reason'].append("Nằm trong ngữ cảnh 'thi hành quyết định' (Thủ tục chung -> Loại B).")
                        # Tiếp tục quét để xem có 'A' ở đoạn khác không, nhưng không xét từ khóa 'A' TRONG đoạn này nữa
                        continue 

                    # Check hành động A
                    for kw in self.action_keywords['A']:
                        if re.search(rf"(?i){kw}", context):
                            results['phan_loai'] = 'A'
                            results['base_class_score'] = 3
                            results['role_weight'] = 2
                            results['reason'].append(f"Đối tượng đi kèm từ khóa chủ trì: '{kw}'")
                            break
                    
                    # Check hành động B
                    if results['phan_loai'] != 'A':
                        for kw in self.action_keywords['B']:
                            if re.search(rf"(?i){kw}", context):
                                results['phan_loai'] = 'B'
                                results['base_class_score'] = 2
                                results['role_weight'] = 1
                                results['reason'].append(f"Đối tượng đi kèm từ khóa phối hợp: '{kw}'")
                                break
                    
                    if results['phan_loai'] == 'A':
                        break 

        return results

if __name__ == "__main__":
    analyzer = Tier1Analyzer()
    sample_text = """
    QUYẾT ĐỊNH
    Số: 456/QĐ-ĐHBK
    Hà Nội, ngày 21 tháng 04 năm 2024
    
    Giao cho Phòng CNTT chủ trì thực hiện dự án X.
    Yêu cầu gửi báo cáo trước ngày 30/04/2026.
    
    Nơi nhận:
    - Ban Giám đốc;
    - Phòng CNTT;
    """
    res = analyzer.analyze(sample_text, target_name="Phòng CNTT")
    import json
    print(json.dumps(res, indent=4, ensure_ascii=False))
