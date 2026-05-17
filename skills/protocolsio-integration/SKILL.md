---
name: protocolsio-integration
description: Integration with protocols.io API for managing scientific protocols. This skill should be used when working with protocols.io to search, create, update, or publish protocols; manage protocol steps and materials; handle discussions and comments; organize workspaces; upload and manage files; or integrate protocols.io functionality into workflows. Applicable for protocol discovery, collaborative protocol development, experiment tracking, lab protocol management, and scientific documentation.
---

# Protocols.io Integration

## Overview

Protocols.io is a comprehensive platform for developing, sharing, and managing scientific protocols. This skill provides complete integration with the protocols.io API v3, enabling programmatic access to protocols, workspaces, discussions, file management, and collaboration features.

## When to Use This Skill

Use this skill when working with protocols.io in any of the following scenarios:

- **Protocol Discovery**: Searching for existing protocols by keywords, DOI, or category
- **Protocol Management**: Creating, updating, or publishing scientific protocols
- **Step Management**: Adding, editing, or organizing protocol steps and procedures
- **Collaborative Development**: Working with team members on shared protocols
- **Workspace Organization**: Managing lab or institutional protocol repositories
- **Discussion & Feedback**: Adding or responding to protocol comments
- **File Management**: Uploading data files, images, or documents to protocols
- **Experiment Tracking**: Documenting protocol executions and results
- **Data Export**: Backing up or migrating protocol collections
- **Integration Projects**: Building tools that interact with protocols.io

## Core Capabilities

This skill provides comprehensive guidance across five major capability areas:

### 1. Authentication & Access

Manage API authentication using access tokens and OAuth flows. Includes both client access tokens (for personal content) and OAuth tokens (for multi-user applications).

**Key operations:**
- Generate authorization links for OAuth flow
- Exchange authorization codes for access tokens
- Refresh expired tokens
- Manage rate limits and permissions

**Reference:** Read `references/authentication.md` for detailed authentication procedures, OAuth implementation, and security best practices.

### 2. Protocol Operations

Complete protocol lifecycle management from creation to publication.

**Key operations:**
- Search and discover protocols by keywords, filters, or DOI
- Retrieve detailed protocol information with all steps
- Create new protocols with metadata and tags
- Update protocol information and settings
- Manage protocol steps (create, update, delete, reorder)
- Handle protocol materials and reagents
- Publish protocols with DOI issuance
- Bookmark protocols for quick access
- Generate protocol PDFs

**Reference:** Read `references/protocols_api.md` for comprehensive protocol management guidance, including API endpoints, parameters, common workflows, and examples.

### 3. Discussions & Collaboration

Enable community engagement through comments and discussions.

**Key operations:**
- View protocol-level and step-level comments
- Create new comments and threaded replies
- Edit or delete your own comments
- Analyze discussion patterns and feedback
- Respond to user questions and issues

**Reference:** Read `references/discussions.md` for discussion management, comment threading, and collaboration workflows.

### 4. Workspace Management

Organize protocols within team workspaces with role-based permissions.

**Key operations:**
- List and access user workspaces
- Retrieve workspace details and member lists
- Request access or join workspaces
- List workspace-specific protocols
- Create protocols within workspaces
- Manage workspace permissions and collaboration

**Reference:** Read `references/workspaces.md` for workspace organization, permission management, and team collaboration patterns.

### 5. File Operations

Upload, organize, and manage files associated with protocols.

**Key operations:**
- Search workspace files and folders
- Upload files with metadata and tags
- Download files and verify uploads
- Organize files into folder hierarchies
- Update file metadata
- Delete and restore files
- Manage storage and organization

**Reference:** Read `references/file_manager.md` for file upload procedures, organization strategies, and storage management.

### 6. Additional Features

Supplementary functionality including profiles, notifications, and exports.

**Key operations:**
- Manage user profiles and settings
- Query recently published protocols
- Create and track experiment records
- Receive and manage notifications
- Export organization data for archival

**Reference:** Read `references/additional_features.md` for profile management, publication discovery, experiment tracking, and data export.

## Getting Started

### Step 1: Authentication Setup

<!-- condensed from source -->

