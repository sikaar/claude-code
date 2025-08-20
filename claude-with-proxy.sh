#!/bin/bash

# Claude Code with Custom Endpoint Wrapper
# This script starts the proxy server and runs Claude Code configured to use it

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load environment variables from .env if it exists
if [[ -f "$SCRIPT_DIR/.env" ]]; then
    echo -e "${BLUE}📋 Loading environment variables from .env file...${NC}"
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

# Check if required environment variables are set
if [[ -z "$CLAUDE_BEARER_TOKEN" ]]; then
    echo -e "${RED}❌ Error: CLAUDE_BEARER_TOKEN environment variable is required${NC}"
    echo -e "${YELLOW}Please set it in your .env file or export it as an environment variable${NC}"
    echo -e "${YELLOW}Example: export CLAUDE_BEARER_TOKEN=your_token_here${NC}"
    exit 1
fi

# Default values
PROXY_PORT=${PROXY_PORT:-3001}
CLAUDE_API_URL=${CLAUDE_API_URL:-"https://your-custom-endpoint.example.com"}

echo -e "${BLUE}🚀 Starting Claude Code with custom endpoint proxy...${NC}"
echo -e "${BLUE}📡 Target API: $CLAUDE_API_URL${NC}"
echo -e "${BLUE}🔌 Proxy Port: $PROXY_PORT${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js to run the proxy server.${NC}"
    exit 1
fi

# Check if npm dependencies are installed
if [[ ! -d "$SCRIPT_DIR/node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    cd "$SCRIPT_DIR"
    npm install express http-proxy-middleware cors dotenv
fi

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [[ -n "$PROXY_PID" ]]; then
        kill "$PROXY_PID" 2>/dev/null || true
        echo -e "${GREEN}✅ Proxy server stopped${NC}"
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Start the proxy server in the background
echo -e "${BLUE}🔄 Starting proxy server...${NC}"
cd "$SCRIPT_DIR"
node basic-proxy.js &
PROXY_PID=$!

# Wait a moment for the proxy to start
sleep 2

# Check if proxy is running
if ! kill -0 "$PROXY_PID" 2>/dev/null; then
    echo -e "${RED}❌ Failed to start proxy server${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Proxy server started (PID: $PROXY_PID)${NC}"

# Test proxy health
echo -e "${BLUE}🔍 Testing proxy connection...${NC}"
if curl -s "http://localhost:$PROXY_PORT/health" > /dev/null; then
    echo -e "${GREEN}✅ Proxy server is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Proxy health check failed, but continuing...${NC}"
fi

# Set environment variables for Claude Code to use the proxy
export ANTHROPIC_BASE_URL="http://localhost:$PROXY_PORT"
export ANTHROPIC_API_KEY="dummy-key-for-proxy"
export NODE_EXTRA_CA_CERTS="/Users/sikeita/Dev/Zscaler Root CA.pem"

echo -e "${BLUE}🤖 Starting Claude Code...${NC}"
echo -e "${YELLOW}All API calls will be proxied to your custom endpoint${NC}"

# Run Claude Code with the provided arguments
npx @anthropic-ai/claude-code "$@"

echo -e "${GREEN}✅ Claude Code session ended${NC}"