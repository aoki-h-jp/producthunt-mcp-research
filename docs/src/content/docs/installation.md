---
title: Installation
description: How to install and set up producthunt-mcp-research
---

This guide will walk you through setting up `producthunt-mcp-research` on your environment.

## Prerequisites

Before installing `producthunt-mcp-research`, make sure you have the following installed:

- **pnpm** (version 9.0.0+) - requires Node.js 18.17.0+
- **Git** for cloning the repository
- **Docker** for running Qdrant locally

## Clone the Repository

First, clone the `producthunt-mcp-research` repository:

```bash
git clone https://github.com/aoki-h-jp/producthunt-mcp-research.git
cd producthunt-mcp-research
```

## Install Dependencies

`producthunt-mcp-research` uses a monorepo structure with workspaces. Install all dependencies:

```bash
pnpm install
```

## Product Hunt API Setup

:::note
Before configuring the environment, you need to obtain a Product Hunt API token.
:::

Follow these steps:

### Step 1: Create a Product Hunt Account

1. Go to [Product Hunt](https://www.producthunt.com/) and create an account if you don't have one
2. Verify your email address

### Step 2: Access the API Dashboard

1. Log in to your Product Hunt account
2. In the top-right corner, hover over your account icon and click on the **API dashboard** option

### Step 3: Create a New Application

1. Click on the **Add an application** button
2. Enter a **Name** for your application (for example, `producthunt-mcp-research`)
3. Paste the following address in the **Redirect URI** field: `http://localhost:3000/callback`
4. Click on the **Create Application** button

### Step 4: Get Your Developer Token

1. After creating the application, you'll see your API credentials
2. Copy the **Developer Token** (doesn't expire, linked to your account)
3. This is the token you'll use in your `.env` file

:::note
**Important**: The Product Hunt API must not be used for commercial purposes. This tool is designed for personal use only. 
:::

## Environment Configuration

Create a `.env` file in the project root directory with your Product Hunt API token:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file and replace 'your_developer_token_here' with your actual token
```

The `.env.example` file contains all available configuration options with sensible defaults. You only need to set the `PH_API_TOKEN`:

```bash
# .env (project root)
PH_API_TOKEN=your_actual_token_here
```

**Important**: Use the environment variable name `PH_API_TOKEN` (not `PRODUCT_HUNT_API_TOKEN`).

All other settings use sensible defaults and will work out of the box.

## Build the Project

Build all modules:

```bash
pnpm run build
```

## Qdrant Setup

Before running sync commands, you need to start Qdrant locally:

```bash
# Start Qdrant with Docker (with data persistence)
docker run -p 6333:6333 -p 6334:6334 \
  -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
  qdrant/qdrant
```

This command will:
- Start Qdrant on port 6333 (REST API) and 6334 (gRPC)
- Persist data to `./qdrant_storage` directory
- Keep running in the foreground (use `-d` flag for background mode)

To verify Qdrant is running, open http://localhost:6333/dashboard in your browser.

## Database Setup

After Qdrant is running, initialize the database collection:

```bash
pnpm run setup
```

This command will:
- Create the `producthunt` collection in Qdrant
- Set up vector embeddings configuration (384 dimensions)
- Configure payload indexes for efficient searching

## Next Steps

Now that you have `producthunt-mcp-research` installed, Qdrant is running, and the database is initialized, check out the [Quick Start Guide](/quick-start/) to learn how to use it.
