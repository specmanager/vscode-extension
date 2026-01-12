# SpecManager for VSCode

A VSCode extension that integrates [SpecManager](https://specmanager.ai) directly into your development workflow. Manage specifications, track tasks, and handle approvals without leaving your editor.

## Features

- **Project Management** - View and switch between your SpecManager projects linked to GitHub repositories
- **Task Tracking** - See all tasks with status indicators (pending, in-progress, done) and track progress
- **Specification Viewer** - Browse specs organized by stage (requirements, design, tasks, implementation)
- **Approval Workflow** - Respond to approval requests directly from VSCode
- **Real-Time Updates** - Get instant notifications when tasks or approvals change via Server-Sent Events
- **Multi-Language Support** - Available in English, Hebrew, and Spanish

## Installation

### From VS Code Marketplace

1. Open VSCode
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "SpecManager"
4. Click Install

### From VSIX File

```bash
code --install-extension specmanager-<version>.vsix
```

## Getting Started

1. Click the SpecManager icon in the Activity Bar (left sidebar)
2. Sign in with your SpecManager account:
   - **Email/Password** - Enter your credentials directly
   - **GitHub OAuth** - Click "Sign in with GitHub" for one-click authentication
3. Select a project from the dropdown to view its specs and tasks

## Commands

Access these commands via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `SpecManager: Open Dashboard` | Opens the SpecManager sidebar panel |
| `SpecManager: Refresh Data` | Refreshes all project, spec, and task data |
| `SpecManager: Logout` | Signs out and clears stored credentials |

## Configuration

Configure the extension in VSCode Settings (`Ctrl+,` / `Cmd+,`):

| Setting | Default | Description |
|---------|---------|-------------|
| `specmanager.apiUrl` | `https://api.specmanager.ai` | Backend API URL |
| `specmanager.language` | `auto` | UI language (auto, en, he, es) |

## Requirements

- VSCode 1.99.0 or higher
- A [SpecManager](https://specmanager.ai) account
- Projects linked to GitHub repositories

## MCP Server Integration

SpecManager also provides an MCP (Model Context Protocol) server for AI-powered development. When using Claude Code or other MCP-compatible tools, you can:

- List and manage projects
- View specs and tasks
- Start, complete, and report progress on tasks
- All from your AI assistant

## Privacy & Security

- Authentication tokens are stored securely using VSCode's SecretStorage API
- All API communication uses HTTPS
- OAuth flows include CSRF protection via state validation

## Support

- **Issues**: [GitHub Issues](https://github.com/specmanager/vscode-extension/issues)
- **Documentation**: [docs.specmanager.ai](https://specmanager.ai/docs)
- **Website**: [specmanager.ai](https://specmanager.ai)

## License

MIT License - see [LICENSE](LICENSE) for details.
