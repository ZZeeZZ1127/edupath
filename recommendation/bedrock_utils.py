import os
import sys

# Make shared module available whether running locally or in Lambda
_shared_dir = os.path.join(os.path.dirname(__file__), "..")
if _shared_dir not in sys.path:
    sys.path.insert(0, _shared_dir)

from shared.bedrock_utils import call_bedrock, HAIKU_MODEL_ID, DEFAULT_MODEL_ID  # noqa: E402, F401
