import os
import boto3
from botocore.exceptions import ClientError

# Initialize the DynamoDB resource
# Boto3 automatically uses the IAM role permissions we set up earlier
dynamodb = boto3.resource('dynamodb', region_name=os.getenv('AWS_REGION', 'us-east-1'))
table = dynamodb.Table('studentProfiles')

# Since the table schema requires a trackId (Sort Key), we use a constant 
# for the main profile record so we can look it up with just the user_id.
PROFILE_TRACK_ID = 'PROFILE'

def get_profile(user_id: str) -> dict | None:
    """Fetch student profile by userId. Returns None if not found."""
    try:
        response = table.get_item(
            Key={
                'userId': user_id,
                'trackId': PROFILE_TRACK_ID
            }
        )
        return response.get('Item')
    except ClientError as e:
        print(f"DynamoDB get_profile Error: {e.response['Error']['Message']}")
        return None


def set_current_track(user_id: str, track_status: dict) -> None:
    """Write the current track status for a student."""
    try:
        table.update_item(
            Key={
                'userId': user_id,
                'trackId': PROFILE_TRACK_ID
            },
            UpdateExpression="SET currentTrackStatus = :track_status",
            ExpressionAttributeValues={
                ':track_status': track_status
            }
        )
    except ClientError as e:
        print(f"DynamoDB set_current_track Error: {e.response['Error']['Message']}")
        raise


def record_outcome(user_id: str, task_id: str, result: str) -> None:
    """Append an outcome entry to currentTrackStatus.outcomes."""
    new_outcome = {
        'taskId': task_id,
        'result': result
    }
    
    try:
        # We use list_append to add to the array, and if_not_exists in case the array is empty/missing
        table.update_item(
            Key={
                'userId': user_id,
                'trackId': PROFILE_TRACK_ID
            },
            UpdateExpression="SET currentTrackStatus.outcomes = list_append(if_not_exists(currentTrackStatus.outcomes, :empty_list), :outcome)",
            ExpressionAttributeValues={
                ':outcome': [new_outcome],
                ':empty_list': []
            }
        )
    except ClientError as e:
        print(f"DynamoDB record_outcome Error: {e.response['Error']['Message']}")
        raise


def put_profile(user_id: str, profile: dict) -> None:
    """Create or replace a student profile. Stores profile fields as top-level attributes."""
    item = {
        'userId': user_id,
        'trackId': PROFILE_TRACK_ID,
        **profile
    }
    try:
        table.put_item(Item=item)
    except ClientError as e:
        print(f"DynamoDB put_profile Error: {e.response['Error']['Message']}")
        raise


def append_conversation_history(user_id: str, entry: dict) -> None:
    """Append an entry to the student's conversationHistory array."""
    try:
        table.update_item(
            Key={
                'userId': user_id,
                'trackId': PROFILE_TRACK_ID
            },
            UpdateExpression="SET conversationHistory = list_append(if_not_exists(conversationHistory, :empty_list), :entry)",
            ExpressionAttributeValues={
                ':entry': [entry],
                ':empty_list': []
            }
        )
    except ClientError as e:
        print(f"DynamoDB append_conversation_history Error: {e.response['Error']['Message']}")
        raise