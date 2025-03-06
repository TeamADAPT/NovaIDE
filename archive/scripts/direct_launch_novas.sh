#!/bin/bash
# Nova VSCodium Direct Launcher
# Version: 1.0.3
# Date: 2025-03-03
# Author: Forge, Lead DevOps Engineer

# This script directly launches VSCodium instances for all Nova agents 
# without requiring system service installation

# Log function for consistent output
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] [Nova VSCodium] $1" | tee -a "${LOG_DIR}/launcher.log"
}

# Configuration
BASE_DIR="${HOME}/.nova-vscodium"
LOG_DIR="${BASE_DIR}/logs"

# Ensure directories exist
mkdir -p "${LOG_DIR}"

# Check for VSCodium executable - Use the known path from launch_nova_vscodium_fleet.sh
VSCODIUM_CMD="/usr/bin/vscodium"

# If not found at the expected location, try other common locations
if [ ! -x "$VSCODIUM_CMD" ]; then
  log "VSCodium not found at $VSCODIUM_CMD, checking alternatives..."
  
  # Try to find VSCodium or VSCode
  for cmd in vscodium codium; do
    if command -v $cmd &> /dev/null; then
      VSCODIUM_CMD=$(command -v $cmd)
      log "Found VSCodium as: $VSCODIUM_CMD"
      break
    fi
  done
  
  # If still not found, check common installation locations
  if [ ! -x "$VSCODIUM_CMD" ]; then
    for location in "/usr/local/bin/vscodium" "/usr/local/bin/codium" "/snap/bin/codium" "/Applications/VSCodium.app/Contents/MacOS/vscodium"; do
      if [ -x "$location" ]; then
        VSCODIUM_CMD=$location
        log "Found VSCodium at location: $VSCODIUM_CMD"
        break
      fi
    done
  fi
fi

# If VSCodium not found, exit with error
if [ ! -x "$VSCODIUM_CMD" ]; then
  log "ERROR: VSCodium not found. Please install VSCodium first."
  echo "VSCodium can be installed from: https://vscodium.com/"
  echo "For Ubuntu/Debian: sudo apt install codium"
  echo "For Fedora/RHEL: sudo dnf install codium"
  echo "For Arch: yay -S vscodium"
  exit 1
fi

log "Starting Nova VSCodium direct launcher using: $VSCODIUM_CMD"

# Nova agent configuration: agent_name:working_directory
AGENTS=(
  "Genesis:/data-nova/ax/DevOps/mcp_master"
  "Synergy:/data-nova/ax/DevOps/mcp_master/mcp-dev"
  "Pathfinder:/data-nova/ax/InfraOps"
  "Ethos:/data-nova/ax/MLOps"
  "Cosmos:/data-nova/ax/NovaOps/NovaSynth"
  "River:/data-nova/ax/InfraOps/ray"
  "Synapse:/data-nova/ax/MLOps/aiml/positions/ml_systems_engineer"
  "Theseus:/data-nova/ax/MLOps/aiml/positions/ml_systems_engineer"
  "Vaeris:/data-nova/ax/NovaOps"
  "Forge:/data-nova/ax/DevOps/DevOps-VSC/NovaIDE"
  "Bridge:/data-nova/ax/RouteOps"
)

# Create base settings file
SETTINGS_FILE="${BASE_DIR}/nova-base-settings.json"
cat > "${SETTINGS_FILE}" << EOF
{
  "workbench.colorTheme": "Default High Contrast",
  "workbench.preferredDarkColorTheme": "Default High Contrast",
  "window.titleBarStyle": "custom",
  "editor.fontSize": 14,
  "editor.fontFamily": "JetBrains Mono, Consolas, monospace",
  "editor.formatOnSave": true,
  "workbench.startupEditor": "none",
  "terminal.integrated.defaultProfile.linux": "bash",
  "window.restoreWindows": "none",
  "files.autoSave": "afterDelay",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.nova/contexts": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.nova/contexts/**": true,
    "**/dist/**": true
  }
}
EOF

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  log "WARNING: jq is not installed. Will use default settings without customization."
  HAS_JQ=false
else
  HAS_JQ=true
fi

# Function to create agent-specific settings
create_agent_settings() {
  local AGENT_NAME="$1"
  local USER_DATA_DIR="$2"
  
  mkdir -p "${USER_DATA_DIR}/User"
  
  # Copy base settings
  cp "${SETTINGS_FILE}" "${USER_DATA_DIR}/User/settings.json"
  
  # Add agent-specific settings if jq is available
  if [ "$HAS_JQ" = true ]; then
    local TEMP_FILE="${USER_DATA_DIR}/User/settings.json.tmp"
    jq ".window.title = \"Nova ${AGENT_NAME} - VSCodium\"" "${USER_DATA_DIR}/User/settings.json" > "${TEMP_FILE}"
    mv "${TEMP_FILE}" "${USER_DATA_DIR}/User/settings.json"
  fi
  
  log "Created settings for ${AGENT_NAME}"
}

# Check if cpulimit is installed
if ! command -v cpulimit &> /dev/null; then
  log "WARNING: cpulimit is not installed. CPU usage will not be limited."
  HAS_CPULIMIT=false
else
  HAS_CPULIMIT=true
fi

# Check if wmctrl is installed (for window management)
if ! command -v wmctrl &> /dev/null; then
  log "WARNING: wmctrl is not installed. Window positioning will not be available."
  HAS_WMCTRL=false
else
  HAS_WMCTRL=true
fi

# Get screen dimensions
SCREEN_WIDTH=1920
SCREEN_HEIGHT=1080
if command -v xrandr &> /dev/null; then
  # Try to get actual screen dimensions
  SCREEN_INFO=$(xrandr --current | grep '*' | uniq | awk '{print $1}' | head -n 1)
  if [ -n "$SCREEN_INFO" ]; then
    SCREEN_WIDTH=$(echo $SCREEN_INFO | cut -d 'x' -f1)
    SCREEN_HEIGHT=$(echo $SCREEN_INFO | cut -d 'x' -f2)
    log "Detected screen resolution: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}"
  fi
fi

# Calculate window positions (grid layout)
COLUMNS=3
ROWS=4
WINDOW_WIDTH=$((SCREEN_WIDTH / COLUMNS))
WINDOW_HEIGHT=$((SCREEN_HEIGHT / ROWS))

# Store all PIDs for monitoring
PIDS=()

# Function to launch an agent VSCodium instance
launch_agent() {
  local AGENT_NAME="$1"
  local WORK_DIR="$2"
  local POSITION="$3"
  
  log "Launching ${AGENT_NAME} for directory ${WORK_DIR}"
  
  # Create agent directories
  local AGENT_DIR="${BASE_DIR}/${AGENT_NAME,,}"
  local USER_DATA_DIR="${AGENT_DIR}/user-data"
  local EXTENSIONS_DIR="${AGENT_DIR}/extensions"
  
  mkdir -p "${USER_DATA_DIR}" "${EXTENSIONS_DIR}"
  
  # Create agent settings
  create_agent_settings "${AGENT_NAME}" "${USER_DATA_DIR}"
  
  # Calculate window position
  local COL=$((POSITION % COLUMNS))
  local ROW=$((POSITION / COLUMNS))
  local X=$((COL * WINDOW_WIDTH))
  local Y=$((ROW * WINDOW_HEIGHT))
  
  # Launch VSCodium with increased memory limit and in a new window
  NODE_OPTIONS="--max-old-space-size=10240" \
  ${VSCODIUM_CMD} \
    --user-data-dir="${USER_DATA_DIR}" \
    --extensions-dir="${EXTENSIONS_DIR}" \
    --enable-proposed-api=all \
    --new-window \
    "${WORK_DIR}" > "${LOG_DIR}/${AGENT_NAME,,}.log" 2>&1 &
  
  local PID=$!
  PIDS+=("${PID}:${AGENT_NAME}")
  echo ${PID} > "${AGENT_DIR}/pid"
  
  # Apply CPU limit if available (200% = 2 cores)
  if [ "$HAS_CPULIMIT" = true ]; then
    cpulimit -p ${PID} -l 200 -b
    log "Applied CPU limit (200%) to ${AGENT_NAME} (PID: ${PID})"
  fi
  
  # Wait a moment for the window to appear
  sleep 3
  
  # Position the window if wmctrl is available
  if [ "$HAS_WMCTRL" = true ]; then
    # Try to find the window by title
    local WINDOW_ID=$(wmctrl -l | grep "${AGENT_NAME}" | awk '{print $1}')
    if [ -n "$WINDOW_ID" ]; then
      wmctrl -i -r "$WINDOW_ID" -e "0,${X},${Y},${WINDOW_WIDTH},${WINDOW_HEIGHT}"
      log "Positioned ${AGENT_NAME} window at ${X},${Y} with size ${WINDOW_WIDTH}x${WINDOW_HEIGHT}"
    else
      log "Could not find window for ${AGENT_NAME} to position it"
    fi
  fi
  
  log "Launched ${AGENT_NAME} (PID: ${PID})"
}

# Launch all agents
POSITION=0
for AGENT_CONFIG in "${AGENTS[@]}"; do
  IFS=':' read -r AGENT_NAME WORK_DIR <<< "${AGENT_CONFIG}"
  launch_agent "${AGENT_NAME}" "${WORK_DIR}" "${POSITION}"
  POSITION=$((POSITION + 1))
  # Add a small delay to prevent resource contention during startup
  sleep 2
done

# Create a simple monitor function
monitor_instances() {
  clear
  echo "Nova VSCodium Instance Monitor ($(date))"
  echo "==============================="
  echo
  printf "%-15s %-10s %-10s %-10s %-20s\n" "AGENT" "PID" "CPU%" "MEM(MB)" "STATUS"
  echo "---------------------------------------------------------------"
  
  for PID_INFO in "${PIDS[@]}"; do
    IFS=':' read -r PID AGENT_NAME <<< "${PID_INFO}"
    
    if ps -p ${PID} > /dev/null; then
      CPU=$(ps -p ${PID} -o %cpu --no-headers | tr -d ' ')
      MEM=$(ps -p ${PID} -o rss --no-headers | tr -d ' ')
      MEM=$((MEM / 1024))  # Convert to MB
      STATUS="RUNNING"
    else
      CPU="-"
      MEM="-"
      STATUS="STOPPED"
    fi
    
    printf "%-15s %-10s %-10s %-10s %-20s\n" "${AGENT_NAME}" "${PID}" "${CPU}" "${MEM}" "${STATUS}"
  done
  
  echo
  echo "Instances launched successfully."
  echo "Log files are in: ${LOG_DIR}"
}

# Show summary
log "All Nova VSCodium instances have been launched"
monitor_instances

# Create a monitoring script
MONITOR_SCRIPT="${BASE_DIR}/monitor.sh"
cat > "${MONITOR_SCRIPT}" << 'EOF'
#!/bin/bash

BASE_DIR="${HOME}/.nova-vscodium"

while true; do
  clear
  echo "Nova VSCodium Instance Monitor ($(date))"
  echo "==============================="
  echo
  printf "%-15s %-10s %-10s %-10s %-20s\n" "AGENT" "PID" "CPU%" "MEM(MB)" "STATUS"
  echo "---------------------------------------------------------------"
  
  for AGENT_DIR in ${BASE_DIR}/*; do
    if [ -d "${AGENT_DIR}" ] && [ -f "${AGENT_DIR}/pid" ]; then
      AGENT_NAME=$(basename "${AGENT_DIR}")
      PID=$(cat "${AGENT_DIR}/pid")
      
      if ps -p ${PID} > /dev/null; then
        CPU=$(ps -p ${PID} -o %cpu --no-headers | tr -d ' ')
        MEM=$(ps -p ${PID} -o rss --no-headers | tr -d ' ')
        MEM=$((MEM / 1024))  # Convert to MB
        STATUS="RUNNING"
      else
        CPU="-"
        MEM="-"
        STATUS="STOPPED"
      fi
      
      printf "%-15s %-10s %-10s %-10s %-20s\n" "${AGENT_NAME}" "${PID}" "${CPU}" "${MEM}" "${STATUS}"
    fi
  done
  
  echo
  echo "Press Ctrl+C to exit"
  sleep 5
done
EOF

chmod +x "${MONITOR_SCRIPT}"
log "Created monitoring script at ${MONITOR_SCRIPT}"

# Output final message
echo
echo "To monitor running instances at any time, run:"
echo "  ${MONITOR_SCRIPT}"
echo