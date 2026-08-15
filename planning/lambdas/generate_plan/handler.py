import json
from datetime import datetime, timezone

from db import client as db
from bedrock_utils import call_bedrock, HAIKU_MODEL_ID
from s3_utils import save_plan
from shared.responses import ok, error

_SYSTEM_PROMPT = """You are an academic advisor AI for EduPath, a college planning assistant for K-12 students.

Your job is to generate a structured, personalized application plan for each task in the student's selected track.

Rules:
- Every action item and match explanation MUST reference at least one specific detail from the student's profile (name, interests, grade, extracurriculars, or goals). Generic output fails the quality bar.
- Materials listed must be specific to the actual opportunity (e.g. RSI requires two teacher recommendations and a personal essay — do not output generic "recommendation letter").
- Deadlines must be realistic and tied to actual known deadlines where possible. Use null if unknown.
- Action items must be ordered by priority (most time-sensitive first).
- Return ONLY valid JSON. No preamble, no explanation, no markdown fences.

For Grade 11-12 students: also include a college_fit_chart (3 schools) as part of the plan. For other grades: set college_fit_chart to null."""


def _build_plan_prompt(profile: dict, track: dict) -> str:
    name = profile.get("name", "Unknown")
    age = profile.get("age", "Unknown")
    grade = profile.get("grade") or 0
    interests = ", ".join(profile.get("interests", [])) or "none"
    extracurriculars = ", ".join(profile.get("extracurriculars", [])) or "none"
    goals_raw = profile.get("goals", [])
    goals = ", ".join(goals_raw) if isinstance(goals_raw, list) else (goals_raw or "none")

    lines = [
        "Student profile:",
        f"- Name: {name}",
        f"- Age: {age}",
        f"- Grade: {grade}",
        f"- Interests: {interests}",
        f"- Extracurriculars: {extracurriculars}",
        f"- Goals: {goals}",
        "",
        f"Active track: {track['label']}",
        f"Track description: {track.get('description', track['label'])}",
        "",
        "Tasks to plan:",
    ]

    for task in track["tasks"]:
        lines.append(
            f"- Task: {task['label']} | Category: {task['category']} | "
            f"Difficulty: {task['difficulty']} | Deadline: {task.get('deadline', 'null')}"
        )
        lines.append(f"  Description: {task.get('description', task['label'])}")

    task_ids = ", ".join([t["task_id"] for t in track["tasks"]])
    track_id = track["track_id"]
    label = track["label"]

    lines.extend([
        "",
        "Generate a JSON object with this structure:",
        "{",
        f'  "track_id": "{track_id}",',
        f'  "label": "{label}",',
        '  "tasks": [',
        "    {",
        '      "task_id": "{task_id}",',
        '      "label": "{task.label}",',
        '      "materials_needed": ["list of specific required materials"],',
        '      "deadlines": {',
        '        "application": "YYYY-MM-DD or null",',
        '        "financial_aid": "YYYY-MM-DD or null"',
        "      },",
        '      "action_items": ["3 specific, ordered action steps"],',
        '      "match_reasoning": "1 sentence explaining why this fits this student specifically",',
        '      "status": "pending"',
        "    }",
        "  ],",
        '  "college_fit_chart": null',
        "}",
        "",
        "Return only the JSON object. No other text.",
    ])

    if int(grade) >= 11:
        lines.extend([
            "",
            "Additionally, generate a college_fit_chart as part of the plan object. "
            "Include 3 schools that match the student's interests, goals, and grade level. For each school:",
            "",
            '{',
            '  "school": "School Name",',
            '  "fit_type": "reach | match | safety",',
            '  "why_it_fits": "1 sentence referencing the student\'s specific interests and goals",',
            '  "requirements": {',
            '    "gpa": "3.5+",',
            '    "test_scores": "SAT 1400+ or ACT 32+",',
            '    "notable_requirements": ["Supplemental essay on research experience", "Interview required"]',
            "  },",
            '  "application_deadline": "YYYY-MM-DD or null",',
            '  "financial_aid_deadline": "YYYY-MM-DD or null"',
            "}",
            "",
            "Select a mix of reach, match, and safety schools. Every entry must reference something "
            "specific in the student's profile — if it could apply to any student, it fails the quality bar.",
        ])

    return "\n".join(lines)


def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body["userId"]

        profile = db.get_profile(user_id)
        if not profile:
            return error(400, "profile not found — complete onboarding first")

        track_status = profile.get("currentTrackStatus")
        if not track_status or track_status.get("status") != "active":
            return error(400, "no active track — select a track first")

        user_message = _build_plan_prompt(profile, track_status)
        plan = call_bedrock(_SYSTEM_PROMPT, user_message, max_tokens=2000, model_id=HAIKU_MODEL_ID)

        save_plan(user_id, track_status["track_id"], plan)

        _append_plan_entry(user_id, profile, track_status, plan)

        return ok({"plan": plan})

    except Exception as e:
        print("Error:", e)
        return error(500, str(e))


def _append_plan_entry(user_id: str, profile: dict, track: dict, plan: dict) -> None:
    """Append a conversation history entry summarizing the generated plan."""
    try:
        task_count = len(plan.get("tasks", []))
        has_college_chart = plan.get("college_fit_chart") is not None
        summary = f"Generated application plan for '{track['label']}' with {task_count} tasks"
        if has_college_chart:
            summary += f" and {len(plan['college_fit_chart'])} college fit schools"

        entry = {
            "role": "assistant",
            "action": "generated_plan",
            "summary": summary,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        db.append_conversation_history(user_id, entry)
    except Exception as e:
        print("Warning: failed to append conversation history:", e)
