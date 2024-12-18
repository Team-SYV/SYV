from fastapi import HTTPException, Request, Response, status
from supabase import Client
from svix.webhooks import Webhook, WebhookVerificationError
import json
from models.user import UserCreate, UserUpdate

async def clerk_webhook_handler(request: Request, response: Response, supabase: Client, webhook_secret: str):
    headers = dict(request.headers)
    payload = await request.body()
    payload_str = payload.decode('utf-8')

    required_headers = ["svix-id", "svix-signature", "svix-timestamp"]
    for header in required_headers:
        if header not in headers:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"error": "Missing required headers"}

    try:
        wh = Webhook(webhook_secret)
        wh.verify(payload_str, headers) 
    except WebhookVerificationError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"error": "Invalid webhook signature", "details": str(e)}

    event = json.loads(payload_str)
    event_type = event.get("type")
    data = event.get("data")


    if event_type == "user.created":
        handle_user_created(data, supabase)
    elif event_type == "user.updated":
        handle_user_updated(data, supabase)
    elif event_type == "user.deleted":
        handle_user_deleted(data, supabase)

    return {"message": "Webhook handled successfully"}

def handle_user_created(data: dict, supabase: Client):
    email_addresses = data.get("email_addresses", [])
    if not email_addresses or not email_addresses[0].get("email_address"):
        raise HTTPException(status_code=400, detail="Email address is missing")

    email_address = email_addresses[0]["email_address"]

    public_metadata = data.get("unsafeMetadata", {})
    private_metadata = data.get("safeMetadata", {})

    user = UserCreate(
        user_id=data.get("id", ""),
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        email=email_address,
        image=data.get("profile_image_url")
    )

    existing_user_response = supabase.table('users').select('email').eq('email', user.email).execute()
    if existing_user_response.data:
        raise HTTPException(status_code=400, detail="Email already in use")

    supabase.table('users').insert({
        'user_id': user.user_id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'image': user.image,
        'public_metadata': json.dumps(public_metadata),  
        'private_metadata': json.dumps(private_metadata),  
    }).execute()

def handle_user_updated(data: dict, supabase: Client):
    user_id = data["id"]
    unsafe_metadata = data.get("unsafe_metadata", {})
    subscribed = unsafe_metadata.get("subscribed", False)
    subscription = unsafe_metadata.get('subscription', None).upper()


    user_update = UserUpdate(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        image=data.get("profile_image_url"),
    )

    user_response = supabase.table('users').select('*').eq('user_id', user_id).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")

    updated_data = user_response.data[0]

    if user_update.first_name:
        updated_data['first_name'] = user_update.first_name
    if user_update.last_name:
        updated_data['last_name'] = user_update.last_name
    if user_update.image:
        updated_data['image'] = user_update.image

    updated_data['subscribed'] = subscribed

    updated_data['subscription'] = subscription

    supabase.table('users').update(updated_data).eq('user_id', user_id).execute()
def handle_user_deleted(data: dict, supabase: Client):
    user_id = data["id"]
    supabase.table('users').delete().eq('user_id', user_id).execute()
