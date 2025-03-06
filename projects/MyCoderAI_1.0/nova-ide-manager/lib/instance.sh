#!/bin/bash
# =============================================================================
# Nova IDE Manager - Instance Management Module
# Version: 1.0.0
# Date: 2025-03-02
# Author: Forge, DevOps Lead
# =============================================================================
# Provides functions for launching and managing VSCode instances
# =============================================================================

# Check if common module is loaded
if ! type module_loaded &>/dev/null || ! module_loaded "common"; then
  echo "Error: common module must be loaded first"
  exit 1
fi

# Function to launch a VSCode instance
function launch_instance() {
  local instance_name=$1
  local workspace_path=$2
  local sync_settings=$3
  local sync_extensions=$4
  local ensure_roo=$5
  
  # Configuration
  USER_DATA_DIR="/home/x/.config/Code-Isolated/${instance_name}"
  EXTENSIONS_DIR="/home/x/.vscode-isolated/${instance_name}/extensions"
  MAIN_EXTENSIONS_DIR="/home/x/.vscode/extensions"
  MAIN_SETTINGS_DIR="/home/x/.config/Code/User"
  LOG_DIR="/home/x/.vscode-isolated/${instance_name}/logs"
  PID_FILE="/tmp/vscode-${instance_name}.pid"
  
  echo -e "=========================="
  echo -e "Launching instance: ${WHITE}${instance_name}${NC}"
  echo -e "Workspace: ${WHITE}${workspace_path}${NC}"
  
  # Check if instance is already running
  if is_instance_running "$instance_name"; then
    local pid=$(cat "$PID_FILE")
    echo -e "${RED}ERROR: Instance already running with PID $pid${NC}"
    echo -e "${YELLOW}Use the following to terminate:${NC}"
    echo -e "${YELLOW}  kill $pid${NC}"
    return 1
  fi
  
  # Create directories if they don't exist
  if [ ! -d "${USER_DATA_DIR}" ]; then
    echo -e "Creating user data directory..."
    mkdir -p "${USER_DATA_DIR}"
  fi
  
  if [ ! -d "${EXTENSIONS_DIR}" ]; then
    echo -e "Creating extensions directory..."
    mkdir -p "${EXTENSIONS_DIR}"
  fi
  
  if [ ! -d "${LOG_DIR}" ]; then
    echo -e "Creating log directory..."
    mkdir -p "${LOG_DIR}"
  fi
  
  # Sync settings if requested
  if [ "$sync_settings" = true ]; then
    echo -e "Syncing settings from main VSCode..."
    mkdir -p "${USER_DATA_DIR}/User"
    
    # Copy settings files
    if [ -f "${MAIN_SETTINGS_DIR}/settings.json" ]; then
      cp "${MAIN_SETTINGS_DIR}/settings.json" "${USER_DATA_DIR}/User/"
      echo -e "${GREEN}Copied settings.json${NC}"
    fi
    
    if [ -f "${MAIN_SETTINGS_DIR}/keybindings.json" ]; then
      cp "${MAIN_SETTINGS_DIR}/keybindings.json" "${USER_DATA_DIR}/User/"
      echo -e "${GREEN}Copied keybindings.json${NC}"
    fi
    
    if [ -d "${MAIN_SETTINGS_DIR}/snippets" ]; then
      cp -r "${MAIN_SETTINGS_DIR}/snippets" "${USER_DATA_DIR}/User/"
      echo -e "${GREEN}Copied snippets${NC}"
    fi
  fi
  
  # Sync extensions if requested
  if [ "$sync_extensions" = true ]; then
    echo -e "Syncing extensions from main VSCode..."
    
    # Find installed extensions
    if [ -d "$MAIN_EXTENSIONS_DIR" ]; then
      mkdir -p "$EXTENSIONS_DIR"
      
      # Copy extensions
      echo -e "Copying extensions (this may take a moment)..."
      cp -r "$MAIN_EXTENSIONS_DIR"/* "$EXTENSIONS_DIR"
      echo -e "${GREEN}Extensions copied${NC}"
    else
      echo -e "${YELLOW}No extensions found in main VSCode${NC}"
    fi
  fi
  
  # Ensure Roo extension is installed
  if [ "$ensure_roo" = true ]; then
    echo -e "Ensuring Roo extension is available..."
    
    # Check if rooveterinaryinc.roo-cline extension exists
    ROO_EXTENSION=$(find "$MAIN_EXTENSIONS_DIR" -name "rooveterinaryinc.roo-cline*" | head -n 1)
    
    if [ -n "$ROO_EXTENSION" ]; then
      ROO_EXTENSION_DIR=$(basename "$ROO_EXTENSION")
      
      # Make sure the extension directory exists
      mkdir -p "$EXTENSIONS_DIR"
      
      # Copy the extension if it's not already there
      if [ ! -d "$EXTENSIONS_DIR/$ROO_EXTENSION_DIR" ]; then
        echo -e "Copying Roo extension..."
        cp -r "$ROO_EXTENSION" "$EXTENSIONS_DIR/"
        echo -e "${GREEN}Roo extension copied${NC}"
      else
        echo -e "${GREEN}Roo extension already available${NC}"
      fi
      
      # Copy MCP settings
      MCP_SETTINGS_DIR="$MAIN_SETTINGS_DIR/globalStorage/rooveterinaryinc.roo-cline/settings"
      if [ -d "$MCP_SETTINGS_DIR" ]; then
        TARGET_MCP_DIR="$USER_DATA_DIR/User/globalStorage/rooveterinaryinc.roo-cline/settings"
        mkdir -p "$TARGET_MCP_DIR"
        
        echo -e "Copying MCP settings..."
        cp -r "$MCP_SETTINGS_DIR"/* "$TARGET_MCP_DIR"
        echo -e "${GREEN}MCP settings copied${NC}"
      fi
    else
      echo -e "${YELLOW}WARNING: Roo extension not found in main VSCode${NC}"
    fi
  fi
  
  # Set resource limits
  NODE_OPTIONS="--max-old-space-size=4096"
  V8_MAX_OLD_SPACE="4096"
  
  # Environment variables for isolation
  VSCODE_IPC_HOOK_CLI="vscode-ipc-${instance_name}.sock"
  VSCODE_CRASH_REPORTER_ID="vscode-${instance_name}"
  VSCODE_PORTABLE="${USER_DATA_DIR}/portable"
  
  # Create timestamp for logs
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  LOG_FILE="${LOG_DIR}/vscode_${TIMESTAMP}.log"
  
  echo -e "Launch Configuration:"
  echo -e "  Instance Name: ${WHITE}${instance_name}${NC}"
  echo -e "  User Data Dir: ${WHITE}${USER_DATA_DIR}${NC}"
  echo -e "  Extensions Dir: ${WHITE}${EXTENSIONS_DIR}${NC}"
  echo -e "  Node Memory: ${WHITE}${V8_MAX_OLD_SPACE}MB${NC}"
  echo -e "  Log File: ${WHITE}${LOG_FILE}${NC}"
  
  # Build command arguments
  ARGS=(
    "--user-data-dir=${USER_DATA_DIR}"
    "--extensions-dir=${EXTENSIONS_DIR}"
    "--disable-crash-reporter"
    "--disable-telemetry"
    "--ignore-certificate-errors"
    "--disable-features=OutOfBlinkCors"
    "--unity-launch"
    "--new-window"
    "--max-memory=4096M"
    "${workspace_path}"
  )
  
  # Export environment variables
  export NODE_OPTIONS
  export VSCODE_IPC_HOOK_CLI
  export VSCODE_CRASH_REPORTER_ID
  export VSCODE_PORTABLE
  
  # Launch with nohup to keep running after terminal closes
  echo -e "Launching VSCode instance..."
  nohup /usr/share/code/code "${ARGS[@]}" > "${LOG_FILE}" 2>&1 &
  
  # Save PID
  PID=$!
  echo $PID > "$PID_FILE"
  
  echo -e "VSCode instance launched with PID ${PID}"
  echo -e "PID saved to ${PID_FILE}"
  echo -e "Logs are being written to ${LOG_FILE}"
  echo -e "VSCode is now running."
  echo -e "=========================="
  
  # Wait a moment to ensure process started successfully
  sleep 1
  if ! ps -p "$PID" > /dev/null; then
    echo -e "${RED}ERROR: VSCode process failed to start or terminated early!${NC}"
    echo -e "${RED}Check the log file: ${LOG_FILE}${NC}"
    return 1
  fi
  
  return 0
}

# Function to launch multiple instances sequentially
function launch_multiple_instances() {
  local instances=("$@")
  local sync_settings="$SYNC_SETTINGS"
  local sync_extensions="$SYNC_EXTENSIONS"
  local ensure_roo="$ENSURE_ROO"
  
  clear
  echo -e "${CYAN}Launching Selected Instances${NC}"
  echo -e "${YELLOW}=========================${NC}"
  
  for instance in "${instances[@]}"; do
    echo
    echo -e "Instance: ${WHITE}${instance}${NC}"
    
    # Get workspace path from configuration
    local workspace_path=$(get_instance_workspace "$instance")
    if [ -z "$workspace_path" ]; then
      echo -e "${RED}ERROR: Could not find workspace path for instance '$instance'${NC}"
      continue
    fi
    
    launch_instance "$instance" "$workspace_path" "$sync_settings" "$sync_extensions" "$ensure_roo"
  done
  
  echo
  return 0
}

# Function to terminate an instance
function terminate_instance() {
  local instance_name=$1
  local force=$2
  
  # Check if instance is running
  if ! is_instance_running "$instance_name"; then
    echo -e "${RED}ERROR: Instance '$instance_name' is not running${NC}"
    return 1
  fi
  
  # Get PID
  local pid_file="/tmp/vscode-${instance_name}.pid"
  local pid=$(cat "$pid_file")
  
  # Kill process
  if [ "$force" = true ]; then
    echo -e "Forcefully terminating instance '$instance_name' (PID: $pid)..."
    kill -9 "$pid"
  else
    echo -e "Gracefully terminating instance '$instance_name' (PID: $pid)..."
    kill "$pid"
  fi
  
  # Wait for process to terminate
  local timeout=10
  while is_instance_running "$instance_name" && [ "$timeout" -gt 0 ]; do
    sleep 1
    timeout=$((timeout - 1))
  done
  
  # Check if process was terminated
  if is_instance_running "$instance_name"; then
    echo -e "${RED}ERROR: Failed to terminate instance '$instance_name'${NC}"
    echo -e "${YELLOW}Try using --force option${NC}"
    return 1
  else
    echo -e "${GREEN}Instance '$instance_name' terminated successfully${NC}"
    # Remove PID file
    rm "$pid_file"
    return 0
  fi
}

# Mark this module as loaded
mark_module_loaded "instance"