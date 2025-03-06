#!/bin/bash
# =============================================================================
# Nova IDE Manager - User Preferences Module
# Version: 1.0.0
# Date: 2025-03-02
# Author: Forge, DevOps Lead
# =============================================================================
# Handles user preference management and personalization
# =============================================================================

# Check if common module is loaded
if ! type module_loaded &>/dev/null || ! module_loaded "common"; then
  echo "Error: common module must be loaded first"
  exit 1
fi

# User preferences file path
USER_PREFS_FILE="$CONFIG_DIR/user_prefs.conf"

# Default preferences
declare -A user_preferences=(
  ["user_name"]="Chase"
  ["theme"]="default"
  ["notifications"]="enabled"
)

# Function to load user preferences from config file
function load_user_preferences() {
  if [ -f "$USER_PREFS_FILE" ]; then
    while IFS='=' read -r key value || [ -n "$key" ]; do
      if [[ ! $key =~ ^# && -n $key ]]; then
        user_preferences["$key"]="$value"
      fi
    done < "$USER_PREFS_FILE"
  else
    # Create default preferences file if it doesn't exist
    echo "# Nova IDE Manager User Preferences" > "$USER_PREFS_FILE"
    echo "# Format: preference_name=value" >> "$USER_PREFS_FILE"
    echo "# Created: $(date)" >> "$USER_PREFS_FILE"
    echo >> "$USER_PREFS_FILE"
    
    for pref in "${!user_preferences[@]}"; do
      echo "$pref=${user_preferences[$pref]}" >> "$USER_PREFS_FILE"
    done
    
    echo -e "${YELLOW}Created default user preferences file at $USER_PREFS_FILE${NC}"
  fi
}

# Function to save user preferences to config file
function save_user_preferences() {
  echo "# Nova IDE Manager User Preferences" > "$USER_PREFS_FILE"
  echo "# Format: preference_name=value" >> "$USER_PREFS_FILE"
  echo "# Updated: $(date)" >> "$USER_PREFS_FILE"
  echo >> "$USER_PREFS_FILE"
  
  for pref in "${!user_preferences[@]}"; do
    echo "$pref=${user_preferences[$pref]}" >> "$USER_PREFS_FILE"
  done
}

# Function to get user name
function get_user_name() {
  echo "${user_preferences["user_name"]}"
}

# Function to set user name
function set_user_name() {
  local new_name="$1"
  
  # Validate name
  if [[ -z "$new_name" ]]; then
    echo -e "${RED}Error: User name cannot be empty${NC}"
    return 1
  fi
  
  # Update name
  user_preferences["user_name"]="$new_name"
  
  # Save preferences
  save_user_preferences
  
  echo -e "${GREEN}Updated user name to: $new_name${NC}"
  return 0
}

# Function to get a specific preference
function get_preference() {
  local pref_name="$1"
  local default_value="$2"
  
  if [[ ${user_preferences[$pref_name]+_} ]]; then
    echo "${user_preferences[$pref_name]}"
  else
    # Return default if preference doesn't exist
    echo "$default_value"
  fi
  
  return 0
}

# Function to set a specific preference
function set_preference() {
  local pref_name="$1"
  local pref_value="$2"
  
  # Validate
  if [[ -z "$pref_name" ]]; then
    echo -e "${RED}Error: Preference name cannot be empty${NC}"
    return 1
  fi
  
  # Update preference
  user_preferences["$pref_name"]="$pref_value"
  
  # Save preferences
  save_user_preferences
  
  echo -e "${GREEN}Updated preference '$pref_name' to: $pref_value${NC}"
  return 0
}

# Function to display all preferences with descriptions
function list_preferences() {
  echo -e "${CYAN}Current User Preferences:${NC}"
  printf "${WHITE}%-20s${NC} ${YELLOW}%-40s${NC}\n" "PREFERENCE" "VALUE"
  echo -e "${YELLOW}$(printf '=%.0s' {1..70})${NC}"
  
  for pref in "${!user_preferences[@]}"; do
    local description=""
    
    # Add descriptions based on preference name
    case "$pref" in
      user_name)
        description="User's display name in interface"
        ;;
      theme)
        description="UI theme (default, dark, light)"
        ;;
      notifications)
        description="Enable/disable notifications"
        ;;
      *)
        description="Custom preference"
        ;;
    esac
    
    printf "${WHITE}%-20s${NC} ${YELLOW}%-30s${NC} ${GREEN}%s${NC}\n" \
      "$pref" "${user_preferences[$pref]}" "$description"
  done
}

# Function to reset a preference to default
function reset_preference() {
  local pref_name="$1"
  
  # Known defaults
  local default_value=""
  case "$pref_name" in
    user_name)
      default_value="Chase"
      ;;
    theme)
      default_value="default"
      ;;
    notifications)
      default_value="enabled"
      ;;
    *)
      echo -e "${RED}Error: No default known for '$pref_name'${NC}"
      return 1
      ;;
  esac
  
  # Apply default
  user_preferences["$pref_name"]="$default_value"
  
  # Save preferences
  save_user_preferences
  
  echo -e "${GREEN}Reset preference '$pref_name' to default: $default_value${NC}"
  return 0
}

# Create config directory if it doesn't exist (should already be done by common)
mkdir -p "$CONFIG_DIR"

# Initialize by loading preferences
load_user_preferences

# Mark this module as loaded
mark_module_loaded "user_prefs"