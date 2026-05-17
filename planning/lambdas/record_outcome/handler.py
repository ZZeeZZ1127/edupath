import json
import os
import urllib.request
from datetime import datetime, timezone

from db import client as db


def _trigger_system1(user_id: str) -> None:
    recommend_url = os.environ.get("RECOMMEND_ENDPOINT")
    payload = json.dumps({"userId": user_id}).encode("utf-8")
    req = urllib.request.Request(
        recommend_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            print("System 1 recalibration triggered:", response.status)
    except Exception as e:
        print("Warning: System 1 trigger failed (non-fatal):", e)


def _all_tasks_resolved(track_status: dict) -> bool:
    tasks = track_status.get("tasks", [])
    if not tasks:
        return False
    return all(t.get("completed") for t in tasks)


def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body["userId"]
        task_id = body.get("task_id")
        result = body.get("result", "pending")
        abort_track = body.get("abort_track", False)

        if result not in ("accepted", "rejected", "pending"):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "result must be 'accepted', 'rejected', or 'pending'"})
            }

        profile = db.get_profile(user_id)
        if not profile:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "profile not found — complete onboarding first"})
            }

        track_status = profile.get("currentTrackStatus")
        if not track_status or track_status.get("status") != "active":
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "no active track — select a track first"})
            }

        if not abort_track and not task_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "task_id is required when not aborting a track"})
            }

        if not abort_track:
            db.record_outcome(user_id, task_id, result)

        profile = db.get_profile(user_id)
        track_status = profile["currentTrackStatus"]

        recalibration_triggered = False

        if abort_track:
            track_status["status"] = "aborted"
            db.set_current_track(user_id, track_status)
            _trigger_system1(user_id)
            recalibration_triggered = True
            _append_outcome_entry(user_id, track_status, None, "aborted")
        elif _all_tasks_resolved(track_status):
            track_status["status"] = "completed"
            db.set_current_track(user_id, track_status)
            _trigger_system1(user_id)
            recalibration_triggered = True
            _append_outcome_entry(user_id, track_status, None, "completed")
        else:
            _append_outcome_entry(user_id, track_status, task_id, result)

        response_body = {
            "success": True,
            "track_status": track_status["status"],
        }
        if recalibration_triggered:
            response_body["recalibration_triggered"] = True

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response_body)
        }

    except Exception as e:
        print("Error:", e)
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def _append_outcome_entry(user_id: str, track_status: dict, task_id: str | None, result: str) -> None:
    """Append a conversation history entry for an outcome or track state change."""
    try:
        if result == "completed":
            summary = f"Track '{track_status['label']}' completed — all tasks resolved"
        elif result == "aborted":
            summary = f"Track '{track_status['label']}' aborted by student"
        else:
            summary = f"Task outcome recorded: {result}"

        entry = {
            "role": "assistant",
            "action": f"track_{result}",
            "summary": summary,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        db.append_conversation_history(user_id, entry)
    except Exception as e:
        print("Warning: failed to append conversation history:", e)
