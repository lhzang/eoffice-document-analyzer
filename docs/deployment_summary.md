# Tổng hợp Kế hoạch Triển khai Server & Tích hợp AI (Đồ án eOffice)

## 1. Thông tin Server & Môi trường
- **Cấu hình:** 16 Core CPU, 32GB RAM. (Đủ mạnh để chạy các model LLM cỡ 7B-9B mượt mà trên CPU/RAM).
- **Mục tiêu:** Deploy hệ thống Python (Hybrid Analyzer) lên Server đại học để tự động phân tích văn bản đến (đưa ra Mức độ ưu tiên & Gợi ý hành động).

## 2. Truy cập Server & Quản lý Code
- **Kết nối (Remote Access):** Sử dụng **VS Code + Extension "Remote - SSH"** để kết nối và code trực tiếp trên server (Cú pháp: `ssh username@IP_Server`).
- **Mạng nội bộ (VPN):** Nếu gặp lỗi Time Out khi ở nhà, cần bật VPN của trường trước khi kết nối SSH.
- **Chuyển Code:** Sử dụng **Git/GitHub** để clone toàn bộ source code từ máy cá nhân lên server (chỉ là phương thức vận chuyển file, không làm thay đổi cấu trúc code).

## 3. Lựa chọn Model AI (Self-host)
- **Định nghĩa Self-host:** Tải file model vật lý về máy/server và chạy 100% offline. Điểm cộng lớn khi bảo vệ đồ án vì giải quyết được bài toán **Bảo mật dữ liệu nội bộ** cho hệ thống eOffice (không gửi data ra ngoài cho ChatGPT).
- **Công cụ:** Sử dụng **LM Studio** hoặc **Ollama** (khuyên dùng LM Studio bản Local Server để có API tương thích chuẩn OpenAI).
- **Model khuyên dùng:** 
  - **Qwen 2.5 7B** hoặc **Qwen 3.5 9B** (Xử lý ngữ nghĩa Tiếng Việt hành chính cực tốt).
  - Không dùng các model quá to (như 27B) vì sẽ gây chậm hệ thống.
  - Luôn tải file GGUF có đuôi **`Q4_K_M`** hoặc **`Q5_K_M`** để cân bằng hoàn hảo giữa dung lượng (nhẹ, tốn 5-6GB RAM) và trí thông minh.

## 4. Kiến trúc Tích hợp (Integration Architecture)
Quy trình tích hợp chuẩn (Microservices) để hệ thống chạy nhanh, mượt và không treo trình duyệt người dùng:

1. **Bước 1 (Gói AI):** Tạo file `main.py`, dùng **FastAPI** bọc các hàm phân tích của project Python hiện tại thành một API độc lập (ví dụ: `http://IP_Server:8000/analyze`).
2. **Bước 2 (Backend eOffice):** 
   - Khi có văn bản mới tải lên, Backend eOffice lập tức gửi file đó ngầm sang API FastAPI.
   - Nhận kết quả từ AI (Mức độ ưu tiên, Gợi ý hành động).
   - **Lưu ngay kết quả vào Database** của eOffice (Ví dụ: cột `ai_priority`).
3. **Bước 3 (Frontend eOffice):** Frontend chỉ việc gọi dữ liệu từ Database ra và hiển thị (vẽ thêm thẻ Badge màu đỏ/vàng/xanh, và khung "💡 Gợi ý từ AI"). Không để Frontend gọi trực tiếp sang API Python.
