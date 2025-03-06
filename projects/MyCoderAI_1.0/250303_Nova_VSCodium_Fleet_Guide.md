# Nova VSCodium Fleet Management Guide
Version: 1.0.0
Date: 2025-03-03 19:10 MST
Author: Forge, Lead DevOps Engineer

## Overview

This guide documents the Nova VSCodium Fleet Management system, which enables the deployment and management of isolated VSCodium instances for all Nova agents across different project directories. The system has been designed to provide consistent environments with optimal performance for each Nova agent while ensuring resource isolation and monitoring capabilities.

## Requirements

- VSCodium installed on the system (`vscodium` command available in PATH)
- 200% CPU allocation per instance (2 cores)
- 10GB memory allocation per instance
- Dark High Contrast theme for all instances
- Isolated user data and extensions directories
- Project-specific working directories

## Scripts

### 1. Full Deployment Script (`launch_nova_vscodium_fleet.sh`)

This script provides a comprehensive deployment solution suitable for production environments. It creates systemd services for each Nova agent with appropriate resource limits and configurations.

#### Features:
- Generates systemd service files for persistent operation
- Configures CPU and memory limits per instance
- Sets up monitoring infrastructure
- Creates isolated directories for user data and extensions
- Configures High Contrast theme and optimal settings
- Provides a monitoring script for real-time status tracking

#### Usage:
```bash
# Setup without launching
./launch_nova_vscodium_fleet.sh

# Setup and start all services (requires sudo)
sudo ./launch_nova_vscodium_fleet.sh --start-services

# Direct launch without systemd
./launch_nova_vscodium_fleet.sh --launch-direct
```

### 2. Direct Launch Script (`direct_launch_novas.sh`)

This script provides a simpler, user-level approach to launching all Nova VSCodium instances without requiring system privileges. It's ideal for development environments or quick testing.

#### Features:
- Launches all Nova agent instances directly
- Creates user-level configuration directories (~/.nova-vscodium)
- Sets High Contrast theme and optimal settings
- Configures CPU limits using cpulimit (if available)
- Includes real-time monitoring capability
- Tracks instance PIDs for monitoring and management

#### Usage:
```bash
# Launch all instances
./direct_launch_novas.sh

# Monitor running instances
~/.nova-vscodium/monitor.sh
```

## Nova Agent Configuration

The following Nova agents are configured with their respective project directories:

| Nova Agent | Project Directory | Description |
|------------|-------------------|-------------|
| Genesis    | /data-nova/ax/DevOps/mcp_master | Master MCP server development |
| Synergy    | /data-nova/ax/DevOps/mcp_master/mcp-dev | MCP development environment |
| Pathfinder | /data-nova/ax/InfraOps | Infrastructure Operations |
| Ethos      | /data-nova/ax/MLOps | Machine Learning Operations |
| Cosmos     | /data-nova/ax/NovaOps/NovaSynth | Nova Synthesis Operations |
| River      | /data-nova/ax/InfraOps/ray | Ray Infrastructure |
| Synapse    | /data-nova/ax/MLOps/aiml/positions/ml_systems_engineer | ML Systems Engineering |
| Theseus    | /data-nova/ax/MLOps/aiml/positions/ml_systems_engineer | ML Systems Engineering (duplicate) |
| Vaeris     | /data-nova/ax/NovaOps | Nova Operations |
| Forge      | /data-nova/ax/DevOps/DevOps-VSC/NovaIDE | DevOps VSCode Engineering |
| Bridge     | /data-nova/ax/RouteOps | Routing Operations |

## Default VSCodium Configuration

All Nova agent instances are configured with the following baseline settings:

```json
{
  "workbench.colorTheme": "Default High Contrast",
  "workbench.preferredDarkColorTheme": "Default High Contrast",
  "editor.fontSize": 14,
  "editor.fontFamily": "JetBrains Mono, Consolas, monospace",
  "editor.formatOnSave": true,
  "workbench.startupEditor": "none",
  "terminal.integrated.defaultProfile.linux": "bash",
  "window.restoreWindows": "none",
  "files.autoSave": "afterDelay",
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.nova/contexts": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/.nova/contexts/**": true,
    "**/dist/**": true
  }
}
```

## Resource Allocation

Each Nova VSCodium instance is configured with the following resource allocation:

- **CPU:** 200% (equivalent to 2 cores)
- **Memory:** 10GB maximum
- **Memory High Threshold:** 9GB (for systemd services)
- **IO Priority:** 90 (high)

## Monitoring

### Real-time Monitoring

Both scripts provide real-time monitoring capabilities for all running Nova VSCodium instances:

- **System Service Deployment:** Logs to `/var/log/nova/vscodium/[agent].log`
- **Direct Launch:** Logs to `~/.nova-vscodium/logs/[agent].log`

The monitoring scripts display:
- Agent name
- Process ID
- CPU usage percentage
- Memory usage (MB)
- Current status

### Long-term Monitoring

For production deployments using the systemd services, standard Linux monitoring tools can be used:

```bash
# View logs for a specific agent
journalctl -u nova-vscodium-forge.service

# Check status of all Nova VSCodium services
systemctl status 'nova-vscodium-*.service'
```

## Troubleshooting

### Instance Not Starting

1. Check for existing instance with the same user data directory:
```bash
ps aux | grep vscodium
```

2. Verify permissions on the working directory:
```bash
ls -la /data-nova/ax/[path/to/working/dir]
```

3. Check logs:
```bash
# For system service deployment
journalctl -u nova-vscodium-[agent].service
# For direct launch
cat ~/.nova-vscodium/logs/[agent].log
```

### High Resource Usage

If a VSCodium instance is consuming excessive resources:

1. Identify the process:
```bash
~/.nova-vscodium/monitor.sh  # or system monitoring tools
```

2. Apply additional limits:
```bash
# For direct launch
cpulimit -p [PID] -l 150  # Reduce to 150% CPU

# For system service
systemctl set-property nova-vscodium-[agent].service CPUQuota=150%
```

## Maintenance

### Updating Settings

To update settings for all instances:

1. Edit the common settings file:
   - System deployment: `/etc/nova/vscodium/common/common.json`
   - Direct launch: `~/.nova-vscodium/nova-base-settings.json`

2. Restart all instances:
   - System deployment: `systemctl restart 'nova-vscodium-*.service'`
   - Direct launch: Stop all instances and re-run the launch script

### Adding New Nova Agents

To add a new Nova agent:

1. Edit the AGENTS array in the respective script
2. Run the script again to create the new instance

## Conclusion

The Nova VSCodium Fleet Management system provides a comprehensive solution for deploying and managing isolated VSCodium instances for all Nova agents. By using these scripts, you can ensure consistent environments with optimal performance for each agent while maintaining proper resource isolation and monitoring capabilities.

For any questions or improvements, contact the DevOps team through the devops.team.communication stream.