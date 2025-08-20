#!/usr/bin/env node

/**
 * Basic Claude Code Proxy Server
 * A very simple HTTP proxy that works with Claude Code
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PROXY_PORT || 3001;
const config = {
    targetUrl: process.env.CLAUDE_API_URL || 'https://your-custom-endpoint.example.com',
    bearerToken: process.env.CLAUDE_BEARER_TOKEN,
    apiVersion: process.env.CLAUDE_API_VERSION || 'vertex-2023-10-16',
    debug: process.env.DEBUG === 'true'
};

if (!config.bearerToken) {
    console.error('❌ Error: CLAUDE_BEARER_TOKEN environment variable is required');
    process.exit(1);
}

console.log('🚀 Basic Claude Code Proxy Server starting...');
console.log(`📡 Target URL: ${config.targetUrl}`);
console.log(`🔑 Using bearer token authentication`);

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Anthropic-Version');

    // Handle OPTIONS (preflight) requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            config: {
                targetUrl: config.targetUrl,
                hasToken: !!config.bearerToken,
                apiVersion: config.apiVersion,
                debug: config.debug
            }
        }));
        return;
    }

    if (config.debug) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }

    try {
        // Collect request body
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // Parse and modify the request body
                let requestData = body;
                if (body && req.headers['content-type']?.includes('application/json')) {
                    try {
                        const parsed = JSON.parse(body);
                        
                        // Set the anthropic_version
                        parsed.anthropic_version = parsed.anthropic_version || config.apiVersion;
                        
                        // Remove parameters that the custom API doesn't support
                        const allowedParams = [
                            'anthropic_version', 'messages', 'max_tokens', 'temperature', 
                            'top_p', 'top_k', 'stream', 'stop_sequences',
                            'tools', 'tool_choice', 'system'
                        ];
                        
                        // Filter the request body to only include allowed parameters
                        const filteredParams = {};
                        allowedParams.forEach(param => {
                            if (param in parsed) {
                                filteredParams[param] = parsed[param];
                            }
                        });
                        
                        requestData = JSON.stringify(filteredParams);
                    } catch (e) {
                        // If parsing fails, use original body
                    }
                }

                if (config.debug) {
                    console.log('🔄 Proxying to:', config.targetUrl);
                    console.log('Request body:', requestData.substring(0, 200) + '...');
                }

                // Parse target URL
                const targetURL = new URL(config.targetUrl);
                const isHttps = targetURL.protocol === 'https:';

                // Prepare request options
                const options = {
                    hostname: targetURL.hostname,
                    port: targetURL.port || (isHttps ? 443 : 80),
                    path: targetURL.pathname + targetURL.search,
                    method: req.method,
                    headers: {
                        'api-key': config.bearerToken,
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestData)
                    }
                };

                // Make the request
                const httpModule = isHttps ? https : http;
                const proxyReq = httpModule.request(options, (proxyRes) => {
                    if (config.debug) {
                        console.log('✅ Response status:', proxyRes.statusCode);
                    }

                    // Forward the response
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    proxyRes.pipe(res);
                });

                proxyReq.on('error', (err) => {
                    console.error('❌ Proxy request error:', err.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
                });

                // Send the request body
                if (requestData) {
                    proxyReq.write(requestData);
                }
                proxyReq.end();

            } catch (error) {
                console.error('❌ Request processing error:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Processing error', message: error.message }));
            }
        });

    } catch (error) {
        console.error('❌ Server error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error', message: error.message }));
    }
});

server.listen(PORT, () => {
    console.log(`🎉 Basic Claude Code Proxy Server running on http://localhost:${PORT}`);
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
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});