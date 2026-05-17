import json
from db import client as db


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
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "userId is required"})
            }

        profile = db.get_profile(user_id)
        if not profile:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "profile not found — complete onboarding first"})
            }

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"profile": profile})
        }

    except Exception as e:
        print("Error:", e)
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
