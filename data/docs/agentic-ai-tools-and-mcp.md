# Agentic AI — Tool Use and Model Context Protocol (MCP)

## Overview

Tools are the primary mechanism through which agents interact with the world beyond text
generation. A tool is any callable capability exposed to the LLM: a web search API, a SQL
query executor, a code interpreter, a file system interface, or any REST endpoint. In 2026,
tool use is standardized across providers through **function calling** APIs and, at a higher
level, through the **Model Context Protocol (MCP)**.

## Function Calling

Function calling (also called "tool calling") is a feature of modern LLM APIs that allows
the model to request invocation of a predefined function by emitting a structured JSON object
instead of free text.

### How It Works

1. The developer defines tools as JSON Schema objects (name, description, parameter schema).
2. These definitions are passed to the LLM in the API request alongside the conversation.
3. The model responds with either a text message OR a `tool_call` object specifying which
   function to invoke and with what arguments.
4. The application executes the function and returns the result to the model.
5. The model continues reasoning with the result in context.

### Example Tool Definition

```json
{
  "type": "function",
  "function": {
    "name": "search_documents",
    "description": "Search the internal knowledge base for relevant documents.",
    "parameters": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "The search query string"
        },
        "top_k": {
          "type": "integer",
          "description": "Number of results to return",
          "default": 5
        }
      },
      "required": ["query"]
    }
  }
}
```

### Structured Outputs (2025+)

Beyond tool calling, providers now support **structured outputs** — the model is constrained to
emit JSON that exactly conforms to a provided JSON Schema. This eliminates the category of
bugs where the model returns almost-correct JSON that fails parsing.

---

## Model Context Protocol (MCP)

### What Is MCP?

The Model Context Protocol is an open standard (introduced by Anthropic in late 2024, broadly
adopted by 2025) that defines a client–server interface for exposing tools, resources, and
prompts to LLM agents in a uniform, transport-agnostic way.

Before MCP, every framework had its own tool-integration format. An agent built with LangGraph
needed different integration code than one built with AutoGen, even if the underlying tool
(e.g. a file reader) was identical. MCP solves this by defining a standard protocol that any
agent framework can speak.

### MCP Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Agent / Host      │  MCP    │   MCP Server         │
│  (LangGraph,        │◄───────►│  (tools, resources,  │
│   OpenAI SDK, etc.) │         │   prompts)           │
└─────────────────────┘         └──────────────────────┘
```

**Host**: the agent application that connects to one or more MCP servers.
**MCP Server**: a lightweight process (local or remote) that exposes capabilities.
**Transport**: stdio (for local servers) or HTTP with Server-Sent Events (for remote servers).

### MCP Primitives

| Primitive | Description |
|---|---|
| **Tools** | Callable functions the agent can invoke (e.g. `read_file`, `run_query`) |
| **Resources** | Static or dynamic data the agent can read (e.g. file contents, DB rows) |
| **Prompts** | Reusable prompt templates the server exposes to the agent |
| **Sampling** | Allows MCP servers to request LLM completions from the host |

### Why MCP Matters

- **Write once, use everywhere**: A file-system MCP server works with LangGraph, CrewAI,
  and the OpenAI Agents SDK without modification.
- **Separation of concerns**: Tool authors ship MCP servers; agent developers consume them.
  No coupling between tool implementation and agent framework.
- **Security boundary**: MCP servers can run in sandboxed processes with limited permissions,
  keeping tool execution isolated from the agent host.
- **Ecosystem**: By 2026, thousands of MCP servers exist for common services — GitHub,
  Postgres, Slack, Jira, web browsers, code execution sandboxes, and more.

### Building an MCP Server (Python)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("docs-search")

@mcp.tool()
def search_docs(query: str, top_k: int = 5) -> list[dict]:
    """Search the documentation index for relevant chunks."""
    results = vector_store.similarity_search(query, top_k)
    return [{"content": r.content, "source": r.metadata["source"]} for r in results]

@mcp.resource("docs://index/stats")
def index_stats() -> str:
    """Return current index statistics."""
    return f"Total chunks: {vector_store.count()}"

if __name__ == "__main__":
    mcp.run()
```

### Connecting to an MCP Server (Agent Side)

```python
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async def main():
    server = MCPServerStdio(command="python", args=["docs_mcp_server.py"])
    async with server:
        agent = Agent(
            name="docs-assistant",
            instructions="Use the search_docs tool to answer questions.",
            mcp_servers=[server],
        )
        result = await Runner.run(agent, "What is the RAG architecture?")
        print(result.final_output)
```

---

## Common Tool Categories

### Information Retrieval
- **Web search**: Brave Search, Tavily, Exa — returns web results with snippets
- **Vector search**: queries an embedding index (the RAG tool pattern)
- **Database query**: executes parameterized SQL against a relational DB
- **Document reader**: fetches and parses PDFs, Word docs, web pages

### Code Execution
- **Code interpreter**: runs Python in a sandboxed environment, returns stdout/stderr
- **Shell executor**: runs shell commands (high risk — requires strict guardrails)
- **REPL**: interactive evaluation for exploratory data analysis tasks

### External Services
- **Email / calendar**: send messages, create events (irreversible — always requires L2+ approval)
- **Version control**: read/write files, create PRs, comment on issues
- **Cloud infrastructure**: provision resources, query logs, scale services

### Internal Business Systems
- **CRM / ticketing**: read/create/update customer records and support tickets
- **ERP / HR**: query organizational data, submit forms
- **Internal wikis**: fetch documentation from Confluence, Notion, SharePoint

---

## Tool Design Principles

### Descriptions Are Critical

The model decides which tool to call — and with what arguments — based almost entirely on the
tool name and description. Poorly written descriptions lead to wrong tool selection.

**Bad:** `name: "query", description: "query data"`
**Good:** `name: "search_knowledge_base", description: "Search the internal product documentation and engineering wiki using semantic similarity. Use this when the user asks about internal systems, processes, or product specifications."`

### Narrow, Single-Purpose Tools

Each tool should do exactly one thing. Avoid multi-purpose tools with many optional parameters
that force the model to make complex configuration decisions. Prefer `search_docs` and
`search_code` over a single `search(type: "docs"|"code")` tool.

### Return Structured Data

Tools should return JSON-serializable objects with clear field names, not raw text blobs.
The model parses natural language poorly when it appears inside a tool result.

### Fail Loudly

Tools should raise exceptions with descriptive error messages on failure rather than returning
`null` or empty arrays silently. The model needs to know *why* a tool failed to decide whether
to retry, try a different tool, or ask the user.

### Idempotency Where Possible

Read tools should always be idempotent. Write tools should be idempotent where feasible
(e.g., upsert instead of insert) to make retries safe.
