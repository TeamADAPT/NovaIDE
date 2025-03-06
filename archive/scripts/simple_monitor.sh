#!/bin/bash
# simple_monitor.sh
# Simple monitor for VSCode/VSCodium instances
#
# This script provides a simple monitor for VSCode/VSCodium instances
#
# Usage: ./scripts/simple_monitor.sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}VSCode/VSCodium Instance Monitor${NC}"
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo

# Print header
printf "${BOLD}%-20s %-10s %-10s %-10s %-40s${NC}\n" "Instance" "PID" "CPU %" "MEM %" "Working Directory"
printf "%-20s %-10s %-10s %-10s %-40s\n" "--------------------" "----------" "----------" "----------" "----------------------------------------"

# Find all VSCode/VSCodium processes
pids=$(ps aux | grep -E "/usr/share/code/code" | grep -v grep | awk '{print $2}')

for pid in $pids; do
    # Get process info
    cmd=$(ps -p $pid -o cmd | tail -n 1)
    cpu=$(ps -p $pid -o %cpu | tail -n 1 | tr -d ' ')
    mem=$(ps -p $pid -o %mem | tail -n 1 | tr -d ' ')
    
    # Try to get working directory
    wd=$(pwdx $pid 2>/dev/null | awk '{print $2}' || echo "Unknown")
    
    # Try to determine instance name
    if [[ $cmd == *"Code-Isolated/forge"* ]]; then
        instance="forge"
    elif [[ $cmd == *"vscodium-isolated/vaeris"* ]]; then
        instance="vaeris"
    elif [[ $cmd == *"vscodium-isolated/theseus"* ]]; then
        instance="theseus"
    else
        instance="unknown"
    fi
    
    # Color code based on resource usage
    cpu_color=$NC
    mem_color=$NC
    
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
    if [ ${#wd} -gt 40 ]; then
        wd="...${wd: -37}"
    fi
    
    # Print process info
    printf "%-20s %-10s ${cpu_color}%-10s${NC} ${mem_color}%-10s${NC} %-40s\n" "$instance" "$pid" "$cpu" "$mem" "$wd"
done

# If no processes found
if [ -z "$pids" ]; then
    echo -e "${RED}No VSCode/VSCodium instances running.${NC}"
fi