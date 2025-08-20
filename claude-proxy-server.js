#!/usr/bin/env node

/**
 * Claude Code Proxy Server
 * 
 * This proxy server intercepts API calls from Claude Code and forwards them
 * to your custom endpoint using bearer token authentication.
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PROXY_PORT || 3001;

// Configuration from environment variables or .env file
const config = {
    targetUrl: process.env.CLAUDE_API_URL || 'https://your-custom-endpoint.example.com',
    bearerToken: process.env.CLAUDE_BEARER_TOKEN,
    apiVersion: process.env.CLAUDE_API_VERSION || 'vertex-2023-10-16',
    debug: process.env.DEBUG === 'true'
};

// Validate configuration
if (!config.bearerToken) {
    console.error('❌ Error: CLAUDE_BEARER_TOKEN environment variable is required');
    console.error('Please set it in your .env file or as an environment variable');
    process.exit(1);
}

console.log('🚀 Claude Code Proxy Server starting...');
console.log(`📡 Target URL: ${config.targetUrl}`);
console.log(`🔑 Using bearer token authentication`);
console.log(`📊 Debug mode: ${config.debug ? 'ON' : 'OFF'}`);

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    if (config.debug) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        if (req.body && Object.keys(req.body).length > 0) {
            console.log('Request body:', JSON.stringify(req.body, null, 2));
        }
    }
    next();
});

// Parse the target URL properly
const targetUrlObj = new URL(config.targetUrl);

// Proxy middleware configuration
const proxyOptions = {
    target: `${targetUrlObj.protocol}//${targetUrlObj.host}`,
    changeOrigin: true,
    pathRewrite: {
        '^/v1/messages': targetUrlObj.pathname,
        '^/v1/.*': targetUrlObj.pathname,
        '^/api/.*': targetUrlObj.pathname,
        '^/.*': targetUrlObj.pathname
    },
    onProxyReq: (proxyReq, req, res) => {
        if (config.debug) {
            console.log('🔄 Proxying request to:', proxyReq.getHeader('host') + proxyReq.path);
        }
        
        // Replace Anthropic API key authentication with bearer token
        proxyReq.removeHeader('x-api-key');
        proxyReq.removeHeader('anthropic-version');
        
        // Set bearer token authentication
        proxyReq.setHeader('Authorization', `Bearer ${config.bearerToken}`);
        proxyReq.setHeader('Content-Type', 'application/json');
        
        // Handle the request body for POST requests
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            // Modify the request body to ensure compatibility
            // Only pass through parameters that the target API supports
            const allowedParams = [
                'anthropic_version', 'messages', 'max_tokens', 'temperature',
                'top_p', 'top_k', 'stream', 'stop_sequences',
                'tools', 'tool_choice', 'system', 'model'
            ];
            
            const bodyData = {
                anthropic_version: config.apiVersion
            };
            
            // Only include allowed parameters from the request
            allowedParams.forEach(param => {
                if (param in req.body) {
                    bodyData[param] = req.body[param];
                }
            });
            
            const bodyString = JSON.stringify(bodyData);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyString));
            proxyReq.write(bodyString);
        }
    },
    onProxyRes: (proxyRes, req, res) => {
        if (config.debug) {
            console.log('✅ Response status:', proxyRes.statusCode);
            console.log('Response headers:', proxyRes.headers);
        }
        
        // Add CORS headers if not present
        if (!proxyRes.headers['access-control-allow-origin']) {
            proxyRes.headers['access-control-allow-origin'] = '*';
        }
        if (!proxyRes.headers['access-control-allow-methods']) {
            proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        }
        if (!proxyRes.headers['access-control-allow-headers']) {
            proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, X-API-Key, Anthropic-Version';
        }
    },
    onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        res.status(500).json({
            error: 'Proxy error',
            message: err.message
        });
    }
};

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Main proxy route - catch all requests
app.use('/v1/messages', createProxyMiddleware(proxyOptions));
app.use('/v1/*', createProxyMiddleware(proxyOptions));
app.use('/api/*', createProxyMiddleware(proxyOptions));

// Fallback route for direct API calls
app.use('/', createProxyMiddleware(proxyOptions));

// Health check endpoint
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

// Start the server
app.listen(PORT, () => {
    console.log(`🎉 Claude Code Proxy Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('To use with Claude Code, set these environment variables:');
    console.log(`  export ANTHROPIC_BASE_URL=http://localhost:${PORT}`);
    console.log(`  export ANTHROPIC_API_KEY=dummy-key-for-proxy`);
    console.log('');
    console.log('Then run Claude Code normally. All requests will be proxied to your custom endpoint.');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Claude Code Proxy Server...');
    process.exit(0);
});