# VSCodium Deployment Quick Start Guide

This guide provides step-by-step instructions for deploying VSCodium instances for Nova agents.

## Prerequisites

- VSCodium repository cloned to `/data-nova/ax/DevOps/DevOps-VSC/NovaIDE/external/vscodium`
- Systemd services installed
- Sudo access for service management

## Deployment Steps

### 1. Deploy VSCodium Instances for Specific Agents

To deploy VSCodium instances for specific agents:

```bash
# Deploy for specific agents
./scripts/deploy_vscodium_agents.sh architect coder tester

# Deploy for all agents listed in config/nova_agents.txt
./scripts/deploy_vscodium_agents.sh --all
```

This will:
- Create workspace directories for each agent
- Install systemd services
- Enable and start the services
- Check service status

### 2. Start Monitoring

To monitor the VSCodium instances:

```bash
# Start monitoring service
sudo systemctl enable vscodium-monitor.service
sudo systemctl start vscodium-monitor.service

# Check monitoring status
sudo systemctl status vscodium-monitor.service
```

The monitoring service will:
- Track resource usage of all VSCodium instances
- Detect and report crashes
- Collect metrics and logs
- Provide a real-time dashboard

### 3. Manual Instance Management

You can also manage VSCodium instances manually:

```bash
# Start a VSCodium instance for a specific agent
./scripts/vscodium_isolation.sh architect /data-nova/ax/DevOps/architect

# Start with custom memory limit
./scripts/vscodium_isolation.sh coder /data-nova/ax/DevOps/coder --memory-limit=4096

# Start with disabled extensions
./scripts/vscodium_isolation.sh tester /data-nova/ax/DevOps/tester --disable-extensions
```

### 4. Service Management

Manage all VSCodium instances together:

```bash
# Start all instances
sudo systemctl start vscodium-instances.target

# Stop all instances
sudo systemctl stop vscodium-instances.target

# Restart all instances
sudo systemctl restart vscodium-instances.target

# Check status of all instances
sudo systemctl status vscodium-instances.target
```

Manage individual instances:

```bash
# Start a specific instance
sudo systemctl start vscodium@architect.service

# Stop a specific instance
sudo systemctl stop vscodium@architect.service

# Restart a specific instance
sudo systemctl restart vscodium@architect.service

# Check status of a specific instance
sudo systemctl status vscodium@architect.service
```

## Directory Structure

- `/home/x/.vscodium-isolated/{agent}` - User data directory for each agent
- `/home/x/.vscodium-isolated/{agent}/extensions` - Extensions directory for each agent
- `/data-nova/ax/DevOps/{agent}` - Workspace directory for each agent
- `/data-nova/ax/DevOps/logs/vscodium/{agent}` - Log directory for each agent
- `/data-nova/ax/DevOps/metrics/vscodium/{agent}` - Metrics directory for each agent

## Troubleshooting

### VSCodium Instance Not Starting

Check the service status:

```bash
sudo systemctl status vscodium@{agent}.service
```

Check the logs:

```bash
journalctl -u vscodium@{agent}.service
cat /data-nova/ax/DevOps/logs/vscodium/{agent}/vscodium_*.log
```

### High Resource Usage

Check the metrics:

```bash
cat /data-nova/ax/DevOps/metrics/vscodium/{agent}/metrics_*.csv
```

Restart the instance with higher memory limit:

```bash
sudo systemctl stop vscodium@{agent}.service
./scripts/vscodium_isolation.sh {agent} /data-nova/ax/DevOps/{agent} --memory-limit=4096
```

### Crashes

Check the crash logs:

```bash
cat /data-nova/ax/DevOps/logs/vscodium/{agent}/crashes.log
```

Restart the instance:

```bash
sudo systemctl restart vscodium@{agent}.service
```

## Next Steps

- Configure VSCodium settings for each agent
- Install additional extensions
- Set up workspace-specific settings
- Configure memory and communication services