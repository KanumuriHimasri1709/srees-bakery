#!/usr/bin/env python
"""
Helper forwarder: delegates to the root run.py when called from inside backend/.
"""
import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
ROOT_RUN = ROOT_DIR / "run.py"

if __name__ == "__main__":
    if ROOT_RUN.exists():
        import subprocess
        cmd = [sys.executable, str(ROOT_RUN)] + sys.argv[1:]
        sys.exit(subprocess.run(cmd, cwd=str(ROOT_DIR)).returncode)
    else:
        print(f"Error: Could not locate root run.py at {ROOT_RUN}")
        sys.exit(1)
