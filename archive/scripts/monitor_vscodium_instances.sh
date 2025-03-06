#!/bin/bash
# monitor_vscodium_instances.sh
# Monitor VSCode/VSCodium instances and display resource usage
#
# This script monitors VSCode/VSCodium instances and displays resource usage in real-time
#
# Usage: ./scripts/monitor_vscodium_instances.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_DIR/logs/vscodium"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo -e "${BLUE}${BOLD}VSCode/VSCodium Instance Monitor${NC}"
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo

# Function to get VSCode/VSCodium instances
get_instances() {
  # Look for both Code-Isolated and vscodium-isolated directories in process list
  ps aux | grep -E "code.*--user-data-dir=.*/(Code-Isolated|vscodium-isolated)/([^/]+)" | grep -v grep | 
  sed -E 's/.*\/(Code-Isolated|vscodium-isolated)\/([^/]+).*/\2/' | sort | uniq
}

# Function to get VSCode/VSCodium process info
get_process_info() {
  local instance=$1
  
  # Get VSCode/VSCodium process ID for this instance
  local pid=$(ps aux | grep -E "code.*/(Code-Isolated|vscodium-isolated)/$instance" | grep -v grep | head -n 1 | awk '{print $2}')
  
  if [ -n "$pid" ]; then
    # Get working directory
    local working_dir=$(pwdx $pid 2>/dev/null | awk '{print $2}' || echo "Unknown")
    
    # Get all child processes
    local all_pids="$pid"
    local child_pids=$(pgrep -P "$pid" 2>/dev/null || echo "")
    
    # Add child PIDs to all_pids
    for child_pid in $child_pids; do
      all_pids="$all_pids $child_pid"
      # Get grandchild PIDs
      local grandchild_pids=$(pgrep -P "$child_pid" 2>/dev/null || echo "")
      for grandchild_pid in $grandchild_pids; do
        all_pids="$all_pids $grandchild_pid"
      done
    done
    
    # Get resource usage for all processes
    local total_cpu=0
    local total_mem=0
    local total_vsz=0
    local total_rss=0
    
    for p in $all_pids; do
      local cpu=$(ps -p "$p" -o %cpu | tail -n 1 | tr -d ' ' 2>/dev/null || echo "0")
      local mem=$(ps -p "$p" -o %mem | tail -n 1 | tr -d ' ' 2>/dev/null || echo "0")
      local vsz=$(ps -p "$p" -o vsz | tail -n 1 | tr -d ' ' 2>/dev/null || echo "0")
      local rss=$(ps -p "$p" -o rss | tail -n 1 | tr -d ' ' 2>/dev/null || echo "0")
      
      total_cpu=$(echo "$total_cpu + $cpu" | bc 2>/dev/null || echo "$total_cpu")
      total_mem=$(echo "$total_mem + $mem" | bc 2>/dev/null || echo "$total_mem")
      total_vsz=$(echo "$total_vsz + $vsz" | bc 2>/dev/null || echo "$total_vsz")
      total_rss=$(echo "$total_rss + $rss" | bc 2>/dev/null || echo "$total_rss")
    done
    
    # Convert VSZ and RSS to MB
    total_vsz=$(echo "scale=2; $total_vsz / 1024" | bc 2>/dev/null || echo "$total_vsz")
    total_rss=$(echo "scale=2; $total_rss / 1024" | bc 2>/dev/null || echo "$total_rss")
    
    # Log resource usage
    echo "$(date +"%Y-%m-%d %H:%M:%S"),$instance,$pid,$total_cpu,$total_mem,$total_vsz,$total_rss,$working_dir" >> "$LOG_DIR/$instance.csv"
    
    # Return resource usage
    echo "$instance,$pid,$total_cpu,$total_mem,$total_vsz,$total_rss,$working_dir"
  else
    echo "$instance,N/A,0,0,0,0,Unknown"
  fi
}

# Function to display resource usage
display_resource_usage() {
  local instances=$(get_instances)
  
  if [ -z "$instances" ]; then
    echo -e "${RED}No VSCode/VSCodium instances running.${NC}"
    return
  fi
  
  # Print header
  printf "${BOLD}%-10s %-10s %-10s %-10s %-10s %-10s %-40s${NC}\n" "Instance" "PID" "CPU (%)" "MEM (%)" "VSZ (MB)" "RSS (MB)" "Working Dir"
  printf "%-10s %-10s %-10s %-10s %-10s %-10s %-40s\n" "----------" "----------" "----------" "----------" "----------" "----------" "----------------------------------------"
  
  # Print resource usage for each instance
  for instance in $instances; do
    local info=$(get_process_info "$instance")
    IFS=',' read -r instance pid cpu mem vsz rss working_dir <<< "$info"
    
    # Color code based on resource usage
    local cpu_color=$NC
    local mem_color=$NC
    
    if (( $(echo "$cpu > 50" | bc -l) )); then
      cpu_color=$RED
    elif (( $(echo "$cpu > 20" | bc -l) )); then
      cpu_color=$YELLOW
    fi
    
    if (( $(echo "$mem > 50" | bc -l) )); then
      mem_color=$RED
    elif (( $(echo "$mem > 20" | bc -l) )); then
      mem_color=$YELLOW
    fi
    
    # Truncate working directory if too long
    if [ ${#working_dir} -gt 40 ]; then
      working_dir="...${working_dir: -37}"
    fi
    
    printf "%-10s %-10s ${cpu_color}%-10s${NC} ${mem_color}%-10s${NC} %-10s %-10s %-40s\n" "$instance" "$pid" "$cpu" "$mem" "$vsz" "$rss" "$working_dir"
  done
}

# Main loop
while true; do
  clear
  echo -e "${BLUE}${BOLD}VSCode/VSCodium Instance Monitor${NC}"
  echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
  echo
  display_resource_usage
  sleep 2
done