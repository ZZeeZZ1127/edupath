import json

CORS_HEADERS = {"Access-Control-Allow-Origin": "*"}

def ok(body: dict) -> dict:
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps(body)
    }

def error(status_code: int, message: str) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message})
    }
