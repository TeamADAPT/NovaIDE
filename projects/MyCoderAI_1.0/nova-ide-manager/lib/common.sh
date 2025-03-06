#!/bin/bash
# =============================================================================
# Nova IDE Manager - Common Utilities
# Version: 1.0.0
# Date: 2025-03-02
# Author: Forge, DevOps Lead
# =============================================================================
# Common utilities, variables, and functions used across modules
# =============================================================================

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration file paths
CONFIG_DIR="/home/x/.config/nova-vscode-manager"
INSTANCES_FILE="$CONFIG_DIR/instances.conf"

# Default settings
SYNC_SETTINGS=true
SYNC_EXTENSIONS=true
ENSURE_ROO=true

# Function to check if a module is loaded already
function module_loaded() {
  local module_name=$1
  [[ ${LOADED_MODULES[*]} =~ (^|[[:space:]])"$module_name"($|[[:space:]]) ]] && return 0 || return 1
}

# Function to mark a module as loaded
function mark_module_loaded() {
  local module_name=$1
  LOADED_MODULES+=("$module_name")
}

# Function to check if an instance is running
function is_instance_running() {
  local instance_name=$1
  local pid_file="/tmp/vscode-${instance_name}.pid"
  
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null; then
      return 0 # True (running)
    fi
  fi
  
  return 1 # False (not running)
}

# Initialize modules tracking array
declare -a LOADED_MODULES=()

# Mark this module as loaded
mark_module_loaded "common"