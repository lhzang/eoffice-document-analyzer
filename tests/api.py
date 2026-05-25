import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Thêm thư mục gốc vào sys.path để nhận diện module core
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from core.hybrid_analyzer import HybridAnalyzer

# Khởi tạo ứng dụng FastAPI và Analyzer (chỉ khởi tạo 1 lần khi chạy server)
app = FastAPI(title="eOffice Document Analyzer API")
analyzer = HybridAnalyzer()

# Định nghĩa cấu trúc dữ liệu đầu vào (Payload)
class DocumentRequest(BaseModel):
    file_path: str        # Đường dẫn tới file văn bản (hệ thống chính và service này phải chung ổ cứng/server)
    # HOẶC bạn có thể dùng document_content: str nếu muốn truyền thẳng nội dung chữ qua API
    user_role: str        # Ví dụ: "Chánh Văn phòng", "Ban Tài chính", "Nguyễn Văn A"

@app.post("/api/v1/analyze")
async def analyze_document(request: DocumentRequest):
    """
    API nhận yêu cầu phân tích văn bản từ hệ thống chính (Web backend).
    """
    if not os.path.exists(request.file_path):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy file: {request.file_path}")
    
    try:
        # Gọi mô hình phân tích với file và vai trò người dùng hiện tại
        result = analyzer.analyze(request.file_path, target_name=request.user_role)
        return {
            "status": "success",
            "user_role": request.user_role,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Chạy server ở cổng 8000
    print("Khởi động API Server tại http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
