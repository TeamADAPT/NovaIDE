# Technical Context

**Version:** 1.0.6  
**Last Updated:** March 3, 2025 at 08:33 MST  
**Updated By:** Forge, Lead VSCode/VSCodium Developer  

## Technology Stack

### Development Environment
- **VSCodium:** Open-source build of VS Code without Microsoft telemetry
- **Node.js:** v20.x for runtime environment
- **TypeScript:** v5.x for type-safe JavaScript development
- **Yarn:** Package management
- **Git:** Version control
- **Systemd:** Service management

### Memory Systems
- **Redis:** Real-time operations, state management
  - Host: localhost
  - Port: 6379
  - Database: 0
  - Prefix: nova:
  - TTL: 3600
- **MongoDB:** Structured data, operation history
  - URL: mongodb://localhost:27017
  - Database: nova_development
  - Collections:
    - nova_operations
    - nova_contexts
    - nova_memory
- **Elasticsearch:** Semantic search across contexts
  - Node: http://localhost:9200
  - Indices:
    - nova-operations-{YYYY.MM}
    - nova-contexts
    - nova-patterns

### Messaging Systems
- **Kafka:** Core event streaming platform
  - Brokers: localhost:9092
  - Topics:
    - nova.events
    - nova.operations
    - nova.contexts
- **NATS:** Service mesh for real-time agent coordination
  - URL: nats://localhost:4222
  - Subjects:
    - nova.agents.>
    - nova.services.>
- **Pulsar:** Multi-tenant distribution
  - Service URL: pulsar://localhost:6650
  - Admin URL: http://localhost:8080
  - Tenants: nova

### Agent Frameworks
- **LangChain:** Agent orchestration
- **LangGraph:** Agent workflow management
- **Crew.ai:** Team-based agent collaboration
- **Semantic Kernel:** Reasoning and planning
- **Autogen:** Multi-agent conversation framework
- **X.Nova:** Custom agent framework

### UI/Visualization
- **Express:** Backend server
- **Socket.IO:** Real-time communication
- **React:** Frontend framework
- **D3.js:** Data visualization
- **Material-UI:** Component library

## Development Setup

### VSCodium Instances
- **Isolated User Data:** /home/x/.vscodium-isolated/{agent_name}
- **Isolated Extensions:** /home/x/.vscodium-isolated/{agent_name}/extensions
- **API Keys:** Configured in settings.json
- **Memory Configuration:** Configured in settings.json
- **Launch Script:** scripts/launch_agent_vscodium.sh
- **Setup Script:** scripts/setup_all_vscodium_instances.sh
- **Monitor Script:** scripts/monitor_vscodium_instances.sh

### Systemd Services
- **VSCodium Instances:** vscodium@{agent_name}.service
- **VSCodium Monitor:** vscodium-monitor.service
- **VSCodium Target:** vscodium-instances.target
- **Service Configuration:** /etc/systemd/system/

### Resource Allocation
- **CPU Cores:** 176 total
- **Memory:** 1.4TB total
- **Disk Space:** 1TB total
- **Per Instance:**
  - CPU: 8 cores
  - Memory: 32GB
  - Disk: 50GB

## Technical Constraints

### Performance Requirements
- **Extension Host Stability:** 99.9%
- **Window Isolation:** 100%
- **Memory System Access Time:** <50ms
- **Event Processing Time:** <10ms
- **Service Mesh Latency:** <1ms
- **Distribution Latency:** <50ms
- **Pattern Emergence Time:** <50ms

### Security Constraints
- **API Key Management:** Isolated per instance
- **Process Isolation:** Complete
- **Memory Isolation:** Complete
- **Extension Isolation:** Complete
- **Network Access:** Controlled
- **File System Access:** Restricted to workspace

### Integration Requirements
- **VSCodium Extension API:** v1.80.x
- **Node.js API:** v20.x
- **Redis API:** v7.x
- **MongoDB API:** v6.x
- **Elasticsearch API:** v8.x
- **Kafka API:** v3.x
- **NATS API:** v2.x
- **Pulsar API:** v3.x

## Integration Points

### VSCodium Integration
- **Extension Host:** Modified for Nova context
- **Window Management:** Isolated per agent
- **Settings Management:** Isolated per agent
- **Extension Management:** Isolated per agent
- **API Key Management:** Isolated per agent

### Memory System Integration
- **Redis Layer:** Neural pathway system
- **MongoDB Layer:** Field pattern storage
- **Elasticsearch Layer:** Resonance detection
- **Kafka Layer:** Event streaming
- **NATS Layer:** Service mesh
- **Pulsar Layer:** Multi-tenant distribution

### Agent Framework Integration
- **LangChain:** Agent orchestration
- **LangGraph:** Agent workflow management
- **Crew.ai:** Team-based agent collaboration
- **Semantic Kernel:** Reasoning and planning
- **Autogen:** Multi-agent conversation framework
- **X.Nova:** Custom agent framework

## Deployment Architecture

### Development Environment
- **VM Type:** c3-highmem-176
- **CPU:** 176 cores
- **Memory:** 1.4TB
- **Disk:** 1TB SSD
- **Network:** 32 Gbps
- **Zone:** us-central1-a

### Production Environment
- **VM Type:** c3-highmem-176 (x3)
- **CPU:** 176 cores (x3)
- **Memory:** 1.4TB (x3)
- **Disk:** 1TB SSD (x3)
- **Network:** 32 Gbps
- **Zone:** us-central1-a, us-east1-b, us-west1-a

### Monitoring
- **Prometheus:** Metrics collection
- **Grafana:** Visualization
- **Node Exporter:** System metrics
- **Service Health Check:** Service monitoring
- **Custom Scripts:** VSCodium instance monitoring