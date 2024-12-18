import os
from fastapi import HTTPException
import jwt

CLERK_SIGNING_KEY = os.getenv("CLERK_SIGNING_KEY")

def validate_token(auth_header: str) -> str:
    """
    returns user_id if valid
    raises AuthenticationException otherwise
    """
    try:
        token = auth_header.split(" ",)[-1]
    except (AttributeError, KeyError):
        raise HTTPException(status_code=404,detail="No authentication token provided")
    try:
        payload = jwt.decode(
            token,
            (CLERK_SIGNING_KEY),
            algorithms=["HS256"],
            options={"verify_signature": False},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Token decode error.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    user_id = payload.get("sub")
    return user_id