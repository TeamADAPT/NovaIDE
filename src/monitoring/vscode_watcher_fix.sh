#!/bin/bash

# VSCode File Watcher Fix Script
# Created: 2025-02-25 23:57 MST
# Author: Forge
# Purpose: Fix "Visual Studio Code is unable to watch for file changes" error
# Implementation: 10x redundant setting of max_user_watches

log_file="/var/log/vscode_watcher_fix.log"
target_value=524288
attempts=10

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S %Z')] $1" | tee -a "$log_file"
}

check_current_value() {
    cat /proc/sys/fs/inotify/max_user_watches
}

apply_fix() {
    local attempt=$1
    log_message "Attempt $attempt of $attempts"
    
    # Check if setting already exists in sysctl.conf
    if grep -q "fs.inotify.max_user_watches" /etc/sysctl.conf; then
        log_message "Setting already exists in sysctl.conf"
    else
        echo "fs.inotify.max_user_watches=$target_value" | sudo tee -a /etc/sysctl.conf
        log_message "Added setting to sysctl.conf"
    fi
    
    # Apply changes
    sudo sysctl -p
    
    # Verify
    current_value=$(check_current_value)
    log_message "Current value: $current_value"
    
    if [ "$current_value" -eq "$target_value" ]; then
        log_message "Successfully set to target value"
        return 0
    else
        log_message "Failed to set target value"
        return 1
    fi
}

main() {
    log_message "Starting VSCode watcher fix implementation"
    log_message "Target value: $target_value"
    
    initial_value=$(check_current_value)
    log_message "Initial value: $initial_value"
    
    success_count=0
    
    for i in $(seq 1 $attempts); do
        if apply_fix $i; then
            ((success_count++))
        fi
        sleep 1
    done
    
    log_message "Implementation complete"
    log_message "Successful attempts: $success_count/$attempts"
    
    final_value=$(check_current_value)
    log_message "Final value: $final_value"
}

main