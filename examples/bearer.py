import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get configuration from environment variables
url = os.getenv('CLAUDE_API_URL', 'https://your-custom-endpoint.example.com')
bearer_token = os.getenv('CLAUDE_BEARER_TOKEN')
api_version = os.getenv('CLAUDE_API_VERSION', 'vertex-2023-10-16')

if not bearer_token:
    print("Error: CLAUDE_BEARER_TOKEN environment variable is required")
    print("Please set it in your .env file or as an environment variable")
    exit(1)

payload = json.dumps({
    "anthropic_version": api_version,
    "stream": True,
    "max_tokens": 512,
    "temperature": 0.5,
    "top_p": 0.95,
    "top_k": 1,
    "messages": [
        {
            "role": "user",
            "content": "hello"
        }
    ]
})

headers = {
    'Authorization': f'Bearer {bearer_token}',
    'Content-Type': 'application/json'
}

try:
    response = requests.post(url, headers=headers, data=payload)
    response.raise_for_status()  # Raises an HTTPError for bad responses
    print(response.text)
except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response status: {e.response.status_code}")
        print(f"Response body: {e.response.text}")
 