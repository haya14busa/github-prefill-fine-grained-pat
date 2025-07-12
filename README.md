# GitHub Fine-grained PAT Helper

A bookmarklet tool to automate the creation of GitHub fine-grained personal access tokens.

**Author:** haya14busa  
**License:** MIT

## Problem

Creating GitHub fine-grained PATs requires filling many form fields and selecting individual permissions, which is time-consuming and encourages users to set longer expiration dates instead of rotating tokens frequently.

## Solution

A bookmarklet that automates form filling on GitHub's PAT creation page. Click the bookmarklet and it will:
- Automatically apply configurations from URL parameters
- Save and share your current form configuration
- Provide helper functions for advanced automation

No server, no API calls, no stored credentials - just client-side DOM manipulation to save you time.

## How It Works

The bookmarklet injects JavaScript directly into GitHub's PAT creation page that:

1. **Finds form elements** by their IDs and CSS selectors
2. **Fills inputs** by setting values and dispatching proper events
3. **Clicks buttons** to open dropdowns and select options
4. **Reads current values** to generate shareable configuration URLs

All operations happen in your browser. The bookmarklet simply automates the clicks and typing you would do manually. It respects GitHub's form validation and security measures - it just does the repetitive work faster.

## Installation

### Option 1: GitHub Pages (Recommended)

Visit the [GitHub PAT Helper page](https://haya14busa.github.io/github-prefill-fine-grained-pat/) and drag the bookmarklet button to your bookmarks bar.

### Option 2: Local Build

```bash
git clone https://github.com/haya14busa/github-prefill-fine-grained-pat.git
cd github-prefill-fine-grained-pat
npm install
npm run build
npm run serve
```

Then visit http://localhost:8080 and drag the bookmarklet button to your bookmarks bar.

## Usage

### Quick Start

1. Navigate to [GitHub's PAT creation page](https://github.com/settings/personal-access-tokens/new)
2. Click the bookmarklet in your bookmarks bar
3. The bookmarklet automatically:
   - **If URL has parameters & form is empty:** Applies the configuration
   - **If form has values:** Saves to URL & copies shareable link
   - **If both are empty:** Makes helper functions available in the console

### URL Parameters

The bookmarklet works with URL parameters to enable configuration sharing. When you visit a URL with parameters, the bookmarklet will automatically apply them.

#### Supported URL Parameters

- `name` - Token name
- `description` - Token description
- `owner` - Resource owner (username or organization)
- `expiration` - Expiration days (7, 30, 60, 90, "custom", "none", or any number for custom days)
- `expiration_date` - Custom expiration date (YYYY-MM-DD) when expiration=custom
- `repo_access` - Repository access type ("none", "all", or "selected")
- `repos` - Comma-separated list of repositories (when repo_access=selected, supports both `repo` and `owner/repo` formats)
- `permissions` - Comma-separated permission pairs (format: `resource:level`)

#### Example URLs

```
# Basic CI/CD token
https://github.com/settings/personal-access-tokens/new?name=CI+Token&expiration=30&repo_access=all&permissions=contents:read,metadata:read

# Organization token with specific repos (both formats work)
https://github.com/settings/personal-access-tokens/new?owner=my-org&name=Deploy+Token&repo_access=selected&repos=api,frontend&permissions=contents:write,packages:write
https://github.com/settings/personal-access-tokens/new?owner=my-org&name=Deploy+Token&repo_access=selected&repos=my-org/api,my-org/frontend&permissions=contents:write,packages:write

# Custom expiration date
https://github.com/settings/personal-access-tokens/new?name=Long+Term+Token&expiration=custom&expiration_date=2025-12-31

# Non-standard expiration days (e.g., 1 day, 14 days)
https://github.com/settings/personal-access-tokens/new?name=Short+Token&expiration=1
https://github.com/settings/personal-access-tokens/new?name=Two+Week+Token&expiration=14
```

### Manual Functions (Advanced)

While the bookmarklet handles most use cases automatically, you can also use these functions manually in the browser console:

#### Token Name and Description

```javascript
// Set token name
ghPat.setTokenName('CI/CD Token for Production');

// Get current token name
ghPat.getTokenName(); // Returns: 'CI/CD Token for Production'

// Set token description
ghPat.setTokenDescription('Used for automated deployments and testing in production environment');

// Get current token description
ghPat.getTokenDescription();
```

#### Resource Owner

```javascript
// Set resource owner (personal account or organization)
// Note: setResourceOwner returns a Promise and waits for confirmation
await ghPat.setResourceOwner('haya14busa');     // Personal account
await ghPat.setResourceOwner('my-org');         // Organization

// Get current resource owner
ghPat.getResourceOwner(); // Returns: 'haya14busa'

// List available resource owners
ghPat.getAvailableResourceOwners();
// Returns array with details about each owner:
// [{name: 'haya14busa', isOrganization: false, limit: null, limitLabel: null}, ...]
```

#### Basic Functions

```javascript
// List all available permissions on the page
ghPat.listAvailablePermissions();

// Get current permission settings
ghPat.getCurrentPermissions();

// Set a single permission
ghPat.setPermission('contents', 'read');

// Set multiple permissions at once (runs in parallel, returns a Promise)
await ghPat.setMultiplePermissions({
  'contents': 'read',
  'issues': 'write',
  'pull_requests': 'write'
});
```

#### Repository Access

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

#### Token Expiration

```javascript
// Set token expiration
ghPat.setExpiration(7);        // 7 days
ghPat.setExpiration(30);       // 30 days (default)
ghPat.setExpiration(60);       // 60 days
ghPat.setExpiration(90);       // 90 days
ghPat.setExpiration('none');   // No expiration

// Set custom expiration date
ghPat.setExpiration('custom', '2025-12-31'); // Custom date
ghPat.setExpiration('custom'); // Select custom, then set date manually
ghPat.setCustomExpirationDate('2025-12-31'); // Set date after selecting custom

// Get current expiration setting
ghPat.getExpiration(); 
// Returns: {type: 'days', days: 30} or {type: 'custom', date: '2025-12-31'} or {type: 'none'}
```

#### Permission Values

- `'none'` - No access
- `'read'` - Read-only access
- `'write'` - Read and write access

#### URL Control Functions

```javascript
// Manually apply configuration from URL parameters
ghPat.applyFromUrlParams();

// Generate URL with current configuration
ghPat.generateConfigUrl();
// Returns: https://github.com/settings/personal-access-tokens/new?name=CI+Token&expiration=30&...

// Copy configuration URL to clipboard
ghPat.copyConfigUrl();

// Open configuration URL in new tab
ghPat.openConfigUrl();

// Update current URL with configuration (without reloading)
ghPat.updateUrlParams();
```

## Preset Configurations

The tool includes several preset configurations available on the [web interface](https://haya14busa.github.io/github-prefill-fine-grained-pat/):

- **CI/CD Token (Read-only)**: Read access for continuous integration workflows
- **Read All Permissions**: Comprehensive read access to all available permissions
- **Write All Permissions**: Full write access to all permissions (use with extreme caution!)
- **Development Token**: Local development with code, issues, and PR access
- **Release Automation**: For automated release workflows with package management
- **Minimal Token**: Minimal access for testing purposes

Each preset generates a URL that you can bookmark or share with your team.

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

## Features

- 🚀 **Smart Auto-detection**: Automatically applies URL parameters or saves current configuration
- 🔗 **URL-based Configuration**: Share PAT configurations via URL parameters
- ⚡ **Parallel Permission Setting**: Sets multiple permissions simultaneously for speed
- 📋 **Preset Configurations**: Common token types ready to use
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS
- 🔒 **No Server Required**: Runs entirely in your browser

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript
- Async/await
- URL and URLSearchParams APIs

Tested on Chrome.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.