#!/bin/bash

# VSCode Window Isolation Script
# Version: 1.0.0
# Created: 2025-03-02 10:35 MST
# Author: Forge
# Purpose: Manage isolated VSCode windows with dedicated extension hosts
# Implementation: Process and resource isolation for Nova-specific instances

set -euo pipefail
IFS=$'\n\t'

# Configuration paths
LOG_DIR="/data-nova/ax/DevOps/logs/vscode"
METRICS_DIR="/data-nova/ax/DevOps/metrics/vscode"
SETTINGS_BASE_DIR="/home/x/.config/Code-Isolated"
EXTENSION_BASE_DIR="/home/x/.vscode-isolated"
WORKSPACE_BASE_DIR="/home/x/.vscode-workspaces"

# Resource limits
MAIN_CPU_QUOTA="200"
MAIN_MEMORY_MAX="10G"
EXTENSION_CPU_QUOTA="100"
EXTENSION_MEMORY_MAX="4G"
EXTENSION_TASKS_MAX="100"

log_message() {
    local nova_name=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S %Z')
    echo "[$timestamp] [$nova_name] $message" | tee -a "$LOG_DIR/${nova_name}/window.log"
}

setup_directories() {
    local nova_name=$1
    
    # Create required directories
    mkdir -p "$LOG_DIR/${nova_name}"
    mkdir -p "$METRICS_DIR/${nova_name}"
    mkdir -p "$SETTINGS_BASE_DIR/$nova_name"
    mkdir -p "$EXTENSION_BASE_DIR/$nova_name"
    mkdir -p "$WORKSPACE_BASE_DIR/$nova_name"
    
    # Set permissions
    chown -R x:x "$LOG_DIR/${nova_name}"
    chown -R x:x "$METRICS_DIR/${nova_name}"
    chown -R x:x "$SETTINGS_BASE_DIR"
    chown -R x:x "$EXTENSION_BASE_DIR"
    chown -R x:x "$WORKSPACE_BASE_DIR"
    
    log_message "$nova_name" "Directories created and permissions set"
}

create_settings() {
    local nova_name=$1
    local mode=$2
    local settings_dir="$SETTINGS_BASE_DIR/$nova_name"
    
    # Create base settings
    cat > "$settings_dir/settings.json" << EOF
{
    "window.title": "\${activeEditorShort} - $nova_name ($mode)",
    "files.watcherExclude": {
        "**/.git/objects/**": true,
        "**/.git/subtree-cache/**": true,
        "**/node_modules/**": true,
        "**/env/**": true,
        "**/venv/**": true,
        "**/.hg/store/**": true,
        "**/dist/**": true,
        "**/.cache/**": true
    },
    "files.exclude": {
        "**/.git": true,
        "**/.svn": true,
        "**/.hg": true,
        "**/CVS": true,
        "**/.DS_Store": true,
        "**/Thumbs.db": true,
        "**/node_modules": true,
        "**/dist": true,
        "**/.cache": true
    },
    "search.followSymlinks": false,
    "files.useExperimentalFileWatcher": true,
    "workbench.enableExperiments": false,
    "workbench.startupEditor": "none",
    "workbench.statusBar.visible": true,
    "workbench.tips.enabled": false,
    "editor.minimap.enabled": false,
    "editor.scrollBeyondLastLine": false,
    "editor.renderWhitespace": "selection",
    "editor.suggestSelection": "first",
    "editor.snippetSuggestions": "top",
    "extensions.autoCheckUpdates": false,
    "extensions.autoUpdate": false,
    "extensions.ignoreRecommendations": true,
    "extensions.closeExtensionHostProcess": true,
    "extensions.experimental.affinity": {
        "roo.cline": 1,
        "ms-python.python": 2,
        "github.copilot": 3
    }
}
EOF
    
    log_message "$nova_name" "Settings created"
}

create_systemd_service() {
    local nova_name=$1
    local service_name="code-$nova_name"
    local override_dir="/etc/systemd/system/$service_name.service.d"
    
    # Create override directory
    mkdir -p "$override_dir"
    
    # Create override file
    cat > "$override_dir/override.conf" << EOF
[Service]
CPUQuota=${MAIN_CPU_QUOTA}%
MemoryMax=${MAIN_MEMORY_MAX}
TasksMax=infinity
Environment=VSCODE_LOGS=/data-nova/ax/DevOps/logs/vscode/${nova_name}
Environment=VSCODE_EXTENSIONS=/home/x/.vscode-isolated/${nova_name}/extensions
Environment=VSCODE_DATA=/home/x/.vscode-isolated/${nova_name}/data
EOF
    
    # Create extension host service
    local ext_service_name="code-extension-host-$nova_name"
    local ext_override_dir="/etc/systemd/system/$ext_service_name.service.d"
    
    mkdir -p "$ext_override_dir"
    
    cat > "$ext_override_dir/override.conf" << EOF
[Service]
CPUQuota=${EXTENSION_CPU_QUOTA}%
MemoryMax=${EXTENSION_MEMORY_MAX}
TasksMax=${EXTENSION_TASKS_MAX}
Environment=VSCODE_LOGS=/data-nova/ax/DevOps/logs/vscode/${nova_name}
Environment=VSCODE_EXTENSIONS=/home/x/.vscode-isolated/${nova_name}/extensions
Environment=VSCODE_DATA=/home/x/.vscode-isolated/${nova_name}/data
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    log_message "$nova_name" "Systemd services created"
}

launch_window() {
    local nova_name=$1
    local mode=$2
    local llm=$3
    local workspace_path=$4
    
    # Set up environment
    export VSCODE_USER_DATA_DIR="$SETTINGS_BASE_DIR/$nova_name"
    export VSCODE_EXTENSIONS_DIR="$EXTENSION_BASE_DIR/$nova_name"
    export ROO_MODE="$mode"
    export ROO_LLM="$llm"
    
    # Launch VSCode with workspace
    code --user-data-dir="$VSCODE_USER_DATA_DIR" \
         --extensions-dir="$VSCODE_EXTENSIONS_DIR" \
         --disable-extensions \
         --max-memory=3072 \
         --verbose \
         "$workspace_path" &
    
    log_message "$nova_name" "Window launched with mode=$mode llm=$llm workspace=$workspace_path"
}

main() {
    if [ $# -ne 5 ]; then
        echo "Usage: $0 new <nova_name> <mode> <llm> <workspace_path>"
        exit 1
    fi
    
    local command=$1
    local nova_name=$2
    local mode=$3
    local llm=$4
    local workspace_path=$5
    
    log_message "$nova_name" "Starting window isolation for $nova_name"
    
    setup_directories "$nova_name"
    create_settings "$nova_name" "$mode"
    create_systemd_service "$nova_name"
    launch_window "$nova_name" "$mode" "$llm" "$workspace_path"
    
    log_message "$nova_name" "Window isolation complete"
}

main "$@"