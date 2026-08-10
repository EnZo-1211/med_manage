import subprocess
import os
import sys
import time

def main():
    print("Initializing Medication Management System...")
    
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    # Detect venv
    venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe") if os.name == "nt" else os.path.join(backend_dir, "venv", "bin", "python")
    python_exe = venv_python if os.path.exists(venv_python) else sys.executable
    
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    
    print("Starting FastAPI Backend...")
    backend_process = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"], 
        cwd=backend_dir
    )
    
    time.sleep(2)
    
    print("Starting Next.js Frontend...")
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"], 
        cwd=frontend_dir
    )
    
    try:
        # Keep script alive while child processes run
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers gracefully...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
