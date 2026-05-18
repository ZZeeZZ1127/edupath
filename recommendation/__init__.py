import os
import sys

# Ensure recommendation/ is on sys.path so handlers can do:
#   from db import client
#   from bedrock_utils import call_bedrock
_dir = os.path.dirname(os.path.abspath(__file__))
if _dir not in sys.path:
    sys.path.insert(0, _dir)
