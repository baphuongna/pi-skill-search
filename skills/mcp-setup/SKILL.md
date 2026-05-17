---
name: mcp-setup
description: Configure popular MCP servers for enhanced agent capabilities
---


# MCP Setup

Configure Model Context Protocol (MCP) servers to extend Claude Code's capabilities with external tools like web search, file system access, and GitHub integration.

## Overview

MCP servers provide additional tools that Claude Code agents can use. This skill helps you configure popular MCP servers using the `claude mcp add` command-line interface.

## Step 1: Choose a Setup Path

Use **AskUserQuestion** with **one question at a time** and **no more than 3 options per question**. Recent Claude Code builds reject larger option payloads as invalid tool parameters, so keep the MCP selection flow staged.

### Step 1.1: First menu

**Question:** "What kind of MCP setup would you like?"

**Options:**
1. **Recommended starter setup** - Fast path for the most common OMC MCP additions
2. **Individual popular server** - Pick one built-in server from a short follow-up menu
3. **Custom server** - Add your own stdio or HTTP MCP server

### Step 1.2: If the user chooses "Recommended starter setup"

Ask a follow-up **AskUserQuestion**:

**Question:** "Which recommended MCP bundle should I configure?"

**Options:**
1. **Context7 only (Recommended)** - Zero-config docs/context server
2. **Context7 + Exa** - Docs/context plus enhanced web search
3. **Full recommended bundle** - Context7, Exa, Filesystem, and GitHub

Map that choice to the server list you will configure.

### Step 1.3: If the user chooses "Individual popular server"

Ask a follow-up **AskUserQuestion**:

**Question:** "Which server should I configure first?"

**Options:**
1. **Context7 (Recommended)** - Documentation and code context from popular libraries
2. **Exa Web Search** - Enhanced web search (replaces built-in websearch)
3. **More server choices** - Filesystem, GitHub, or the full recommended bundle

If the user chooses **More server choices**, ask one more **AskUserQuestion**:

**Question:** "Which additional MCP option do you want?"

**Options:**
1. **Filesystem (Recommended)** - Extended file system access with additional capabilities
2. **GitHub** - GitHub API integration for issues, PRs, and repository management
3. **Full recommended bundle** - Configure Context7, Exa, Filesystem, and GitHub together

### Step 1.4: If the user chooses "Custom server"

Skip directly to the **Custom MCP Server** section below.

## Step 2: Gather Required Information

### For Context7:
No API key required. Ready to use immediately.

### For Exa Web Search:
Ask for API key:
```
Do you have an Exa API key?
- Get one at: https://exa.ai
- Enter your API key, or type 'skip' to configure later
```

### For Filesystem:
Ask for allowed directories:
```
Which directories should the filesystem MCP have access to?
Default: Current working directory
Enter comma-separated paths, or press Enter for default
```


