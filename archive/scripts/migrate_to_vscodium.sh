#!/bin/bash
# migrate_to_vscodium.sh
# Migrate extensions, keys, and settings from VSCode to VSCodium for specified users
#
# Usage: ./scripts/migrate_to_vscodium.sh [--all] [user1 user2 ...]
#
# Example: ./scripts/migrate_to_vscodium.sh forge vaeris theseus

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
DEFAULT_USERS=("forge" "vaeris" "theseus")
MIGRATE_ALL=false

# Parse arguments
if [ "$1" = "--all" ]; then
  MIGRATE_ALL=true
  shift
fi

# Create users array
USERS=()
if [ "$MIGRATE_ALL" = true ]; then
  USERS=("${DEFAULT_USERS[@]}")
else
  # Use users from command line or default to all if none specified
  if [ $# -eq 0 ]; then
    USERS=("${DEFAULT_USERS[@]}")
  else
    USERS=("$@")
  fi
fi

# Check if we have any users to migrate
if [ ${#USERS[@]} -eq 0 ]; then
  echo -e "${RED}Error: No users specified${NC}"
  echo -e "Usage: ./migrate_to_vscodium.sh [--all] [user1 user2 ...]"
  exit 1
fi

# Function to migrate a single user
migrate_user() {
  local user=$1
  echo -e "${BLUE}Migrating VSCode settings for user: ${YELLOW}$user${NC}"
  
  # Define source and destination directories
  local vscode_user_dir="/home/x/.config/Code-Isolated/$user"
  local vscode_ext_dir="/home/x/.vscode-isolated/$user/extensions"
  local vscodium_user_dir="/home/x/.vscodium-isolated/$user"
  local vscodium_ext_dir="/home/x/.vscodium-isolated/$user/extensions"
  
  # Create destination directories if they don't exist
  mkdir -p "$vscodium_user_dir"
  mkdir -p "$vscodium_ext_dir"
  
  # Check if source directories exist
  if [ ! -d "$vscode_user_dir" ]; then
    echo -e "${YELLOW}Warning: VSCode user directory not found: $vscode_user_dir${NC}"
    echo -e "${YELLOW}Skipping user settings migration for $user${NC}"
  else
    # Migrate user settings
    echo -e "${GREEN}Migrating user settings...${NC}"
    
    # Copy User directory (contains settings.json, keybindings.json, etc.)
    if [ -d "$vscode_user_dir/User" ]; then
      mkdir -p "$vscodium_user_dir/User"
      cp -r "$vscode_user_dir/User/"* "$vscodium_user_dir/User/"
      echo -e "${GREEN}✓ User settings migrated successfully${NC}"
    else
      echo -e "${YELLOW}Warning: User settings directory not found: $vscode_user_dir/User${NC}"
    fi
    
    # Copy other important directories
    for dir in "globalStorage" "workspaceStorage"; do
      if [ -d "$vscode_user_dir/$dir" ]; then
        mkdir -p "$vscodium_user_dir/$dir"
        cp -r "$vscode_user_dir/$dir/"* "$vscodium_user_dir/$dir/"
        echo -e "${GREEN}✓ $dir migrated successfully${NC}"
      fi
    done
  fi
  
  # Migrate extensions
  if [ ! -d "$vscode_ext_dir" ]; then
    echo -e "${YELLOW}Warning: VSCode extensions directory not found: $vscode_ext_dir${NC}"
    echo -e "${YELLOW}Skipping extensions migration for $user${NC}"
  else
    echo -e "${GREEN}Migrating extensions...${NC}"
    
    # Copy all extensions
    cp -r "$vscode_ext_dir/"* "$vscodium_ext_dir/"
    echo -e "${GREEN}✓ Extensions migrated successfully${NC}"
    
    # Special handling for Roo extension
    if [ -d "$vscode_ext_dir/rooveterinaryinc.roo-cline-3.7.11" ]; then
      echo -e "${GREEN}Found Roo extension, ensuring proper configuration...${NC}"
      
      # Ensure extensions.json includes Roo
      if [ -f "$vscodium_ext_dir/extensions.json" ]; then
        # Check if Roo is already in extensions.json
        if ! grep -q "rooveterinaryinc.roo-cline" "$vscodium_ext_dir/extensions.json"; then
          # Add Roo to extensions.json
          sed -i 's/\[/\[\n\t"rooveterinaryinc.roo-cline",/g' "$vscodium_ext_dir/extensions.json"
          echo -e "${GREEN}✓ Added Roo extension to extensions.json${NC}"
        fi
      else
        # Create extensions.json with Roo
        echo -e '[\n\t"rooveterinaryinc.roo-cline"\n]' > "$vscodium_ext_dir/extensions.json"
        echo -e "${GREEN}✓ Created extensions.json with Roo extension${NC}"
      fi
      
      # Copy MCP settings if they exist
      if [ -f "$vscode_user_dir/User/globalStorage/rooveterinaryinc.roo-cline/cline_mcp_settings.json" ]; then
        mkdir -p "$vscodium_user_dir/User/globalStorage/rooveterinaryinc.roo-cline"
        cp "$vscode_user_dir/User/globalStorage/rooveterinaryinc.roo-cline/cline_mcp_settings.json" \
           "$vscodium_user_dir/User/globalStorage/rooveterinaryinc.roo-cline/"
        echo -e "${GREEN}✓ MCP settings migrated successfully${NC}"
      fi
    fi
  fi
  
  # Migrate API keys
  echo -e "${GREEN}Migrating API keys...${NC}"
  
  # Check if settings.json exists
  if [ -f "$vscode_user_dir/User/settings.json" ]; then
    # Extract API keys from settings.json
    local api_keys=$(grep -o '"[A-Za-z0-9_]*_API_KEY": "[^"]*"' "$vscode_user_dir/User/settings.json" || echo "")
    
    if [ -n "$api_keys" ]; then
      echo -e "${GREEN}Found API keys in settings.json${NC}"
      
      # Ensure settings.json exists in VSCodium
      if [ ! -f "$vscodium_user_dir/User/settings.json" ]; then
        echo "{}" > "$vscodium_user_dir/User/settings.json"
      fi
      
      # Add API keys to VSCodium settings.json
      for key_pair in $api_keys; do
        local key_name=$(echo "$key_pair" | cut -d':' -f1 | tr -d '"')
        local key_value=$(echo "$key_pair" | cut -d':' -f2 | tr -d '" ')
        
        # Update settings.json with the API key
        if grep -q "$key_name" "$vscodium_user_dir/User/settings.json"; then
          # Replace existing key
          sed -i "s/\"$key_name\": \"[^\"]*\"/\"$key_name\": \"$key_value\"/" "$vscodium_user_dir/User/settings.json"
        else
          # Add new key
          sed -i "s/{/{\"$key_name\": \"$key_value\",/" "$vscodium_user_dir/User/settings.json"
        fi
        
        echo -e "${GREEN}✓ Migrated API key: $key_name${NC}"
      done
    else
      echo -e "${YELLOW}No API keys found in settings.json${NC}"
    fi
  else
    echo -e "${YELLOW}Warning: settings.json not found: $vscode_user_dir/User/settings.json${NC}"
    echo -e "${YELLOW}Skipping API key migration for $user${NC}"
  fi
  
  echo -e "${GREEN}Migration completed for user: ${YELLOW}$user${NC}"
  echo -e "-------------------------------------------"
}

# Migrate settings for all users
echo -e "${BLUE}Migrating VSCode settings to VSCodium for ${#USERS[@]} users${NC}"
echo -e "-------------------------------------------"

for user in "${USERS[@]}"; do
  migrate_user "$user"
done

echo -e "${GREEN}All migrations completed successfully${NC}"
echo -e "To launch VSCodium with migrated settings:"
echo -e "  ./scripts/launch_vscodium.sh <user> <working_directory>"
echo -e "Example:"
echo -e "  ./scripts/launch_vscodium.sh forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE"