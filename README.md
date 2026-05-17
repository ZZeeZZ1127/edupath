# EduPath

AI-Powered K–12 to College Planning Assistant — built for AWS Hackathon 2025.

**Mission:** Give every student, especially first-generation learners, the same quality of academic guidance that wealthy families pay thousands of dollars for.

## Team

- Zeen Zheng
- Haoqian Li
- Robin Ding
- Anderson Niu

## Track

Bedrock Track (also qualifies for Serverless). Amazon Bedrock powers both core AI systems — the Recommendation System and the Planning System — while the entire backend runs on a serverless architecture.

## What We Built

EduPath is split into two coordinated systems that share a persistent student profile:

**Recommendation System** — Reads the student's profile from DynamoDB and generates personalized, grade-appropriate track recommendations (research programs, internships, college prep, competitions, extracurriculars). Every recommendation references specific details from the student's profile — generic responses fail the quality bar. Tracks carry difficulty scores (0–100) derived from their individual tasks.

**Planning System** — Once a student selects a track, generates a step-by-step action plan with required materials, deadlines, weekly milestones, resources, and prerequisites specific to both the student's profile and the chosen opportunity. Progress on completed steps is persisted.

**Key features delivered:**
- Student onboarding with interest picker, grade selection, and goal setting
- Personalized AI track recommendations referencing student profile details
- Action guide generation with steps, milestones, resources, and prerequisites
- College fit chart generator (Grade 11–12)
- Conversation memory — AI references past inputs and previous plans across sessions
- Persistent student profile storage via DynamoDB
- Plan storage and retrieval via S3
- Two-system UI with Recommendations and Plans tabs

## What We Did Not Build (Cut for Hackathon Scope)

- Amazon Textract document parsing — manual transcript entry instead
- Amazon Comprehend analysis — Bedrock handles NLP inline
- Step Functions pipeline — single Lambda per endpoint
- SES email delivery — not visible in a live demo
- Mobile responsive design — desktop-first
- Multi-student / parent view — single student account for demo
- Interactive progress tracker — plan displayed as structured output (v2 feature)
- Real-time chat — recommendations and plans are generated on-demand via API calls

## AWS Services Used

| Service | Role |
|---|---|
| Amazon Bedrock | Core AI engine powering recommendation and plan generation |
| AWS Lambda | Orchestrates all backend logic — reads profile, calls Bedrock, writes results |
| API Gateway | HTTP entry point for all frontend calls |
| Amazon DynamoDB | Persistent student profile and conversation history store |
| Amazon S3 | Stores generated application plans and college fit charts |
| AWS Amplify | Hosts the web app with built-in CI/CD and Cognito integration |
| Amazon Cognito | User authentication, tying sessions to persistent profiles |

## Architecture

```
Amplify (React frontend)
        │
   API Gateway
        │
     Lambda ──── DynamoDB (student profiles, history)
        │
     Bedrock ──── S3 (generated plans)
```

Single Lambda per endpoint. No queues, no Step Functions. API Gateway → Lambda → DynamoDB + Bedrock.

## Getting Started

### Frontend (standalone demo with mock AI)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs independently with mock AI services (`mockAi.ts`) simulating Bedrock responses and `localStorage` for persistence. No AWS credentials needed for local development.

To use the pre-built demo profile, log in with an email containing "maria" (e.g. `maria@demo.com`) after clicking "Sign up".

### Backend (requires AWS account)

The backend Lambda functions, API Gateway routes, DynamoDB tables, and S3 buckets are configured via the AWS Console / CDK. Bedrock model access must be enabled in your AWS account before the backend can serve live AI responses.
