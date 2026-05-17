"""
Database client stub for System 1.
Owned by teammate — do not implement real DynamoDB calls here.
Swap stubs for real calls once the teammate provides the interface.
"""


def get_profile(user_id: str) -> dict | None:
    """Fetch student profile by userId (Cognito sub). Returns None if not found."""
    raise NotImplementedError("Waiting on DB interface from teammate")


def set_current_track(user_id: str, track_status: dict) -> None:
    """Write the current track status for a student."""
    raise NotImplementedError("Waiting on DB interface from teammate")


def append_conversation_history(user_id: str, entry: dict) -> None:
    """Append an entry to the student's conversationHistory array."""
    raise NotImplementedError("Waiting on DB interface from teammate")
