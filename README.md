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

## AWS Services Used

| Service | Role |
|---|---|
| Amazon Bedrock | Core AI engine powering recommendation and plan generation |
| AWS Lambda | Orchestrates backend logic — reads profile, calls Bedrock, writes results |
| API Gateway | HTTP entry point for all frontend calls |
| Amazon DynamoDB | Persistent student profile and conversation history store |
| Amazon S3 | Stores generated application plans and college fit charts |
| AWS Amplify | Hosts the web app with built-in CI/CD and Cognito integration |
| Amazon Cognito | User authentication, tying sessions to persistent profiles |

## Pre-existing Code or Templates

None. All code was written during the hackathon.

## Getting Started

### Frontend (standalone demo with mock AI)

```bash
cd frontend
npm install
npm run dev
```

The frontend runs independently with mock AI services simulating Bedrock responses and `localStorage` for persistence. No AWS credentials needed for local development.

To use the pre-built demo profile, log in with an email containing "maria" (e.g. `maria@demo.com`).

### Backend (requires AWS account)

Backend Lambda functions, API Gateway routes, DynamoDB tables, and S3 buckets are configured via the AWS Console. Bedrock model access must be enabled in your AWS account.
