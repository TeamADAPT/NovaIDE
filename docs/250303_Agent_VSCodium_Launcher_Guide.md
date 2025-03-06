# Agent VSCodium Launcher Guide

**Version:** 1.0.0  
**Date:** March 3, 2025  
**Author:** Forge, Lead VSCode Developer

## Overview

The Agent VSCodium Launcher is a specialized script for launching VSCodium instances with agent-specific configurations, persistent API keys, and the Roo extension. This guide explains how to use the launcher script to create isolated VSCodium environments for different Nova agents.

## Features

- **Agent-Specific Window Titles**: Shows the agent name in the VSCodium window title
- **Persistent API Keys**: Stores API keys in settings.json for future sessions
- **Roo Extension Integration**: Automatically copies the Roo extension from main VSCode
- **MCP Settings**: Creates and initializes MCP settings directory
- **Isolated Environments**: Separate user data and extensions directories for each agent
- **Resource Management**: Configures memory limits for optimal performance
- **Fallback Mechanism**: Falls back to VSCode if VSCodium binary not found

## Prerequisites

- VSCodium binary (will fall back to VSCode if not found)
- Roo extension installed in main VSCode
- API keys for Anthropic and OpenAI (set as environment variables)

## Usage

```bash
./scripts/launch_agent_vscodium.sh <agent_name> <working_directory>
```

### Parameters

- `agent_name`: The name of the agent (e.g., Forge, Vaeris, Theseus)
- `working_directory`: The directory to open in VSCodium

### Examples

Launch VSCodium for Forge with the NovaIDE project:

```bash
./scripts/launch_agent_vscodium.sh Forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

Launch VSCodium for Vaeris with the NovaOps project:

```bash
./scripts/launch_agent_vscodium.sh Vaeris /data-nova/ax/NovaOps
```

Launch VSCodium for Theseus with the DataOps project:

```bash
./scripts/launch_agent_vscodium.sh Theseus /data-nova/ax/DataOps
```

## Directory Structure

The script creates the following directory structure for each agent:

```
/home/x/.vscodium-isolated/
└── <agent_name>/
    ├── User/
    │   ├── settings.json
    │   └── globalStorage/
    │       └── rooveterinaryinc.roo-cline/
    │           └── settings/
    │               └── cline_mcp_settings.json
    └── extensions/
        └── rooveterinaryinc.roo-cline/
```

## API Keys

The script configures the following API keys:

- **Anthropic API Key**: Set via `ANTHROPIC_API_KEY` environment variable
- **OpenAI API Key**: Set via `OPENAI_API_KEY` environment variable

These keys are stored in the agent's settings.json file and also passed as environment variables when launching VSCodium.

## Settings

The script creates a settings.json file with the following configurations:

- Window title with agent name
- Dark theme
- Format on save
- Redis, MongoDB, and Elasticsearch configurations
- Context management settings
- Development settings
- File associations and exclusions
- Editor and terminal settings
- Git settings
- TypeScript and JavaScript settings
- Debug settings

## Troubleshooting

### VSCodium Binary Not Found

If the VSCodium binary is not found, the script will fall back to using VSCode. To build VSCodium, use:

```bash
./scripts/build_vscodium.sh
```

Or to download a pre-built binary:

```bash
./scripts/download_vscodium.sh
```

### Roo Extension Not Found

If the Roo extension is not found in the main VSCode installation, the script will display a warning. To fix this, install the Roo extension in the main VSCode installation and run the script again.

### API Keys Not Working

If the API keys are not working, check the settings.json file in the agent's user data directory:

```bash
cat /home/x/.vscodium-isolated/<agent_name>/User/settings.json
```

Ensure the API keys are correctly set in the file. If not, you can manually edit the file or run the script again.

## Related Scripts

- `scripts/migrate_to_vscodium.sh`: Migrate VSCode settings to VSCodium
- `scripts/vscodium_isolation.sh`: Launch VSCodium with isolated directories
- `scripts/download_vscodium.sh`: Download pre-built VSCodium binary
- `scripts/build_vscodium.sh`: Build VSCodium from source

## Conclusion

The Agent VSCodium Launcher provides a convenient way to launch VSCodium instances with agent-specific configurations, persistent API keys, and the Roo extension. By using isolated environments for each agent, you can ensure that each agent has its own settings, extensions, and workspace without interfering with others.