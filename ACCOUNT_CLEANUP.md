# EduPath — Account Cleanup Runbook

Post-hackathon cleanup for AWS account `037055844080`, region `us-east-1`.

> **WARNING — run these deliberately.**
> These commands mutate and delete live AWS resources. Read each step before running it, confirm the output of the `list`/`get` commands matches what you expect, and only run the destructive commands after that confirmation. Do not script-and-forget. If you are unsure, stop and review the state in the AWS Console first.

All commands assume the AWS CLI is authenticated against account `037055844080`.

---

## 1. Delete the dead IAM user `BedrockAPIKey-zi78`

**Why:** Leftover user created 2026-05-20 (after the hackathon) with the `AmazonBedrockLimitedAccess` policy and zero access keys. It has no purpose, so removing it reduces the account's attack surface.

```bash
# 1a. Confirm what is attached before touching anything
aws iam get-user --user-name BedrockAPIKey-zi78
aws iam list-attached-user-policies --user-name BedrockAPIKey-zi78
aws iam list-user-policies --user-name BedrockAPIKey-zi78

# 1b. Detach the managed policy (customer-managed, account-scoped ARN)
aws iam detach-user-policy \
  --user-name BedrockAPIKey-zi78 \
  --policy-arn arn:aws:iam::037055844080:policy/AmazonBedrockLimitedAccess

#     If step 1a shows it is an INLINE policy instead of a managed one, use:
#     aws iam delete-user-policy --user-name BedrockAPIKey-zi78 --policy-name AmazonBedrockLimitedAccess

# 1c. Delete the user (zero access keys, so there is nothing to deactivate first)
aws iam delete-user --user-name BedrockAPIKey-zi78
```

---

## 2. Scope the Lambda IAM role's `bedrock:InvokeModel` down from `Resource: "*"`

**Why:** The role currently allows invoking *any* Bedrock model in the account. Scoping it to just the two models EduPath actually uses (Sonnet 4.5 for recommendations, Haiku 4.5 for plan generation) follows least-privilege.

This is done in **`serverless.yml`** (`provider.iam.role.statements`), not in the console — the Serverless Framework owns the role, so an in-console change would be overwritten on the next `serverless deploy`.

**Current block** (`serverless.yml`, around line 36):

```yaml
        # ── Bedrock ─────────────────────────────
        - Effect: Allow
          Action:
            - bedrock:InvokeModel
          Resource: "*"
```

**Replace with:**

```yaml
        # ── Bedrock ─────────────────────────────
        - Effect: Allow
          Action:
            - bedrock:InvokeModel
          Resource:
            - arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-sonnet-4-5-20250929-v1:0
            - arn:aws:bedrock:us-east-1::foundation-model/us.anthropic.claude-haiku-4-5-20251001-v1:0
```

> **Note on inference profiles.** These `us.anthropic.claude-*-v1:0` models are US cross-region models, which Bedrock may invoke through an *inference profile* rather than the foundation model directly. If your account resolves them via inference profiles, use the inference-profile ARN form instead (note the account id in the ARN):
>
> ```yaml
>   Resource:
>     - arn:aws:bedrock:us-east-1:037055844080:inference-profile/us.anthropic.claude-sonnet-4-5-20250929-v1:0
>     - arn:aws:bedrock:us-east-1:037055844080:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0
> ```
>
> Apply the change and redeploy:
>
> ```bash
> serverless deploy
> ```
>
> After deployment, verify the role policy no longer contains `Resource: "*"` for `bedrock:InvokeModel`.

---

## 3. Remove leftover test profiles from `studentProfiles`

**Why:** The DynamoDB table contains throwaway test data. Cleaning it avoids confusing demo data and keeps the table honest for future use.

The table's composite key is `userId` (HASH) + `trackId` (RANGE). Profiles are stored under the constant `trackId` of `"PROFILE"`, so both attributes are required in the key.

Run one `delete-item` per leftover test user:

```bash
aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"maria-edupath-demo"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1

aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"leo"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1

aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"haoqianli0702-gmail-com"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1

aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"maria"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1

aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"test-user-123"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1

aws dynamodb delete-item \
  --table-name studentProfiles \
  --key '{"userId":{"S":"test123"},"trackId":{"S":"PROFILE"}}' \
  --region us-east-1
```

**Recommendation — keep exactly one clean demo profile.** The frontend demo login uses any email containing "maria", which slugs to `maria-edupath-demo`. So instead of deleting that one, keep it as the single seed profile. Delete the other five (`leo`, `haoqianli0702-gmail-com`, `maria`, `test-user-123`, `test123`) and re-seed `maria-edupath-demo` with a clean profile via the app's signup/onboarding flow (or a `put-item`) so the demo has exactly one known-good user.

> **Check for additional rows.** These test users may also have non-`PROFILE` rows (e.g. a selected track under another `trackId`). Before deleting, list what exists so you don't leave orphans:
>
> ```bash
> aws dynamodb scan \
>   --table-name studentProfiles \
>   --filter-expression "userId = :uid" \
>   --expression-attribute-values '{\":uid\":{\"S\":\"leo\"}}' \
>   --region us-east-1
> ```
>
> Repeat for each test `userId`, and delete any extra `trackId` rows the same way (with the correct `trackId` value in the key).
