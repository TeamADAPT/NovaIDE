#!/bin/bash
# config.sh
# Configuration management for Nova IDE Manager
#
# This module handles configuration loading, saving, and management
# for the Nova IDE Manager.

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# Configuration directory
CONFIG_DIR="${HOME}/.config/nova-ide-manager"
CONFIG_FILE="${CONFIG_DIR}/config.json"

# Create config directory if it doesn't exist
mkdir -p "${CONFIG_DIR}"

# Known instances with their default working directories
declare -A known_instances=(
  ["forge"]="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE"
  ["vaeris"]="/data-nova/ax/DevOps/DevOps-VSC/NovaOps"
  ["theseus"]="/data-nova/ax/DevOps/DevOps-VSC/DataOps"
  ["pathfinder"]="/data-nova/ax/InfraOps"
  ["zenith"]="/data-nova/ax/ArchOps"
  ["nexus"]="/data-nova/ax/NetOps"
  ["aurora"]="/data-nova/ax/SecOps"
  ["atlas"]="/data-nova/ax/DataScience"
  ["nova"]="/data-nova/ax/CoreOps"
  ["quantum"]="/data-nova/ax/QuantumOps"
  ["orion"]="/data-nova/ax/AIResearch"
  ["phoenix"]="/data-nova/ax/CloudOps"
  ["titan"]="/data-nova/ax/DevOps"
  ["polaris"]="/data-nova/ax/QAOps"
)

# Function to load known instances from config file
load_known_instances() {
  if [[ -f "${CONFIG_FILE}" ]]; then
    log_debug "Loading known instances from ${CONFIG_FILE}"
    
    # Parse JSON config file
    local instances_json=$(jq -r '.known_instances' "${CONFIG_FILE}" 2>/dev/null)
    
    if [[ $? -eq 0 && "${instances_json}" != "null" ]]; then
      # Clear existing known instances
      known_instances=()
      
      # Parse each instance
      while IFS="=" read -r name path; do
        known_instances["${name}"]="${path}"
      done < <(echo "${instances_json}" | jq -r 'to_entries[] | "\(.key)=\(.value)"')
      
      log_debug "Loaded ${#known_instances[@]} known instances"
    else
      log_warning "Failed to parse known instances from config file"
    fi
  else
    log_debug "Config file not found, using default known instances"
  fi
}

# Function to save known instances to config file
save_known_instances() {
  log_debug "Saving known instances to ${CONFIG_FILE}"
  
  # Create JSON object for known instances
  local instances_json="{"
  local first=true
  
  for name in "${!known_instances[@]}"; do
    if [[ "${first}" == "true" ]]; then
      first=false
    else
      instances_json+=","
    fi
    
    instances_json+="\"${name}\":\"${known_instances[${name}]}\""
  done
  
  instances_json+="}"
  
  # Create or update config file
  if [[ -f "${CONFIG_FILE}" ]]; then
    # Update existing config file
    jq ".known_instances = ${instances_json}" "${CONFIG_FILE}" > "${CONFIG_FILE}.tmp"
    mv "${CONFIG_FILE}.tmp" "${CONFIG_FILE}"
  else
    # Create new config file
    echo "{\"known_instances\": ${instances_json}}" > "${CONFIG_FILE}"
  fi
  
  log_debug "Saved ${#known_instances[@]} known instances"
}

# Function to add a new instance
add_instance() {
  local name="$1"
  local path="$2"
  
  if [[ -z "${name}" || -z "${path}" ]]; then
    log_error "Instance name and path are required"
    return 1
  fi
  
  # Add or update instance
  known_instances["${name}"]="${path}"
  
  # Save changes
  save_known_instances
  
  log_info "Added instance ${name} with path ${path}"
  return 0
}

# Function to remove an instance
remove_instance() {
  local name="$1"
  
  if [[ -z "${name}" ]]; then
    log_error "Instance name is required"
    return 1
  fi
  
  # Check if instance exists
  if [[ -z "${known_instances[${name}]}" ]]; then
    log_error "Instance ${name} not found"
    return 1
  fi
  
  # Remove instance
  unset known_instances["${name}"]
  
  # Save changes
  save_known_instances
  
  log_info "Removed instance ${name}"
  return 0
}

# Function to get instance path
get_instance_path() {
  local name="$1"
  
  if [[ -z "${name}" ]]; then
    log_error "Instance name is required"
    return 1
  fi
  
  # Check if instance exists
  if [[ -z "${known_instances[${name}]}" ]]; then
    log_error "Instance ${name} not found"
    return 1
  fi
  
  echo "${known_instances[${name}]}"
  return 0
}

# Function to list all known instances
list_instances() {
  for name in "${!known_instances[@]}"; do
    echo "${name}=${known_instances[${name}]}"
  done
}

# Load known instances on module import
load_known_instances