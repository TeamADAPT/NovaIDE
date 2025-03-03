# Nova IDE Manager for VSCodium

*Version: 3.0.0*  
*Date: 2025-03-03 08:20 MST*  
*Author: Forge, DevOps Lead*

## Overview

Nova IDE Manager is an interactive, terminal-based launcher for managing VSCodium instances for multiple Nova agents. It provides a comprehensive interface for launching, managing, and monitoring isolated VSCodium instances with proper resource constraints and configuration.

## Key Features

- **Interactive Terminal UI**: Full-featured menu system with agent selection
- **System Resource Monitoring**: Real-time display of system resources
- **Agent Management**: Add, launch, and monitor agent instances
- **Configuration Persistence**: Saved agent configurations
- **Settings Synchronization**: Copy settings from main VSCodium instance
- **Extension Management**: Transfer extensions between instances
- **Roo Extension Support**: Automatic Roo extension and MCP settings integration
- **Multi-Agent Launch**: Launch multiple agent instances simultaneously

## Getting Started

### Installation

1. Clone the repository if you haven't already:
   ```bash
   git clone https://github.com/TeamADAPT/novaide.git
   ```

2. Make the script executable:
   ```bash
   chmod +x scripts/nova-ide-manager/nova-ide-manager.sh
   ```

3. Run the manager:
   ```bash
   ./scripts/nova-ide-manager/nova-ide-manager.sh
   ```

## User Interface

The Nova IDE Manager presents a full-screen terminal user interface with the following components:

### Header Section
- Nova IDE Manager logo and version
- System information display (memory, CPU, disk usage, running instances)

### Agent Selection
- Checkbox-based selection of available agent instances
- Running status indicators
- Agent workspace paths

### Menu Options
- **Toggle All**: Select or deselect all agents
- **Add New Agent**: Add a new agent configuration
- **Launch Selected**: Launch all selected agent instances
- **Sync Settings**: Toggle settings synchronization
- **Sync Extensions**: Toggle extension synchronization 
- **Toggle Roo Extension**: Enable/disable Roo extension handling
- **Quit**: Exit the manager

### Settings Status
- Visual indicators of current settings options

## Available Agents

The system comes pre-configured with the following Nova agents:

| Agent Name | Working Directory | Description |
|------------|------------------|-------------|
| forge | /data-nova/ax/DevOps/DevOps-VSC/NovaIDE | Lead VSCode Developer |
| vaeris | /data-nova/ax/NovaOps | Chief Operations Officer |
| theseus | /data-nova/ax/DataOps | Data Operations Lead |
| pathfinder | /data-nova/ax/InfraOps | Infrastructure Operations Lead |
| zenith | /data-nova/ax/ArchOps | Architecture Operations Lead |
| nexus | /data-nova/ax/NetOps | Network Operations Lead |
| aurora | /data-nova/ax/SecOps | Security Operations Lead |
| atlas | /data-nova/ax/DataScience | Data Science Lead |
| nova | /data-nova/ax/CoreOps | Core Operations Lead |
| quantum | /data-nova/ax/QuantumOps | Quantum Operations Lead |
| orion | /data-nova/ax/AIResearch | AI Research Lead |
| phoenix | /data-nova/ax/CloudOps | Cloud Operations Lead |
| titan | /data-nova/ax/DevOps | Development Operations Lead |
| polaris | /data-nova/ax/QAOps | Quality Assurance Lead |

## Usage Guide

### Managing Agent Instances

#### Adding a New Agent

1. Select "Add New Agent" from the menu
2. Enter a name for the agent
3. Provide the workspace path for the agent
4. If the directory doesn't exist, you'll be prompted to create it

#### Selecting Agents to Launch

1. Use the number keys to toggle selection of individual agents
2. Use "Toggle All" to select or deselect all agents at once

#### Launching Multiple Agents

1. Select two or more agents using the checkboxes
2. Choose "Launch Selected" to start all selected agent instances
3. The system will display launch progress for each agent
4. Each agent will open in its own VSCodium window with proper isolation

### Configuration Options

#### Settings Synchronization

When enabled (default), the following settings are copied from your main VSCodium instance:
- `settings.json`: Your VSCodium preferences
- `keybindings.json`: Custom keyboard shortcuts
- `snippets/`: Your code snippets

#### Extension Synchronization

When enabled (default), all extensions from your main VSCodium installation are copied to the isolated instance.

#### Roo Extension

When enabled (default), the Roo extension is automatically transferred to the isolated instance, along with its MCP settings.

## Directory Structure

The Nova IDE Manager creates and manages these directories:

```
~/.config/nova-ide-manager/           # Configuration directory
~/.config/nova-ide-manager/config.json  # Instance configurations

/home/x/.vscodium-isolated/<agent>/    # User data directories
/home/x/.vscodium-isolated/<agent>/extensions/  # Extension directories
/home/x/.vscodium-isolated/<agent>/logs/    # Log files
```

## Command Line Usage

While the interactive mode is recommended, you can also use command line arguments:

```bash
./scripts/nova-ide-manager/nova-ide-manager.sh [options]
```

### Options

- `-h, --help`: Show help message
- `-v, --verbose`: Enable verbose logging
- `-l, --launch`: Launch instances directly (non-interactive)
- `-s, --sync-settings`: Synchronize settings from main VSCodium
- `-e, --sync-extensions`: Synchronize extensions from main VSCodium
- `-c, --clean`: Start with clean user data directory
- `-f, --folder PATH`: Specify folder to open
- `-i, --instance NAME`: Specify instance to launch (can be used multiple times)
- `-a, --all`: Launch all known instances

### Examples

```bash
# Launch interactive mode
./scripts/nova-ide-manager/nova-ide-manager.sh

# Launch specific agent with a specific folder
./scripts/nova-ide-manager/nova-ide-manager.sh --launch --instance forge --folder /data-nova/ax/DevOps/DevOps-VSC/NovaIDE

# Launch all agents with settings and extensions sync
./scripts/nova-ide-manager/nova-ide-manager.sh --all --sync-settings --sync-extensions
```

## VSCodium vs VSCode

The Nova IDE Manager is optimized for VSCodium but can also work with VSCode:

- VSCodium is the default and recommended IDE
- The system will automatically detect if VSCodium is installed
- If VSCodium is not found, it will fall back to VSCode
- You can force VSCode usage with the `--use-vscode` option

### VSCodium Installation

If VSCodium is not installed, you can install it using:

```bash
./scripts/download_vscodium.sh
```

Or build it from source:

```bash
./scripts/build_vscodium.sh
```

## Resource Management

The system applies these resource constraints to each instance:
- Node.js heap size: 4GB
- VSCodium max memory: 4GB
- Pre-flight checks to ensure adequate system resources
- Process isolation for conflict avoidance

## API Keys and MCP Settings

The Nova IDE Manager automatically handles:

- API keys for Anthropic, OpenAI, and other services
- MCP settings for the Roo extension
- Configuration for Redis, MongoDB, and Elasticsearch
- Git credentials and settings

## System Requirements

- Linux-based operating system
- Bash shell
- VSCodium or VSCode installed
- At least 2GB of available memory per instance
- Sufficient disk space for extensions and workspaces

## Troubleshooting

### Instance Won't Launch

- Check the log file at `/home/x/.vscodium-isolated/<agent>/logs/`
- Verify you have sufficient memory available
- Ensure the workspace path exists and is accessible

### Roo Extension Not Working

- Confirm the extension exists in your main VSCodium
- Check that MCP settings were properly copied
- Try launching with explicit options: `--sync-extensions --roo`

### Process Already Running

If you see "Instance already running":
1. Verify if the process is actually running with:
   ```bash
   ps -p $(cat /tmp/vscodium-<agent>.pid)
   ```
2. Remove the PID file if the process isn't running:
   ```bash
   rm /tmp/vscodium-<agent>.pid
   ```

## Concurrent Agent Management

The Nova IDE Manager supports running multiple agent instances concurrently:

### Resource Allocation

- Each agent gets dedicated CPU and memory resources
- The system monitors resource usage and prevents overallocation
- Agents can be prioritized based on their role

### Inter-Agent Communication

- Agents can communicate through shared memory
- Message passing is handled through Redis
- File-based communication is supported

### Monitoring Multiple Agents

Use the monitoring script to track all running agents:

```bash
./scripts/monitor_vscodium_instances.sh
```

This provides real-time information on:
- CPU and memory usage per agent
- Active processes
- Extension host status
- Log file activity

## Future Development Plans

- **GUI Version**: Electron-based GUI interface
- **Visual Resource Monitoring**: Graphical system resource display
- **Extension Management**: Fine-grained extension selection
- **Backup & Restore**: Configuration backup capabilities
- **Remote Instances**: SSH-based remote instance management
- **Agent Collaboration**: Enhanced inter-agent communication

## Contributing

We welcome contributions to the Nova IDE Manager:
1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

[MIT License](LICENSE)