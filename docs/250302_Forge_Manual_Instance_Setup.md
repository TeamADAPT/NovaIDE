# Forge Manual Instance Setup

*Version: 1.1.0*  
*Date: 2025-03-02 21:53 MST*  
*Author: Forge, DevOps Lead*

## Overview

This document provides instructions for using the enhanced manual Forge VSCode instance launcher, which offers a non-systemd approach to running isolated VSCode instances with appropriate resource limitations. This alternative approach was created after experiencing resource management issues with the systemd-based solution.

## Motivation

While systemd services provide good integration with the system startup process and dependency management, there are cases where a more direct approach is preferable:

1. Easier debugging of process issues
2. More direct control over the environment
3. Ability to run without elevated privileges
4. Simpler resource monitoring
5. VM environments with sufficient resources but preference for direct process management

## Prerequisites

- VSCode installed on the system
- Bash shell environment
- At least 2GB of available memory
- Administrative access (only for initial setup)

## Manual Launcher Features

The `launch_forge_manual.sh` script provides:

- Isolated user data and extensions directories
- Resource limitation through environment variables
- Pre-flight system checks
- Logging capabilities
- Process tracking via PID file
- Graceful termination capabilities
- UI performance optimizations
- Settings and extensions synchronization
- Roo extension and MCP settings support
- Command-line options for flexible usage

## Directory Structure

The manual launcher creates and uses the following directory structure:

```
/home/x/.config/Code-Isolated/forge/       # User data directory
/home/x/.vscode-isolated/forge/extensions/ # Extensions directory
/home/x/.vscode-isolated/forge/logs/       # Log files
```

## Command-Line Options

The launcher script now supports several command-line options:

| Option | Description |
|--------|-------------|
| `-h, --help` | Show help information |
| `-f, --folder <path>` | Open a specific folder |
| `-w, --workspace <path>` | Open a specific workspace file |
| `-s, --sync-settings` | Sync settings from main VSCode installation |
| `-e, --sync-extensions` | Sync extensions from main VSCode installation |
| `-a, --all` | Open all windows from default VSCode |
| `-r, --roo` | Ensure Roo extension is enabled (default: true) |
| `-c, --clean` | Start with a clean user data directory |

## Usage Examples

### Basic Usage

```bash
# Make the script executable (only needed once)
chmod +x scripts/launch_forge_manual.sh

# Launch with default settings
./scripts/launch_forge_manual.sh
```

### Sync Settings and Extensions

To start with settings and extensions from your main VSCode:

```bash
./scripts/launch_forge_manual.sh --sync-settings --sync-extensions
```

### Open a Specific Project

```bash
./scripts/launch_forge_manual.sh --folder /path/to/your/project
```

### Open a Workspace File

```bash
./scripts/launch_forge_manual.sh --workspace /path/to/your/project.code-workspace
```

### Clean Start

To start with a fresh user data directory (useful for troubleshooting):

```bash
./scripts/launch_forge_manual.sh --clean
```

## Synchronization Details

### Settings Synchronization

When using the `--sync-settings` option, the script copies:

- `settings.json` - Your VSCode preferences
- `keybindings.json` - Custom keyboard shortcuts
- `snippets/` - Your code snippets

### Extension Synchronization

When using the `--sync-extensions` option, the script:

1. Copies all extensions from your main VSCode installation
2. Preserves any existing extensions in the isolated instance

### Roo Extension Handling

With the `--roo` option (enabled by default), the script:

1. Locates the Roo extension in the main VSCode
2. Copies it to the isolated instance if not already present
3. Copies MCP settings to ensure proper functionality

## Monitoring and Managing the Instance

### Logs

The script creates a log file at:
```
/home/x/.vscode-isolated/forge/logs/vscode_YYYYMMDD_HHMMSS.log
```

You can monitor the logs with:
```bash
tail -f /home/x/.vscode-isolated/forge/logs/vscode_*.log
```

### Terminating the Instance

The script creates a PID file at `/tmp/vscode-forge.pid`. To terminate the instance:

```bash
# Using the PID stored in the file
kill $(cat /tmp/vscode-forge.pid)

# If needed, forcefully terminate
kill -9 $(cat /tmp/vscode-forge.pid)
```

## Resource Management

The manual launcher implements the following resource management approaches:

### Memory Controls

- Node.js heap size limit: 4GB
- VSCode max memory parameter: 4GB

### Process Controls

- Pre-flight checks of system resources
- Warning when system memory is insufficient
- Verification of running VSCode instances

### Input/Output Controls

- Log file generation for debugging
- Process tracking via PID file
- Signal handling for graceful termination

## Comparing Approaches

| Feature | Manual Launcher | Systemd Service |
|---------|----------------|-----------------|
| Requires root | No | Yes (for service) |
| Auto-start on boot | No | Yes |
| Dependency management | Manual | Automatic |
| Resource monitoring | Simple | Via systemd |
| Debugging | Direct access | Through journal |
| Live log access | Direct file | journalctl |
| Process isolation | Environment vars | Namespaces |
| Settings sync | Command-line option | Manual setup |
| Extensions sync | Command-line option | Manual setup |
| Window flexibility | Multiple options | Fixed configuration |

## Troubleshooting

### Insufficient Memory

If the script warns about insufficient memory:
- Close other applications to free memory
- Reduce the memory allocation in the script
- Consider rebooting if memory is fragmented

### Process Already Running

If the script indicates that a Forge process is already running:
- Verify if the process is actually running with `ps -p $(cat /tmp/vscode-forge.pid)`
- Terminate the existing process if needed
- Remove the PID file if it's stale: `rm /tmp/vscode-forge.pid`

### VSCode Crashes on Start

If VSCode crashes immediately:
- Check the log file for errors
- Verify the user data directories are accessible
- Ensure VSCode is properly installed
- Try starting with fewer extensions: `--clean`

### Settings Not Appearing

If your settings don't appear to be synchronized:
- Verify the path to your main VSCode settings is correct
- Run with explicit settings sync: `--sync-settings`
- Check log file for any errors during settings copy
- Try manually copying settings to the isolated directory

### Roo Extension Issues

If the Roo extension isn't working:
- Verify the Roo extension exists in your main VSCode
- Check the log file for errors during extension copying
- Try running with explicit extension sync: `--sync-extensions --roo`
- Ensure MCP settings were properly copied

## Next Steps

1. Add automatic extension installation
2. Implement session persistence
3. Create a companion script for easy termination
4. Add support for specific extension versions

## References

- VSCode CLI documentation: https://code.visualstudio.com/docs/editor/command-line
- Node.js memory management: https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes
- Bash process management: https://www.gnu.org/software/bash/manual/html_node/Process-Substitution.html