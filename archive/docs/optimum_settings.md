# VSCode/VSCodium Optimum Settings
Version: 1.0.0
Date: 2025-03-03
Author: Forge

## Resource Management Optimizations

### Process Resource Allocation
- **Main Process**: 2 cores (200% CPU), 10GB memory
- **Extension Host**: 1 core (100% CPU), 4GB memory
- **Total per Nova**: 3 cores, 14GB memory
- **Process Priority**: High (nice -n -10)

### Memory Settings
```
NODE_OPTIONS="--max-old-space-size=4096"
VSCODE_UNLIMITED_MEM=1
files.maxMemoryForLargeFilesMB: 10240
```

### Systemd Service Configuration
```
CPUShares=2048
MemoryLimit=4G (for extension host)
TasksMax=200
IOWeight=800
```

## Process Isolation Architecture

### Directory Structure
```
~/.config/Code-Isolated/<nova>/
├── settings.json
├── keybindings.json
└── state/

~/.vscode-isolated/<nova>/
├── extensions/
└── data/
```

### Process Separation
- Main VSCode process
- Separate extension host process
- Unique IPC hooks to prevent conflicts

### Environment Variables
```
VSCODE_AMD_ENTRYPOINT=1
VSCODE_EXTHOST_WILL_SEND_SOCKET=1
VSCODE_IPC_HOOK_CLI=unique_<nova>_vscode_ipc_hook
VSCODE_IPC_HOOK=unique_<nova>_vscode_hook
```

## File System Optimizations

### File Watcher Settings
```json
"files.watcherExclude": {
  "**/.git/objects/**": true,
  "**/.git/subtree-cache/**": true,
  "**/node_modules/*/**": true,
  "**/.venv/**": true,
  "**/build/**": true,
  "**/dist/**": true,
  "**/logs/**": true,
  "**/.cache/**": true
}
```

### Window Settings
```json
"window.restoreWindows": "all",
"window.newWindowDimensions": "maximized",
"window.titleBarStyle": "custom"
```

## VSCodium-Specific Optimizations

### Directory Structure
```
~/.config/VSCodium-Isolated/<nova>/
├── settings.json
├── keybindings.json
└── state/

~/.vscodium-isolated/<nova>/
├── extensions/
└── data/
```

### Resource Allocation
- Apply the same resource allocation as VSCode
- Ensure proper process isolation
- Use systemd services for process management

### Service Configuration
Create systemd service files for VSCodium instances:
```
[Unit]
Description=VSCodium Instance - %i
After=network.target gnome-keyring.service
Requires=gnome-keyring.service
StartLimitIntervalSec=0

[Service]
Type=simple
User=x
Environment=DISPLAY=:20
Environment=XAUTHORITY=/home/x/.Xauthority
Environment=NODE_OPTIONS=--max-old-space-size=4096
Environment=VSCODE_UNLIMITED_MEM=1
Environment=VSCODE_AMD_ENTRYPOINT=1
Environment=VSCODE_EXTHOST_WILL_SEND_SOCKET=1
Environment=VSCODE_IPC_HOOK_CLI=unique_%i_vscodium_ipc_hook
Environment=VSCODE_IPC_HOOK=unique_%i_vscodium_hook
ExecStart=/usr/bin/vscodium \
    --user-data-dir=/home/x/.config/VSCodium-Isolated/%i \
    --extensions-dir=/home/x/.vscodium-isolated/%i/extensions \
    /data-nova/ax/%i
CPUShares=2048
MemoryLimit=10G
TasksMax=200
IOWeight=800
Restart=always
RestartSec=1

[Install]
WantedBy=multi-user.target
```

### Extension Host Service
```
[Unit]
Description=VSCodium Extension Host for %i
After=vscodium@%i.service

[Service]
Type=simple
User=x
Group=x
Environment=DISPLAY=:20
Environment=XAUTHORITY=/home/x/.Xauthority
Environment=NODE_OPTIONS=--max-old-space-size=4096
ExecStart=/usr/bin/vscodium --type=extensionHost --user-data-dir=/home/x/.config/VSCodium-Isolated/%i --extensions-dir=/home/x/.vscodium-isolated/%i/extensions
CPUShares=1024
MemoryLimit=4G
TasksMax=100
IOWeight=400
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Launch Script
Create a launch script for VSCodium instances:
```bash
#!/bin/bash
# VSCodium instance launcher with enhanced resources
# Version: 1.0.0
# Date: 2025-03-03
# Author: Forge

NOVA_NAME="$1"
NOVA_USER_DIR="/home/x/.config/VSCodium-Isolated/$NOVA_NAME"
NOVA_EXT_DIR="/home/x/.vscodium-isolated/$NOVA_NAME/extensions"
PROJECT_DIR="/data-nova/ax/$NOVA_NAME"

# Create directories if they don't exist
if [ ! -d "$NOVA_USER_DIR/User" ]; then
    echo "Creating user directory structure..."
    mkdir -p "$NOVA_USER_DIR/User/globalStorage"
    chmod 700 "$NOVA_USER_DIR"
fi

if [ ! -d "$NOVA_EXT_DIR" ]; then
    echo "Creating extensions directory..."
    mkdir -p "$NOVA_EXT_DIR/extensions"
    chmod 700 "$NOVA_EXT_DIR"
fi

# Enhanced resource allocation through environment variables
export NODE_OPTIONS="--max-old-space-size=4096"
export VSCODE_UNLIMITED_MEM=1
export VSCODE_AMD_ENTRYPOINT=1
export VSCODE_EXTHOST_WILL_SEND_SOCKET=1
export VSCODE_IPC_HOOK_CLI="unique_${NOVA_NAME}_vscodium_ipc_hook"
export VSCODE_IPC_HOOK="unique_${NOVA_NAME}_vscodium_hook"

# Launch VSCodium with isolated configuration
echo "Launching $NOVA_NAME VSCodium instance with enhanced resources..."
echo "User data directory: $NOVA_USER_DIR"
echo "Extensions directory: $NOVA_EXT_DIR"
echo "Project directory: $PROJECT_DIR"

DISABLE_KEYTAR=1 \
nice -n -10 \
vscodium --user-data-dir="$NOVA_USER_DIR" \
       --extensions-dir="$NOVA_EXT_DIR" \
       "$PROJECT_DIR"

echo "VSCodium launched. Press Ctrl+C to terminate this script."