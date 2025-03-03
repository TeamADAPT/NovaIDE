#!/bin/bash

# VSCode File Watcher Fix Script
# Version: 1.0.0
# Author: Forge
# Date: 2025-03-02

# Default watcher settings
declare -A WATCHER_EXCLUDES=(
  ["**/.git/objects/**"]=true
  ["**/.git/subtree-cache/**"]=true
  ["**/node_modules/*/**"]=true
  ["**/.venv/**"]=true
  ["**/build/**"]=true
  ["**/dist/**"]=true
  ["**/logs/**"]=true
  ["**/.cache/**"]=true
)

# Instance paths
VAERIS_PATH="/home/x/.config/Code-Isolated/vaeris/User/settings.json"
THESEUS_PATH="/home/x/.config/Code-Isolated/theseus/User/settings.json"

# System limits check
check_system_limits() {
  echo "Checking system file watch limits..."
  current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
  if [ "$current_limit" -lt 524288 ]; then
    echo "Warning: Low inotify watch limit ($current_limit)"
    echo "Recommended: Add to /etc/sysctl.conf:"
    echo "fs.inotify.max_user_watches=524288"
  else
    echo "System watch limits OK: $current_limit"
  fi
}

# Update settings file
update_settings() {
  local settings_file=$1
  if [ ! -f "$settings_file" ]; then
    echo "Error: Settings file not found: $settings_file"
    return 1
  }

  # Backup settings
  cp "$settings_file" "${settings_file}.bak"

  # Update watcher excludes
  local temp_file=$(mktemp)
  jq '.["files.watcherExclude"] = {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/*/**": true,
    "**/.venv/**": true,
    "**/build/**": true,
    "**/dist/**": true,
    "**/logs/**": true,
    "**/.cache/**": true
  }' "$settings_file" > "$temp_file"

  if [ $? -eq 0 ]; then
    mv "$temp_file" "$settings_file"
    echo "Updated watcher settings in: $settings_file"
  else
    echo "Error updating settings file: $settings_file"
    rm "$temp_file"
    return 1
  fi
}

# Main execution
echo "VSCode File Watcher Fix"
echo "======================"

# Check system limits
check_system_limits

# Update instance settings
echo -e "\nUpdating instance settings..."
update_settings "$VAERIS_PATH"
update_settings "$THESEUS_PATH"

echo -e "\nDone. Restart VSCode instances to apply changes."