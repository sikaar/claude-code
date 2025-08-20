# Bearer Token Authentication Setup for Claude Code

This guide demonstrates how to configure Claude Code to work with custom API endpoints using bearer token authentication instead of Anthropic's standard API.

## Overview

The examples in this directory show how to:
- Use a custom API URL endpoint
- Authenticate using bearer tokens stored in environment variables
- Properly handle authentication headers
- Configure credentials securely using `.env` files

## Quick Setup

### 1. Environment Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```bash
# Your custom API endpoint URL
CLAUDE_API_URL=https://your-custom-api-endpoint.com/v1/messages

# Your bearer token for authentication
CLAUDE_BEARER_TOKEN=your_api_key_here

# Optional: API version (defaults to vertex-2023-10-16)
CLAUDE_API_VERSION=vertex-2023-10-16
```

### 2. Python Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the Python example:

```bash
python bearer.py
```

### 3. TypeScript/Node.js Setup

Install dependencies:

```bash
npm install
```

Run the TypeScript example:

```bash
# Using ts-node for development
npm run dev

# Or compile and run
npm run build
npm start
```

## Authentication Details

### Bearer Token Authentication

Both examples use standard Bearer token authentication with the `Authorization` header:

```
Authorization: Bearer your_bearer_token_here
```

This is the standard OAuth 2.0 bearer token format, which is more secure and widely adopted than custom header approaches.

### Key Differences from Original Implementation

The updated examples include several improvements over the original `bearer.py`:

1. **Standard Authentication**: Uses `Authorization: Bearer` header instead of custom `api-key` header
2. **Environment Variables**: Credentials are loaded from `.env` file instead of hardcoded values
3. **Error Handling**: Comprehensive error handling for HTTP requests
4. **Security**: No hardcoded tokens in source code
5. **Configuration**: Flexible URL and API version configuration
6. **Type Safety**: TypeScript example includes full type definitions

### Configuration Options

| Environment Variable | Default Value | Description |
|---------------------|---------------|-------------|
| `CLAUDE_API_URL` | `https://your-custom-endpoint.example.com` | Your custom API endpoint |
| `CLAUDE_BEARER_TOKEN` | *Required* | Your authentication bearer token |
| `CLAUDE_API_VERSION` | `vertex-2023-10-16` | API version for compatibility |

## Security Best Practices

1. **Never commit `.env` files**: Add `.env` to your `.gitignore`
2. **Use environment variables**: In production, use system environment variables instead of files
3. **Rotate tokens regularly**: Implement token rotation policies
4. **Validate certificates**: Ensure HTTPS connections are properly validated
5. **Monitor usage**: Log authentication attempts and API usage

## Integration with Claude Code

To integrate this bearer token authentication with the actual Claude Code CLI tool, you would need to:

1. **Modify the CLI configuration**: Update Claude Code's configuration to support custom endpoints
2. **Update authentication logic**: Replace Anthropic API key authentication with bearer token authentication
3. **Add endpoint configuration**: Allow users to specify custom API URLs
4. **Maintain compatibility**: Ensure existing Anthropic API functionality still works

> **Note**: The examples in this directory demonstrate the authentication pattern for custom API integration. The actual Claude Code application source code would need to be modified to fully implement this authentication method.

## Troubleshooting

### Common Issues

1. **Missing Bearer Token**: Ensure `CLAUDE_BEARER_TOKEN` is set in your environment
2. **Invalid URL**: Verify your `CLAUDE_API_URL` is correct and accessible
3. **Certificate Errors**: For custom endpoints, ensure SSL certificates are valid
4. **API Compatibility**: Ensure your custom endpoint supports Anthropic's API format

### Testing Your Setup

You can test your bearer token authentication by running either example:

```bash
# Python
python bearer.py

# TypeScript
npm run dev
```

Both examples will attempt to send a "hello" message to your configured API endpoint using bearer token authentication.

## API Compatibility

The examples maintain compatibility with Anthropic's API format:

- Uses `anthropic_version` parameter
- Supports streaming responses
- Maintains message format structure
- Includes proper temperature and token settings

This ensures that custom endpoints implementing Anthropic-compatible APIs will work correctly with these authentication methods.