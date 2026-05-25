import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys

from core.hybrid_analyzer import HybridAnalyzer

app = FastAPI(title="eOffice Hybrid Analyzer API", version="1.0")

# Cấu hình CORS để Frontend/Backend dễ dàng gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Có thể thay bằng domain/IP của Backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo Analyzer (Dùng model Qwen theo khuyến nghị, hoặc llama3 mặc định)
# Lưu ý: Model này phải được tải và chạy qua Ollama trên Server
analyzer = HybridAnalyzer(model_name='qwen2.5') # Sửa tên model theo thực tế cài đặt trên server

@app.post("/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    target_name: str = Form(...)
):
    if not target_name:
        raise HTTPException(status_code=400, detail="Missing target_name")
        
    # Tạo thư mục temp nếu chưa có
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Lưu file tạm để đưa vào analyzer
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower() or '.txt'
    temp_file_path = os.path.join(temp_dir, f"{file_id}{ext}")
    txt_path = None
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        analyze_path = temp_file_path
        
        # Nếu là file PDF, gọi pdftotext để chuyển sang txt
        if ext == '.pdf':
            import subprocess
            txt_path = os.path.join(temp_dir, f"{file_id}.txt")
            try:
                subprocess.run(['pdftotext', '-enc', 'UTF-8', temp_file_path, txt_path], check=True)
                analyze_path = txt_path
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Lỗi chuyển đổi PDF sang Text: {e}")
                
        # Chạy phân tích
        result = analyzer.analyze(analyze_path, target_name=target_name)
        
        # Nếu có lỗi trong quá trình đọc file
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
        
    except HTTPException:
        # Giữ nguyên các lỗi HTTP đã được raise một cách chủ động (ví dụ: lỗi 400 ở trên)
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Xóa file tạm sau khi phân tích xong
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if txt_path and os.path.exists(txt_path):
            os.remove(txt_path)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "eOffice AI Service is running"}

if __name__ == "__main__":
    import uvicorn
    # Chạy server với uvicorn, host 0.0.0.0 để có thể truy cập từ ngoài
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
