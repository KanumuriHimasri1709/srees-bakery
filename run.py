#!/usr/bin/env python
"""
Unified management and execution script for Sree's Home Bakery project.

Commands:
    python run.py backend       - Starts FastAPI backend on port 8000
    python run.py frontend      - Starts React Vite frontend on port 5173
    python run.py dev           - Starts both backend and frontend concurrently
    python run.py rag-build     - Rebuilds vector store index from rag/documents/
    python run.py test          - Runs all automated backend and RAG tests
"""
import os
import sys
import subprocess
import signal
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent

def get_port():
    port = os.getenv("PORT", "8001")
    return port

def run_backend():
    port = get_port()
    print(f"[RUN] Starting FastAPI Backend on http://localhost:{port} ...")
    cmd = [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", str(port), "--reload"]
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    subprocess.run(cmd, cwd=str(PROJECT_ROOT), env=env)

def run_frontend():
    print("[RUN] Starting Vite React Frontend on http://localhost:5173 ...")
    frontend_dir = PROJECT_ROOT / "frontend"
    # Ensure dependencies are installed
    if not (frontend_dir / "node_modules").exists():
        print("[RUN] Installing frontend dependencies with npm install...")
        subprocess.run(["npm", "install"], cwd=str(frontend_dir), shell=True)
    subprocess.run(["npm", "run", "dev"], cwd=str(frontend_dir), shell=True)

def run_dev():
    port = get_port()
    print("=" * 60)
    print("Starting Sree's Home Bakery Full-Stack Environment")
    print(f"Backend:  http://localhost:{port}")
    print("Frontend: http://localhost:5173")
    print("=" * 60)

    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", str(port), "--reload"],
        cwd=str(PROJECT_ROOT),
        env=env
    )

    frontend_dir = PROJECT_ROOT / "frontend"
    if not (frontend_dir / "node_modules").exists():
        print("[RUN] Installing frontend dependencies with npm install...")
        subprocess.run(["npm", "install"], cwd=str(frontend_dir), shell=True)

    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(frontend_dir),
        shell=True
    )

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\n[RUN] Stopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()

def run_rag_build():
    print("[RUN] Building RAG Vector Store from verified bakery documents...")
    from rag.create_embeddings import build_vector_store
    build_vector_store()

def run_tests():
    print("[RUN] Executing Automated Test Suite...")
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"

    print("\n--- Running tests/rag_test.py ---")
    r1 = subprocess.run([sys.executable, str(PROJECT_ROOT / "tests" / "rag_test.py")], cwd=str(PROJECT_ROOT), env=env)

    print("\n--- Running tests/chatbot_test.py ---")
    r2 = subprocess.run([sys.executable, str(PROJECT_ROOT / "tests" / "chatbot_test.py")], cwd=str(PROJECT_ROOT), env=env)

    print("\n--- Running tests/knowledge.test.ts ---")
    r3 = subprocess.run(["node", "--experimental-strip-types", "--test", str(PROJECT_ROOT / "tests" / "knowledge.test.ts")], cwd=str(PROJECT_ROOT), shell=True)

    if r1.returncode == 0 and r2.returncode == 0 and r3.returncode == 0:
        print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")
    else:
        print("\n[FAILURE] SOME TESTS FAILED.")
        sys.exit(1)

def run_e2e():
    print("[RUN] Executing End-to-End System Verification (Services must be running)...")
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    r = subprocess.run([sys.executable, str(PROJECT_ROOT / "tests" / "e2e_verification.py")], cwd=str(PROJECT_ROOT), env=env)
    if r.returncode != 0:
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    command = sys.argv[1].lower()
    if command == "backend":
        run_backend()
    elif command == "frontend":
        run_frontend()
    elif command == "dev":
        run_dev()
    elif command == "rag-build":
        run_rag_build()
    elif command == "test":
        run_tests()
    elif command == "e2e":
        run_e2e()
    else:
        print(f"Unknown command: {command}\n")
        print(__doc__)

if __name__ == "__main__":
    main()
