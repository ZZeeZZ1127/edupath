"""
Local test suite for System 2 — Planning System.

Run from the planning/ directory:
    cd planning
    python test_local.py

Uses in-memory mocks for DB, Bedrock, and S3 to test all logic paths
without requiring AWS credentials.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── In-memory mocks ───────────────────────────────────────────────────────

_in_memory_db: dict[str, dict] = {}


def _copy(obj):
    """Deep copy via JSON round-trip."""
    return json.loads(json.dumps(obj))


_MARIA = {
    "userId": "maria-001",
    "name": "Maria",
    "age": 17,
    "grade": 11,
    "interests": ["biology", "debate"],
    "extracurriculars": ["debate club", "hospital volunteer"],
    "goals": ["apply to pre-med program"],
    "conversationHistory": [],
    "currentTrackStatus": {
        "track_id": "track-sr-1",
        "label": "Research-Focused Pre-Med Path",
        "description": "Build toward pre-med through research programs suited to biology and debate.",
        "difficulty": 43.8,
        "status": "active",
        "selected_at": "2025-01-01T00:00:00Z",
        "tasks": [
            {"task_id": "st-1", "label": "Apply to RSI", "category": "research", "difficulty": 90, "description": "Apply to the Research Science Institute.", "deadline": "2026-01-15", "completed": False},
            {"task_id": "st-2", "label": "Science Fair Project", "category": "competition", "difficulty": 45, "description": "Develop a biology project for the regional science fair.", "deadline": "2026-03-01", "completed": False},
            {"task_id": "st-3", "label": "Hospital Volunteering", "category": "extracurricular", "difficulty": 20, "description": "Continue hospital volunteering, target 100+ hours.", "deadline": "2026-06-01", "completed": False},
            {"task_id": "st-4", "label": "College Research", "category": "college", "difficulty": 20, "description": "Research pre-med programs and build a college list.", "deadline": "2026-06-01", "completed": False},
        ],
        "outcomes": []
    }
}

_G10_PROFILE = {
    "userId": "student-g10",
    "name": "Jordan",
    "age": 15,
    "grade": 10,
    "interests": ["CS", "robotics"],
    "extracurriculars": ["robotics club", "coding club"],
    "goals": ["get into a good engineering program"],
    "conversationHistory": [],
    "currentTrackStatus": {
        "track_id": "track-mid-1",
        "label": "CS Competition Path",
        "description": "Channel your coding skills into competitions.",
        "difficulty": 41.7,
        "status": "active",
        "selected_at": "2025-01-01T00:00:00Z",
        "tasks": [
            {"task_id": "mt-1", "label": "USACO Training", "category": "competition", "difficulty": 55, "description": "Train for USACO.", "deadline": "2025-12-01", "completed": False},
            {"task_id": "mt-2", "label": "Hackathon", "category": "competition", "difficulty": 40, "description": "Participate in a regional hackathon.", "deadline": "2026-02-01", "completed": False},
        ],
        "outcomes": []
    }
}

_in_memory_s3: dict[str, dict] = {}


def _mock_get_profile(user_id: str) -> dict | None:
    return _in_memory_db.get(user_id)


def _mock_set_current_track(user_id: str, track_status: dict) -> None:
    # Write track status back onto the profile
    profile = _in_memory_db.get(user_id)
    if profile:
        profile["currentTrackStatus"] = track_status


def _mock_record_outcome(user_id: str, task_id: str, result: str) -> None:
    profile = _in_memory_db.get(user_id)
    if profile and profile.get("currentTrackStatus"):
        profile["currentTrackStatus"]["outcomes"].append(
            {"task_id": task_id, "result": result}
        )
        # Also mark the task as completed for the "all tasks resolved" check
        for task in profile["currentTrackStatus"].get("tasks", []):
            if task["task_id"] == task_id:
                task["completed"] = True
                break


_conversation_history_spy: list = []


def _mock_append_conversation_history(user_id: str, entry: dict) -> None:
    _conversation_history_spy.append({"userId": user_id, "entry": entry})


def _mock_save_plan(user_id: str, track_id: str, plan: dict) -> str:
    key = f"plans/{user_id}/{track_id}.json"
    _in_memory_s3[key] = plan
    return key


def _mock_load_plan(user_id: str, track_id: str) -> dict | None:
    key = f"plans/{user_id}/{track_id}.json"
    return _in_memory_s3.get(key)


# ── Mock Bedrock responses ────────────────────────────────────────────────

_bedrock_call_log = []


def _make_mock_plan(profile, track):
    """Return a personalized plan based on the student profile."""
    grade = profile["grade"]
    interests = [i.lower() for i in profile.get("interests", [])]

    tasks = []
    for t in track["tasks"]:
        if "biology" in interests or "pre-med" in str(profile.get("goals", [])).lower():
            reasoning = f"{t['label']} fits {profile['name']}'s strong background in {', '.join(interests[:2])} and her pre-med aspirations."
        elif "cs" in interests or "robotics" in interests:
            reasoning = f"{t['label']} aligns with {profile['name']}'s passion for {', '.join(interests[:2])} and engineering goals."
        else:
            reasoning = f"{t['label']} is a natural fit for {profile['name']}'s interests in {', '.join(interests[:2])}."

        tasks.append({
            "task_id": t["task_id"],
            "label": t["label"],
            "materials_needed": ["Application form", "Personal statement"],
            "deadlines": {"application": t.get("deadline"), "financial_aid": None},
            "action_items": [
                f"Research {t['label']} requirements and eligibility",
                f"Gather required materials for {t['label']}",
                f"Submit application for {t['label']} before deadline"
            ],
            "match_reasoning": reasoning,
            "status": "pending"
        })

    result = {
        "track_id": track["track_id"],
        "label": track["label"],
        "tasks": tasks,
        "college_fit_chart": None
    }

    if grade >= 11:
        result["college_fit_chart"] = [
            {
                "school": "Harvard University" if "pre-med" in str(profile.get("goals", [])).lower() else "MIT",
                "fit_type": "reach",
                "why_it_fits": f"Strong match for {profile['name']}'s interest in {', '.join(interests[:2])}.",
                "requirements": {"gpa": "3.8+", "test_scores": "SAT 1500+ or ACT 34+", "notable_requirements": ["Personal essay", "2 teacher recommendations"]},
                "application_deadline": "2026-01-01",
                "financial_aid_deadline": "2026-02-01"
            },
            {
                "school": "University of Michigan",
                "fit_type": "match",
                "why_it_fits": f"Excellent programs in areas related to {', '.join(interests[:2])}.",
                "requirements": {"gpa": "3.5+", "test_scores": "SAT 1350+ or ACT 30+", "notable_requirements": ["Common App essay"]},
                "application_deadline": "2026-02-01",
                "financial_aid_deadline": "2026-03-01"
            },
            {
                "school": "State University",
                "fit_type": "safety",
                "why_it_fits": f"Solid backup option with strong merit aid for students in {', '.join(interests[:2])}.",
                "requirements": {"gpa": "3.0+", "test_scores": "SAT 1200+", "notable_requirements": ["Application form"]},
                "application_deadline": "2026-05-01",
                "financial_aid_deadline": "2026-04-01"
            }
        ]

    return result


def _mock_call_bedrock(system_prompt, user_message, retry=True):
    _bedrock_call_log.append((system_prompt, user_message, retry))

    # Extract grade from user message
    import re
    grade_match = re.search(r"Grade:\s*(\d+)", user_message)
    grade = int(grade_match.group(1)) if grade_match else 11

    # Find the matching mock profile in our in-memory DB
    for uid, profile in _in_memory_db.items():
        if profile.get("name") and str(profile.get("grade")) == str(grade):
            track = profile.get("currentTrackStatus")
            if track:
                return _make_mock_plan(profile, track)

    # Fallback: build a minimal plan
    return {
        "track_id": "unknown",
        "label": "Unknown Track",
        "tasks": [],
        "college_fit_chart": None
    }


# ── Patch modules before importing handlers ──────────────────────────────

import db.client as db_client
import bedrock_utils as bedrock_mod
import s3_utils as s3_mod

# Snapshot the original call_bedrock before patching, for retry-logic tests
_ORIGINAL_CALL_BEDROCK = bedrock_mod.call_bedrock

db_client.get_profile = _mock_get_profile
db_client.set_current_track = _mock_set_current_track
db_client.record_outcome = _mock_record_outcome
db_client.append_conversation_history = _mock_append_conversation_history
bedrock_mod.call_bedrock = _mock_call_bedrock
s3_mod.save_plan = _mock_save_plan
s3_mod.load_plan = _mock_load_plan
s3_mod.PLAN_BUCKET = "edupath-plans-test"

# Patch urllib for System 1 trigger spy
_trigger_calls = []

import urllib.request as _urllib


class _MockHTTPResponse:
    def __init__(self, status):
        self.status = status

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def read(self):
        return b"{}"


def _mock_urlopen(req, timeout=None):
    body = json.loads(req.data)
    _trigger_calls.append({"url": req.full_url, "body": body})
    return _MockHTTPResponse(200)


_original_urlopen = _urllib.urlopen
_urllib.urlopen = _mock_urlopen

os.environ["RECOMMEND_ENDPOINT"] = "https://api.example.com/recommend"

from lambdas.generate_plan.handler import handler as generate_plan
from lambdas.record_outcome.handler import handler as record_outcome


# ── Test helpers ─────────────────────────────────────────────────────────


def _api_gateway_event(body: dict) -> dict:
    return {"body": json.dumps(body)}


def _assert_200(result: dict):
    assert result["statusCode"] == 200, f"Expected 200, got {result['statusCode']}: {result.get('body')}"


def _assert_400(result: dict):
    assert result["statusCode"] == 400, f"Expected 400, got {result['statusCode']}: {result.get('body')}"


def _assert_500(result: dict):
    assert result["statusCode"] == 500, f"Expected 500, got {result['statusCode']}: {result.get('body')}"


# ── Tests ─────────────────────────────────────────────────────────────────


def test_generate_plan_maria():
    """Generate a plan for Maria (grade 11) — includes college fit chart."""
    _in_memory_db.clear()
    _in_memory_s3.clear()
    _bedrock_call_log.clear()
    _trigger_calls.clear()

    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({"userId": "maria-001"})
    result = generate_plan(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    plan = data["plan"]
    assert plan["track_id"] == "track-sr-1"
    assert plan["label"] == "Research-Focused Pre-Med Path"
    assert len(plan["tasks"]) == 4

    for task in plan["tasks"]:
        assert "materials_needed" in task
        assert "deadlines" in task
        assert "action_items" in task
        assert "match_reasoning" in task
        assert task["status"] == "pending"
        assert "Maria" in task["match_reasoning"] or "biology" in task["match_reasoning"].lower()

    # Grade 11 must include college fit chart
    assert plan["college_fit_chart"] is not None
    assert len(plan["college_fit_chart"]) >= 3
    fit_types = [s["fit_type"] for s in plan["college_fit_chart"]]
    assert "reach" in fit_types
    assert "match" in fit_types
    assert "safety" in fit_types

    # Verify S3 save
    assert "plans/maria-001/track-sr-1.json" in _in_memory_s3
    print("  PASS test_generate_plan_maria")


def test_generate_plan_younger_student():
    """Generate a plan for Jordan (grade 10) — no college fit chart."""
    _in_memory_db.clear()
    _in_memory_s3.clear()
    _bedrock_call_log.clear()

    _in_memory_db["student-g10"] = _copy(_G10_PROFILE)

    event = _api_gateway_event({"userId": "student-g10"})
    result = generate_plan(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    plan = data["plan"]
    assert len(plan["tasks"]) == 2
    assert plan["college_fit_chart"] is None

    # Verify tasks reference the student specifically
    for task in plan["tasks"]:
        msg = task["match_reasoning"].lower()
        assert "jordan" in msg or "cs" in msg or "robotics" in msg

    print("  PASS test_generate_plan_younger_student")


def test_generate_plan_no_profile():
    """Generate plan without profile returns 400."""
    _in_memory_db.clear()
    event = _api_gateway_event({"userId": "no-such-user"})
    result = generate_plan(event, None)
    _assert_400(result)
    assert "profile not found" in json.loads(result["body"])["error"]
    print("  PASS test_generate_plan_no_profile")


def test_generate_plan_no_active_track():
    """Generate plan without an active track returns 400."""
    _in_memory_db.clear()
    _in_memory_db["maria-001"] = {
        "userId": "maria-001",
        "name": "Maria",
        "age": 17,
        "grade": 11,
        "interests": ["biology"],
        "extracurriculars": [],
        "goals": [],
        "conversationHistory": [],
        "currentTrackStatus": None
    }

    event = _api_gateway_event({"userId": "maria-001"})
    result = generate_plan(event, None)
    _assert_400(result)
    assert "no active track" in json.loads(result["body"])["error"]
    print("  PASS test_generate_plan_no_active_track")


def test_generate_plan_track_not_active():
    """Generate plan when track is completed returns 400."""
    _in_memory_db.clear()
    profile = _copy(_MARIA)
    profile["currentTrackStatus"]["status"] = "completed"
    _in_memory_db["maria-001"] = profile

    event = _api_gateway_event({"userId": "maria-001"})
    result = generate_plan(event, None)
    _assert_400(result)
    assert "no active track" in json.loads(result["body"])["error"]
    print("  PASS test_generate_plan_track_not_active")


def test_generate_plan_saves_to_s3():
    """Plan is persisted to S3 before returning."""
    _in_memory_db.clear()
    _in_memory_s3.clear()

    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({"userId": "maria-001"})
    result = generate_plan(event, None)
    _assert_200(result)

    saved = _in_memory_s3.get("plans/maria-001/track-sr-1.json")
    assert saved is not None
    assert saved["track_id"] == "track-sr-1"
    assert len(saved["tasks"]) == 4
    print("  PASS test_generate_plan_saves_to_s3")


def test_record_outcome_accepted():
    """Recording an accepted outcome keeps track active."""
    _in_memory_db.clear()
    _trigger_calls.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-1",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    assert data["success"] is True
    assert data["track_status"] == "active"
    assert "recalibration_triggered" not in data

    # Verify outcome was written
    profile = _in_memory_db["maria-001"]
    assert len(profile["currentTrackStatus"]["outcomes"]) == 1
    assert profile["currentTrackStatus"]["outcomes"][0]["result"] == "accepted"
    assert profile["currentTrackStatus"]["status"] == "active"

    # No S1 trigger
    assert len(_trigger_calls) == 0
    print("  PASS test_record_outcome_accepted")


def test_record_outcome_completion():
    """Recording all outcomes completes the track and triggers System 1."""
    _in_memory_db.clear()
    _trigger_calls.clear()

    profile = _copy(_MARIA)
    # Pre-mark 3 tasks as having outcomes, leaving 1 unresolved
    profile["currentTrackStatus"]["outcomes"] = [
        {"task_id": "st-1", "result": "accepted"},
        {"task_id": "st-2", "result": "accepted"},
        {"task_id": "st-3", "result": "rejected"},
    ]
    for task in profile["currentTrackStatus"]["tasks"]:
        if task["task_id"] in ("st-1", "st-2", "st-3"):
            task["completed"] = True
    _in_memory_db["maria-001"] = profile

    # Record the final task's outcome
    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-4",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    assert data["success"] is True
    assert data["track_status"] == "completed"
    assert data["recalibration_triggered"] is True

    # DB status updated
    assert _in_memory_db["maria-001"]["currentTrackStatus"]["status"] == "completed"

    # S1 triggered
    assert len(_trigger_calls) == 1
    assert _trigger_calls[0]["url"] == "https://api.example.com/recommend"
    assert _trigger_calls[0]["body"]["userId"] == "maria-001"
    print("  PASS test_record_outcome_completion")


def test_record_outcome_abort():
    """Aborting a track marks it aborted and triggers System 1."""
    _in_memory_db.clear()
    _trigger_calls.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": None,
        "result": "pending",
        "abort_track": True
    })
    result = record_outcome(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    assert data["success"] is True
    assert data["track_status"] == "aborted"
    assert data["recalibration_triggered"] is True

    assert _in_memory_db["maria-001"]["currentTrackStatus"]["status"] == "aborted"
    assert len(_trigger_calls) == 1
    print("  PASS test_record_outcome_abort")


def test_record_outcome_invalid_result():
    """Invalid result value returns 400."""
    _in_memory_db.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-1",
        "result": "invalid"
    })
    result = record_outcome(event, None)
    _assert_400(result)
    assert "result must be" in json.loads(result["body"])["error"]
    print("  PASS test_record_outcome_invalid_result")


def test_record_outcome_no_profile():
    """Record outcome without profile returns 400."""
    _in_memory_db.clear()
    event = _api_gateway_event({
        "userId": "no-such-user",
        "task_id": "t1",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_400(result)
    print("  PASS test_record_outcome_no_profile")


def test_record_outcome_no_active_track():
    """Record outcome without active track returns 400."""
    _in_memory_db.clear()
    _in_memory_db["maria-001"] = {
        "userId": "maria-001",
        "name": "Maria",
        "age": 17,
        "grade": 11,
        "interests": [],
        "extracurriculars": [],
        "goals": [],
        "conversationHistory": [],
        "currentTrackStatus": None
    }

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "t1",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_400(result)
    print("  PASS test_record_outcome_no_active_track")


def test_record_outcome_missing_task_id():
    """Record outcome without task_id (and not aborting) returns 400."""
    _in_memory_db.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_400(result)
    assert "task_id" in json.loads(result["body"])["error"]
    print("  PASS test_record_outcome_missing_task_id")


def test_record_outcome_rejected():
    """Recording a rejected outcome is accepted."""
    _in_memory_db.clear()
    _trigger_calls.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-1",
        "result": "rejected"
    })
    result = record_outcome(event, None)
    _assert_200(result)
    data = json.loads(result["body"])
    assert data["track_status"] == "active"
    assert _in_memory_db["maria-001"]["currentTrackStatus"]["outcomes"][0]["result"] == "rejected"
    print("  PASS test_record_outcome_rejected")


def test_s1_trigger_failure_non_fatal():
    """System 1 trigger failure does not break the outcome flow."""
    _in_memory_db.clear()
    _trigger_calls.clear()

    # Make the trigger fail
    import urllib.request as _urllib2

    def _failing_urlopen(req, timeout=None):
        raise OSError("Connection refused")

    _urllib2.urlopen = _failing_urlopen

    profile = _copy(_MARIA)
    for task in profile["currentTrackStatus"]["tasks"]:
        if task["task_id"] == "st-1":
            task["completed"] = True
    profile["currentTrackStatus"]["outcomes"] = [
        {"task_id": "st-2", "result": "accepted"},
        {"task_id": "st-3", "result": "accepted"},
        {"task_id": "st-4", "result": "accepted"},
    ]
    for task in profile["currentTrackStatus"]["tasks"]:
        if task["task_id"] in ("st-2", "st-3", "st-4"):
            task["completed"] = True
    _in_memory_db["maria-001"] = profile

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-1",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    assert data["success"] is True
    assert data["track_status"] == "completed"
    assert data["recalibration_triggered"] is True

    # Restore working mock
    _urllib2.urlopen = _mock_urlopen
    print("  PASS test_s1_trigger_failure_non_fatal")


def test_build_plan_prompt_senior():
    """Prompt builder includes college fit chart for grade 11+."""
    from lambdas.generate_plan.handler import _build_plan_prompt

    profile = {
        "name": "Maria", "age": 17, "grade": 11,
        "interests": ["biology", "debate"],
        "extracurriculars": ["debate club"], "goals": ["pre-med"]
    }
    track = {
        "track_id": "t1", "label": "Research Path",
        "description": "A research track",
        "tasks": [
            {"task_id": "ta", "label": "Apply RSI", "category": "research", "difficulty": 90, "description": "Apply to RSI", "deadline": "2026-01-15"}
        ]
    }

    prompt = _build_plan_prompt(profile, track)
    assert "Maria" in prompt
    assert "college_fit_chart" in prompt
    assert "biology, debate" in prompt
    print("  PASS test_build_plan_prompt_senior")


def test_build_plan_prompt_junior():
    """Prompt builder excludes college fit chart for grade < 11."""
    from lambdas.generate_plan.handler import _build_plan_prompt

    profile = {
        "name": "Alex", "age": 12, "grade": 7,
        "interests": ["art", "soccer"],
        "extracurriculars": ["art club"], "goals": []
    }
    track = {
        "track_id": "t1", "label": "Creative Path", "description": "desc",
        "tasks": [
            {"task_id": "ta", "label": "Art Club", "category": "extracurricular", "difficulty": 15, "description": "Join art club", "deadline": "2026-01-01"}
        ]
    }

    prompt = _build_plan_prompt(profile, track)
    assert "Alex" in prompt
    # The JSON template always includes "college_fit_chart": null, but
    # the college fit chart SCHEMA instructions should not appear for grade < 11
    assert "Select a mix of reach, match, and safety schools" not in prompt
    print("  PASS test_build_plan_prompt_junior")


def test_bedrock_json_parsing_and_retry():
    """Verify JSON cleaning (markdown fences) and retry-once logic in call_bedrock."""
    call_count = [0]
    _orig_get = bedrock_mod._get_bedrock
    _orig_cb = bedrock_mod.call_bedrock

    class _FakeResponse:
        def __init__(self, data):
            self._data = data
        def read(self):
            return self._data

    class _FakeBedrock:
        def invoke_model(self, modelId, body, contentType, accept):
            call_count[0] += 1
            if call_count[0] == 1:
                raw = "not valid json {{{"
            else:
                raw = '{"key": "value"}'
            return {
                "body": _FakeResponse(json.dumps({
                    "content": [{"text": raw}]
                }).encode())
            }

    try:
        bedrock_mod._get_bedrock = lambda: _FakeBedrock()
        bedrock_mod.call_bedrock = _ORIGINAL_CALL_BEDROCK  # restore so retry calls itself
        result = _ORIGINAL_CALL_BEDROCK("system", "user message")
        assert isinstance(result, dict), f"Expected dict, got {type(result)}: {result}"
        assert call_count[0] == 2, f"Expected 2 calls (malformed + retry), got {call_count[0]}"
        print("  PASS test_bedrock_json_parsing_and_retry")
    finally:
        bedrock_mod.call_bedrock = _orig_cb
        bedrock_mod._get_bedrock = _orig_get


def test_all_tasks_resolved():
    """Unit test the all-tasks-resolved helper."""
    from lambdas.record_outcome.handler import _all_tasks_resolved

    assert not _all_tasks_resolved({"tasks": []})
    assert not _all_tasks_resolved({
        "tasks": [{"completed": True}, {"completed": False}]
    })
    assert _all_tasks_resolved({
        "tasks": [{"completed": True}, {"completed": True}]
    })
    print("  PASS test_all_tasks_resolved")


def test_generate_plan_persists_conversation_history():
    """Generate plan appends a conversation entry after Bedrock response."""
    _in_memory_db.clear()
    _in_memory_s3.clear()
    _conversation_history_spy.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({"userId": "maria-001"})
    result = generate_plan(event, None)
    _assert_200(result)

    assert len(_conversation_history_spy) == 1
    entry = _conversation_history_spy[0]["entry"]
    assert entry["role"] == "assistant"
    assert entry["action"] == "generated_plan"
    assert "4 tasks" in entry["summary"]
    assert "college fit" in entry["summary"].lower()
    assert "timestamp" in entry
    print("  PASS test_generate_plan_persists_conversation_history")


def test_record_outcome_persists_conversation_history():
    """Recording an outcome appends a conversation entry."""
    _in_memory_db.clear()
    _conversation_history_spy.clear()
    _trigger_calls.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-1",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_200(result)

    assert len(_conversation_history_spy) == 1
    entry = _conversation_history_spy[0]["entry"]
    assert entry["action"] == "track_accepted"
    print("  PASS test_record_outcome_persists_conversation_history")


def test_track_completion_persists_conversation_history():
    """Track completion appends a conversation entry."""
    _in_memory_db.clear()
    _conversation_history_spy.clear()
    _trigger_calls.clear()

    profile = _copy(_MARIA)
    for task in profile["currentTrackStatus"]["tasks"]:
        if task["task_id"] in ("st-1", "st-2", "st-3"):
            task["completed"] = True
    profile["currentTrackStatus"]["outcomes"] = [
        {"task_id": "st-1", "result": "accepted"},
        {"task_id": "st-2", "result": "accepted"},
        {"task_id": "st-3", "result": "accepted"},
    ]
    _in_memory_db["maria-001"] = profile

    event = _api_gateway_event({
        "userId": "maria-001",
        "task_id": "st-4",
        "result": "accepted"
    })
    result = record_outcome(event, None)
    _assert_200(result)

    assert len(_conversation_history_spy) == 1
    entry = _conversation_history_spy[0]["entry"]
    assert entry["action"] == "track_completed"
    assert "completed" in entry["summary"]
    print("  PASS test_track_completion_persists_conversation_history")


def test_track_abort_persists_conversation_history():
    """Track abort appends a conversation entry."""
    _in_memory_db.clear()
    _conversation_history_spy.clear()
    _trigger_calls.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    event = _api_gateway_event({
        "userId": "maria-001",
        "abort_track": True
    })
    result = record_outcome(event, None)
    _assert_200(result)

    assert len(_conversation_history_spy) == 1
    entry = _conversation_history_spy[0]["entry"]
    assert entry["action"] == "track_aborted"
    assert "aborted" in entry["summary"]
    print("  PASS test_track_abort_persists_conversation_history")


def test_conversation_history_non_fatal_s2():
    """Conversation history write failure does not break generate_plan."""
    _in_memory_db.clear()
    _in_memory_s3.clear()
    _conversation_history_spy.clear()
    _in_memory_db["maria-001"] = _copy(_MARIA)

    def _failing_history(user_id, entry):
        raise RuntimeError("DB write failed")

    db_client.append_conversation_history = _failing_history

    try:
        event = _api_gateway_event({"userId": "maria-001"})
        result = generate_plan(event, None)
        _assert_200(result)  # Still succeeds
        print("  PASS test_conversation_history_non_fatal_s2")
    finally:
        db_client.append_conversation_history = _mock_append_conversation_history


def test_quality_bar_plan_personalization():
    """Verify that the mock plan generator produces different output for different students."""
    _in_memory_db.clear()
    _in_memory_s3.clear()

    _in_memory_db["maria-001"] = _copy(_MARIA)
    _in_memory_db["student-g10"] = _copy(_G10_PROFILE)

    r1 = generate_plan(_api_gateway_event({"userId": "maria-001"}), None)
    r2 = generate_plan(_api_gateway_event({"userId": "student-g10"}), None)

    _assert_200(r1)
    _assert_200(r2)

    plan1 = json.loads(r1["body"])["plan"]
    plan2 = json.loads(r2["body"])["plan"]

    # Different labels
    assert plan1["label"] != plan2["label"]

    # Maria gets college fit chart, Jordan (grade 10) does not
    assert plan1["college_fit_chart"] is not None
    assert plan2["college_fit_chart"] is None

    # Task reasoning differs
    r1_reasoning = " ".join(t["match_reasoning"] for t in plan1["tasks"]).lower()
    r2_reasoning = " ".join(t["match_reasoning"] for t in plan2["tasks"]).lower()
    assert "biology" in r1_reasoning or "maria" in r1_reasoning
    assert "jordan" in r2_reasoning or "cs" in r2_reasoning or "robotics" in r2_reasoning

    print("  PASS test_quality_bar_plan_personalization")


# ── Main ─────────────────────────────────────────────────────────────────


if __name__ == "__main__":
    print("=== System 2 Test Suite ===\n")

    tests = [
        test_generate_plan_maria,
        test_generate_plan_younger_student,
        test_generate_plan_no_profile,
        test_generate_plan_no_active_track,
        test_generate_plan_track_not_active,
        test_generate_plan_saves_to_s3,
        test_record_outcome_accepted,
        test_record_outcome_completion,
        test_record_outcome_abort,
        test_record_outcome_invalid_result,
        test_record_outcome_no_profile,
        test_record_outcome_no_active_track,
        test_record_outcome_missing_task_id,
        test_record_outcome_rejected,
        test_s1_trigger_failure_non_fatal,
        test_build_plan_prompt_senior,
        test_build_plan_prompt_junior,
        test_bedrock_json_parsing_and_retry,
        test_generate_plan_persists_conversation_history,
        test_record_outcome_persists_conversation_history,
        test_track_completion_persists_conversation_history,
        test_track_abort_persists_conversation_history,
        test_conversation_history_non_fatal_s2,
        test_all_tasks_resolved,
        test_quality_bar_plan_personalization,
    ]

    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except Exception as e:
            failed += 1
            import traceback
            print(f"  FAIL {test_fn.__name__}: {e}")
            traceback.print_exc()

    print(f"\n=== Results: {passed} passed, {failed} failed ===")

    if failed > 0:
        sys.exit(1)
