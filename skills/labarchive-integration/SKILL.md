---
name: labarchive-integration
description: Electronic lab notebook API integration. Access notebooks, manage entries/attachments, backup notebooks, integrate with Protocols.io/Jupyter/REDCap, for programmatic ELN workflows.
---

# LabArchives Integration

## Overview

LabArchives is an electronic lab notebook platform for research documentation and data management. Access notebooks, manage entries and attachments, generate reports, and integrate with third-party tools programmatically via REST API.

## When to Use This Skill

This skill should be used when:
- Working with LabArchives REST API for notebook automation
- Backing up notebooks programmatically
- Creating or managing notebook entries and attachments
- Generating site reports and analytics
- Integrating LabArchives with third-party tools (Protocols.io, Jupyter, REDCap)
- Automating data upload to electronic lab notebooks
- Managing user access and permissions programmatically

## Core Capabilities

### 1. Authentication and Configuration

Set up API access credentials and regional endpoints for LabArchives API integration.

**Prerequisites:**
- Enterprise LabArchives license with API access enabled
- API access key ID and password from LabArchives administrator
- User authentication credentials (email and external applications password)

**Configuration setup:**

Use the `scripts/setup_config.py` script to create a configuration file:

```bash
python3 scripts/setup_config.py

# Initialize client
client = Client(api_url, access_key_id, access_password)

# Get user access info
login_params = {'login_or_email': user_email, 'password': auth_token}
response = client.make_call('users', 'user_access_info', params=login_params)

# Extract UID from response
import xml.etree.ElementTree as ET
uid = ET.fromstring(response.content)[0].text

# Get detailed user info
params = {'uid': uid}
user_info = client.make_call('users', 'user_info_via_id', params=params)
```

### 3. Notebook Operations

Manage notebook access, backup, and metadata retrieval.

**Key operations:**

- **List notebooks:** Retrieve all notebooks accessible to a user
- **Backup notebooks:** Download complete notebook data with optional attachment inclusion
- **Get notebook IDs:** Retrieve institution-defined notebook identifiers for integration with grants/project management systems
- **Get notebook members:** List all users with access to a specific notebook
- **Get notebook settings:** Retrieve configuration and permissions for notebooks

**Notebook backup example:**

Use the `scripts/notebook_operations.py` script:

```bash
# Backup with attachments (default, creates 7z archive)
python3 scripts/notebook_operations.py backup --uid USER_ID --nbid NOTEBOOK_ID

### 4. Entry and Attachment Management

Create, modify, and manage notebook entries and file attachments.

**Entry operations:**
- Create new entries in notebooks
- Add comments to existing entries
- Create entry parts/components
- Upload file attachments to entries

**Attachment workflow:**

Use the `scripts/entry_operations.py` script:

```bash
# Upload attachment to an entry
python3 scripts/entry_operations.py upload --uid USER_ID --nbid NOTEBOOK_ID --entry-id ENTRY_ID --file /path/to/file.pdf

# Create a new entry with text content
python3 scripts/entry_operations.py create --uid USER_ID --nbid NOTEBOOK_ID --title "Experiment Results" --content "Results from today's experiment..."
```

<!-- condensed from source -->

