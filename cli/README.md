# GitHub Personal Access Token CLI

A command-line tool for generating GitHub Personal Access Token creation URLs with pre-filled
parameters.

## Features

- Interactive mode prompts for required values with smart defaults
- Auto-detects repository owner from git remote
- Suggests token names based on repository name
- Defaults to "selected" repository access for better security
- Supports configuration via YAML/JSON files
- Command-line flags for all token parameters
- Can copy URL to clipboard
- Can open URL directly in browser

## Installation

### Using aqua

If you use [aqua](https://aquaproj.github.io/), you can manage Deno version declaratively:

```bash
# Install aqua if you haven't already
# https://aquaproj.github.io/docs/install

# Install tools defined in aqua.yaml (including Deno)
aqua i

# Then install the CLI globally
deno install --allow-read --allow-run -n github-pat-cli https://raw.githubusercontent.com/haya14busa/github-prefill-fine-grained-pat/main/cli/src/main.ts
```

### Using Deno directly

```bash
# Install globally
deno install --allow-read --allow-run -n github-pat-cli https://raw.githubusercontent.com/haya14busa/github-prefill-fine-grained-pat/main/cli/src/main.ts

# Or run directly
deno run --allow-read --allow-run https://raw.githubusercontent.com/haya14busa/github-prefill-fine-grained-pat/main/cli/src/main.ts [OPTIONS]
```

### Using compiled binary

Download pre-compiled binaries from the
[releases page](https://github.com/haya14busa/github-prefill-fine-grained-pat/releases) or compile
from source:

```bash
# Compile for current platform
deno task compile

# Run
./github-pat-cli [OPTIONS]
```

#### Supported Platforms

| Platform | Architecture          | Target                      | Binary Name                                 |
| -------- | --------------------- | --------------------------- | ------------------------------------------- |
| Windows  | x64                   | `x86_64-pc-windows-msvc`    | `github-pat-cli-x86_64-pc-windows-msvc.exe` |
| macOS    | x64 (Intel)           | `x86_64-apple-darwin`       | `github-pat-cli-x86_64-apple-darwin`        |
| macOS    | ARM64 (Apple Silicon) | `aarch64-apple-darwin`      | `github-pat-cli-aarch64-apple-darwin`       |
| Linux    | x64                   | `x86_64-unknown-linux-gnu`  | `github-pat-cli-x86_64-unknown-linux-gnu`   |
| Linux    | ARM64                 | `aarch64-unknown-linux-gnu` | `github-pat-cli-aarch64-unknown-linux-gnu`  |

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
- `--repo-access <access>` - Repository access ("none", "all", or "selected", default: "selected")
- `--repos <repos>` - Comma-separated list of repositories
- `--permissions <perms>` - Comma-separated permissions (format: resource:level)
- `--copy` - Copy URL to clipboard (requires pbcopy/xclip)
- `--open` - Open URL in browser
- `-h, --help` - Show help message

### Examples

Interactive mode (prompts for name and description):

```bash
github-pat-cli
# Token name (max 40 chars): [github-prefill-fine-grained-pat 2025-01-13] _
# Token description (optional): [Created by https://haya14busa.github.io/github-prefill-fine-grained-pat/] _
```

Note: Token names are automatically truncated to 40 characters if too long.

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
- Or use [aqua](https://aquaproj.github.io/) for version management:
  ```bash
  aqua i  # Installs Deno version specified in aqua.yaml
  ```

### Available Tasks

```bash
# Testing
deno task test              # Run all tests
deno task test:watch        # Run tests in watch mode
deno task test:coverage     # Run tests with coverage
deno task coverage:html     # Generate HTML coverage report

# Development
deno task dev              # Run the CLI in development mode
deno task run              # Run the CLI
deno task run:help         # Show CLI help
deno task run:example      # Run with example parameters

# Code Quality
deno task fmt              # Format code
deno task fmt:check        # Check code formatting
deno task lint             # Lint code
deno task type-check       # Type check all TypeScript files
deno task check            # Run all checks (format, lint, type-check, test)

# Building
deno task compile                            # Compile for current platform
deno task compile:all                        # Compile for all platforms
deno task compile:x86_64-pc-windows-msvc     # Compile for Windows x64
deno task compile:x86_64-apple-darwin        # Compile for macOS Intel
deno task compile:aarch64-apple-darwin       # Compile for macOS Apple Silicon
deno task compile:x86_64-unknown-linux-gnu   # Compile for Linux x64
deno task compile:aarch64-unknown-linux-gnu  # Compile for Linux ARM64

# Maintenance
deno task clean            # Clean build artifacts and coverage data
```

### Quick Development Workflow

```bash
# Run all checks before committing
deno task check

# Run tests in watch mode during development
deno task test:watch

# Test the CLI interactively
deno task dev
```

## License

MIT
