import json
import os
import re
import time

DEFAULT_MODEL_ID = "us.anthropic.claude-sonnet-4-5-20250929-v1:0"
HAIKU_MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

_bedrock_client = None


def _get_bedrock():
    global _bedrock_client
    if _bedrock_client is None:
        import boto3
        _bedrock_client = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION", "us-east-1"))
    return _bedrock_client


def call_bedrock(system_prompt: str, user_message: str, retry: bool = True, max_tokens: int = 2000, model_id: str = DEFAULT_MODEL_ID) -> list | dict:
    """
    Call Amazon Bedrock (Claude Sonnet 4.5) with the given prompts.
    Parses JSON from the response, stripping markdown fences if present.
    Retries once on malformed JSON before raising.
    """
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}]
    })

    response = _get_bedrock().invoke_model(
        modelId=model_id,
        body=body,
        contentType="application/json",
        accept="application/json"
    )

    response_body = json.loads(response["body"].read())
    raw_text = response_body["content"][0]["text"]
    print("Raw Bedrock response:", raw_text)

    cleaned = re.sub(r"^```(?:json)?\n?", "", raw_text.strip())
    cleaned = re.sub(r"\n?```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        if retry:
            print("Malformed JSON response, retrying once...")
            time.sleep(0.5)
            return call_bedrock(system_prompt, user_message, retry=False, max_tokens=max_tokens, model_id=model_id)
        raise
