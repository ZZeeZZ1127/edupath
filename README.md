# EduPath

AI-Powered K–12 to College Planning Assistant — built for AWS Hackathon 2025.

**Mission:** Give every student, especially first-generation learners, the same quality of academic guidance that wealthy families pay thousands of dollars for.

## Team

- Zeen Zheng
- Haoqian Li
- Robin Ding
- Anderson Niu

## Track

Cloud for Good

## What We Built

EduPath is split into two coordinated systems that share a persistent student profile:

**Recommendation System** — Reads the student's profile from DynamoDB and generates personalized, grade-appropriate track recommendations (research programs, internships, college prep, competitions, extracurriculars). Every recommendation references specific details from the student's profile. Tracks carry difficulty scores derived from their individual tasks.

**Planning System** — Once a student selects a track, generates a step-by-step action plan with required materials, deadlines, weekly milestones, resources, and prerequisites specific to both the student's profile and the chosen opportunity.

**Key features delivered:**
- Student onboarding with interest picker, grade selection, and goal setting
- Personalized AI track recommendations referencing student profile details
- Action guide generation with steps, milestones, resources, and prerequisites
- College fit chart generator (Grade 11–12)
- Conversation memory — AI references past inputs and previous plans across sessions
- Two-system UI with Recommendations and Plans tabs

## What We Did Not Build (Cut for Hackathon Scope)

- Amazon Textract document parsing
- Amazon Comprehend analysis
- Step Functions pipeline
- SES email delivery
- Mobile responsive design
- Multi-student / parent view
- Interactive progress tracker (v2 feature)
- Real authentication (see "Authentication" below)

## Architecture

The entire stack is defined in `serverless.yml` (Serverless Framework) and deployed as a single CloudFormation stack (`edupath-prod`) in `us-east-1`, account `037055844080`.

- **Frontend** — React 19 + Vite 7 + TypeScript + Tailwind, built to a static bundle and served from S3 (`edupath-frontend-leo`).
- **API** — one HTTP API (API Gateway V2) at `https://o4nv2xjy0e.execute-api.us-east-1.amazonaws.com` in front of 6 Python 3.11 Lambda functions:

  | Route | Lambda |
  |---|---|
  | `POST /profile` | `create_profile` |
  | `GET  /profile` | `get_profile` |
  | `POST /recommend` | `recommend` |
  | `POST /select-track` | `select_track` |
  | `POST /plan` | `generate_plan` |
  | `POST /outcome` | `record_outcome` |

- **Storage** — DynamoDB table `studentProfiles` (composite key `userId` + `trackId`; the profile itself is stored under a constant `trackId` of `"PROFILE"`) and S3 bucket `edupath-plans-037055844080` for saved plans.
- **AI** — Amazon Bedrock. Recommendations use `us.anthropic.claude-sonnet-4-5-20250929-v1:0`; plan generation uses `us.anthropic.claude-haiku-4-5-20251001-v1:0`.

### Authentication (mocked)

There is **no Cognito and no Amplify** in this project. The login/signup screens are UI only: any email/password is accepted, and the email address is lowercased and non-alphanumeric characters are replaced with `-` to produce the `userId` used as the DynamoDB key. For example, `maria@edupath.demo` becomes `maria-edupath-demo`.

This is fine for a hackathon demo but is **not real authentication** — anyone who knows another user's email slug can read that profile. Do not treat this as production security.

## AWS Services Used

| Service | Role |
|---|---|
| Amazon Bedrock | Core AI engine powering recommendation and plan generation |
| AWS Lambda | Backend logic — reads profile, calls Bedrock, writes results (6 functions) |
| API Gateway (HTTP API, V2) | Single HTTP entry point for all frontend calls |
| Amazon DynamoDB | Persistent student profile and conversation history store |
| Amazon S3 | Stores generated plans (`edupath-plans-037055844080`) and hosts the frontend (`edupath-frontend-leo`) |
| Serverless Framework | Infrastructure-as-code; defines and deploys the whole stack |

## Deployment

Everything is deployed from `serverless.yml` with one command:

```bash
serverless deploy
```

This creates/updates the `edupath-prod` CloudFormation stack (region `us-east-1`). There is no AWS Console provisioning required — the Lambda functions, API Gateway routes, DynamoDB table, S3 bucket, and IAM role are all declared in `serverless.yml`. Bedrock model access must be enabled in the account.

The frontend is built and uploaded to S3 separately:

```bash
cd frontend
npm install
npm run build
# upload frontend/dist to the edupath-frontend-leo bucket
```

## Getting Started

### Frontend (standalone demo with mock AI)

```bash
cd frontend
npm install
npm run dev
```

With no `VITE_API_BASE_URL` set, the frontend runs entirely against mock AI (`frontend/src/services/mockAi.ts`) with `localStorage` for persistence — no AWS credentials or backend needed.

To use the pre-built demo profile, log in with an email containing "maria" (e.g. `maria@edupath.demo`).

### Frontend against the live backend

Set `VITE_API_BASE_URL` to the API base URL in `frontend/.env`:

```
VITE_API_BASE_URL=https://o4nv2xjy0e.execute-api.us-east-1.amazonaws.com
```

When this is set, API calls (`/profile`, `/recommend`, `/select-track`, `/plan`) hit the live Lambda backend and Bedrock. Leave it empty or unset to fall back to mock data. This gate is implemented in `frontend/src/services/api.ts`.

### Backend (requires AWS account)

```bash
npm install -g serverless
serverless deploy
```

Requires AWS credentials with permission to create the CloudFormation stack, Lambda functions, API Gateway, DynamoDB table, and S3 bucket, plus Bedrock model access enabled in the account.
