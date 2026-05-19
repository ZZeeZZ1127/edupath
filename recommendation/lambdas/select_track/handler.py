import json
import uuid
from datetime import datetime, timezone
from db import client as db
from shared.responses import ok, error


def handler(event, context):
    """
    POST /select-track — write the student's chosen track to the database.
    Sets status to "active" and records the selection timestamp.
    """
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body.get("userId")
        track = body.get("track")

        if not user_id or not track:
            return error(400, "userId and track are required")

        # Compute difficulty if not already set
        if not track.get("difficulty"):
            tasks = track.get("tasks", [])
            if tasks:
                track["difficulty"] = round(
                    sum(t["difficulty"] for t in tasks) / len(tasks), 1
                )
            else:
                track["difficulty"] = 0.0

        # Ensure all task_ids are present
        for task in track.get("tasks", []):
            if not task.get("task_id"):
                task["task_id"] = str(uuid.uuid4())

        if not track.get("track_id"):
            track["track_id"] = str(uuid.uuid4())

        track["status"] = "active"
        track["selected_at"] = datetime.now(timezone.utc).isoformat()
        track.setdefault("outcomes", [])

        db.set_current_track(user_id, track)

        return ok({"success": True})

    except Exception as e:
        print("Error:", e)
        return error(500, str(e))
