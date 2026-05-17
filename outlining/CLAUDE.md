# CLAUDE.md — EduPath System 2

This file is read by Claude Code at the start of every session. It contains everything you need to work on System 2 without asking clarifying questions.

---

## What This Project Is

EduPath is an AI-powered academic planning assistant for K–12 students. It runs on a serverless AWS stack (Lambda + API Gateway + DynamoDB + S3 + Amplify + Cognito) and uses Amazon Bedrock for AI.

The project has two systems that communicate through DynamoDB:

- **System 1 — Recommendation System (already built):** Reads the student profile from DB, generates recommended tracks, computes difficulty scores, writes chosen track to DB, and recalibrates difficulty after each completed or aborted track. Lives in `recommendation/`.
- **System 2 — Planning System (you are here):** Takes ownership once a track is selected. Generates application plans via Bedrock, stores them in S3, records outcomes (accepted/rejected) to DB, and triggers System 1 recalibration when a track ends. Lives in `outlining/`.

---

## Current Implementation Status

- [x] System 1 — Recommendation System
- [ ] System 2 — Planning System ← **active work**
- [ ] Frontend (Amplify + Cognito)
- [ ] DynamoDB table setup
- [ ] API Gateway wiring

---

## Project Structure

System 2 lives entirely within the `outlining/` folder. System 1 lives in `recommendation/`. Each system deploys its Lambdas independently.

```
outlining/
├── CLAUDE.md                    ← you are here
├── lambdas/
│   ├── generate_plan/           # POST /plan — generate application plan
│   │   └── handler.py
│   └── record_outcome/          # POST /outcome — record result, trigger S1
│       └── handler.py
├── db/
│   ├── __init__.py
│   └── client.py                ← DB stubs (same interface across both systems)
├── prompts/
│   ├── application_plan.txt     # system prompt for plan generation
│   └── college_fit_chart.txt    # appended to plan prompt for Grade 11–12
├── bedrock_utils.py             # Bedrock helper (same as recommendation/)
└── s3_utils.py                  # S3 save/load plans
```

System 1 lives next door in `recommendation/`. The `db/client.py` stubs must stay in sync between both folders — when the teammate delivers the real implementation, update both copies.

---

## AWS Stack

| Service | Purpose |
|---------|---------|
| Amazon Bedrock | Powers both systems — model: `anthropic.claude-sonnet-4-5` |
| AWS Lambda | One Lambda per endpoint, synchronous, no Step Functions |
| API Gateway | HTTP entry point for all frontend calls |
| DynamoDB | `studentProfiles` table — student profile + current track status |
| S3 | Generated application plans — bucket name in `PLAN_BUCKET` env var |
| Amplify | Hosts React frontend |
| Cognito | User auth — `userId` = Cognito sub, used as DynamoDB partition key |

**Key principle:** One Lambda per endpoint. No Step Functions, no queues. No over-engineering.

---

## DynamoDB Schema (reference only — owned by teammate)

System 2 never calls DynamoDB directly. This is here so you understand what data the DB module reads and writes on your behalf.

```json
{
  "userId": "cognito-sub-id",
  "name": "Maria",
  "age": 17,
  "grade": 11,
  "interests": ["biology", "debate"],
  "extracurriculars": ["debate club", "hospital volunteer"],
  "goals": ["apply to pre-med program"],
  "conversationHistory": [],
  "currentTrackStatus": {
    "track_id": "uuid",
    "label": "Research-Focused Path",
    "difficulty": 62.5,
    "status": "active",
    "selected_at": "ISO8601",
    "tasks": [
      {
        "task_id": "uuid",
        "label": "Apply to RSI",
        "category": "research",
        "difficulty": 85,
        "description": "...",
        "deadline": "2025-03-01",
        "completed": false
      }
    ],
    "outcomes": [
      { "task_id": "uuid", "result": "accepted" }
    ]
  }
}
```

`currentTrackStatus.status` values: `active` | `completed` | `aborted`

An outcome is "recorded" once it appears in the `outcomes` array (written by `db.record_outcome`). A track is terminal when all tasks have outcomes or the student explicitly aborts.

---

## API Endpoints

| Method | Path | Lambda | Owner |
|--------|------|--------|-------|
| POST | /profile | createProfile | System 1 |
| GET | /profile | getProfile | System 1 |
| POST | /recommend | recommend | System 1 |
| POST | /select-track | selectTrack | System 1 |
| POST | /plan | generatePlan | **System 2** |
| POST | /outcome | recordOutcome | **System 2** |

---

## System 2 — How It Works

### POST /plan

1. Call `db.get_profile(userId)` to fetch the student profile
2. Validate `currentTrackStatus.status == "active"` — if not, return 400
3. Build Bedrock prompt using profile + active track (see Prompts section)
4. Call Bedrock, parse JSON response
5. If Grade 11–12: append the college fit chart prompt to the user message before calling Bedrock
6. Save plan to S3 at `plans/{userId}/{track_id}.json`
7. Return plan to frontend

### POST /outcome

1. Call `db.get_profile(userId)` to fetch the profile
2. Validate `currentTrackStatus.status == "active"`
3. Call `db.record_outcome(userId, task_id, result)` to write the outcome
4. Re-fetch the profile to get the updated outcomes list
5. Check termination:
   - `abort_track == true` → call `db.set_current_track(userId, { ...track, status: "aborted" })`, trigger System 1
   - All tasks have a recorded outcome → call `db.set_current_track(userId, { ...track, status: "completed" })`, trigger System 1
   - Otherwise → return success, no trigger
6. Return `{ success: true, track_status: "active" | "completed" | "aborted" }`

### System 1 Trigger

When a track ends (completed or aborted), HTTP POST to the System 1 /recommend endpoint with `{ userId }`. This is fire-and-forget — if it fails, log the error but still return 200. The outcome is already written; System 1 will self-correct on the student's next visit.

```python
import urllib.request, json, os

def trigger_system1(user_id: str) -> None:
    url = os.environ.get("RECOMMEND_ENDPOINT")
    payload = json.dumps({"userId": user_id}).encode("utf-8")
    req = urllib.request.Request(url, data=payload,
          headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            print("System 1 triggered:", r.status)
    except Exception as e:
        print("Warning: System 1 trigger failed (non-fatal):", e)
```

---

## Database Layer

System 2 does **not** talk to DynamoDB directly. A teammate owns the database layer and exposes it as direct function calls. Import and use their module — do not write your own DynamoDB calls.

Until the teammate delivers the real implementation, use these stubs:

```python
# db/client.py — do not implement, swap for real calls when ready

def get_profile(user_id: str) -> dict | None:
    """Fetch student profile by userId. Returns None if not found."""
    raise NotImplementedError("Waiting on DB interface from teammate")

def set_current_track(user_id: str, track_status: dict) -> None:
    """Write the full currentTrackStatus for a student (e.g. flip status to completed/aborted)."""
    raise NotImplementedError("Waiting on DB interface from teammate")

def record_outcome(user_id: str, task_id: str, result: str) -> None:
    """Record an outcome (accepted/rejected/pending) for a specific task."""
    raise NotImplementedError("Waiting on DB interface from teammate")
```

When the teammate shares the real interface, swap the stubs for the real calls. Keep `outlining/db/client.py` in sync with `recommendation/db/client.py` — same function signatures, same behavior.

---

## Bedrock Integration

Language: **Python**. Runtime: **AWS Lambda (Python 3.12)**. SDK: **boto3**.

`bedrock_utils.py` is identical to System 1's copy in `recommendation/bedrock_utils.py`.

```python
import boto3
import json
import re

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

def call_bedrock(system_prompt: str, user_message: str) -> list | dict:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}]
    })

    response = bedrock.invoke_model(
        modelId="anthropic.claude-sonnet-4-5",
        body=body,
        contentType="application/json",
        accept="application/json"
    )

    response_body = json.loads(response["body"].read())
    raw_text = response_body["content"][0]["text"]
    print("Raw Bedrock response:", raw_text)  # always log before parsing

    cleaned = re.sub(r"^```(?:json)?\n?", "", raw_text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()

    return json.loads(cleaned)
```

---

## S3 Storage

Plans are stored as JSON in S3. Bucket name comes from the `PLAN_BUCKET` environment variable.

S3 key pattern: `plans/{userId}/{track_id}.json`

```python
import boto3, json, os

s3 = boto3.client("s3", region_name="us-east-1")
PLAN_BUCKET = os.environ.get("PLAN_BUCKET")

def save_plan(user_id: str, track_id: str, plan: dict) -> str:
    key = f"plans/{user_id}/{track_id}.json"
    s3.put_object(Bucket=PLAN_BUCKET, Key=key,
                  Body=json.dumps(plan), ContentType="application/json")
    return key

def load_plan(user_id: str, track_id: str) -> dict | None:
    key = f"plans/{user_id}/{track_id}.json"
    try:
        obj = s3.get_object(Bucket=PLAN_BUCKET, Key=key)
        return json.loads(obj["Body"].read())
    except s3.exceptions.NoSuchKey:
        return None
```

---

## Prompts

### Application Plan — System Prompt (`prompts/application_plan.txt`)

```
You are an academic advisor AI for EduPath, a college planning assistant for K-12 students.

Generate a structured, personalized application plan for each task in the student's selected track.

Rules:
- Every action item and match explanation MUST reference at least one specific detail from the student's profile (name, interests, grade, extracurriculars, or goals). Generic output fails the quality bar.
- Materials listed must be specific to the actual opportunity — RSI requires two teacher recommendations and a personal essay, not generic "recommendation letter".
- Deadlines must be realistic and tied to known deadlines where possible. Use null if unknown.
- Action items must be ordered by priority (most time-sensitive first).
- Return ONLY valid JSON. No preamble, no explanation, no markdown fences.

For Grade 11-12 students: include a college_fit_chart (6-8 schools). For other grades: set college_fit_chart to null.
```

### Application Plan — User Message Template (built in code)

```
Student profile:
- Name: {{name}}
- Age: {{age}}
- Grade: {{grade}}
- Interests: {{interests}}
- Extracurriculars: {{extracurriculars}}
- Goals: {{goals}}

Active track: {{track.label}}
Track description: {{track.description}}

Tasks to plan:
{{for each task}}
- {{task.label}} | Category: {{task.category}} | Deadline: {{task.deadline}}
  Description: {{task.description}}
{{end for}}

Return a JSON object:
{
  "track_id": "...",
  "label": "...",
  "tasks": [
    {
      "task_id": "...",
      "label": "...",
      "materials_needed": ["specific materials required"],
      "deadlines": { "application": "YYYY-MM-DD or null", "financial_aid": "YYYY-MM-DD or null" },
      "action_items": ["ordered, specific steps"],
      "match_reasoning": "2-3 sentences referencing student's specific profile",
      "status": "pending"
    }
  ],
  "college_fit_chart": null
}

Return only the JSON object. No other text.
```

### College Fit Chart — appended to user message for Grade 11–12 (`prompts/college_fit_chart.txt`)

When the student is in Grade 11 or 12, load this from file and append it to the user message above:

```
Additionally, include college_fit_chart in the plan object (6-8 schools):

"college_fit_chart": [
  {
    "school": "School Name",
    "fit_type": "reach | match | safety",
    "why_it_fits": "2 sentences referencing this student's specific interests and goals",
    "requirements": {
      "gpa": "...",
      "test_scores": "...",
      "notable_requirements": ["specific to this school"]
    },
    "application_deadline": "YYYY-MM-DD or null",
    "financial_aid_deadline": "YYYY-MM-DD or null"
  }
]

Mix of reach/match/safety. Every entry must reference something specific in the student's profile. Generic entries fail the quality bar.
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `PLAN_BUCKET` | S3 bucket name for storing generated plans |
| `RECOMMEND_ENDPOINT` | Full URL of POST /recommend (System 1) for triggering recalibration |

---

## IAM Permissions (Lambda execution role)

- `bedrock:InvokeModel` — for the Bedrock model
- `s3:PutObject` and `s3:GetObject` — on the plan bucket

DynamoDB permissions are handled by the teammate who owns the DB layer — not System 2's concern.

---

## Error Handling Rules

- Bedrock returns malformed JSON → retry once, then 500 with message
- DB call fails → 500
- S3 write fails → 500 (do not return a plan that wasn't persisted)
- No profile found → 400 `{ "error": "profile not found — complete onboarding first" }`
- No active track → 400 `{ "error": "no active track — select a track first" }`
- System 1 trigger fails → log it, still return 200 (outcome is already written)
- Always log raw Bedrock response before parsing

---

## Quality Bar

Test with the demo persona before shipping:

**Demo Persona:** Maria | Age 17 | Grade 11 | Interests: biology, debate | Extracurriculars: debate club, hospital volunteer | Goals: apply to pre-med program

| Test | Expected |
|------|---------|
| Plan for Maria's RSI task | Must reference biology specifically; materials must be RSI-specific (2 teacher recs, personal essay), not generic |
| Plan for Maria's debate tournament task | Must reference debate; materials must differ from the RSI plan |
| College fit chart for Maria | Mix of reach/match/safety; every entry mentions biology or debate or pre-med interest |
| Record outcome (partial) | Returns `track_status: "active"`, no System 1 trigger |
| Record all outcomes | Returns `track_status: "completed"`, confirms System 1 trigger |
| Abort track | Returns `track_status: "aborted"`, confirms System 1 trigger |

If any plan output could apply to any student, the prompt needs more work.

---

## What Not to Do

- Do not write DynamoDB calls directly — use the DB module your teammate provides
- Do not add Step Functions or SQS
- Do not build the frontend or progress tracking UI
- Do not implement System 1 logic (track generation, difficulty scoring, recalibration)
- Do not add Textract, Comprehend, or SES unless explicitly told to
- Do not break the one-Lambda-per-endpoint structure
- Do not return a plan to the frontend if the S3 write failed

---

## System 1 Contract

**System 1 → System 2:** Writes a selected track to `currentTrackStatus` with `status: "active"` and a fully populated `tasks` array. You read this; you do not modify the tasks themselves.

**System 2 → System 1:** When a track ends, update `currentTrackStatus.status` to `"completed"` or `"aborted"` (via `db.set_current_track`), then HTTP POST to `/recommend` with `{ userId }`. That's the full handoff — System 1 reads everything else from DB.

---

## Demo Persona (for testing)

Name: Maria | Age: 17 | Grade: 11 | Interests: biology, debate | Extracurriculars: debate club, hospital volunteer | Goals: apply to pre-med program

Use Maria's profile when verifying that plans are specific, materials are realistic, and the college fit chart names schools that genuinely match a pre-med biology student who debates.
