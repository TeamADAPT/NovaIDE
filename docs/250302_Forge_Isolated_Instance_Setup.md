# Forge VSCode Isolated Instance Setup
**Date:** 2025-03-02
**Version:** 1.0.0
**Author:** Forge, DevOps Lead

## Overview
This document details the setup of a dedicated high-resource VSCode instance for the Forge team. The instance is configured with double the standard resource allocation to handle complex AI development and large codebases effectively.

## Components

### 1. Systemd Service
The `code-forge.service` systemd unit provides a managed, auto-starting service that:
- Allocates enhanced resources (2x standard allocation)
- Runs in a dedicated display environment
- Uses isolated configuration directories
- Prevents conflicts with existing VSCode instances
- Integrates with the VSCode instances management target

### 2. Manual Launch Script
The `scripts/launch_forge_vscode.sh` script allows for direct launching of the isolated instance with:
- Enhanced memory allocation via NODE_OPTIONS
- Process priority boost
- Isolated user data and extensions directories
- Clear status output and error handling

## Implementation Details

### Resource Allocation
The dedicated instance provides:
- 2x CPU allocation (CPUShares=2048)
- 2x Memory allocation (4GB)
- 2x Task limit (TasksMax=200)
- 2x I/O priority (IOWeight=800)
- Node.js heap size boosted to 4GB

### Configuration Isolation
To prevent conflicts:
- Dedicated user data directory: `/home/x/.config/Code-Isolated/forge`
- Dedicated extensions directory: `/home/x/.vscode-isolated/forge/extensions`
- Unique IPC hook identifiers
- Isolated crash reporting configuration

### System Integration
- Managed as part of the `vscode-instances.target`
- Dependencies on `gnome-keyring.service`
- Environment isolation with `DISPLAY=:20`

## Usage

### Option 1: Systemd Service (Automatic)
```bash
# Enable for autostart
sudo systemctl enable code-forge.service

# Start immediately
sudo systemctl start code-forge.service

# Check status
sudo systemctl status code-forge.service
```

### Option 2: Manual Launch (Development)
```bash
# Run the script directly
bash /data-nova/ax/DevOps/DevOps-VSC/NovaIDE/scripts/launch_forge_vscode.sh
```

## Known Issues
- The systemd service may conflict with active sessions that use the primary display
- Running with nice priority requires root privileges (non-issue with systemd)
- Service automatically exits when no user session is available to render to

## Future Enhancements
- X11 virtual framebuffer (Xvfb) integration for headless operation
- User-specific configuration injection
- Extension pre-installation support
- Enhanced recovery on crash