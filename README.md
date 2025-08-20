# Claude Code Custom Endpoint Integration

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

**Run Claude Code CLI with custom API endpoints and bearer token authentication**

This project enables [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview) to work with custom enterprise API endpoints (like Azure API Management) that use bearer token authentication, while preserving all Claude Code functionality including tools and agents.

<img src="./demo.gif" />

---

## 🎯 **Quick Start**

```bash
# 1. Configure your credentials
cp .env.example .env
# Edit .env with your API endpoint and bearer token

# 2. Install dependencies
npm install

# 3. Use with your custom endpoint
./claude-mode-switcher.sh proxy --print "Hello from custom endpoint!"

# 4. Switch back to normal Claude Code anytime
./claude-mode-switcher.sh normal --print "Hello from Anthropic API!"
```

## ✨ **Features**

- 🔄 **Transparent Proxy** - Seamlessly route Claude Code through custom endpoints
- 🔐 **Authentication Translation** - Converts Bearer tokens to api-key headers
- 🛠️ **Full Tool Support** - All Claude Code tools work (Bash, file ops, 40+ agents)
- 🔀 **Smart Mode Switching** - Easy switching between custom and standard endpoints
- 📊 **Debug Monitoring** - Real-time request/response logging
- 🏢 **Enterprise Ready** - Certificate support, proper error handling
- ⚡ **Zero Config Switch** - No manual settings file management

## 🚀 **Use Cases**

- **Enterprise Integration** - Use Claude Code with Azure API Management
- **Custom Authentication** - Work with bearer token or api-key based endpoints
- **Development/Staging** - Switch between different API environments
- **Compliance** - Route through approved enterprise endpoints
- **Cost Management** - Use custom billing/monitoring endpoints

## 📖 **Documentation**

- **[Quick Setup Guide](README-CUSTOM-ENDPOINT.md)** - Get started in 5 minutes
- **[Complete Documentation](PROJECT_DOCUMENTATION.md)** - Comprehensive technical guide
- **[Bearer Token Examples](examples/BEARER_TOKEN_SETUP.md)** - Python/TypeScript examples

## 🏗️ **Architecture**

```
Claude Code CLI → Proxy Server → Custom API Endpoint
     ↓                ↓              ↓
Standard Format → Translation → Custom Format
```

**Authentication Flow:**
```
Claude Code: Authorization: Bearer xyz
     ↓
Proxy Server: api-key: xyz  
     ↓
Custom Endpoint: ✅ Success
```

## 📁 **Key Files**

```
├── claude-mode-switcher.sh      # 🌟 Smart mode switching (recommended)
├── basic-proxy.js               # 🌟 Working proxy server
├── .env.example                 # Configuration template
├── package.json                 # Dependencies and scripts
├── 
├── Documentation/
├── ├── README-CUSTOM-ENDPOINT.md    # Quick start guide
├── ├── PROJECT_DOCUMENTATION.md     # Complete technical docs
├── 
├── Examples/
└── └── examples/
    ├── bearer.py                # Python example with .env
    ├── bearer.ts                # TypeScript example
    └── BEARER_TOKEN_SETUP.md    # Examples documentation
```

## 🎮 **Usage Examples**

### **Mode Switching (Recommended)**
```bash
# Custom endpoint mode
./claude-mode-switcher.sh proxy --print "List all available agents"

# Standard Anthropic API  
./claude-mode-switcher.sh normal --print "List all available agents"

# Check current mode
./claude-mode-switcher.sh status
```

### **Manual Mode**
```bash
# Terminal 1: Start proxy
npm start

# Terminal 2: Use Claude Code  
export ANTHROPIC_BASE_URL=http://localhost:3001
export ANTHROPIC_API_KEY=dummy-key-for-proxy
npx @anthropic-ai/claude-code
```

## ⚙️ **Configuration**

Create `.env` file with your settings:
```bash
# Your custom API endpoint
CLAUDE_API_URL=https://your-api-endpoint.com/path

# Your bearer token (sent as api-key header)  
CLAUDE_BEARER_TOKEN=your_bearer_token_here

# API version compatibility
CLAUDE_API_VERSION=vertex-2023-10-16

# Proxy settings
PROXY_PORT=3001
DEBUG=false
```

## 🧪 **Testing & Verification**

```bash
# Health check
curl http://localhost:3001/health

# Debug mode (see all requests)
DEBUG=true npm start

# Verify traffic routing
./claude-mode-switcher.sh proxy --print "test traffic routing"
# Look for: "🔄 Proxying to: https://your-endpoint.com"
```

## 🔧 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Port already in use | `pkill -f basic-proxy.js` |
| Missing bearer token | Check `.env` file configuration |
| Certificate errors | Verify `NODE_EXTRA_CA_CERTS` path |
| API 400 errors | Enable debug mode to see request details |
| Missing tools | Use proxy mode with proper settings |

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- [Anthropic](https://www.anthropic.com) for Claude Code CLI
- [Azure API Management](https://azure.microsoft.com/products/api-management) for enterprise endpoint capabilities

---

**⚡ Ready to get started?** Run `./claude-mode-switcher.sh proxy --print "Hello from custom endpoint!"` 

**📚 Need help?** Check out the [complete documentation](PROJECT_DOCUMENTATION.md)

**🐛 Found an issue?** [Open an issue](https://github.com/sikaar/claude-code/issues) or contribute a fix!
