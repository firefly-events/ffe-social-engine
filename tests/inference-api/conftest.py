import sys
import os
from pathlib import Path

# Add the 'inference-api' directory to sys.path so tests can import 'main'
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "inference-api"))
