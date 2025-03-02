#!/bin/bash

# VSCode Monitoring Script
# Version: 1.0.1
# Created: 2025-03-02 10:57 MST
# Author: Forge
# Purpose: Monitor VSCode instances and extension hosts per Nova
# Implementation: Resource tracking and crash detection with timeouts

set -euo pipefail
IFS=$'\n\t'

# Configuration
LOG_DIR="/data-nova/ax/DevOps/logs/vscode"
METRICS_DIR="/data-nova/ax/DevOps/metrics/vscode"
CRASH_DIR="/data-nova/ax/DevOps/crashes/vscode"
POLL_INTERVAL=5  # seconds
TAIL_TIMEOUT=2   # seconds for tail operations

# Resource thresholds
CPU_THRESHOLD=80  # percentage
MEM_THRESHOLD=3584  # MB (3.5GB)
CRASH_THRESHOLD=3  # crashes per hour
RESTART_DELAY=5  # seconds between restart attempts

log_message() {
    local nova_name=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S %Z')
    echo "[$timestamp] [$nova_name] $message" | timeout $TAIL_TIMEOUT tee -a "$LOG_DIR/${nova_name}/monitor.log"
}

setup_directories() {
    local nova_name=$1
    
    # Create required directories
    mkdir -p "$LOG_DIR/${nova_name}"
    mkdir -p "$METRICS_DIR/${nova_name}"
    mkdir -p "$CRASH_DIR/${nova_name}"
    
    # Set permissions
    chown -R x:x "$LOG_DIR/${nova_name}"
    chown -R x:x "$METRICS_DIR/${nova_name}"
    chown -R x:x "$CRASH_DIR/${nova_name}"
}

get_process_metrics() {
    local nova_name=$1
    local process_name=$2
    local metrics_file="$METRICS_DIR/${nova_name}/${process_name}_$(date '+%Y%m%d').csv"
    
    # Get PIDs for the Nova's processes
    local pids
    pids=$(timeout $TAIL_TIMEOUT pgrep -f "code.*$nova_name" || true)
    if [ -z "$pids" ]; then
        return
    fi
    
    # Collect metrics
    for pid in $pids; do
        local cpu
        local mem
        cpu=$(timeout $TAIL_TIMEOUT ps -p "$pid" -o %cpu= || echo "0")
        mem=$(timeout $TAIL_TIMEOUT ps -p "$pid" -o rss= || echo "0")
        local timestamp
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        
        # Convert memory to MB
        mem=$((mem / 1024))
        
        # Log metrics
        echo "$timestamp,$pid,$cpu,$mem" | timeout $TAIL_TIMEOUT tee -a "$metrics_file"
        
        # Check thresholds
        if (( $(echo "$cpu > $CPU_THRESHOLD" | bc -l) )); then
            log_message "$nova_name" "High CPU usage: $cpu% (PID: $pid)"
        fi
        
        if [ "$mem" -gt "$MEM_THRESHOLD" ]; then
            log_message "$nova_name" "High memory usage: ${mem}MB (PID: $pid)"
        fi
    done
}

restart_extension_host() {
    local nova_name=$1
    local crash_file="$CRASH_DIR/${nova_name}/crashes_$(date '+%Y%m%d').log"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    log_message "$nova_name" "Attempting to restart extension host"
    
    # Kill any zombie processes
    pkill -f "code-extension-host.*$nova_name" || true
    sleep 2
    
    # Restart VSCode instance
    code --user-data-dir="/home/x/.config/Code-Isolated/$nova_name" \
         --extensions-dir="/home/x/.vscode-isolated/$nova_name" \
         --disable-extensions \
         --max-memory=3072 &
    
    log_message "$nova_name" "Extension host restart attempted"
}

check_crashes() {
    local nova_name=$1
    local crash_file="$CRASH_DIR/${nova_name}/crashes_$(date '+%Y%m%d').log"
    local crash_count=0
    
    # Check if extension host process died
    if ! timeout $TAIL_TIMEOUT pgrep -f "code-extension-host.*$nova_name" > /dev/null; then
        local timestamp
        timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo "$timestamp: Extension host crash detected" | timeout $TAIL_TIMEOUT tee -a "$crash_file"
        ((crash_count++))
        
        # Count crashes in the last hour
        local hour_ago
        hour_ago=$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')
        local recent_crashes
        recent_crashes=$(timeout $TAIL_TIMEOUT grep -c "Extension host crash detected" "$crash_file" || echo "0")
        
        if [ "$recent_crashes" -ge "$CRASH_THRESHOLD" ]; then
            log_message "$nova_name" "WARNING: $recent_crashes crashes in the last hour"
            return 1
        fi
        
        log_message "$nova_name" "Extension host crash detected"
        restart_extension_host "$nova_name"
    fi
}

cleanup() {
    local days_to_keep=7
    
    # Remove old metric files
    find "$METRICS_DIR" -name "*.csv" -type f -mtime +"$days_to_keep" -delete
    
    # Remove old crash logs
    find "$CRASH_DIR" -name "*.log" -type f -mtime +"$days_to_keep" -delete
    
    # Compress files older than 1 day
    find "$METRICS_DIR" -name "*.csv" -type f -mtime +1 -exec gzip {} \;
    find "$CRASH_DIR" -name "*.log" -type f -mtime +1 -exec gzip {} \;
    
    log_message "monitor" "Cleaned up old logs and metrics"
}

monitor_nova() {
    local nova_name=$1
    
    while true; do
        get_process_metrics "$nova_name" "main"
        get_process_metrics "$nova_name" "extension-host"
        
        if ! check_crashes "$nova_name"; then
            log_message "$nova_name" "ERROR: Too many crashes, restarting monitoring service"
            systemctl restart vscode-monitor.service
            exit 1
        fi
        
        sleep "$POLL_INTERVAL"
    done
}

main() {
    if [ $# -lt 1 ]; then
        echo "Usage: $0 <nova_name> [<nova_name2> ...]"
        exit 1
    fi
    
    # Create base directories
    mkdir -p "$LOG_DIR"
    mkdir -p "$METRICS_DIR"
    mkdir -p "$CRASH_DIR"
    
    # Set up monitoring for each Nova
    for nova_name in "$@"; do
        setup_directories "$nova_name"
        monitor_nova "$nova_name" &
        log_message "$nova_name" "Started monitoring"
    done
    
    # Run cleanup daily
    while true; do
        sleep 86400  # 24 hours
        cleanup
    done
}

main "$@"