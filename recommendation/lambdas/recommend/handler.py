import json
import uuid
from datetime import datetime, timezone
from db import client as db
from bedrock_utils import call_bedrock


# Load prompt templates
import os
_prompts_dir = os.path.join(os.path.dirname(__file__), "..", "..", "prompts")

with open(os.path.join(_prompts_dir, "track_generation.txt"), "r") as f:
    SYSTEM_PROMPT = f.read()

with open(os.path.join(_prompts_dir, "recalibration.txt"), "r") as f:
    RECALIBRATION_TEMPLATE = f.read()


def handler(event, context):
    """
    POST /recommend — System 1 core.
    Generates 3 recommended tracks based on the student's profile.
    Triggers recalibration if currentTrackStatus is completed or aborted.
    """
    try:
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

        track_status = profile.get("currentTrackStatus")
        recalibration_block = ""

        if track_status and track_status.get("status") in ("completed", "aborted"):
            recalibration_block = _build_recalibration_block(track_status)

        user_message = _build_user_message(profile, recalibration_block)

        try:
            tracks = call_bedrock(SYSTEM_PROMPT, user_message)
        except Exception:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Bedrock call failed"})
            }

        if not isinstance(tracks, list):
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Bedrock returned unexpected format"})
            }

        # Add missing track_ids if Bedrock didn't provide them
        for track in tracks:
            if not track.get("track_id"):
                track["track_id"] = str(uuid.uuid4())
            for task in track.get("tasks", []):
                if not task.get("task_id"):
                    task["task_id"] = str(uuid.uuid4())

        # Compute difficulty for each track
        for track in tracks:
            track["difficulty"] = _compute_track_difficulty(track)

        # Persist conversation history so future prompts have memory
        _append_conversation_entry(user_id, profile, tracks, track_status)

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"tracks": tracks})
        }

    except Exception as e:
        print("Error:", e)
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def _build_user_message(profile: dict, recalibration_block: str) -> str:
    """Build the user message from the student profile and optional recalibration block."""
    return (
        f"Student profile:\n"
        f"- Name: {profile.get('name', 'Unknown')}\n"
        f"- Age: {profile.get('age', 'Unknown')}\n"
        f"- Grade: {profile.get('grade', 'Unknown')}\n"
        f"- Interests: {', '.join(profile.get('interests', [])) or 'none'}\n"
        f"- Extracurriculars: {', '.join(profile.get('extracurriculars', [])) or 'none'}\n"
        f"- Goals: {', '.join(profile.get('goals', [])) if isinstance(profile.get('goals'), list) else (profile.get('goals') or 'none')}\n"
        f"- Past conversation: {profile.get('conversationHistory') or 'none'}\n"
        f"{recalibration_block}\n"
        f"Return a JSON array of 3 tracks. Each track:\n"
        f'{{"track_id": "uuid", "label": "short name",\n'
        f' "description": "2-3 sentences referencing student\'s specific interests",\n'
        f' "tasks": [{{"task_id": "uuid", "label": "task name",\n'
        f'             "category": "research|internship|college|competition|extracurricular",\n'
        f'             "difficulty": 0-100, "description": "what to do",\n'
        f'             "deadline": "YYYY-MM-DD or null"}}]}}\n'
        f"\nReturn only the JSON array. No other text."
    )


def _build_recalibration_block(track_status: dict) -> str:
    """Build the recalibration block using the previous track's performance data."""
    label = track_status.get("label", "Unknown")
    difficulty = track_status.get("difficulty", 0)
    tasks = track_status.get("tasks", [])
    outcomes = track_status.get("outcomes", [])

    if tasks:
        completed_count = sum(1 for t in tasks if t.get("completed"))
        completion_rate = round(completed_count / len(tasks) * 100)
    else:
        completion_rate = 0

    outcome_summary = "none"
    if outcomes:
        accepted = sum(1 for o in outcomes if o.get("result") == "accepted")
        rejected = sum(1 for o in outcomes if o.get("result") == "rejected")
        outcome_summary = f"{accepted} accepted, {rejected} rejected"

    return RECALIBRATION_TEMPLATE.replace("{{previousTrackLabel}}", label) \
        .replace("{{previousTrackDifficulty}}", str(difficulty)) \
        .replace("{{completionRate}}", str(completion_rate)) \
        .replace("{{outcomes}}", outcome_summary)


def _compute_track_difficulty(track: dict) -> float:
    """Compute track difficulty as the average of all task difficulties."""
    tasks = track.get("tasks", [])
    if not tasks:
        return 0.0
    return round(sum(t["difficulty"] for t in tasks) / len(tasks), 1)


def _append_conversation_entry(user_id: str, profile: dict, tracks: list, track_status: dict | None) -> None:
    """Append a conversation history entry summarizing the generated tracks."""
    try:
        labels = [t["label"] for t in tracks]
        if track_status and track_status.get("status") in ("completed", "aborted"):
            summary = f"Recalibrated tracks after {track_status['status']} track: {', '.join(labels)}"
        else:
            summary = f"Generated {len(tracks)} track recommendations: {', '.join(labels)}"

        entry = {
            "role": "assistant",
            "action": "generated_tracks",
            "summary": summary,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        db.append_conversation_history(user_id, entry)
    except Exception as e:
        print("Warning: failed to append conversation history:", e)
