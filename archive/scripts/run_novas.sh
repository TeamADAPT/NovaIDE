#!/bin/bash
# Nova VSCodium Fleet Quick Launcher
# Version: 1.0.2
# Date: 2025-03-03
# Author: Forge, Lead DevOps Engineer

# This script is a simple wrapper to execute the direct_launch_novas.sh script
# with minimal dependencies and maximum compatibility

# Directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Log function for consistent output
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] [Nova VSCodium] $1"
}

log "Starting Nova VSCodium Fleet Quick Launcher"

# Check if direct_launch_novas.sh exists
if [ ! -f "${SCRIPT_DIR}/direct_launch_novas.sh" ]; then
  log "ERROR: direct_launch_novas.sh not found in ${SCRIPT_DIR}"
  exit 1
fi

# Make sure the script is executable
chmod +x "${SCRIPT_DIR}/direct_launch_novas.sh"

# Set VSCODIUM_CMD environment variable to force using codium
export VSCODIUM_CMD="codium"

# Execute the direct launch script
log "Launching Nova VSCodium instances..."
"${SCRIPT_DIR}/direct_launch_novas.sh" "$@"