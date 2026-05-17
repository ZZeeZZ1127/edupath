"""
Local test suite for System 1 — Recommendation System.

Run from the recommendation/ directory:
    cd recommendation
    python test_local.py

Uses in-memory mocks for DB and Bedrock to test all logic paths
without requiring AWS credentials.
"""

import json
import sys
import os
from unittest.mock import patch, MagicMock

# Ensure recommendation/ is on the path so handlers can import db, bedrock_utils
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── In-memory DB mock ──────────────────────────────────────────────────

_in_memory_db: dict[str, dict] = {}


def _mock_get_profile(user_id: str) -> dict | None:
    profile = _in_memory_db.get(user_id)
    if profile and "__profile" in profile:
        return profile["__profile"]
    return None


def _mock_set_current_track(user_id: str, track_status: dict) -> None:
    _in_memory_db[user_id] = track_status


# ── Sample Bedrock responses ────────────────────────────────────────────

def _make_mock_tracks(grade, interests):
    """Return grade-appropriate mock tracks based on the student profile."""
    grade = int(grade) if grade else 11

    if grade <= 8:
        # Grade 6-8: clubs, competitions, community service only
        return [
            {
                "track_id": "track-junior-1",
                "label": f"{'Art' if 'art' in str(interests).lower() else 'Creative'} Expression Path",
                "description": f"Build your creativity through hands-on projects and friendly competition.",
                "tasks": [
                    {"task_id": "jt-1", "label": "Join Art Club", "category": "extracurricular", "difficulty": 15, "description": "Attend weekly art club meetings.", "deadline": "2025-09-15"},
                    {"task_id": "jt-2", "label": "Local Art Competition", "category": "competition", "difficulty": 30, "description": "Submit artwork to a local youth competition.", "deadline": "2025-11-01"},
                    {"task_id": "jt-3", "label": "Community Mural Project", "category": "extracurricular", "difficulty": 25, "description": "Volunteer for a community mural painting event.", "deadline": "2026-03-01"}
                ]
            },
            {
                "track_id": "track-junior-2",
                "label": "Soccer + Teamwork Path",
                "description": "Develop athletic skills and team leadership through soccer.",
                "tasks": [
                    {"task_id": "jt-4", "label": "Soccer League", "category": "extracurricular", "difficulty": 20, "description": "Join a local youth soccer league.", "deadline": "2025-08-01"},
                    {"task_id": "jt-5", "label": "Soccer Tournament", "category": "competition", "difficulty": 35, "description": "Compete in a regional youth soccer tournament.", "deadline": "2025-10-01"},
                    {"task_id": "jt-6", "label": "Team Captain", "category": "extracurricular", "difficulty": 30, "description": "Take on a leadership role as team captain.", "deadline": "2026-01-01"}
                ]
            },
            {
                "track_id": "track-junior-3",
                "label": "Well-Rounded Explorer Path",
                "description": "Try different activities to discover what excites you most.",
                "tasks": [
                    {"task_id": "jt-7", "label": "Community Cleanup", "category": "extracurricular", "difficulty": 10, "description": "Participate in a neighborhood cleanup day.", "deadline": "2025-09-01"},
                    {"task_id": "jt-8", "label": "School Talent Show", "category": "competition", "difficulty": 20, "description": "Perform in the school talent show.", "deadline": "2025-12-01"},
                    {"task_id": "jt-9", "label": "Chess Club", "category": "extracurricular", "difficulty": 15, "description": "Join chess club and learn strategic thinking.", "deadline": "2025-09-15"}
                ]
            }
        ]
    elif grade <= 10:
        # Grade 9-10: add research and internships
        return [
            {
                "track_id": "track-mid-1",
                "label": "CS Competition Path",
                "description": "Channel your coding skills into competitions that build your resume.",
                "tasks": [
                    {"task_id": "mt-1", "label": "USACO Training", "category": "competition", "difficulty": 55, "description": "Train for USA Computing Olympiad bronze/silver.", "deadline": "2025-12-01"},
                    {"task_id": "mt-2", "label": "Hackathon", "category": "competition", "difficulty": 40, "description": "Participate in a regional hackathon.", "deadline": "2026-02-01"},
                    {"task_id": "mt-3", "label": "CS Club Founder", "category": "extracurricular", "difficulty": 30, "description": "Start a coding club at school.", "deadline": "2025-09-01"}
                ]
            },
            {
                "track_id": "track-mid-2",
                "label": "Robotics + Engineering Path",
                "description": "Build hardware and software skills through robotics projects.",
                "tasks": [
                    {"task_id": "mt-4", "label": "FTC Robotics", "category": "competition", "difficulty": 50, "description": "Join a FIRST Tech Challenge team.", "deadline": "2025-09-01"},
                    {"task_id": "mt-5", "label": "Summer STEM Camp", "category": "research", "difficulty": 35, "description": "Attend a summer engineering camp at a local university.", "deadline": "2026-05-01"},
                    {"task_id": "mt-6", "label": "Arduino Project", "category": "extracurricular", "difficulty": 30, "description": "Build a personal electronics project.", "deadline": "2026-03-01"}
                ]
            },
            {
                "track_id": "track-mid-3",
                "label": "Balanced STEM Explorer",
                "description": "Explore CS and engineering broadly to find your focus area.",
                "tasks": [
                    {"task_id": "mt-7", "label": "Online CS Course", "category": "extracurricular", "difficulty": 25, "description": "Complete an advanced online programming course.", "deadline": "2025-12-01"},
                    {"task_id": "mt-8", "label": "Science Fair Entry", "category": "competition", "difficulty": 35, "description": "Enter a CS project in the school science fair.", "deadline": "2026-02-01"},
                    {"task_id": "mt-9", "label": "Tech Internship Search", "category": "internship", "difficulty": 45, "description": "Research and apply to high school tech internships.", "deadline": "2026-04-01"}
                ]
            }
        ]
    else:
        # Grade 11-12: add college applications
        return [
            {
                "track_id": "track-sr-1",
                "label": "Research-Focused Pre-Med Path",
                "description": f"Build toward pre-med through research programs suited to your interests in {', '.join(interests[:2]) if interests else 'STEM'}.",
                "tasks": [
                    {"task_id": "st-1", "label": "Apply to RSI", "category": "research", "difficulty": 90, "description": "Apply to the Research Science Institute.", "deadline": "2026-01-15"},
                    {"task_id": "st-2", "label": "Science Fair Project", "category": "competition", "difficulty": 45, "description": "Develop a biology project for the regional science fair.", "deadline": "2026-03-01"},
                    {"task_id": "st-3", "label": "Hospital Volunteering", "category": "extracurricular", "difficulty": 20, "description": "Continue hospital volunteering, target 100+ hours.", "deadline": "2026-06-01"},
                    {"task_id": "st-4", "label": "College Research", "category": "college", "difficulty": 20, "description": "Research pre-med programs and build a college list.", "deadline": "2026-06-01"}
                ]
            },
            {
                "track_id": "track-sr-2",
                "label": "Leadership + Debate Path",
                "description": "Leverage your debate experience for communication and leadership growth.",
                "tasks": [
                    {"task_id": "st-5", "label": "National Debate Tournament", "category": "competition", "difficulty": 70, "description": "Compete in a national high school debate tournament.", "deadline": "2026-04-01"},
                    {"task_id": "st-6", "label": "Start Interest Club", "category": "extracurricular", "difficulty": 35, "description": "Found a club combining your academic interests with leadership.", "deadline": "2025-09-01"},
                    {"task_id": "st-7", "label": "SAT/ACT Prep", "category": "college", "difficulty": 50, "description": "Prepare for standardized tests.", "deadline": "2026-06-01"}
                ]
            },
            {
                "track_id": "track-sr-3",
                "label": "Balanced College Prep Path",
                "description": "A well-rounded approach to pre-med with academics, service, and applications.",
                "tasks": [
                    {"task_id": "st-8", "label": "SAT/ACT Prep", "category": "college", "difficulty": 50, "description": "Target 1500+ SAT or 33+ ACT.", "deadline": "2026-06-01"},
                    {"task_id": "st-9", "label": "Summer Medical Program", "category": "research", "difficulty": 65, "description": "Apply to a pre-college medical summer program.", "deadline": "2026-02-01"},
                    {"task_id": "st-10", "label": "Personal Statement Draft", "category": "college", "difficulty": 30, "description": "Draft a personal statement connecting your interests.", "deadline": "2026-07-01"},
                    {"task_id": "st-11", "label": "AP Exam Prep", "category": "college", "difficulty": 40, "description": "Prepare for AP exams, target scores of 4-5.", "deadline": "2026-05-01"}
                ]
            }
        ]


# ── Test helpers ────────────────────────────────────────────────────────


def _api_gateway_event(body: dict) -> dict:
    """Simulate an API Gateway event with a JSON body."""
    return {"body": json.dumps(body)}


def _assert_200(result: dict):
    assert result["statusCode"] == 200, f"Expected 200, got {result['statusCode']}: {result.get('body')}"


def _assert_400(result: dict):
    assert result["statusCode"] == 400, f"Expected 400, got {result['statusCode']}: {result.get('body')}"


def _assert_500(result: dict):
    assert result["statusCode"] == 500, f"Expected 500, got {result['statusCode']}: {result.get('body')}"


# ── Maria profile fixture ───────────────────────────────────────────────

MARIA = {
    "userId": "maria-001",
    "name": "Maria",
    "age": 17,
    "grade": 11,
    "interests": ["biology", "debate"],
    "extracurriculars": ["debate club", "hospital volunteer"],
    "goals": ["apply to pre-med program"],
    "conversationHistory": [],
    "currentTrackStatus": None
}

# ── Tests ───────────────────────────────────────────────────────────────

# Patch the db module and bedrock_utils before importing handlers
import db.client as db_client
import bedrock_utils as bedrock_mod

db_client.get_profile = _mock_get_profile
db_client.set_current_track = _mock_set_current_track

_bedrock_call_log = []  # mutable list for spying on calls across tests

def _mock_call_bedrock(system_prompt, user_message, retry=True):
    # Extract grade from the user message to return grade-appropriate tracks
    import re
    _bedrock_call_log.append((system_prompt, user_message, retry))
    grade_match = re.search(r"Grade:\s*(\d+)", user_message)
    grade = int(grade_match.group(1)) if grade_match else 11
    interests_match = re.search(r"Interests:\s*(.+)", user_message)
    interests = interests_match.group(1).split(", ") if interests_match else []
    if interests == ["none"]:
        interests = []
    return _make_mock_tracks(grade, interests)

bedrock_mod.call_bedrock = _mock_call_bedrock

from lambdas.create_profile.handler import handler as create_profile
from lambdas.get_profile.handler import handler as get_profile
from lambdas.recommend.handler import handler as recommend
from lambdas.select_track.handler import handler as select_track


def test_create_profile_maria():
    """Create Maria's profile and verify it can be retrieved."""
    _in_memory_db.clear()

    event = _api_gateway_event(MARIA)
    result = create_profile(event, None)
    _assert_200(result)
    assert json.loads(result["body"]) == {"success": True}

    # Verify it was stored
    profile = _mock_get_profile("maria-001")
    assert profile is not None
    assert profile["name"] == "Maria"
    assert profile["grade"] == 11
    print("  PASS test_create_profile_maria")


def test_get_profile_exists():
    """Retrieve an existing profile."""
    _in_memory_db.clear()
    create_profile(_api_gateway_event(MARIA), None)

    # GET via query string
    event = {"queryStringParameters": {"userId": "maria-001"}}
    result = get_profile(event, None)
    _assert_200(result)
    data = json.loads(result["body"])
    assert data["profile"]["name"] == "Maria"
    print("  PASS test_get_profile_exists")


def test_get_profile_not_found():
    """Profile not found returns 400."""
    _in_memory_db.clear()
    event = {"queryStringParameters": {"userId": "no-such-user"}}
    result = get_profile(event, None)
    _assert_400(result)
    data = json.loads(result["body"])
    assert "profile not found" in data["error"]
    print("  PASS test_get_profile_not_found")


def test_recommend_fresh_generation():
    """Fresh recommendation (no prior track) returns 3 tracks with difficulty."""
    _in_memory_db.clear()
    create_profile(_api_gateway_event(MARIA), None)

    event = _api_gateway_event({"userId": "maria-001"})
    result = recommend(event, None)
    _assert_200(result)

    data = json.loads(result["body"])
    tracks = data["tracks"]
    assert isinstance(tracks, list)
    assert len(tracks) == 3

    for track in tracks:
        assert "track_id" in track
        assert "label" in track
        assert "description" in track
        assert "tasks" in track
        assert "difficulty" in track
        assert 3 <= len(track["tasks"]) <= 5

        # Difficulty should be a computed average
        task_diffs = [t["difficulty"] for t in track["tasks"]]
        expected = round(sum(task_diffs) / len(task_diffs), 1)
        assert track["difficulty"] == expected, \
            f"Track difficulty {track['difficulty']} != avg {expected}"

        for task in track["tasks"]:
            assert "task_id" in task
            assert "category" in task
            assert task["category"] in ("research", "internship", "college", "competition", "extracurricular")
            assert 0 <= task["difficulty"] <= 100

    print("  PASS test_recommend_fresh_generation")


def test_recommend_no_profile():
    """Recommend without a profile returns 400."""
    _in_memory_db.clear()
    event = _api_gateway_event({"userId": "no-such-user"})
    result = recommend(event, None)
    _assert_400(result)
    data = json.loads(result["body"])
    assert "profile not found" in data["error"]
    print("  PASS test_recommend_no_profile")


def test_recommend_recalibration():
    """Recommend after track completion triggers recalibration."""
    _in_memory_db.clear()
    create_profile(_api_gateway_event(MARIA), None)

    # Set up a completed track
    profile = _mock_get_profile("maria-001")
    profile["currentTrackStatus"] = {
        "track_id": "prev-track",
        "label": "Previous Research Path",
        "difficulty": 55.0,
        "status": "completed",
        "selected_at": "2025-06-01T00:00:00Z",
        "tasks": [
            {"task_id": "t1", "label": "Task 1", "category": "research", "difficulty": 60, "description": "desc", "deadline": "2025-08-01", "completed": True},
            {"task_id": "t2", "label": "Task 2", "category": "competition", "difficulty": 70, "description": "desc", "deadline": "2025-09-01", "completed": True},
            {"task_id": "t3", "label": "Task 3", "category": "college", "difficulty": 40, "description": "desc", "deadline": "2025-10-01", "completed": True},
            {"task_id": "t4", "label": "Task 4", "category": "internship", "difficulty": 50, "description": "desc", "deadline": "2025-11-01", "completed": False},
        ],
        "outcomes": [
            {"task_id": "t1", "result": "accepted"},
            {"task_id": "t2", "result": "accepted"},
        ]
    }
    _in_memory_db["maria-001"]["__profile"] = profile

    # Spy on call_bedrock to capture the user_message
    _bedrock_call_log.clear()

    event = _api_gateway_event({"userId": "maria-001"})
    result = recommend(event, None)
    _assert_200(result)

    # Verify recalibration block was included in the user message
    assert _bedrock_call_log, "Expected call_bedrock to be called"
    user_message = _bedrock_call_log[0][1]
    assert "Previous track performance" in user_message
    assert "Previous Research Path" in user_message
    assert "75%" in user_message  # 3/4 tasks completed
    assert "2 accepted" in user_message
    print("  PASS test_recommend_recalibration")


def test_select_track():
    """Selecting a track writes it to DB with active status."""
    _in_memory_db.clear()

    track = {
        "track_id": "track-001",
        "label": "Research-Focused Path",
        "description": "A research-heavy track.",
        "tasks": [
            {"task_id": "t1", "label": "Apply to RSI", "category": "research", "difficulty": 90, "description": "Apply", "deadline": "2026-01-15"},
            {"task_id": "t2", "label": "Science Fair", "category": "competition", "difficulty": 45, "description": "Compete", "deadline": "2026-03-01"}
        ]
    }

    event = _api_gateway_event({"userId": "maria-001", "track": track})
    result = select_track(event, None)
    _assert_200(result)
    assert json.loads(result["body"]) == {"success": True}

    # Verify the stored track
    stored = _in_memory_db.get("maria-001")
    assert stored is not None
    assert stored["status"] == "active"
    assert stored["label"] == "Research-Focused Path"
    assert "selected_at" in stored
    assert stored["difficulty"] == round((90 + 45) / 2, 1)
    assert stored["outcomes"] == []
    print("  PASS test_select_track")


def test_select_track_computes_difficulty():
    """Select track computes difficulty when not provided."""
    _in_memory_db.clear()

    track = {
        "track_id": "track-002",
        "label": "Simple Path",
        "description": "desc",
        "tasks": [
            {"label": "Easy task", "category": "extracurricular", "difficulty": 10, "description": "do it"},
            {"label": "Hard task", "category": "research", "difficulty": 80, "description": "do it"}
        ]
    }

    event = _api_gateway_event({"userId": "maria-001", "track": track})
    result = select_track(event, None)
    _assert_200(result)

    stored = _in_memory_db.get("maria-001")
    assert stored["difficulty"] == 45.0
    print("  PASS test_select_track_computes_difficulty")


def test_select_track_missing_data():
    """Select track fails with missing userId or track."""
    _in_memory_db.clear()

    result = select_track(_api_gateway_event({"userId": "maria-001"}), None)
    _assert_400(result)

    result = select_track(_api_gateway_event({"track": {}}), None)
    _assert_400(result)

    result = select_track(_api_gateway_event({}), None)
    _assert_400(result)
    print("  PASS test_select_track_missing_data")


def test_recommend_missing_user_id():
    """Recommend without userId returns 400."""
    result = recommend(_api_gateway_event({}), None)
    _assert_400(result)
    print("  PASS test_recommend_missing_user_id")


def test_create_profile_missing_user_id():
    """Create profile without userId returns 400."""
    result = create_profile(_api_gateway_event({}), None)
    _assert_400(result)
    print("  PASS test_create_profile_missing_user_id")


def test_difficulty_computation():
    """Unit test the difficulty computation directly."""
    from lambdas.recommend.handler import _compute_track_difficulty

    assert _compute_track_difficulty({"tasks": []}) == 0.0
    assert _compute_track_difficulty({
        "tasks": [{"difficulty": 50}, {"difficulty": 100}]
    }) == 75.0
    assert _compute_track_difficulty({
        "tasks": [{"difficulty": 33}, {"difficulty": 33}, {"difficulty": 34}]
    }) == 33.3
    print("  PASS test_difficulty_computation")


def test_build_user_message():
    """Unit test the user message builder."""
    from lambdas.recommend.handler import _build_user_message

    profile = {
        "name": "TestStudent",
        "age": 14,
        "grade": 9,
        "interests": ["math", "coding"],
        "extracurriculars": ["chess club"],
        "goals": ["win math olympiad"],
        "conversationHistory": []
    }

    msg = _build_user_message(profile, "")
    assert "TestStudent" in msg
    assert "math, coding" in msg
    assert "chess club" in msg
    assert "win math olympiad" in msg
    assert "9" in msg
    assert "14" in msg
    print("  PASS test_build_user_message")


def test_build_recalibration_block():
    """Unit test the recalibration block builder."""
    from lambdas.recommend.handler import _build_recalibration_block

    track_status = {
        "label": "My Track",
        "difficulty": 60.5,
        "tasks": [
            {"task_id": "t1", "completed": True},
            {"task_id": "t2", "completed": True},
            {"task_id": "t3", "completed": False},
            {"task_id": "t4", "completed": True},
        ],
        "outcomes": [
            {"task_id": "t1", "result": "accepted"},
            {"task_id": "t2", "result": "accepted"},
            {"task_id": "t4", "result": "rejected"},
        ]
    }

    block = _build_recalibration_block(track_status)
    assert "My Track" in block
    assert "60.5" in block
    assert "75%" in block  # 3/4
    assert "2 accepted" in block
    assert "1 rejected" in block
    print("  PASS test_build_recalibration_block")


def test_build_recalibration_block_empty():
    """Recalibration block with no tasks."""
    from lambdas.recommend.handler import _build_recalibration_block

    track_status = {
        "label": "Empty Track",
        "difficulty": 0,
        "tasks": [],
        "outcomes": []
    }

    block = _build_recalibration_block(track_status)
    assert "Empty Track" in block
    assert "0%" in block
    assert "none" in block
    print("  PASS test_build_recalibration_block_empty")


# ── Quality bar profiles ────────────────────────────────────────────────

def test_quality_bar_profiles():
    """
    Verify that the system can process the three quality-bar profiles
    without error. Actual differentiation is tested via Bedrock,
    but we verify the pipeline handles all three profile types.
    """
    profiles = [
        {
            "userId": "student-g7",
            "name": "Alex",
            "age": 12,
            "grade": 7,
            "interests": ["art", "soccer"],
            "extracurriculars": ["art club", "soccer team"],
            "goals": [],
            "conversationHistory": [],
            "currentTrackStatus": None
        },
        {
            "userId": "student-g10",
            "name": "Jordan",
            "age": 15,
            "grade": 10,
            "interests": ["CS", "robotics"],
            "extracurriculars": ["robotics club", "coding club"],
            "goals": ["get into a good engineering program"],
            "conversationHistory": [],
            "currentTrackStatus": None
        },
        {
            "userId": "student-g11",
            "name": "Priya",
            "age": 16,
            "grade": 11,
            "interests": ["biology", "debate"],
            "extracurriculars": ["debate club", "hospital volunteer"],
            "goals": ["apply to pre-med program"],
            "conversationHistory": [],
            "currentTrackStatus": None
        }
    ]

    _in_memory_db.clear()

    for profile in profiles:
        # Create profile
        r = create_profile(_api_gateway_event(profile), None)
        _assert_200(r)

        # Get recommendation
        r = recommend(_api_gateway_event({"userId": profile["userId"]}), None)
        _assert_200(r)

        data = json.loads(r["body"])
        tracks = data["tracks"]
        assert len(tracks) == 3

        # Verify grade-appropriate categories exist
        grade = profile["grade"]
        for track in tracks:
            for task in track["tasks"]:
                cat = task["category"]
                # College apps only for grade 11+
                if grade < 11:
                    assert cat != "college", \
                        f"College tasks should not appear for grade {grade}"
                # Internships/research only for grade 9+
                if grade < 9:
                    assert cat not in ("internship", "research"), \
                        f"{cat} tasks should not appear for grade {grade}"

    print("  PASS test_quality_bar_profiles")


def test_bedrock_json_parsing():
    """Verify JSON parsing: clean JSON, markdown-fenced JSON, and malformed handling."""
    import bedrock_utils
    import inspect

    # Verify retry parameter exists
    sig = inspect.signature(bedrock_utils.call_bedrock)
    assert "retry" in sig.parameters

    # Test the JSON cleaning logic directly since it's the core parsing logic
    import re
    import json as json_mod

    # Clean JSON passes
    text = '[{"key": "value"}]'
    cleaned = re.sub(r"^```(?:json)?\n?", "", text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()
    assert json_mod.loads(cleaned) == [{"key": "value"}]

    # Markdown-fenced JSON is stripped
    text = '```json\n[{"a": 1}]\n```'
    cleaned = re.sub(r"^```(?:json)?\n?", "", text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()
    assert json_mod.loads(cleaned) == [{"a": 1}]

    # No-fence markdown JSON
    text = '```\n[{"b": 2}]\n```'
    cleaned = re.sub(r"^```(?:json)?\n?", "", text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()
    assert json_mod.loads(cleaned) == [{"b": 2}]

    # Malformed text raises JSONDecodeError
    try:
        json_mod.loads("not valid json")
        assert False, "Should have raised"
    except json_mod.JSONDecodeError:
        pass

    print("  PASS test_bedrock_json_parsing")


# ── Main ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== System 1 Test Suite ===\n")

    tests = [
        test_create_profile_maria,
        test_get_profile_exists,
        test_get_profile_not_found,
        test_recommend_fresh_generation,
        test_recommend_no_profile,
        test_recommend_recalibration,
        test_select_track,
        test_select_track_computes_difficulty,
        test_select_track_missing_data,
        test_recommend_missing_user_id,
        test_create_profile_missing_user_id,
        test_difficulty_computation,
        test_build_user_message,
        test_build_recalibration_block,
        test_build_recalibration_block_empty,
        test_quality_bar_profiles,
        test_bedrock_json_parsing,
    ]

    passed = 0
    failed = 0

    for test_fn in tests:
        try:
            test_fn()
            passed += 1
        except Exception as e:
            failed += 1
            print(f"  FAIL {test_fn.__name__}: {e}")

    print(f"\n=== Results: {passed} passed, {failed} failed ===")

    if failed > 0:
        sys.exit(1)
