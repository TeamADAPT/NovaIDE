#!/bin/bash
# nova-ide-manager.sh
# Nova IDE Manager - Main Script
#
# This script provides a unified interface for managing VSCodium instances
# for Nova agents with isolated user data and extensions directories.
#
# Usage: ./scripts/nova-ide-manager/nova-ide-manager.sh [options]

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="${SCRIPT_DIR}/lib"

# Source modules
source "${LIB_DIR}/common.sh"
source "${LIB_DIR}/config.sh"
source "${LIB_DIR}/ui.sh"
source "${LIB_DIR}/instance.sh"
source "${LIB_DIR}/user_prefs.sh"

# Initialize global variables
declare -a selected_instances=()
declare -A instance_status=()

# Command line options
LAUNCH_MODE="interactive"
SYNC_SETTINGS=false
SYNC_EXTENSIONS=false
CLEAN_START=false
SHOW_HELP=false
VERBOSE=false

# Parse command line arguments
parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        SHOW_HELP=true
        shift
        ;;
      --verbose|-v)
        VERBOSE=true
        export VERBOSE=true
        shift
        ;;
      --launch|-l)
        LAUNCH_MODE="launch"
        shift
        ;;
      --sync-settings|-s)
        SYNC_SETTINGS=true
        shift
        ;;
      --sync-extensions|-e)
        SYNC_EXTENSIONS=true
        shift
        ;;
      --clean|-c)
        CLEAN_START=true
        shift
        ;;
      --folder|-f)
        if [[ -n "$2" && "$2" != -* ]]; then
          FOLDER_PATH="$2"
          shift 2
        else
          log_error "Error: Folder path is required for --folder option"
          exit 1
        fi
        ;;
      --instance|-i)
        if [[ -n "$2" && "$2" != -* ]]; then
          selected_instances+=("$2")
          shift 2
        else
          log_error "Error: Instance name is required for --instance option"
          exit 1
        fi
        ;;
      --all|-a)
        for instance in "${!known_instances[@]}"; do
          selected_instances+=("$instance")
        done
        shift
        ;;
      *)
        # Unknown option or positional argument
        if [[ "$1" != -* && -z "${FOLDER_PATH}" ]]; then
          FOLDER_PATH="$1"
        else
          log_error "Unknown option: $1"
          show_help
          exit 1
        fi
        shift
        ;;
    esac
  done
}

# Show help message
show_help() {
  echo "Nova IDE Manager - Manage VSCodium instances for Nova agents"
  echo ""
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help              Show this help message"
  echo "  -v, --verbose           Enable verbose logging"
  echo "  -l, --launch            Launch instances directly (non-interactive)"
  echo "  -s, --sync-settings     Synchronize settings from main VSCodium"
  echo "  -e, --sync-extensions   Synchronize extensions from main VSCodium"
  echo "  -c, --clean             Start with clean user data directory"
  echo "  -f, --folder PATH       Specify folder to open"
  echo "  -i, --instance NAME     Specify instance to launch (can be used multiple times)"
  echo "  -a, --all               Launch all known instances"
  echo ""
  echo "Examples:"
  echo "  $0                      # Interactive mode"
  echo "  $0 --launch --instance forge --folder /path/to/project"
  echo "  $0 --all --sync-settings --sync-extensions"
}

# Check instance status
check_instance_status() {
  log_debug "Checking instance status"
  
  for instance in "${!known_instances[@]}"; do
    if is_instance_running "${instance}"; then
      instance_status["${instance}"]="running"
    else
      instance_status["${instance}"]="stopped"
    fi
  done
}

# Main function
main() {
  log_info "Starting Nova IDE Manager"
  
  # Parse command line arguments
  parse_arguments "$@"
  
  # Show help if requested
  if [[ "${SHOW_HELP}" == "true" ]]; then
    show_help
    exit 0
  fi
  
  # Check instance status
  check_instance_status
  
  # Load user preferences
  load_user_preferences
  
  # Interactive or launch mode
  if [[ "${LAUNCH_MODE}" == "interactive" ]]; then
    # Interactive mode
    show_interactive_ui
  else
    # Launch mode
    if [[ ${#selected_instances[@]} -eq 0 ]]; then
      log_error "No instances selected for launch mode"
      show_help
      exit 1
    fi
    
    # Launch selected instances
    for instance in "${selected_instances[@]}"; do
      launch_instance "${instance}" "${FOLDER_PATH}" "${SYNC_SETTINGS}" "${SYNC_EXTENSIONS}" "${CLEAN_START}"
    done
  fi
  
  log_info "Nova IDE Manager completed"
}

# Run main function with all arguments
main "$@"