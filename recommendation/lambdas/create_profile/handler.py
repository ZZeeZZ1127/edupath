import json
from db import client as db


def handler(event, context):
    """POST /profile — save onboarding data for a new student profile."""
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("userId")
        if not user_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "userId is required"})
            }

        profile = {
            "userId": user_id,
            "name": body.get("name", ""),
            "age": body.get("age"),
            "grade": body.get("grade"),
            "interests": body.get("interests", []),
            "extracurriculars": body.get("extracurriculars", []),
            "goals": body.get("goals", []),
            "conversationHistory": body.get("conversationHistory", []),
            "currentTrackStatus": None
        }

        db.set_current_track(user_id, {"__profile": profile})

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"success": True})
        }

    except Exception as e:
        print("Error:", e)
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
