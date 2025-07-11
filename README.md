# GitHub Fine-grained PAT Helper

A bookmarklet tool to automate the creation of GitHub fine-grained personal access tokens.

## Problem

Creating GitHub fine-grained PATs requires filling many form fields and selecting individual permissions, which is time-consuming and encourages users to set longer expiration dates instead of rotating tokens frequently.

## Solution

This tool provides JavaScript functions that can be run as a bookmarklet to automatically fill the PAT creation form based on predefined configurations.

## Usage

### Basic Functions

```javascript
// List all available permissions on the page
listAvailablePermissions();

// Get current permission settings
getCurrentPermissions();

// Set a single permission
setPermission('contents', 'read');

// Set multiple permissions at once
setMultiplePermissions({
  'contents': 'read',
  'issues': 'write',
  'pull_requests': 'write'
});
```

### Permission Values

- `'none'` - No access
- `'read'` - Read-only access
- `'write'` - Read and write access

## Development

The main script is in `github-pat-bookmarklet.js`.

## Future Plans

- [ ] Create bookmarklet version for easy installation
- [ ] Add URL parameter parsing for configuration sharing
- [ ] Create static HTML page for bookmarklet generation
- [ ] Add preset configurations for common use cases