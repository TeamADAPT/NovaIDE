# NovaIDE Quick Start Guide
Version: 1.0.0
Created: 2025-03-02 05:04 MST
Author: Forge, Lead VSCode Developer

## Overview

This guide helps you set up a development environment for NovaIDE using VSCodium with integrated memory systems (Redis, MongoDB, Elasticsearch) for Nova context management.

## Prerequisites

- Node.js v20+
- Git
- Docker
- VSCodium (or will be installed during setup)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/TeamADAPT/novaide.git
cd novaide
```

2. Start the development environment:
```bash
# Make scripts executable
chmod +x scripts/start_dev_env.sh
chmod +x scripts/setup_vscodium_dev.sh

# Start memory services and setup environment
./scripts/start_dev_env.sh
```

3. Launch VSCodium:
```bash
cd vscodium
yarn watch
```

## Memory Systems

### Redis (Active Context)
- Port: 6379
- Purpose: Active Nova context state
- Access: Redis Client extension in VSCodium

### MongoDB (Persistent Storage)
- Port: 27017
- Purpose: Long-term operation storage
- Access: MongoDB extension in VSCodium

### Elasticsearch (Search)
- Port: 9200
- Purpose: Semantic search across contexts
- Access: Elasticsearch extension in VSCodium

## Development Workflow

1. **Start Memory Services**
```bash
# From project root
docker-compose up -d
```

2. **Check Service Health**
```bash
# Redis
redis-cli ping

# MongoDB
mongosh --eval "db.runCommand({ ping: 1 })"

# Elasticsearch
curl localhost:9200/_cluster/health
```

3. **VSCodium Development**
```bash
cd vscodium
yarn watch
```

## Project Structure

```
novaide/
├── src/                    # Source code
│   ├── core/              # Core functionality
│   ├── memory/            # Memory systems
│   ├── agents/            # Agent frameworks
│   └── processing/        # Data processing
├── services/              # Microservices
│   ├── context/          # Context management
│   ├── memory/           # Memory services
│   └── monitoring/       # System monitoring
└── docs/                 # Documentation
```

## Common Tasks

### Adding a New Nova Context
```typescript
// Using NovaMemoryService
const context = await memoryService.createContext({
  name: "MyNova",
  mode: "development",
  resources: {
    cpu: 1,
    memory: 1024
  }
});
```

### Switching Contexts
```typescript
// Using NovaContextService
await contextService.switchContext("nova1", "nova2");
```

### Searching Operation History
```typescript
// Using NovaSearchService
const operations = await searchService.findOperations({
  novaId: "nova1",
  timeRange: "24h",
  pattern: "code_edit"
});
```

## Troubleshooting

### Memory Services
- Check Docker container status: `docker ps`
- View container logs: `docker logs <container_name>`
- Restart services: `docker-compose restart`

### VSCodium Development
- Clear watch: `yarn watch-clean`
- Rebuild: `yarn clean && yarn && yarn watch`
- Check logs: `tail -f ~/.vscodium/logs/main.log`

## Next Steps

1. Read the [Development Guide](docs/DEVELOPMENT.md)
2. Review [Architecture Overview](docs/ARCHITECTURE.md)
3. Check [Contributing Guidelines](CONTRIBUTING.md)

## Support

- Issues: GitHub Issues
- Questions: Team Chat
- Documentation: /docs

Remember: Always use the memory services for context management. Don't store Nova state directly in files.