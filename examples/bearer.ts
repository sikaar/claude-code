import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface ClaudeMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ClaudeRequest {
    anthropic_version: string;
    stream: boolean;
    max_tokens: number;
    temperature: number;
    top_p: number;
    top_k: number;
    messages: ClaudeMessage[];
}

interface ClaudeConfig {
    apiUrl: string;
    bearerToken: string;
    apiVersion: string;
}

function getConfig(): ClaudeConfig {
    const bearerToken = process.env.CLAUDE_BEARER_TOKEN;
    
    if (!bearerToken) {
        console.error('Error: CLAUDE_BEARER_TOKEN environment variable is required');
        console.error('Please set it in your .env file or as an environment variable');
        process.exit(1);
    }

    return {
        apiUrl: process.env.CLAUDE_API_URL || 'https://your-custom-endpoint.example.com',
        bearerToken,
        apiVersion: process.env.CLAUDE_API_VERSION || 'vertex-2023-10-16'
    };
}

async function callClaudeAPI(config: ClaudeConfig, messages: ClaudeMessage[]): Promise<void> {
    const payload: ClaudeRequest = {
        anthropic_version: config.apiVersion,
        stream: true,
        max_tokens: 512,
        temperature: 0.5,
        top_p: 0.95,
        top_k: 1,
        messages
    };

    const headers = {
        'Authorization': `Bearer ${config.bearerToken}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const responseText = await response.text();
        console.log(responseText);
    } catch (error) {
        console.error('Error making request:', error);
    }
}

// Main execution
async function main() {
    const config = getConfig();
    
    const messages: ClaudeMessage[] = [
        {
            role: 'user',
            content: 'hello'
        }
    ];

    await callClaudeAPI(config, messages);
}

main().catch(console.error);