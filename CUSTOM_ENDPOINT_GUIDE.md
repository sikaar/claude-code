# How to Run Claude Code with Custom API Endpoint

Based on the analysis of your Claude Code installation (version 1.0.77), here are the methods to configure it for your custom API endpoint:

## Method 1: Environment Variables (Most Likely to Work)

Set these environment variables before running Claude Code:

```bash
# Export environment variables
export ANTHROPIC_API_KEY="your_bearer_token_here"
export ANTHROPIC_BASE_URL="https://your-custom-api-endpoint.com"

# Run Claude Code
npx @anthropic-ai/claude-code
```

## Method 2: Using .env File

Create a `.env` file in your working directory:

```bash
# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_bearer_token_here
ANTHROPIC_BASE_URL=https://your-custom-api-endpoint.com
CLAUDE_API_URL=https://your-custom-api-endpoint.com/v1/messages
EOF

# Load environment and run
source .env
npx @anthropic-ai/claude-code
```

## Method 3: Custom Settings File

Create a custom settings file:

```bash
# Create custom settings
cat > ~/.claude/custom-settings.json << 'EOF'
{
  "apiKey": "your_bearer_token_here",
  "apiUrl": "https://your-custom-api-endpoint.com",
  "model": "claude-sonnet-4"
}
EOF

# Run with custom settings
npx @anthropic-ai/claude-code --settings ~/.claude/custom-settings.json
```

## Method 4: Using Claude Code Configuration

Try setting configuration values directly:

```bash
# Set API key via config (if supported)
npx @anthropic-ai/claude-code config set -g apiKey "your_bearer_token_here"

# Set custom endpoint (if supported)
npx @anthropic-ai/claude-code config set -g baseUrl "https://your-custom-api-endpoint.com"
```

## Method 5: Runtime Model Override

```bash
# Specify custom model endpoint
npx @anthropic-ai/claude-code --model "your-custom-model-name"
```

## Testing Your Setup

1. **Test with a simple prompt**:
```bash
npx @anthropic-ai/claude-code --print "Hello, test my custom endpoint"
```

2. **Test with debug mode**:
```bash
npx @anthropic-ai/claude-code --debug --print "Hello, test my custom endpoint"
```

3. **Test interactive mode**:
```bash
npx @anthropic-ai/claude-code
```

## Troubleshooting

### If Environment Variables Don't Work

Claude Code might be looking for different environment variable names. Try these alternatives:

```bash
# Try different environment variable names
export CLAUDE_API_KEY="your_bearer_token_here"
export CLAUDE_BASE_URL="https://your-custom-api-endpoint.com"
export CLAUDE_ENDPOINT="https://your-custom-api-endpoint.com"
export API_URL="https://your-custom-api-endpoint.com"
```

### Check What Claude Code is Using

Run with debug mode to see what endpoint it's trying to connect to:

```bash
npx @anthropic-ai/claude-code --debug --print "test"
```

### Verify Your Custom Endpoint

Test your endpoint manually first:

```bash
curl -X POST "https://your-custom-api-endpoint.com/v1/messages" \
  -H "Authorization: Bearer your_bearer_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "anthropic_version": "vertex-2023-10-16",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Important Notes

1. **Bearer Token Format**: Make sure your custom endpoint accepts the standard `Authorization: Bearer` header format
2. **API Compatibility**: Your endpoint should be compatible with Anthropic's API format
3. **HTTPS**: Ensure your custom endpoint uses HTTPS
4. **Model Names**: Your endpoint should support the model names that Claude Code expects

## If None of These Work

Since Claude Code is distributed as a compiled npm package, the authentication and endpoint configuration might be hardcoded. In that case, you might need to:

1. **Contact Anthropic Support**: Ask about custom endpoint support
2. **Use a Proxy**: Set up a proxy server that translates between Claude Code and your custom endpoint
3. **Wait for Official Support**: Request this feature from Anthropic

## Proxy Solution (Advanced)

If direct configuration doesn't work, you can create a proxy server that:
1. Receives requests from Claude Code (using standard Anthropic format)
2. Translates authentication from API key to bearer token
3. Forwards requests to your custom endpoint
4. Returns responses in the format Claude Code expects

This would require setting up a local proxy server on `localhost:8000` that Claude Code connects to, which then forwards to your actual endpoint.