import json
from decimal import Decimal

CORS_HEADERS = {"Access-Control-Allow-Origin": "*"}

def _json_default(obj):
    """Serialize boto3 Decimal values (DynamoDB numbers) to JSON numbers."""
    if isinstance(obj, Decimal):
        return int(obj) if obj == obj.to_integral_value() else float(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

def ok(body: dict) -> dict:
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, default=_json_default)
    }

def error(status_code: int, message: str) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}, default=_json_default)
    }
