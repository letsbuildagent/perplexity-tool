#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Check for API key
const PERPLEXITY_API_KEY = "YOUR-API-KEY-HERE";
if (!PERPLEXITY_API_KEY) {
    console.error("Error: PERPLEXITY_API_KEY environment variable is required");
    process.exit(1);
}
const PERPLEXITY_TOOL = {
    name: "ask_perplexity",
    description: "Ask a question to Perplexity AI",
    inputSchema: {
        type: "object",
        properties: {
            question: {
                type: "string",
                description: "The question to ask"
            },
            temperature: {
                type: "number",
                description: "Response randomness (0-2)",
                default: 0.2
            },
            max_tokens: {
                type: "integer",
                description: "Maximum tokens in response",
                default: 1000
            },
            search_domain_filter: {
                type: "array",
                items: { type: "string" },
                description: "Limit search to specific domains",
                default: []
            },
            search_recency_filter: {
                type: "string",
                enum: ["day", "week", "month", "year"],
                description: "Filter results by recency",
                default: "month"
            }
        },
        required: ["question"],
    },
};
// Server implementation
const server = new Server({
    name: "perplexity-tool",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
function isPerplexityArgs(args) {
    return (typeof args === "object" &&
        args !== null &&
        "question" in args &&
        typeof args.question === "string");
}
async function askPerplexity(args) {
    const { question, temperature = 0.2, max_tokens = 1000, search_domain_filter = [], search_recency_filter = "month" } = args;
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.1-sonar-small-128k-online",
            messages: [
                {
                    role: "system",
                    content: "You are a world-class researcher with strong attention to details"
                },
                {
                    role: "user",
                    content: question
                }
            ],
            max_tokens,
            temperature,
            top_p: 0.9,
            stream: false,
            search_domain_filter,
            search_recency_filter,
            return_images: false,
            return_related_questions: false,
            frequency_penalty: 1,
            presence_penalty: 0
        })
    });
    if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    // Extract answer and citations
    const answer = result.choices[0].message.content;
    const citations = result.citations || [];
    const tokenUsage = result.usage || {};
    // Format response
    const fullResponse = [
        `Answer: ${answer}\n`,
        "\nSources:",
        ...citations.map((citation, i) => `${i + 1}. ${citation}`),
        "\nToken Usage:",
        `- Prompt tokens: ${tokenUsage.prompt_tokens || 'N/A'}`,
        `- Completion tokens: ${tokenUsage.completion_tokens || 'N/A'}`,
        `- Total tokens: ${tokenUsage.total_tokens || 'N/A'}`
    ].join('\n');
    return fullResponse;
}
// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [PERPLEXITY_TOOL],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error("No arguments provided");
        }
        if (name === "ask_perplexity") {
            if (!isPerplexityArgs(args)) {
                throw new Error("Invalid arguments for ask_perplexity");
            }
            const results = await askPerplexity(args);
            return {
                content: [{ type: "text", text: results }],
                isError: false,
            };
        }
        return {
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Perplexity MCP Server running on stdio");
}
runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
