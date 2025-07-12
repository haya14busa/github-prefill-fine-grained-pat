# GitHub Personal Access Token CLI

A command-line tool for generating GitHub Personal Access Token creation URLs with pre-filled parameters.

## Features

- Auto-detects repository owner from git remote
- Supports configuration via YAML/JSON files
- Command-line flags for all token parameters
- Can copy URL to clipboard
- Can open URL directly in browser

## Installation

### Using Deno

```bash
# Install globally
deno install --allow-read --allow-run -n github-pat-cli https://raw.githubusercontent.com/haya14busa/github-prefill-fine-grained-pat/main/cli/src/main.ts

# Or run directly
deno run --allow-read --allow-run https://raw.githubusercontent.com/haya14busa/github-prefill-fine-grained-pat/main/cli/src/main.ts [OPTIONS]
```

### Using compiled binary

```bash
# Compile
deno compile --allow-read --allow-run --allow-net --output github-pat-cli src/main.ts

# Run
./github-pat-cli [OPTIONS]
```

## Usage

```bash
github-pat-cli [OPTIONS]
```

### Options

- `-n, --name <name>` - Token name
- `-o, --owner <owner>` - Repository owner (auto-detected from git if not specified)
- `--description <desc>` - Token description
- `--config <file>` - Load configuration from YAML/JSON file
- `--expiration <days>` - Token expiration (number of days, "none", or "custom")
- `--expiration-date <date>` - Custom expiration date (YYYY-MM-DD)
- `--repo-access <access>` - Repository access ("none", "all", or "selected")
- `--repos <repos>` - Comma-separated list of repositories
- `--permissions <perms>` - Comma-separated permissions (format: resource:level)
- `--copy` - Copy URL to clipboard (requires pbcopy/xclip)
- `--open` - Open URL in browser
- `-h, --help` - Show help message

### Examples

Generate URL with auto-detected git repository:
```bash
github-pat-cli --name "CI Token"
```

Use configuration file:
```bash
github-pat-cli --config token.yaml
```

Specify repositories and permissions:
```bash
github-pat-cli --name "Deploy Token" --repos "api,frontend" --permissions "contents:write,issues:read"
```

Custom expiration:
```bash
github-pat-cli --name "Temp Token" --expiration custom --expiration-date 2025-12-31
```

Copy to clipboard and open in browser:
```bash
github-pat-cli --name "New Token" --copy --open
```

## Configuration Files

The tool supports YAML and JSON configuration files.

### YAML Example

```yaml
name: CI/CD Token
description: Token for GitHub Actions workflows
owner: myorg
expiration: 30
repoAccess: selected
repos:
  - myorg/api
  - myorg/frontend
permissions:
  contents: write
  issues: read
  metadata: read
  pull_requests: write
  actions: write
```

### JSON Example

```json
{
  "name": "API Token",
  "description": "Token for API access",
  "owner": "myuser",
  "expiration": "none",
  "permissions": {
    "contents": "read",
    "metadata": "read"
  }
}
```

## Permissions

Common permission resources include:
- `actions` - GitHub Actions workflows, workflow runs and artifacts
- `contents` - Repository contents, commits, branches, downloads, releases, and merges
- `issues` - Issues and related comments, assignees, labels, and milestones
- `metadata` - Search repositories, list collaborators, and access repository metadata
- `packages` - Packages published to GitHub Packages
- `pull_requests` - Pull requests and related comments, assignees, labels, milestones, and merges

Permission levels: `none`, `read`, `write`

## Development

### Prerequisites

- [Deno](https://deno.land/) runtime

### Running tests

```bash
deno task test
```

### Building

```bash
deno task compile
```

## License

MIT