# CLAUDE.md — EduPath

This file is read by Claude Code at the start of every session. It contains everything you need to work on this project without asking clarifying questions.

---

## What This Project Is

EduPath is an AI-powered academic planning assistant for K–12 students. It uses Amazon Bedrock for AI and runs on a serverless AWS stack (Lambda + API Gateway + DynamoDB + S3 + Amplify + Cognito).

The project is split into two systems that communicate through DynamoDB:

- **System 1 — Recommendation System:** Reads student profile from DB, generates recommended tracks (curated paths of opportunities), computes difficulty scores per track, returns tracks to frontend. After a track is completed or aborted, recalibrates difficulty using completion rate and application outcomes.
- **System 2 — Planning System:** Takes over once a track is selected. Collects application materials, tracks progress, records outcomes (accepted/rejected) to DB, and triggers System 1 recalibration on major state changes.

---

## Current Implementation Status

- [ ] System 1 — Recommendation System ← **active work**
- [ ] System 2 — Planning System
- [ ] Frontend (Amplify + Cognito)
- [ ] DynamoDB table setup
- [ ] API Gateway wiring

---

## Project Structure

```
edupath/
├── CLAUDE.md                        ← you are here
├── lambdas/
│   ├── create_profile/              # POST /profile — save onboarding data
│   │   └── handler.py
│   ├── get_profile/                 # GET /profile — retrieve student profile
│   │   └── handler.py
│   ├── recommend/                   # POST /recommend — System 1 core (ACTIVE)
│   │   └── handler.py
│   ├── select_track/                # POST /select-track — write chosen track to DB
│   │   └── handler.py
│   ├── generate_plan/               # POST /plan — System 2
│   │   └── handler.py
│   └── record_outcome/             # POST /outcome — System 2, triggers System 1
│       └── handler.py
├── db/
│   └── client.py                    ← teammate's module — import, don't rewrite
├── frontend/                        # Amplify React app
├── infra/                           # CDK or SAM config (if used)
└── prompts/                         # Bedrock prompt templates
    ├── track_generation.txt
    └── recalibration.txt
```

---

## AWS Stack

| Service | Purpose |
|---------|---------|
| Amazon Bedrock | Powers both systems — model: `anthropic.claude-sonnet-4-5` |
| AWS Lambda | One Lambda per endpoint, synchronous, no Step Functions |
| API Gateway | HTTP entry point for all frontend calls |
| DynamoDB | `studentProfiles` table — student profile + current track status |
| S3 | Generated application plans (System 2 only) |
| Amplify | Hosts React frontend |
| Cognito | User auth — `userId` = Cognito sub, used as DynamoDB partition key |

**Key principle:** One Lambda per endpoint. No Step Functions, no queues. No over-engineering.

---

## DynamoDB Schema (reference only — owned by teammate)

System 1 never calls DynamoDB directly. This is here so you understand what data the DB module is reading/writing on your behalf.

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
      { "task_id": "uuid", "result": "rejected" }
    ]
  }
}
```

---

## API Endpoints

| Method | Path | Lambda | System |
|--------|------|--------|--------|
| POST | /profile | createProfile | Both |
| GET | /profile | getProfile | Both |
| POST | /recommend | recommend | System 1 |
| POST | /select-track | selectTrack | System 1 |
| POST | /plan | generatePlan | System 2 |
| POST | /outcome | recordOutcome | System 2 |

---

## System 1 — How It Works

### POST /recommend

1. Call `db.getProfile(userId)` to fetch the student profile
2. Check `currentTrackStatus.status`:
   - If `completed` or `aborted` → recalibration mode (include past outcomes and completion rate in prompt)
   - Otherwise → fresh generation mode
3. Build Bedrock prompt (see Prompts section below)
4. Call Bedrock, parse JSON response
5. Compute each track's difficulty = weighted average of task difficulties
6. Return `{ tracks: [...] }` to frontend

### POST /select-track

1. Receive `{ userId, track }`
2. Compute track difficulty if not already set
3. Call `db.setCurrentTrack(userId, { ...track, status: "active", selected_at: now })`
4. Return `{ success: true }`

### Recalibration trigger (called by System 2)

System 2 calls POST /recommend after setting `currentTrackStatus.status` to `completed` or `aborted`. System 1 reads the status, detects it's a recalibration run, and adjusts difficulty accordingly.

---

## System 2 — How It Works (don't build this yet, but know the contract)

- Reads `currentTrackStatus` from DynamoDB
- Collects materials + progress from the student via the UI
- Writes outcomes (accepted/rejected) to `currentTrackStatus.outcomes`
- When all tasks done or student aborts: sets `currentTrackStatus.status = "completed" | "aborted"`
- Then calls POST /recommend to trigger System 1 recalibration

---

## Database Layer

System 1 does **not** talk to DynamoDB directly. A teammate owns the database layer and exposes it as direct function calls within the same codebase. Import and use their module — do not write your own DynamoDB calls.

The exact function signatures are TBD. Until the interface is confirmed, stub them like this:

```python
# db/client.py — teammate's module (do not implement, just import)
# Stub for local development until teammate provides real implementation:

def get_profile(user_id: str) -> dict:
    raise NotImplementedError("Waiting on DB interface from teammate")

def set_current_track(user_id: str, track_status: dict) -> None:
    raise NotImplementedError("Waiting on DB interface from teammate")
```

When the teammate shares the real interface, swap the stubs for the real calls. All DB reads and writes in System 1 go through this module — nothing else.

---

## Bedrock Integration

Language: **Python**. Runtime: **AWS Lambda (Python 3.12)**. SDK: **boto3** (pre-installed in Lambda — no extra dependencies needed).

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

    # Strip accidental markdown fences
    cleaned = re.sub(r"^```(?:json)?\n?", "", raw_text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()

    return json.loads(cleaned)
```

### Lambda handler pattern

```python
import json
from db import client as db
from bedrock_utils import call_bedrock  # your shared helper

def handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        user_id = body["userId"]

        profile = db.get_profile(user_id)
        if not profile:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "profile not found — complete onboarding first"})
            }

        # ... build prompt, call Bedrock, compute difficulty ...

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"tracks": tracks})
        }

    except Exception as e:
        print("Error:", e)
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
```

---

## Prompts

### Track Generation — System Prompt

```
You are an academic advisor AI for EduPath, a college planning assistant for K-12 students.

Generate recommended tracks — curated paths of opportunities — based on the student's profile. Each track contains 3-5 tasks.

Rules:
- Every track description MUST reference at least one specific detail from the student's profile (name, interests, grade, or goals). Generic output fails the quality bar.
- Tracks must be grade-appropriate:
  - Grade 6-8: clubs, competitions, community service
  - Grade 9-10: add research programs and internships
  - Grade 11-12: add college applications
- Each task has a difficulty value 0-100. RSI = 90. Local science fair = 30. Be realistic.
- Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
- Return exactly 3 tracks.

Task categories: research | internship | college | competition | extracurricular
```

### Track Generation — User Message Template

```
Student profile:
- Name: {{name}}
- Age: {{age}}
- Grade: {{grade}}
- Interests: {{interests}}
- Extracurriculars: {{extracurriculars}}
- Goals: {{goals}}
- Past conversation: {{conversationHistory or "none"}}
{{recalibrationBlock}}

Return a JSON array of 3 tracks. Each track:
{
  "track_id": "uuid",
  "label": "short name",
  "description": "2-3 sentences referencing student's specific interests",
  "tasks": [
    {
      "task_id": "uuid",
      "label": "task name",
      "category": "research|internship|college|competition|extracurricular",
      "difficulty": 0-100,
      "description": "what to do",
      "deadline": "YYYY-MM-DD or null"
    }
  ]
}

Return only the JSON array. No other text.
```

### Recalibration Block (append when status is completed/aborted)

```
Previous track performance:
- Track: {{previousTrack.label}} (difficulty: {{previousTrack.difficulty}})
- Completion rate: {{completionRate}}% of tasks completed
- Outcomes: {{outcomes}}

Adjust difficulty of new tracks:
- Completion > 80% AND mostly accepted → increase target difficulty ~15 points
- Completion < 50% OR mostly rejected → decrease target difficulty ~15 points
- Otherwise → hold similar difficulty
```

---

## IAM Permissions (Lambda execution role)

- `bedrock:InvokeModel` — for the Bedrock model being used

DynamoDB permissions are handled by the teammate who owns the DB layer — not System 1's concern.

---

## Error Handling Rules

- Bedrock returns malformed JSON → retry once, then 500 with message
- DB call fails → 500
- Student has no profile → 400 `{ error: "profile not found — complete onboarding first" }`
- Always log raw Bedrock response before parsing

---

## Quality Bar

Track generation passes quality when tested with these three profiles and the outputs are meaningfully different:

| Profile | Expected output |
|---------|----------------|
| Grade 7, interests: art + soccer | Competitions, clubs, community service. No internships or college. |
| Grade 10, interests: CS + robotics | Hackathons, coding competitions, maybe a research program. No college apps. |
| Grade 11, interests: biology + debate, goal: pre-med | Research programs (RSI-type), hospital volunteering, college recommendations with match reasoning. |

If any output could apply to a different student, the prompt needs more work.

---

## What Not to Do

- Do not write DynamoDB calls directly — use the DB module your teammate provides
- Do not add Step Functions or SQS
- Do not build System 2 (application materials, progress tracking, outcome UI)
- Do not add mobile responsive design (desktop-first for the demo)
- Do not add Textract, Comprehend, or SES unless explicitly told to
- Do not break the one-Lambda-per-endpoint structure

---

## Demo Persona (for testing)

Name: Maria | Age: 17 | Grade: 11 | Interests: biology, debate | Extracurriculars: debate club, hospital volunteer | Goals: apply to pre-med program

Use Maria as the test profile when verifying that System 1 outputs are specific and impressive.
