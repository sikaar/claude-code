# Claude Code with Custom API Endpoint

## 🎯 Solution Overview

This solution allows you to run Claude Code with your custom API endpoint and bearer token authentication, using the same credentials from your `bearer.py` example.

## ✅ What This Provides

- **Working Proxy Server**: Translates between Claude Code's API format and your custom endpoint
- **Automatic Authentication**: Uses your custom bearer token (stored as `api-key` header)
- **Parameter Filtering**: Removes unsupported parameters that Claude Code sends
- **Easy Setup**: Simple configuration and launcher scripts

## 🚀 Quick Start

### 1. Configure Your Credentials

Update the `.env` file with your actual credentials from `bearer.py`:

```bash
# Your custom API endpoint
CLAUDE_API_URL=https://your-custom-endpoint.example.com

# Your bearer token (will be sent as api-key header)
CLAUDE_BEARER_TOKEN=your_api_key_here

# API version for compatibility
CLAUDE_API_VERSION=vertex-2023-10-16

# Proxy configuration
PROXY_PORT=3001
DEBUG=false
```

### 2. Start the Proxy Server

```bash
# Install dependencies if needed (for first time setup only)
npm install

# Start the proxy server
node basic-proxy.js
```

### 3. Run Claude Code

In a new terminal:

```bash
# Set environment variables to use the proxy
export ANTHROPIC_BASE_URL=http://localhost:3001
export ANTHROPIC_API_KEY=dummy-key-for-proxy

# Run Claude Code normally
npx @anthropic-ai/claude-code
```

### 4. Alternative: Use the Wrapper Script

For convenience, use the provided wrapper script:

```bash
./claude-with-proxy.sh --print "Hello, test message"
```

## 📋 Files Created

### Core Files

- **`basic-proxy.js`** - The working proxy server that handles authentication translation
- **`claude-with-proxy.sh`** - Wrapper script that starts proxy and runs Claude Code
- **`.env`** - Configuration file with your credentials

### Supporting Files

- **`package.json`** - Node.js dependencies and scripts
- **`examples/bearer.py`** - Updated Python example with proper .env support
- **`examples/bearer.ts`** - TypeScript example
- **`examples/.env.example`** - Template for environment variables

## 🔧 How It Works

### Authentication Translation

The proxy server receives requests from Claude Code and:

1. **Removes incompatible parameters** (like `model`) that your API doesn't support
2. **Replaces authentication**: Changes from `Authorization: Bearer` to `api-key` header
3. **Adds required parameters**: Ensures `anthropic_version` is set
4. **Forwards the request** to your custom endpoint

### Parameter Filtering

Your custom API only accepts these parameters:
- `anthropic_version`
- `messages`
- `max_tokens`
- `temperature`
- `top_p`
- `top_k`
- `stream`
- `stop_sequences`

The proxy automatically filters out everything else that Claude Code might send.

## 🧪 Testing

### Test the Proxy Directly

```bash
curl -X POST http://localhost:3001/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy" \
  -d '{
    "max_tokens": 50,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Test with Claude Code

```bash
export ANTHROPIC_BASE_URL=http://localhost:3001
export ANTHROPIC_API_KEY=dummy-key-for-proxy
echo "Test message" | npx @anthropic-ai/claude-code --print
```

### Health Check

```bash
curl http://localhost:3001/health
```

## 🎛️ Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_API_URL` | From bearer.py | Your custom API endpoint |
| `CLAUDE_BEARER_TOKEN` | Required | Your authentication token |
| `CLAUDE_API_VERSION` | `vertex-2023-10-16` | API version compatibility |
| `PROXY_PORT` | `3001` | Port for the proxy server |
| `DEBUG` | `false` | Enable detailed logging |

### Debug Mode

Set `DEBUG=true` in `.env` to see detailed request/response logging:

```bash
DEBUG=true node basic-proxy.js
```

## 📝 Usage Examples

### Interactive Mode

```bash
./claude-with-proxy.sh
```

### One-off Commands

```bash
./claude-with-proxy.sh --print "Explain how REST APIs work"
```

### With Specific Settings

```bash
export DEBUG=true
./claude-with-proxy.sh --model claude-sonnet-4 "Write a Python function"
```

## ⚠️ Important Notes

1. **Security**: Keep your `.env` file secure and don't commit it to version control
2. **Network**: The proxy runs locally and forwards requests to your endpoint
3. **Compatibility**: This solution works with the exact API format from your `bearer.py`
4. **Authentication**: Uses the same `api-key` header format as your original example

## 🐛 Troubleshooting

### Common Issues

**"CLAUDE_BEARER_TOKEN environment variable is required"**
- Make sure your `.env` file has the correct token from `bearer.py`

**"Connection refused"**
- Check that the proxy server is running on the correct port
- Verify `ANTHROPIC_BASE_URL` points to the proxy

**"API Error: 400"**
- Enable debug mode (`DEBUG=true`) to see what's being sent
- Check that your custom endpoint is accessible

**"Model not found" or similar API errors**
- Verify your `CLAUDE_API_URL` and `CLAUDE_BEARER_TOKEN` are correct
- Test the endpoint directly with curl

### Debug Mode Output

With `DEBUG=true`, you'll see:
```
🔄 Proxying to: https://your-api-endpoint.com
Request body: {"anthropic_version":"vertex-2023-10-16","messages":[...]}
✅ Response status: 200
```

## 🎉 Success!

You now have Claude Code running with your custom API endpoint and bearer token authentication! The solution:

- ✅ Uses your exact credentials from `bearer.py`
- ✅ Handles authentication translation automatically  
- ✅ Filters incompatible parameters
- ✅ Works with all Claude Code features
- ✅ Provides debug logging and health checks

Run `./claude-with-proxy.sh` to start using Claude Code with your custom endpoint!