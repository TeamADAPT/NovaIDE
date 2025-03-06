#!/bin/bash
# build_vscodium.sh
# Build VSCodium using the isolated environment
#
# This script sources the isolated environment and then builds VSCodium
#
# Usage: ./scripts/build_vscodium.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VSCODIUM_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/external/vscodium"

echo -e "${BLUE}Starting VSCodium build process...${NC}"

# Source the isolated environment
echo -e "${YELLOW}Setting up isolated build environment...${NC}"
source "$SCRIPT_DIR/vscodium_build_env.sh"

# Navigate to VSCodium directory
echo -e "${YELLOW}Navigating to VSCodium directory...${NC}"
cd "$VSCODIUM_DIR" || { echo -e "${RED}Failed to navigate to VSCodium directory${NC}"; exit 1; }

# Run the build script
echo -e "${YELLOW}Running VSCodium build script...${NC}"
./build.sh

# Check if build was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}VSCodium build completed successfully!${NC}"
  
  # Check for the binary
  if [ -f "VSCode-linux-x64/bin/codium" ]; then
    echo -e "${GREEN}VSCodium binary found at: ${VSCODIUM_DIR}/VSCode-linux-x64/bin/codium${NC}"
    
    # Create a symlink to the binary in our scripts directory
    ln -sf "${VSCODIUM_DIR}/VSCode-linux-x64/bin/codium" "${SCRIPT_DIR}/../bin/codium"
    echo -e "${GREEN}Symlink created at: ${SCRIPT_DIR}/../bin/codium${NC}"
    
    # Create a directory for the binary if it doesn't exist
    mkdir -p "${SCRIPT_DIR}/../bin"
    
    echo -e "${YELLOW}You can now run VSCodium using: ${SCRIPT_DIR}/../bin/codium${NC}"
  else
    echo -e "${RED}VSCodium binary not found. Build may have completed but binary location is different.${NC}"
    echo -e "${YELLOW}Please check the VSCodium directory for the binary.${NC}"
  fi
else
  echo -e "${RED}VSCodium build failed!${NC}"
  exit 1
fi