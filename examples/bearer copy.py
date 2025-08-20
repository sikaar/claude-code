import requests
import json

url = "https://your-custom-endpoint.example.com"

payload = json.dumps({
  "anthropic_version": "vertex-2023-10-16",
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
  'api-key': 'your_api_key_here',
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
 