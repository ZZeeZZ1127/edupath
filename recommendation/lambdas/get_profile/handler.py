import json
from db import client as db
from shared.responses import ok, error


def handler(event, context):
    """GET /profile — retrieve student profile by userId."""
    try:
        user_id = None

        # Support both query params (GET) and body (for consistency)
        if event.get("queryStringParameters") and event["queryStringParameters"].get("userId"):
            user_id = event["queryStringParameters"]["userId"]
        elif event.get("body"):
            body = json.loads(event.get("body", "{}"))
            user_id = body.get("userId")

        if not user_id:
            return error(400, "userId is required")

        profile = db.get_profile(user_id)
        if not profile:
            return error(400, "profile not found — complete onboarding first")

        return ok({"profile": profile})

    except Exception as e:
        print("Error:", e)
        return error(500, str(e))
