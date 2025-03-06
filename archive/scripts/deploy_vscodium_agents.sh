#!/bin/bash
# deploy_vscodium_agents.sh
# Deploy VSCodium instances for multiple Nova agents
#
# Usage: ./deploy_vscodium_agents.sh [--all] [agent1 agent2 ...]
#
# Example: ./deploy_vscodium_agents.sh architect coder tester

set -e

# Default values
AGENTS_FILE="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/config/nova_agents.txt"
SYSTEMD_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/systemd"
DEPLOY_ALL=false

# Parse arguments
if [ "$1" = "--all" ]; then
  DEPLOY_ALL=true
  shift
fi

# Create agents array
AGENTS=()
if [ "$DEPLOY_ALL" = true ]; then
  # Read agents from file if it exists
  if [ -f "$AGENTS_FILE" ]; then
    while IFS= read -r agent; do
      # Skip empty lines and comments
      if [ -n "$agent" ] && [[ ! "$agent" =~ ^# ]]; then
        AGENTS+=("$agent")
      fi
    done < "$AGENTS_FILE"
  else
    echo "Error: Agents file not found: $AGENTS_FILE"
    echo "Please create the file or specify agents manually"
    exit 1
  fi
else
  # Use agents from command line
  AGENTS=("$@")
fi

# Check if we have any agents to deploy
if [ ${#AGENTS[@]} -eq 0 ]; then
  echo "Error: No agents specified"
  echo "Usage: ./deploy_vscodium_agents.sh [--all] [agent1 agent2 ...]"
  exit 1
fi

# Function to deploy a single agent
deploy_agent() {
  local agent=$1
  echo "Deploying VSCodium instance for agent: $agent"
  
  # Create workspace directory if it doesn't exist
  local workspace_dir="/data-nova/ax/DevOps/$agent"
  mkdir -p "$workspace_dir"
  
  # Copy systemd service file
  sudo cp "$SYSTEMD_DIR/vscodium@.service" "/etc/systemd/system/vscodium@$agent.service"
  
  # Reload systemd
  sudo systemctl daemon-reload
  
  # Enable and start service
  sudo systemctl enable "vscodium@$agent.service"
  sudo systemctl start "vscodium@$agent.service"
  
  # Check service status
  sudo systemctl status "vscodium@$agent.service" --no-pager
  
  echo "VSCodium instance deployed for agent: $agent"
  echo "-------------------------------------------"
}

# Deploy VSCodium instances for all agents
echo "Deploying VSCodium instances for ${#AGENTS[@]} agents"
echo "-------------------------------------------"

# Install target file if it doesn't exist
if [ ! -f "/etc/systemd/system/vscodium-instances.target" ]; then
  echo "Installing vscodium-instances.target"
  sudo cp "$SYSTEMD_DIR/vscodium-instances.target" "/etc/systemd/system/"
  sudo systemctl daemon-reload
  sudo systemctl enable vscodium-instances.target
fi

# Deploy each agent
for agent in "${AGENTS[@]}"; do
  deploy_agent "$agent"
done

echo "All VSCodium instances deployed successfully"
echo "To check status: sudo systemctl status vscodium-instances.target"
echo "To stop all: sudo systemctl stop vscodium-instances.target"
echo "To start all: sudo systemctl start vscodium-instances.target"