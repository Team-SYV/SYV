import os
from fastapi import HTTPException
import requests
import jwt
from jwt.algorithms import RSAAlgorithm

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")


def validate_token(auth_header: str) -> str:
    """
    returns user_id if valid
    raises AuthenticationException otherwise
    """
    try:
        token = auth_header.split(" ")[1]
    except (AttributeError, KeyError):
        raise HTTPException(status_code=404,detail="No authentication token provided")

    jwks = requests.get(
        "https://api.clerk.com/v1/jwks",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        },
    ).json()
    public_key = RSAAlgorithm.from_jwk(jwks["keys"][0])
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_signature": True},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException("Token has expired.")
    except jwt.DecodeError:
        raise HTTPException("Token decode error.")
    except jwt.InvalidTokenError:
        raise HTTPException("Invalid token.")
    user_id = payload.get("sub")
    return user_id