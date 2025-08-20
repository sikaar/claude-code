#!/usr/bin/env node

/**
 * Simple Claude Code Proxy Server
 * A simplified proxy that forwards requests to your custom endpoint
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Configuration
const config = {
    targetUrl: process.env.CLAUDE_API_URL || 'https://your-custom-endpoint.example.com',
    bearerToken: process.env.CLAUDE_BEARER_TOKEN,
    apiVersion: process.env.CLAUDE_API_VERSION || 'vertex-2023-10-16',
    debug: process.env.DEBUG === 'true'
};

// Validate configuration
if (!config.bearerToken) {
    console.error('❌ Error: CLAUDE_BEARER_TOKEN environment variable is required');
    process.exit(1);
}

console.log('🚀 Simple Claude Code Proxy Server starting...');
console.log(`📡 Target URL: ${config.targetUrl}`);
console.log(`🔑 Using bearer token authentication`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ limit: '50mb', type: 'application/json' }));

// Logging middleware
app.use((req, res, next) => {
    if (config.debug) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
});

// Simple proxy handler
async function proxyRequest(req, res) {
    try {
        if (config.debug) {
            console.log('🔄 Proxying request to:', config.targetUrl);
            console.log('Headers:', req.headers);
        }

        // Prepare headers for the target API
        const headers = {
            'Authorization': `Bearer ${config.bearerToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Claude-Code-Proxy/1.0'
        };

        // Prepare the request body
        let body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body);
        }

        // Ensure anthropic_version is set
        if (body && typeof body === 'object') {
            body.anthropic_version = body.anthropic_version || config.apiVersion;
        }

        if (config.debug) {
            console.log('Request body:', JSON.stringify(body, null, 2));
        }

        // Make the request to the target API
        const response = await fetch(config.targetUrl, {
            method: req.method,
            headers: headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (config.debug) {
            console.log('✅ Response status:', response.status);
        }

        // Set CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Anthropic-Version');

        // Forward the response
        res.status(response.status);
        
        // Handle different response types
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json') || contentType.includes('text/plain')) {
            const responseText = await response.text();
            res.send(responseText);
        } else {
            // Handle streaming responses
            response.body.pipe(res);
        }

    } catch (error) {
        console.error('❌ Proxy error:', error.message);
        res.status(500).json({
            error: 'Proxy error',
            message: error.message
        });
    }
}

// Route handlers
app.options('*', cors()); // Handle CORS preflight
app.post('/v1/messages', proxyRequest);
app.post('/v1/*', proxyRequest);
app.post('/api/*', proxyRequest);
app.get('/v1/*', proxyRequest);
app.post('/', proxyRequest); // Fallback

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        config: {
            targetUrl: config.targetUrl,
            hasToken: !!config.bearerToken,
            apiVersion: config.apiVersion,
            debug: config.debug
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎉 Claude Code Proxy Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('To use with Claude Code:');
    console.log(`  export ANTHROPIC_BASE_URL=http://localhost:${PORT}`);
    console.log(`  export ANTHROPIC_API_KEY=dummy-key-for-proxy`);
    console.log('  npx @anthropic-ai/claude-code');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down proxy server...');
    process.exit(0);
});