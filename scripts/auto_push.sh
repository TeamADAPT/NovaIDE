#!/bin/bash
# auto_push.sh - Automated Git Repository Updates
# Version: 0.1.0
# Date: 2025-03-03
# Author: Forge, DevOps Lead

# Configuration
REPO_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE"
LOG_FILE="${REPO_DIR}/scripts/auto_push.log"
COMMIT_PREFIX="chore"
PUSH_INTERVAL=15  # Minutes between pushes in auto mode

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_changes() {
  cd "$REPO_DIR" || {
    log "${RED}ERROR: Could not change to repository directory${NC}"
    exit 1
  }
  
  git status --porcelain
}

commit_changes() {
  local message="$1"
  local default_message="${COMMIT_PREFIX}: Automated repository update $(date '+%Y-%m-%d %H:%M')"
  local commit_message="${message:-$default_message}"
  
  log "${BLUE}Committing changes with message: ${commit_message}${NC}"
  git add .
  git commit -m "$commit_message"
  return $?
}

push_changes() {
  log "${BLUE}Pushing changes to remote repository${NC}"
  git push origin main
  return $?
}

print_help() {
  echo -e "${GREEN}auto_push.sh${NC} - Automated Git Repository Updates"
  echo -e "\nUsage:"
  echo -e "  ${YELLOW}./auto_push.sh${NC} [options]"
  echo -e "\nOptions:"
  echo -e "  ${YELLOW}-h, --help${NC}       Show this help message"
  echo -e "  ${YELLOW}-m, --message${NC}    Specify commit message"
  echo -e "  ${YELLOW}-a, --auto${NC}       Run in auto mode (continuous)"
  echo -e "  ${YELLOW}-i, --interval${NC}   Specify push interval in minutes (default: ${PUSH_INTERVAL})"
  echo -e "  ${YELLOW}-p, --prefix${NC}     Specify commit prefix (default: ${COMMIT_PREFIX})"
  echo -e "\nExamples:"
  echo -e "  ${YELLOW}./auto_push.sh${NC}                        # One-time push with default message"
  echo -e "  ${YELLOW}./auto_push.sh -m \"fix: Update docs\"${NC}  # One-time push with custom message"
  echo -e "  ${YELLOW}./auto_push.sh -a -i 30${NC}               # Auto mode, push every 30 minutes"
  echo -e "  ${YELLOW}./auto_push.sh -a -p \"docs\"${NC}           # Auto mode, with 'docs' prefix"
}

run_once() {
  local message="$1"
  local changes
  changes=$(check_changes)
  
  if [ -z "$changes" ]; then
    log "${GREEN}No changes to commit${NC}"
    return 0
  fi
  
  log "${YELLOW}Changes detected:${NC}"
  echo "$changes" | sed 's/^/  /'
  
  if commit_changes "$message"; then
    log "${GREEN}Commit successful${NC}"
    if push_changes; then
      log "${GREEN}Push successful${NC}"
      return 0
    else
      log "${RED}Push failed${NC}"
      return 1
    fi
  else
    log "${RED}Commit failed${NC}"
    return 1
  fi
}

run_auto() {
  log "${GREEN}Starting auto push mode with ${PUSH_INTERVAL} minute interval${NC}"
  
  while true; do
    run_once
    log "${BLUE}Waiting ${PUSH_INTERVAL} minutes until next check...${NC}"
    sleep $((PUSH_INTERVAL * 60))
  done
}

# Main execution
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

# Parse arguments
AUTO_MODE=false
CUSTOM_MESSAGE=""

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help)
      print_help
      exit 0
      ;;
    -m|--message)
      CUSTOM_MESSAGE="$2"
      shift 2
      ;;
    -a|--auto)
      AUTO_MODE=true
      shift
      ;;
    -i|--interval)
      PUSH_INTERVAL="$2"
      shift 2
      ;;
    -p|--prefix)
      COMMIT_PREFIX="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      print_help
      exit 1
      ;;
  esac
done

# Execute in proper mode
if [ "$AUTO_MODE" = true ]; then
  run_auto
else
  run_once "$CUSTOM_MESSAGE"
fi