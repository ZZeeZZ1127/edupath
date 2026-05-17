import json
import os

_s3_client = None
PLAN_BUCKET = os.environ.get("PLAN_BUCKET")


def _get_s3():
    global _s3_client
    if _s3_client is None:
        import boto3
        _s3_client = boto3.client("s3", region_name="us-east-1")
    return _s3_client


def save_plan(user_id: str, track_id: str, plan: dict) -> str:
    key = f"plans/{user_id}/{track_id}.json"
    _get_s3().put_object(
        Bucket=PLAN_BUCKET,
        Key=key,
        Body=json.dumps(plan),
        ContentType="application/json"
    )
    return key


def load_plan(user_id: str, track_id: str) -> dict | None:
    key = f"plans/{user_id}/{track_id}.json"
    try:
        obj = _get_s3().get_object(Bucket=PLAN_BUCKET, Key=key)
        return json.loads(obj["Body"].read())
    except Exception:
        return None
