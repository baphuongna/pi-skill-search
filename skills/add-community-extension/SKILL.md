---
name: add-community-extension
description: 'Add a community extension to the Spec Kit catalog from a GitHub issue submission. USE FOR: processing extension submission issues, validating catalog entries, updating catalog.community.json and docs/community/extensions.md, creating PRs. DO NOT USE FOR: creating new extensions from scratch, or first-party extension work.'
---


# Add Community Extension

Process an extension submission issue and add or update it in the community catalog.

## When to Use

- A new `[Extension]` submission issue is filed
- An existing extension submits an update issue (new version, changed metadata)
- You need to add or update a community extension in `extensions/catalog.community.json` and `docs/community/extensions.md`

## Procedure

### 1. Fetch the submission issue

Read the GitHub issue to extract all metadata:
- Extension ID, name, version, description, author
- Repository URL, download URL, homepage, documentation, changelog
- License, required spec-kit version, optional tool dependencies
- Number of commands and hooks
- Tags

### 2. Validate against publishing rules

Check **all** of the following (per `extensions/EXTENSION-PUBLISHING-GUIDE.md`):

| Check | How |
|-------|-----|
| Repository exists and is public | Fetch the repository URL |
| `extension.yml` manifest present | Confirm in repo file listing |
| README.md present | Confirm in repo file listing |
| LICENSE file present | Confirm in repo file listing |
| GitHub release exists matching version | Check releases on the repo page |
| Download URL is accessible | Verify it follows `archive/refs/tags/vX.Y.Z.zip` pattern and release exists |
| Extension ID is lowercase-with-hyphens only | Regex: `^[a-z][a-z0-9-]*$` |
| Version follows semver | Format: `X.Y.Z` |
| Submission checklists are all checked | Confirm in issue body |

### 3. Determine if this is an add or update

Search `extensions/catalog.community.json` for the extension ID.

- **Not found** → this is a **new addition**. Proceed to step 4.
- **Found** → this is an **update**. Proceed to step 4 but replace the existing entry in-place instead of inserting.

### 4. Add or update `extensions/catalog.community.json`

**New extension:** Insert the entry in **alphabetical order** by extension ID.

**Update:** Replace the existing entry in-place. Update only the fields that changed (typically `version`, `download_url`, `description`, `provides`, `requires`, `tags`, `updated_at`). Preserve `created_at` and `downloads`/`stars` from the existing entry.

Use the existing entries as the format template. Required fields:

```json
{
  "<id>": {
    "name": "<name>",
    "id": "<id>",
    "description": "<description>",
    "author": "<author>",
    "version": "<version>",
    "download_url": "<download_url>",
    "repository": "<repository>",
    "homepage": "<homepage>",
    "documentation": "<documentation>",
    "changelog": "<changelog>",
    "license": "<license>",
    "requires": {
      "speckit_version": "<speckit_version>"
    },
    "provides": {
      "commands": <N>,
      "hooks": <N>
    },
    "tags": ["<tag1>", "<tag2>"],
    "verified": false,
    "downloads": 0,
    "stars": 0,
    "created_at": "<today>T00:00:00Z",
    "updated_at": "<today>T00:00:00Z"
```

