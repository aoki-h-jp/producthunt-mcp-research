---
title: Quick Start
description: Get up and running with producthunt-mcp-research in minutes
---

This guide will help you get `producthunt-mcp-research` up and running quickly with a basic data ingestion workflow.

:::note
Make sure you've completed the [Installation](/installation/) guide first, including setting up your Product Hunt API token, starting Qdrant, and running the database setup command.
:::

## Step 1: Sync Product Hunt Data

Run the sync command to fetch all Product Hunt data (topics, collections, and posts with comments):

```bash
pnpm run sync:all
```

This command will:
1. Fetch topics from Product Hunt API
2. Fetch collections from Product Hunt API
3. Fetch posts (including comments) from Product Hunt API
4. Store all data in Qdrant with vector embeddings

The sync process may take some time depending on the API rate limits. Progress and statistics will be displayed in the console.

## Step 2: Search Data with MCP

After syncing data to Qdrant, you can search and query it using the Model Context Protocol (MCP).

### Configure MCP Server

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "producthunt": {
      "command": "uvx",
      "args": ["mcp-server-qdrant"],
      "env": {
        "EMBEDDING_MODEL": "sentence-transformers/all-MiniLM-L6-v2"
      }
    }
  }
}
```

The unified collection contains all Product Hunt entities (posts, topics, collections) in a single searchable collection, making it much more efficient than separate collections.

:::tip
Make sure Qdrant is running on `http://localhost:6333` before using the MCP server.
:::

### Search Your Data

Once configured, you can use MCP tools to search your Product Hunt data:

**Example Queries:**

- "Find AI and machine learning tools" (searches across posts, topics, and collections)
- "Show me productivity tools" (finds relevant posts, topics, and collections)
- "What are the latest developer tools?" (cross-entity search)
- "Find trending products with high engagement"

The MCP server will perform vector similarity searches on the embeddings stored in Qdrant, returning relevant Product Hunt posts, collections, and topics.

### Unified Collection

Your Qdrant instance contains a single unified collection:

- **producthunt**: All Product Hunt entities (posts, topics, collections) in one searchable collection

The unified collection includes:
- **Cross-entity search**: Search across posts, topics, and collections simultaneously
- **Entity type filtering**: Filter by entity type (post, topic, collection) when needed
- **Vector embeddings**: Semantic search capabilities for all entity types
- **Rich metadata**: Comprehensive filtering options for all entities

## Next Steps

- Explore the [CLI Reference](/reference/cli/) for detailed command documentation
- Set up automated sync schedules for continuous data updates
- Build custom queries and analytics on your Product Hunt data
- Integrate with your AI applications using the MCP interface
