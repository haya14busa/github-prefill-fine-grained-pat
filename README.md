# GitHub Fine-grained PAT Helper

A bookmarklet tool to automate the creation of GitHub fine-grained personal access tokens.

## Problem

Creating GitHub fine-grained PATs requires filling many form fields and selecting individual permissions, which is time-consuming and encourages users to set longer expiration dates instead of rotating tokens frequently.

## Solution

This tool provides JavaScript functions that can be run as a bookmarklet to automatically fill the PAT creation form based on predefined configurations.

## Installation

1. Visit the [GitHub PAT Helper page](./index.html) (open `index.html` in your browser)
2. Drag the "GitHub PAT Helper" button to your bookmarks bar
3. Navigate to [GitHub's PAT creation page](https://github.com/settings/personal-access-tokens/new)
4. Click the bookmarklet to load the helper functions

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

### Repository Access

```javascript
// Set repository access type
setRepositoryAccess('all');      // All repositories
setRepositoryAccess('selected'); // Selected repositories only
setRepositoryAccess('none');     // Public repositories only

// Get current repository access setting
getRepositoryAccess();

// Select specific repositories (when access is set to 'selected')
selectRepositories(['owner/repo1', 'owner/repo2']);

// Clear all selected repositories
clearAllRepositories();

// Get currently selected repositories
getSelectedRepositories();
```

### Permission Values

- `'none'` - No access
- `'read'` - Read-only access
- `'write'` - Read and write access

## Preset Configurations

The tool includes several preset configurations:

- **CI/CD Token**: Read-only access for continuous integration
- **Development Token**: Read/write access for development workflows
- **Release Automation**: Permissions for automated releases
- **Admin Token**: Full administrative access (use sparingly)

Access these presets through the HTML interface or copy the code from the examples.

## Development

The project consists of:
- `github-pat-bookmarklet.js` - Core functionality
- `bookmarklet.js` - Minified bookmarklet version
- `index.html` - User interface with presets and configuration builder

## Future Plans

- [x] Create bookmarklet version for easy installation
- [ ] Add URL parameter parsing for configuration sharing
- [x] Create static HTML page for bookmarklet generation
- [x] Add preset configurations for common use cases