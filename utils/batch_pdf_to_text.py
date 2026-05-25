import os
import subprocess
import sys

# Ensure stdout handles UTF-8 for Vietnamese printing
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def convert_pdfs_to_text(raw_dir, txt_dir):
    if not os.path.exists(txt_dir):
        os.makedirs(txt_dir)
    
    pdf_files = [f for f in os.listdir(raw_dir) if f.lower().endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDF files. Starting conversion...")
    
    for i, pdf_file in enumerate(pdf_files):
        pdf_path = os.path.join(raw_dir, pdf_file)
        txt_filename = os.path.splitext(pdf_file)[0] + ".txt"
        txt_path = os.path.join(txt_dir, txt_filename)
        
        print(f"[{i+1}/{len(pdf_files)}] Converting: {pdf_file}...")
        
        try:
            # Use pdftotext command
            # -enc UTF-8 ensures Vietnamese characters are preserved
            subprocess.run(['pdftotext', '-enc', 'UTF-8', pdf_path, txt_path], check=True)
        except Exception as e:
            print(f"Error converting {pdf_file}: {e}")

    print("Conversion completed!")

if __name__ == "__main__":
    # Adjust paths based on the structure
    RAW_DIR = r"d:\study\DoAn_eOffice\data\raw"
    TXT_DIR = r"d:\study\DoAn_eOffice\data\txt"
    
    convert_pdfs_to_text(RAW_DIR, TXT_DIR)
