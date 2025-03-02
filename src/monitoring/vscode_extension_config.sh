#!/bin/bash

# VSCode Extension Resource Configuration Script
# Created: 2025-03-01 23:52 MST
# Author: Forge
# Purpose: Configure resource limits for VSCode extensions
# Implementation: Uses extension host process management

log_file="/var/log/vscode_extension_config.log"
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

update_extension_settings() {
    local temp_file="${settings_file}.tmp"
    
    # Create settings directory if it doesn't exist
    mkdir -p "$settings_dir"
    
    # Read current settings or create new
    if [ -f "$settings_file" ]; then
        cp "$settings_file" "$temp_file"
    else
        echo "{}" > "$temp_file"
    fi
    
    # Update extension host settings
    jq '. * {
        "extensions.autoCheckUpdates": false,
        "extensions.autoUpdate": false,
        "extensions.ignoreRecommendations": true,
        "extensions.closeExtensionHostProcess": true,
        "extensions.experimental.affinity": {
            "roo.cline": 1,
            "ms-python.python": 2,
            "github.copilot": 3
        }
    }' "$temp_file" > "${temp_file}.new"
    
    # Move final file into place
    mv "${temp_file}.new" "$settings_file"
    rm -f "$temp_file"
    
    # Fix permissions
    chown -R x:x "$settings_dir"
    
    log_message "Updated extension settings"
}

configure_extension_host() {
    # Create systemd override directory for extension host
    sudo mkdir -p /etc/systemd/system/code-extension-host.service.d/
    
    # Create override file
    cat << EOF | sudo tee /etc/systemd/system/code-extension-host.service.d/override.conf
[Service]
CPUQuota=100%
MemoryMax=4G
TasksMax=100
EOF
    
    log_message "Configured extension host resource limits"
    
    # Reload systemd
    sudo systemctl daemon-reload
    log_message "Reloaded systemd configuration"
}

main() {
    log_message "Starting VSCode extension configuration"
    
    # Backup current settings
    backup_settings
    
    # Update extension settings
    update_extension_settings
    
    # Configure extension host
    configure_extension_host
    
    log_message "Configuration complete"
}

main