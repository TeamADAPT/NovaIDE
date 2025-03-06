# Nova IDE Manager

*Version: 2.0.0*  
*Date: 2025-03-02 22:03 MST*  
*Author: Forge, DevOps Lead*

## Overview

Nova IDE Manager is an interactive, terminal-based launcher for managing VSCode/VSCodium instances for multiple team members and projects. It provides a comprehensive interface for launching, managing, and monitoring isolated IDE instances with proper resource constraints and configuration.

![Nova IDE Manager Screenshot](https://example.com/screenshot.png)

## Key Features

- **Interactive Terminal UI**: Full-featured menu system with instance selection
- **System Resource Monitoring**: Real-time display of system resources
- **Instance Management**: Add, launch, and monitor instances
- **Configuration Persistence**: Saved instance configurations
- **Settings Synchronization**: Copy settings from main VSCode instance
- **Extension Management**: Transfer extensions between instances
- **Roo Extension Support**: Automatic Roo extension and MCP settings integration

## Getting Started

### Installation

1. Clone the repository if you haven't already:
   ```bash
   git clone https://github.com/example/nova-ide-manager.git
   ```

2. Make the script executable:
   ```bash
   chmod +x scripts/launch_forge_manual.sh
   ```

3. Run the manager:
   ```bash
   ./scripts/launch_forge_manual.sh
   ```

## User Interface

The Nova IDE Manager presents a full-screen terminal user interface with the following components:

### Header Section
- Nova IDE Manager logo and version
- System information display (memory, CPU, disk usage, running instances)

### Instance Selection
- Checkbox-based selection of available instances
- Running status indicators
- Instance workspace paths

### Menu Options
- **Toggle All**: Select or deselect all instances
- **Add New Instance**: Add a new instance configuration
- **Launch Selected**: Launch all selected instances
- **Sync Settings**: Toggle settings synchronization
- **Sync Extensions**: Toggle extension synchronization 
- **Toggle Roo Extension**: Enable/disable Roo extension handling
- **Quit**: Exit the manager

### Settings Status
- Visual indicators of current settings options

## Usage Guide

### Managing Instances

#### Adding a New Instance

1. Select "Add New Instance" from the menu
2. Enter a name for the instance (typically an agent name)
3. Provide the workspace path for the instance
4. If the directory doesn't exist, you'll be prompted to create it

#### Selecting Instances to Launch

1. Use the number keys to toggle selection of individual instances
2. Use "Toggle All" to select or deselect all instances at once

#### Launching Instances

1. Select one or more instances using the checkboxes
2. Choose "Launch Selected" to start the instances
3. The system will display launch progress for each instance
4. Each instance will open in its own window

### Configuration Options

#### Settings Synchronization

When enabled (default), the following settings are copied from your main VSCode instance:
- `settings.json`: Your VSCode preferences
- `keybindings.json`: Custom keyboard shortcuts
- `snippets/`: Your code snippets

#### Extension Synchronization

When enabled (default), all extensions from your main VSCode installation are copied to the isolated instance.

#### Roo Extension

When enabled (default), the Roo extension is automatically transferred to the isolated instance, along with its MCP settings.

## Directory Structure

The Nova IDE Manager creates and manages these directories:

```
~/.config/nova-vscode-manager/           # Configuration directory
~/.config/nova-vscode-manager/instances.conf  # Instance configurations

/home/x/.config/Code-Isolated/<instance>/    # User data directories
/home/x/.vscode-isolated/<instance>/extensions/  # Extension directories
/home/x/.vscode-isolated/<instance>/logs/    # Log files
```

## VSCode vs VSCodium

While the script is configured for VSCode by default, it can be used with VSCodium with minor modifications:

1. Change the executable path from `/usr/share/code/code` to the VSCodium path
2. Update the configuration paths if using different directories

## Resource Management

The system applies these resource constraints to each instance:
- Node.js heap size: 4GB
- VSCode max memory: 4GB
- Pre-flight checks to ensure adequate system resources
- Process isolation for conflict avoidance

## System Requirements

- Linux-based operating system
- Bash shell
- VSCode or VSCodium installed
- At least 2GB of available memory per instance
- Sufficient disk space for extensions and workspaces

## Troubleshooting

### Instance Won't Launch

- Check the log file at `/home/x/.vscode-isolated/<instance>/logs/`
- Verify you have sufficient memory available
- Ensure the workspace path exists and is accessible

### Roo Extension Not Working

- Confirm the extension exists in your main VSCode
- Check that MCP settings were properly copied
- Try launching with explicit options: `--sync-extensions --roo`

### Process Already Running

If you see "Instance already running":
1. Verify if the process is actually running with:
   ```bash
   ps -p $(cat /tmp/vscode-<instance>.pid)
   ```
2. Remove the PID file if the process isn't running:
   ```bash
   rm /tmp/vscode-<instance>.pid
   ```

## Future Development Plans

- **GUI Version**: Electron-based GUI interface
- **Visual Resource Monitoring**: Graphical system resource display
- **Extension Management**: Fine-grained extension selection
- **Backup & Restore**: Configuration backup capabilities
- **Remote Instances**: SSH-based remote instance management

## Contributing

We welcome contributions to the Nova IDE Manager:
1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## License

[MIT License](LICENSE.md)