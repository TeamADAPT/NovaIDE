#!/bin/bash
# Script to download and install pre-built VSCodium binaries
# Author: Forge
# Date: March 3, 2025

set -e

# Configuration
VSCODIUM_VERSION="1.97.2.25045"
DOWNLOAD_DIR="/tmp/vscodium-download"
INSTALL_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/external/vscodium-bin"
ARCH="x64"  # Options: x64, arm64
OS="linux"  # Options: linux, darwin (for macOS), win32 (for Windows)

# Create directories
mkdir -p "$DOWNLOAD_DIR"
mkdir -p "$INSTALL_DIR"

# Determine the download URL
DOWNLOAD_URL="https://github.com/VSCodium/vscodium/releases/download/${VSCODIUM_VERSION}/VSCodium-${OS}-${ARCH}-${VSCODIUM_VERSION}.tar.gz"

echo "Downloading VSCodium ${VSCODIUM_VERSION} for ${OS}-${ARCH}..."
echo "URL: ${DOWNLOAD_URL}"

# Download the binary
curl -L "$DOWNLOAD_URL" -o "$DOWNLOAD_DIR/vscodium.tar.gz"

echo "Extracting to $INSTALL_DIR..."
tar -xzf "$DOWNLOAD_DIR/vscodium.tar.gz" -C "$INSTALL_DIR"

echo "Cleaning up..."
rm -rf "$DOWNLOAD_DIR"

echo "VSCodium ${VSCODIUM_VERSION} has been installed to $INSTALL_DIR"
echo "You can run it using: $INSTALL_DIR/bin/codium"

# Create a symlink for easier access
SYMLINK_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/bin"
mkdir -p "$SYMLINK_DIR"
ln -sf "$INSTALL_DIR/bin/codium" "$SYMLINK_DIR/vscodium"

echo "Created symlink: $SYMLINK_DIR/vscodium -> $INSTALL_DIR/bin/codium"