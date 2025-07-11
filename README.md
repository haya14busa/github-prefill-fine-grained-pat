# GitHub Fine-grained PAT Helper

A bookmarklet tool to automate the creation of GitHub fine-grained personal access tokens.

## Problem

Creating GitHub fine-grained PATs requires filling many form fields and selecting individual permissions, which is time-consuming and encourages users to set longer expiration dates instead of rotating tokens frequently.

## Solution

This tool provides JavaScript functions that can be run as a bookmarklet to automatically fill the PAT creation form based on predefined configurations.

## Installation

### Option 1: Local Build

```bash
git clone https://github.com/haya14busa/github-prefill-fine-grained-pat.git
cd github-prefill-fine-grained-pat
npm install
npm run build
npm run serve
```

Then visit http://localhost:8080

### Option 2: Pre-built Version

1. Open `dist/index.html` in your browser (after building)
2. Drag the "GitHub PAT Helper" button to your bookmarks bar
3. Navigate to [GitHub's PAT creation page](https://github.com/settings/personal-access-tokens/new)
4. Click the bookmarklet to load the helper functions

## Usage

### Basic Functions

```javascript
// List all available permissions on the page
ghPat.listAvailablePermissions();

// Get current permission settings
ghPat.getCurrentPermissions();

// Set a single permission
ghPat.setPermission('contents', 'read');

// Set multiple permissions at once
ghPat.setMultiplePermissions({
  'contents': 'read',
  'issues': 'write',
  'pull_requests': 'write'
});
```

### Repository Access

```javascript
// Set repository access type
ghPat.setRepositoryAccess('all');      // All repositories
ghPat.setRepositoryAccess('selected'); // Selected repositories only
ghPat.setRepositoryAccess('none');     // Public repositories only

// Get current repository access setting
ghPat.getRepositoryAccess();

// Select specific repositories (when access is set to 'selected')
ghPat.selectRepositories(['owner/repo1', 'owner/repo2']);

// Clear all selected repositories
ghPat.clearAllRepositories();

// Get currently selected repositories
ghPat.getSelectedRepositories();
```

### Token Expiration

```javascript
// Set token expiration
ghPat.setExpiration(7);        // 7 days
ghPat.setExpiration(30);       // 30 days (default)
ghPat.setExpiration(60);       // 60 days
ghPat.setExpiration(90);       // 90 days
ghPat.setExpiration('custom'); // Custom date (manual selection required)
ghPat.setExpiration('none');   // No expiration

// Get current expiration setting
ghPat.getExpiration(); // Returns: 7, 30, 60, 90, 'custom', 'none', or null
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

### Project Structure

```
├── src/
│   ├── github-pat-bookmarklet.js   # Core functionality
│   └── index.template.html          # HTML template
├── scripts/
│   ├── create-bookmarklet.js        # Generates bookmarklet from minified code
│   └── build-html.js                # Builds HTML with bookmarklet URL
├── dist/                            # Build output (gitignored)
│   ├── bookmarklet.min.js           # Minified JavaScript
│   ├── bookmarklet.json             # Bookmarklet metadata
│   ├── bookmarklet-url.txt          # Bookmarklet URL
│   └── index.html                   # Final HTML page
└── package.json                     # Build configuration
```

### Build Commands

```bash
# Install dependencies
npm install

# Build everything
npm run build

# Development mode (build + serve)
npm run dev

# Clean build directory
npm run clean
```

### How it Works

1. **Source code** in `src/github-pat-bookmarklet.js` defines all functions on `window.ghPat`
2. **Build process**:
   - Terser minifies the JavaScript
   - `create-bookmarklet.js` wraps it as a bookmarklet URL
   - `build-html.js` injects the bookmarklet URL into the HTML template
3. **Output** in `dist/` directory contains the deployable files

## Future Plans

- [x] Create bookmarklet version for easy installation
- [ ] Add URL parameter parsing for configuration sharing
- [x] Create static HTML page for bookmarklet generation
- [x] Add preset configurations for common use cases