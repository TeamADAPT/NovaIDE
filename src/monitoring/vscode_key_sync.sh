#!/bin/bash

# VSCode API Key Sync Script
# Version: 1.0.0
# Author: Forge
# Date: 2025-03-02

# Instance paths
VAERIS_PATH="/home/x/.config/Code-Isolated/vaeris"
THESEUS_PATH="/home/x/.config/Code-Isolated/theseus"
GLOBAL_KEYS_FILE="/home/x/.config/Code/User/globalStorage/api-keys.json"

# Ensure directories exist
mkdir -p "$VAERIS_PATH/User/globalStorage"
mkdir -p "$THESEUS_PATH/User/globalStorage"

# Function to backup keys
backup_keys() {
  local instance_path=$1
  local backup_path="${instance_path}/User/globalStorage/api-keys.backup.json"
  
  if [ -f "${instance_path}/User/globalStorage/api-keys.json" ]; then
    cp "${instance_path}/User/globalStorage/api-keys.json" "$backup_path"
    echo "Backed up keys for $(basename $instance_path)"
  fi
}

# Function to sync keys
sync_keys() {
  local instance_path=$1
  local target_file="${instance_path}/User/globalStorage/api-keys.json"
  
  # Backup existing keys
  backup_keys "$instance_path"
  
  # Copy global keys
  if [ -f "$GLOBAL_KEYS_FILE" ]; then
    cp "$GLOBAL_KEYS_FILE" "$target_file"
    echo "Synced keys to $(basename $instance_path)"
  else
    echo "No global keys file found at $GLOBAL_KEYS_FILE"
  fi
}

# Function to collect keys
collect_keys() {
  # Create global storage directory if it doesn't exist
  mkdir -p "$(dirname "$GLOBAL_KEYS_FILE")"
  
  # Merge keys from all instances
  jq -s '.[0] * .[1] * .[2] // {}' \
    "${VAERIS_PATH}/User/globalStorage/api-keys.json" \
    "${THESEUS_PATH}/User/globalStorage/api-keys.json" \
    "$GLOBAL_KEYS_FILE" > "${GLOBAL_KEYS_FILE}.tmp"
  
  mv "${GLOBAL_KEYS_FILE}.tmp" "$GLOBAL_KEYS_FILE"
  echo "Collected and merged keys to global storage"
}

# Function to set permissions
set_permissions() {
  local file=$1
  if [ -f "$file" ]; then
    chmod 600 "$file"
    echo "Set secure permissions for $(basename $file)"
  fi
}

# Main execution
echo "VSCode API Key Sync"
echo "=================="

# Collect keys from all instances
echo -e "\nCollecting keys..."
collect_keys

# Sync keys to instances
echo -e "\nSyncing keys..."
sync_keys "$VAERIS_PATH"
sync_keys "$THESEUS_PATH"

# Set secure permissions
echo -e "\nSetting permissions..."
set_permissions "$GLOBAL_KEYS_FILE"
set_permissions "${VAERIS_PATH}/User/globalStorage/api-keys.json"
set_permissions "${THESEUS_PATH}/User/globalStorage/api-keys.json"

echo -e "\nDone. API keys synchronized across instances."