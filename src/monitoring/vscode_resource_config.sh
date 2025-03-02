#!/bin/bash

# VSCode Resource Configuration Script
# Created: 2025-02-26 05:18 MST
# Author: Forge
# Purpose: Configure VSCode resources and file watching
# Implementation: Handles inotify limits, watcher excludes, and resource allocation

log_file="/var/log/vscode_resource_config.log"
timestamp=$(date '+%Y%m%d-%H%M')
settings_dir="/home/x/.config/Code/User"
settings_file="$settings_dir/settings.json"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $1" | tee -a "$log_file"
}

backup_settings() {
    if [ -f "$settings_file" ]; then
        cp "$settings_file" "${settings_file}.backup-${timestamp}"
        log_message "Settings backup created: ${settings_file}.backup-${timestamp}"
    fi
}

update_inotify_limit() {
    log_message "Updating inotify watches limit to 5242880"
    
    # Backup sysctl.conf
    sudo cp /etc/sysctl.conf "/etc/sysctl.conf.backup-${timestamp}"
    log_message "sysctl.conf backup created"
    
    # Append new limit if not exists
    if ! grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf; then
        echo "fs.inotify.max_user_watches=5242880" | sudo tee -a /etc/sysctl.conf
        log_message "Added inotify limit to sysctl.conf"
    else
        sudo sed -i 's/fs.inotify.max_user_watches=.*/fs.inotify.max_user_watches=5242880/' /etc/sysctl.conf
        log_message "Updated existing inotify limit"
    fi
    
    # Apply changes
    sudo sysctl -p
    log_message "Applied sysctl changes"
}

update_vscode_settings() {
    local temp_file="${settings_file}.tmp"
    
    # Create settings directory if it doesn't exist
    mkdir -p "$settings_dir"
    
    # Read current settings or create new
    if [ -f "$settings_file" ]; then
        cp "$settings_file" "$temp_file"
    else
        echo "{}" > "$temp_file"
    fi
    
    # Update watcher excludes
    jq '. * {
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
    }' "$temp_file" > "${temp_file}.new"
    
    # Update resource allocation
    jq '. * {
        "window.titleBarStyle": "custom",
        "window.zoomLevel": 0,
        "window.restoreWindows": "all",
        "window.newWindowDimensions": "maximized",
        "files.maxMemoryForLargeFilesMB": 10240,
        "window.autoDetectColorScheme": true
    }' "${temp_file}.new" > "${temp_file}.final"
    
    # Move final file into place
    mv "${temp_file}.final" "$settings_file"
    rm -f "$temp_file" "${temp_file}.new"
    
    # Fix permissions
    chown -R x:x "$settings_dir"
    
    log_message "Updated VSCode settings"
}

configure_resource_limits() {
    # Create systemd override directory
    sudo mkdir -p /etc/systemd/system/code.service.d/
    
    # Create override file
    cat << EOF | sudo tee /etc/systemd/system/code.service.d/override.conf
[Service]
CPUQuota=200%
MemoryMax=10G
TasksMax=infinity
EOF
    
    log_message "Configured systemd resource limits for VSCode"
    
    # Reload systemd
    sudo systemctl daemon-reload
    log_message "Reloaded systemd configuration"
}

main() {
    log_message "Starting VSCode resource configuration"
    
    # Backup current settings
    backup_settings
    
    # Update inotify limit
    update_inotify_limit
    
    # Update VSCode settings
    update_vscode_settings
    
    # Configure resource limits
    configure_resource_limits
    
    log_message "Configuration complete"
    
    # Verify inotify limit
    current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
    log_message "Current inotify limit: $current_limit"
}

main