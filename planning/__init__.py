import os
import sys

# Ensure planning/ is on sys.path so handlers can do:
#   from db import client
#   from bedrock_utils import call_bedrock
#   from s3_utils import save_plan
_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.insert(0, _dir)

# Also ensure project root is on sys.path so handlers can do:
#   from shared.responses import ok, error
_root = os.path.dirname(_dir)
if _root not in sys.path:
    sys.path.insert(0, _root)
