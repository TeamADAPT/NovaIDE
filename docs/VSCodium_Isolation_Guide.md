# VSCodium Isolation Guide

This guide explains how to use the VSCodium isolation scripts to run multiple VSCodium instances with isolated user data, extensions, and working directories.

## Overview

The VSCodium isolation scripts allow you to run multiple VSCodium instances with:

- Isolated user data directories
- Isolated extensions directories
- Different working directories
- Resource limits

This is useful for:

- Running multiple VSCodium instances for different projects
- Testing different extensions without conflicts
- Isolating development environments
- Running multiple Nova agents with their own environments

## Scripts

### vscodium_isolation.sh

This script launches a VSCodium instance with isolated user data and extensions directories.

```bash
./scripts/vscodium_isolation.sh <instance_name> <working_directory>
```

Parameters:
- `<instance_name>`: Name of the instance (e.g., "forge", "vaeris", "theseus")
- `<working_directory>`: Path to the working directory for the instance

Example:
```bash
./scripts/vscodium_isolation.sh forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

### launch_vscodium.sh

This script is a wrapper around vscodium_isolation.sh that provides a simpler interface.

```bash
./scripts/launch_vscodium.sh <instance_name> <working_directory>
```

Parameters:
- `<instance_name>`: Name of the instance (e.g., "forge", "vaeris", "theseus")
- `<working_directory>`: Path to the working directory for the instance

Example:
```bash
./scripts/launch_vscodium.sh forge /data-nova/ax/DevOps/DevOps-VSC/NovaIDE
```

### launch_concurrent_vscodium.sh

This script launches VSCodium instances for Forge, Vaeris, and Theseus concurrently in separate GNOME terminals.

```bash
./scripts/launch_concurrent_vscodium.sh
```

This script will launch three VSCodium instances:
- Forge: Working directory `/data-nova/ax/DevOps/DevOps-VSC/NovaIDE`
- Vaeris: Working directory `/data-nova/ax/NovaOps`
- Theseus: Working directory `/data-nova/ax/DataOps`

## Monitoring Scripts

### vscode_ps.sh

This script shows VSCode/VSCodium processes and their working directories.

```bash
./scripts/vscode_ps.sh
```

### simple_monitor.sh

This script provides a simple monitor for VSCode/VSCodium instances.

```bash
./scripts/simple_monitor.sh
```

### monitor_vscodium_instances.sh

This script monitors VSCode/VSCodium instances and displays resource usage in real-time.

```bash
./scripts/monitor_vscodium_instances.sh
```

## Directory Structure

The VSCodium isolation scripts use the following directory structure:

- `/home/x/.vscodium-isolated/<instance_name>`: User data directory for the instance
- `/home/x/.vscodium-isolated/<instance_name>/extensions`: Extensions directory for the instance

## Resource Limits

The VSCodium instances are launched with the following resource limits:

- Node.js memory limit: 3072MB (3GB)

## Troubleshooting

If you encounter issues with the VSCodium isolation scripts, try the following:

1. Check if the working directory exists
2. Check if the user data and extensions directories exist
3. Check if VSCodium is installed
4. Check if the scripts are executable
5. Check the process list with `vscode_ps.sh`