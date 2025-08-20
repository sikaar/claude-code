#!/bin/bash

# Claude Code Mode Switcher
# Easily switch between proxy mode and normal Claude Code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Claude config directory
CLAUDE_DIR="$HOME/.claude"

# Settings files
NORMAL_SETTINGS="$CLAUDE_DIR/settings.json"
PROXY_SETTINGS="$CLAUDE_DIR/settings-proxy.json"
BACKUP_SETTINGS="$CLAUDE_DIR/settings-backup.json"

function show_usage() {
    echo -e "${BLUE}Claude Code Mode Switcher${NC}"
    echo ""
    echo "Usage: $0 [mode] [claude-args...]"
    echo ""
    echo -e "${YELLOW}Modes:${NC}"
    echo "  proxy     - Use custom endpoint via proxy"
    echo "  normal    - Use standard Anthropic API"
    echo "  status    - Show current mode"
    echo "  setup     - Set up proxy settings"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 proxy --print \"Hello world\""
    echo "  $0 normal --print \"Hello world\""
    echo "  $0 status"
    echo ""
}

function ensure_claude_dir() {
    if [[ ! -d "$CLAUDE_DIR" ]]; then
        mkdir -p "$CLAUDE_DIR"
        echo -e "${BLUE}📁 Created Claude config directory${NC}"
    fi
}

function backup_current_settings() {
    if [[ -f "$NORMAL_SETTINGS" ]]; then
        cp "$NORMAL_SETTINGS" "$BACKUP_SETTINGS"
        echo -e "${BLUE}💾 Backed up current settings${NC}"
    fi
}

function create_proxy_settings() {
    cat > "$PROXY_SETTINGS" << 'EOF'
{
  "allowedTools": [
    "Bash(*)",
    "Edit(*)",
    "Read(*)",
    "Write(*)",
    "MultiEdit(*)",
    "Grep(*)",
    "Glob(*)",
    "LS(*)",
    "TodoWrite(*)",
    "WebFetch(*)",
    "WebSearch(*)",
    "Task(*)"
  ],
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
EOF
    echo -e "${GREEN}✅ Created proxy settings with full tool access${NC}"
}

function switch_to_proxy() {
    ensure_claude_dir
    backup_current_settings
    
    # Create proxy settings if they don't exist
    if [[ ! -f "$PROXY_SETTINGS" ]]; then
        create_proxy_settings
    fi
    
    # Switch settings
    cp "$PROXY_SETTINGS" "$NORMAL_SETTINGS"
    echo -e "${GREEN}🔄 Switched to proxy mode${NC}"
}

function switch_to_normal() {
    ensure_claude_dir
    
    # Restore backup if it exists, otherwise remove proxy settings
    if [[ -f "$BACKUP_SETTINGS" ]]; then
        cp "$BACKUP_SETTINGS" "$NORMAL_SETTINGS"
        echo -e "${GREEN}🔄 Restored normal Claude Code settings${NC}"
    elif [[ -f "$NORMAL_SETTINGS" ]]; then
        rm "$NORMAL_SETTINGS"
        echo -e "${GREEN}🔄 Switched to normal mode${NC}"
    fi
}

function show_status() {
    echo -e "${BLUE}📊 Current Claude Code Status:${NC}"
    echo ""
    
    if [[ -f "$NORMAL_SETTINGS" ]]; then
        echo -e "${YELLOW}Settings file exists:${NC} $NORMAL_SETTINGS"
        
        if grep -q "allowedTools" "$NORMAL_SETTINGS" 2>/dev/null; then
            echo -e "${GREEN}Mode:${NC} Proxy mode (with tools configured)"
        else
            echo -e "${GREEN}Mode:${NC} Normal mode"
        fi
    else
        echo -e "${GREEN}Mode:${NC} Normal mode (no custom settings)"
    fi
    
    echo ""
    echo -e "${BLUE}Available settings files:${NC}"
    [[ -f "$BACKUP_SETTINGS" ]] && echo -e "  📄 Backup: $BACKUP_SETTINGS"
    [[ -f "$PROXY_SETTINGS" ]] && echo -e "  🔧 Proxy: $PROXY_SETTINGS"
}

function run_with_proxy() {
    # Switch to proxy mode
    switch_to_proxy
    
    # Load environment variables from .env if it exists
    if [[ -f "$SCRIPT_DIR/.env" ]]; then
        export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
    fi
    
    # Check if required environment variables are set
    if [[ -z "$CLAUDE_BEARER_TOKEN" ]]; then
        echo -e "${RED}❌ Error: CLAUDE_BEARER_TOKEN environment variable is required${NC}"
        echo -e "${YELLOW}Please set it in your .env file or export it as an environment variable${NC}"
        exit 1
    fi
    
    # Start proxy in background
    echo -e "${BLUE}🚀 Starting proxy server...${NC}"
    cd "$SCRIPT_DIR"
    export NODE_EXTRA_CA_CERTS="/Users/sikeita/Dev/Zscaler Root CA.pem"
    node basic-proxy.js &
    PROXY_PID=$!
    
    # Wait for proxy to start
    sleep 2
    
    # Check if proxy is running
    if ! kill -0 "$PROXY_PID" 2>/dev/null; then
        echo -e "${RED}❌ Failed to start proxy server${NC}"
        exit 1
    fi
    
    # Set environment variables for Claude Code
    export ANTHROPIC_BASE_URL="http://localhost:${PROXY_PORT:-3001}"
    export ANTHROPIC_API_KEY="dummy-key-for-proxy"
    export NODE_EXTRA_CA_CERTS="/Users/sikeita/Dev/Zscaler Root CA.pem"
    
    echo -e "${GREEN}✅ Proxy mode activated${NC}"
    
    # Cleanup function
    cleanup() {
        if [[ -n "$PROXY_PID" ]]; then
            kill "$PROXY_PID" 2>/dev/null || true
            echo -e "${YELLOW}🛑 Proxy server stopped${NC}"
        fi
        switch_to_normal
    }
    
    trap cleanup EXIT INT TERM
    
    # Run Claude Code
    npx @anthropic-ai/claude-code "${@:2}"
}

function run_with_normal() {
    switch_to_normal
    export NODE_EXTRA_CA_CERTS="/Users/sikeita/Dev/Zscaler Root CA.pem"
    echo -e "${GREEN}✅ Normal mode activated${NC}"
    npx @anthropic-ai/claude-code "${@:2}"
}

# Main logic
case "${1:-help}" in
    "proxy")
        run_with_proxy "$@"
        ;;
    "normal")
        run_with_normal "$@"
        ;;
    "status")
        show_status
        ;;
    "setup")
        ensure_claude_dir
        create_proxy_settings
        echo -e "${GREEN}✅ Proxy settings created${NC}"
        ;;
    "help"|"-h"|"--help"|*)
        show_usage
        ;;
esac