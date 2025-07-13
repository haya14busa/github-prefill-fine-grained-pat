# Contributing to GitHub Fine-grained PAT Helper

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 20 or higher (for bookmarklet development)
- Deno 1.x or higher (for CLI development)
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/github-prefill-fine-grained-pat.git
   cd github-prefill-fine-grained-pat
   ```

3. Install dependencies:
   ```bash
   # For bookmarklet
   npm install
   
   # For CLI (dependencies are managed by Deno)
   cd cli
   ```

## Development Workflow

### Bookmarklet Development

```bash
# Build the bookmarklet
npm run build

# Run development server
npm run serve

# Clean build artifacts
npm run clean
```

### CLI Development

```bash
cd cli

# Run tests
deno task test

# Run tests in watch mode
deno task test:watch

# Check code quality
deno task check

# Run the CLI
deno task dev

# Build binaries
deno task compile
```

## Testing

### Running Tests

Before submitting a pull request, ensure all tests pass:

```bash
# Bookmarklet
npm run build

# CLI
cd cli
deno task check
```

### Writing Tests

- Add tests for any new functionality
- Ensure tests are descriptive and cover edge cases
- Follow the existing test patterns in the codebase

## Code Style

### JavaScript/TypeScript

- Use ES modules
- Follow the existing code style
- Run formatters before committing:
  ```bash
  # CLI
  cd cli
  deno task fmt
  ```

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

Examples:
```
feat(cli): add support for custom expiration dates
fix(bookmarklet): handle special characters in repository names
docs: update installation instructions
```

## Pull Request Process

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them following the commit message guidelines

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request with:
   - Clear description of the changes
   - Reference to any related issues
   - Screenshots/examples if applicable

5. Ensure all CI checks pass

6. Wait for review and address any feedback

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment information (if relevant)
- Any error messages or logs

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues first
- Provide a clear use case
- Explain why this feature would be beneficial
- Consider submitting a pull request if you can implement it

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the question label
- Check existing issues and discussions

Thank you for contributing!