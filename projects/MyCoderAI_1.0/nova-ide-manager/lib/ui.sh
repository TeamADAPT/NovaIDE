#!/bin/bash
# =============================================================================
# Nova IDE Manager - UI Module
# Version: 1.0.0
# Date: 2025-03-02
# Author: Forge, DevOps Lead
# =============================================================================
# User interface components and display functions
# =============================================================================

# Check if common module is loaded
if ! type module_loaded &>/dev/null || ! module_loaded "common"; then
  echo "Error: common module must be loaded first"
  exit 1
fi

# Print logo and header
function print_header() {
  clear
  echo -e "${CYAN}"
  echo "  _   _                    _____ _____  ______   __  __                                "
  echo " | \ | |                  |_   _|  __ \|  ____| |  \/  |                               "
  echo " |  \| | _____   ____ _     | | | |  | | |__    | \  / | __ _ _ __   __ _  __ _  ___ _ __ "
  echo " | . \` |/ _ \ \ / / _\` |    | | | |  | |  __|   | |\/| |/ _\` | '_ \ / _\` |/ _\` |/ _ \ '__|"
  echo " | |\  | (_) \ V / (_| |   _| |_| |__| | |____  | |  | | (_| | | | | (_| | (_| |  __/ |   "
  echo " |_| \_|\___/ \_/ \__,_|  |_____|_____/|______| |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   "
  echo "                                                                            __/ |          "
  echo "                                                                           |___/           "
  echo -e "${GREEN}===========================================================================${NC}"
  echo -e "${GREEN}   Nova IDE Manager v2.1.0                                                ${NC}"
  echo -e "${GREEN}===========================================================================${NC}"
}

# Function to display system information
function show_system_info() {
  echo -e "${YELLOW}System Information:${NC}"
  
  # Memory
  TOTAL_MEM=$(free -h | awk '/^Mem:/{print $2}')
  USED_MEM=$(free -h | awk '/^Mem:/{print $3}')
  FREE_MEM=$(free -h | awk '/^Mem:/{print $4}')
  MEM_PERCENT=$(free | awk '/^Mem:/{printf("%.1f%%", 100*$3/$2)}')
  
  # CPU Load
  LOAD=$(uptime | awk -F'[a-z]:' '{ print $2}' | tr -d ' ')
  CPU_CORES=$(nproc)
  
  # Running VSCode instances
  RUNNING_VSCODE=$(pgrep -f "Code" | wc -l)
  
  # Disk space
  DISK_USAGE=$(df -h /home | awk 'NR==2 {print $5}')
  DISK_FREE=$(df -h /home | awk 'NR==2 {print $4}')
  
  # Format similar to setup_forge_instance.sh
  echo -e "[${BLUE}Memory${NC}]    Total: ${WHITE}${TOTAL_MEM}${NC} | Used: ${WHITE}${USED_MEM}${NC} | Free: ${WHITE}${FREE_MEM}${NC} | Usage: ${WHITE}${MEM_PERCENT}${NC}"
  echo -e "[${BLUE}CPU${NC}]       Load: ${WHITE}${LOAD}${NC} | Cores: ${WHITE}${CPU_CORES}${NC}"
  echo -e "[${BLUE}Disk${NC}]      Usage: ${WHITE}${DISK_USAGE}${NC} | Free: ${WHITE}${DISK_FREE}${NC}"
  echo -e "[${BLUE}VSCode${NC}]    Running Instances: ${WHITE}${RUNNING_VSCODE}${NC}"
  echo
}

# Display a list of instances with checkboxes for selection
function show_instances_list() {
  local selected_instances=("$@")
  
  echo -e "${CYAN}Available Instances:${NC}"
  echo -e "${YELLOW}====================${NC}"
  
  # Display instances with checkboxes
  local i=1
  local instance_names=()
  for instance in "${!known_instances[@]}"; do
    instance_names+=("$instance")
    local checkbox="[ ]"
    local status_text=""
    
    # Check if instance is running
    if is_instance_running "$instance"; then
      status_text="${GREEN}RUNNING${NC}"
    else
      status_text="${BLUE}STOPPED${NC}"
    fi
    
    # Check if selected
    if [[ " ${selected_instances[*]} " =~ " ${instance} " ]]; then
      checkbox="[${CYAN}X${NC}]"
    fi
    
    printf "${WHITE}%-3s${NC} %s ${WHITE}%-20s${NC} ${YELLOW}%-40s${NC} %s\n" \
      "[$i]" "$checkbox" "$instance" "${known_instances[$instance]}" "$status_text"
    
    i=$((i+1))
  done
  
  echo -e "${YELLOW}====================${NC}"
}

# Display main menu options
function show_menu_options() {
  local sync_settings=$1
  local sync_extensions=$2
  local ensure_roo=$3
  
  echo -e "${WHITE}[a]${NC} Toggle All Instances"
  echo -e "${WHITE}[n]${NC} Add New Instance"
  echo -e "${WHITE}[l]${NC} Launch Selected"
  echo -e "${WHITE}[s]${NC} Toggle Sync Settings      ($([ "$sync_settings" == true ] && echo "${GREEN}ON${NC}" || echo "${RED}OFF${NC}"))"
  echo -e "${WHITE}[e]${NC} Toggle Sync Extensions    ($([ "$sync_extensions" == true ] && echo "${GREEN}ON${NC}" || echo "${RED}OFF${NC}"))"
  echo -e "${WHITE}[r]${NC} Toggle Roo Extension      ($([ "$ensure_roo" == true ] && echo "${GREEN}ON${NC}" || echo "${RED}OFF${NC}"))"
  echo -e "${WHITE}[q]${NC} Quit"
  echo
  
  # Instructions for keyboard navigation
  echo -e "Use number keys to toggle selection."
  echo -e "Toggle options with [s], [e], or [r] keys."
  echo -e "Press [l] to launch the selected instances."
  echo
}

# Function to create an interactive add instance dialog
function add_instance_dialog() {
  print_header
  echo -e "${CYAN}Add New Instance${NC}"
  echo -e "${YELLOW}==============${NC}"
  
  read -p "Enter instance name (e.g., agent name): " instance_name
  
  # Validate instance name
  if [[ -z "$instance_name" ]]; then
    echo -e "${RED}Error: Instance name cannot be empty${NC}"
    read -n 1 -s -r -p "Press any key to continue..."
    return 1
  fi
  
  if [[ ${known_instances[$instance_name]+_} ]]; then
    echo -e "${RED}Error: Instance '$instance_name' already exists${NC}"
    read -n 1 -s -r -p "Press any key to continue..."
    return 1
  fi
  
  # Get workspace path
  read -p "Enter workspace path: " workspace_path
  
  # Validate path
  if [[ -z "$workspace_path" ]]; then
    echo -e "${RED}Error: Workspace path cannot be empty${NC}"
    read -n 1 -s -r -p "Press any key to continue..."
    return 1
  fi
  
  if [[ ! -d "$workspace_path" ]]; then
    echo -e "${YELLOW}Warning: Directory does not exist. Create it? (y/n) ${NC}"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}Cancelled adding new instance${NC}"
      read -n 1 -s -r -p "Press any key to continue..."
      return 1
    fi
    mkdir -p "$workspace_path"
  fi
  
  # Add instance using the config module function
  add_instance "$instance_name" "$workspace_path"
  
  read -n 1 -s -r -p "Press any key to continue..."
  return 0
}

# Function to print usage information
function print_usage() {
  echo -e "${CYAN}Nova IDE Manager${NC} - Interactive VSCode Instance Manager"
  echo
  echo -e "Usage: $0 [options]"
  echo
  echo -e "Options:"
  echo -e "  -h, --help              Show this help message"
  echo -e "  -i, --instance NAME     Launch a specific instance"
  echo -e "  -l, --list              List available instances"
  echo -e "  -s, --no-settings       Don't sync settings"
  echo -e "  -e, --no-extensions     Don't sync extensions"
  echo -e "  -r, --no-roo            Don't ensure Roo extension"
  echo
  echo -e "Examples:"
  echo -e "  $0                      Run in interactive mode"
  echo -e "  $0 --instance forge     Launch the forge instance directly"
  echo -e "  $0 --list               List available instances"
  echo
}

# Mark this module as loaded
mark_module_loaded "ui"