import json
from db import client as db
from shared.responses import ok, error


def handler(event, context):
    """POST /profile — save onboarding data for a new student profile."""
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("userId")
        if not user_id:
            return error(400, "userId is required")

        profile = {
            "userId": user_id,
            "name": body.get("name", ""),
            "age": body.get("age"),
            "grade": body.get("grade"),
            "interests": body.get("interests", []),
            "extracurriculars": body.get("extracurriculars", []),
            "goals": body.get("goals", []) if isinstance(body.get("goals"), list) else [body.get("goals", "")] if body.get("goals") else [],
            "conversationHistory": body.get("conversationHistory", []),
            "currentTrackStatus": None
        }

        db.put_profile(user_id, profile)

        return ok({"success": True})

    except Exception as e:
        print("Error:", e)
        return error(500, str(e))
