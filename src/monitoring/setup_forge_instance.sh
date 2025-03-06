#!/bin/bash
# Forge VSCode Isolated Instance Setup
# Version: 1.0.0
# Date: March 2, 2025
# Author: Forge, DevOps Lead

set -e

# Directory paths
FORGE_USER_DIR="/home/x/.config/Code-Isolated/forge"
FORGE_EXT_DIR="/home/x/.vscode-isolated/forge/extensions"
PROJECT_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE"
SERVICE_DIR="/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/systemd"

# Banner
echo "====================================================="
echo "  Forge VSCode Isolated Instance Setup"
echo "  Version: 1.0.0"
echo "====================================================="
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "ERROR: This script must be run as root" 
  echo "Please use: sudo $0"
  exit 1
fi

# Create isolated directories
echo "[1/5] Creating isolated directories..."
mkdir -p "$FORGE_USER_DIR/User/globalStorage"
mkdir -p "$FORGE_EXT_DIR"

# Set correct permissions
echo "[2/5] Setting permissions..."
chown -R x:x "$FORGE_USER_DIR"
chown -R x:x "$FORGE_EXT_DIR"
chmod -R 700 "$FORGE_USER_DIR"
chmod -R 700 "$FORGE_EXT_DIR"

# Install systemd services
echo "[3/5] Installing systemd services..."

# Copy target if it doesn't exist
if [ ! -f "/etc/systemd/system/vscode-instances.target" ]; then
  echo "Installing vscode-instances.target..."
  cp "$SERVICE_DIR/vscode-instances.target" /etc/systemd/system/
  systemctl enable vscode-instances.target
fi

# Copy gnome-keyring service if it doesn't exist
if [ ! -f "/etc/systemd/system/gnome-keyring.service" ]; then
  echo "Installing gnome-keyring.service..."
  cp "$SERVICE_DIR/gnome-keyring.service" /etc/systemd/system/
  systemctl enable gnome-keyring.service
fi

# Install forge service
cp "$SERVICE_DIR/code-forge.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable code-forge.service

# Create launcher script
echo "[4/5] Setting up launcher script..."
chmod +x "$PROJECT_DIR/scripts/launch_forge_vscode.sh"

# Create configuration file
echo "[5/5] Creating VSCode configuration..."
cat > "$FORGE_USER_DIR/User/settings.json" << EOL
{
  "window.title": "FORGE VSCode",
  "workbench.colorTheme": "Default Dark+",
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#3a0054",
    "titleBar.activeForeground": "#ffffff",
    "activityBar.background": "#3a0054",
    "activityBar.foreground": "#ffffff"
  },
  "terminal.integrated.profiles.linux": {
    "bash": {
      "path": "bash",
      "icon": "terminal-bash",
      "env": {
        "NODE_OPTIONS": "--max-old-space-size=4096"
      }
    }
  },
  "terminal.integrated.defaultProfile.linux": "bash",
  "editor.fontFamily": "'Fira Code', 'Droid Sans Mono', 'monospace'",
  "editor.fontSize": 14,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "workbench.startupEditor": "none",
  "window.restoreWindows": "none",
  "security.workspace.trust.enabled": false,
  "telemetry.telemetryLevel": "off",
  "telemetry.enableCrashReporter": false,
  "telemetry.enableTelemetry": false,
  "update.mode": "none",
  "update.showReleaseNotes": false
}
EOL

# Create a custom keybindings file
cat > "$FORGE_USER_DIR/User/keybindings.json" << EOL
[
  {
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.build"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.toggleTerminal"
  }
]
EOL

echo 
echo "====================================================="
echo "  Installation Complete"
echo "====================================================="
echo
echo "You can launch Forge VSCode in the following ways:"
echo
echo "1. Manual launch:"
echo "   $ bash /data-nova/ax/DevOps/DevOps-VSC/NovaIDE/scripts/launch_forge_vscode.sh"
echo
echo "2. Systemd service:"
echo "   $ sudo systemctl start code-forge"
echo
echo "3. Or to enable at startup:"
echo "   $ sudo systemctl enable code-forge"
echo
echo "NOTE: If you encounter conflicts with other VSCode instances,"
echo "      consider using the manual launch script instead of systemd."
echo "====================================================="