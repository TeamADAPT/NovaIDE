# MyCoderAI Technology Context
**Version:** 0.1.0
**Date:** 2025-03-03
**Author:** Forge, DevOps Lead

## Technology Stack

### Backend Technologies
- **Runtime Environment:** Node.js v18+
- **Server Framework:** Express.js 4.18+
- **Real-time Communication:** Socket.IO 4.5+
- **Process Management:** PM2 5.2+
- **Database:**
  - SQLite 3.36+ (default storage)
  - Redis 6.2+ (optional for distributed setups)
- **Execution Environment:**
  - Docker 24.0+ (when available)
  - Child Process API (fallback)

### Frontend Technologies
- **Framework:** React 18.2+
- **UI Library:** Bootstrap 5.1+
- **State Management:** React Context API
- **Data Fetching:** Axios 1.3+
- **WebSocket Client:** Socket.IO Client 4.5+
- **Visualization:** Chart.js 4.0+

### Development Tools
- **Package Management:** npm 8.0+
- **Build Tools:**
  - Webpack 5.75+
  - Babel 7.20+
- **Testing Framework:**
  - Jest 29.0+
  - Supertest 6.0+
  - React Testing Library 13.0+
- **Code Quality:**
  - ESLint 8.30+
  - Prettier 2.8+

### Containerization & Deployment
- **Containerization:** Docker 24.0+
- **Orchestration:** Docker Compose 2.15+ (development)
- **CI/CD Pipeline:** GitHub Actions

## Development Setup

### Local Development Environment
1. **Prerequisites:**
   - Node.js v18+ installed
   - npm 8.0+ installed
   - Docker (optional, for enhanced execution isolation)
   - Git for version control

2. **Installation Steps:**
   ```bash
   # Clone repository
   git clone https://github.com/organization/mycoderai.git
   cd mycoderai
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.example .env
   # Edit .env with required API keys and configuration
   
   # Start development server
   npm run dev
   ```

3. **Development Server:**
   - Express server runs on port 3000
   - Socket.IO attaches to Express server
   - Frontend development server on port 3001
   - API endpoints at /api/*
   - Socket.IO path at /socket.io

### Directory Structure
```
mycoderai/
├── src/
│   ├── agent/            # Agent orchestration system
│   ├── memory/           # Memory management system
│   ├── communication/    # Communication protocol 
│   ├── execution/        # Code execution environment
│   ├── ui/               # User interface (server + client)
│   └── utils/            # Shared utilities
├── tests/                # Test suites
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── .env.example          # Environment variable template
└── package.json          # Project dependencies and scripts
```

### Build and Deployment
- **Development Mode:**
  ```bash
  npm run dev             # Starts development server with hot reloading
  ```

- **Production Build:**
  ```bash
  npm run build           # Creates optimized production build
  npm run start           # Starts production server
  ```

- **Docker Deployment:**
  ```bash
  docker-compose up       # Starts all services using Docker
  ```

- **Testing:**
  ```bash
  npm run test            # Runs all tests
  npm run test:unit       # Runs only unit tests
  npm run test:integration # Runs only integration tests
  npm run test:e2e        # Runs end-to-end tests
  ```

## Technical Constraints

### Performance Constraints
1. **Memory Usage:**
   - System designed to operate within 2GB RAM for core functionality
   - Execution environment may require additional memory based on task complexity
   - Memory usage monitoring and adaptive resource allocation implemented

2. **Execution Timeouts:**
   - Default execution timeout: 10 seconds
   - Long-running tasks: 30 seconds
   - Custom timeouts configurable per task

3. **Concurrency Limits:**
   - Default maximum concurrent agents: 10
   - Default maximum concurrent code executions: 5
   - Queue-based execution for exceeding requests

### Security Constraints
1. **Code Execution:**
   - Isolated execution environments
   - Resource limits enforced (CPU, memory, disk, network)
   - No access to host file system outside designated directories
   - Network access disabled by default

2. **API Constraints:**
   - Rate limiting on all endpoints
   - Input validation and sanitization
   - Authentication required for sensitive operations
   - CORS restrictions on API endpoints

3. **Data Persistence:**
   - Encryption for sensitive data
   - Access control for stored information
   - Data retention policies

### Scalability Constraints
1. **Single-Instance Limitations:**
   - MVP designed for single-server deployment
   - Local resource constraints apply
   - Limited horizontal scaling

2. **Future Distributed Architecture:**
   - Designed for future distribution of components
   - Service discovery and registration required
   - Consistent state management across instances needed

### External API Constraints
1. **LLM API Rate Limits:**
   - Rate limiting based on provider restrictions
   - Token budgeting and allocation
   - Graceful degradation when limits reached

2. **Dependencies on External Services:**
   - Fallback mechanisms for API unavailability
   - Caching strategies to reduce API calls
   - Timeout handling for external requests

## Integration Requirements

### LLM API Integration
1. **Provider Requirements:**
   - OpenAI API v1 compatibile endpoints
   - Anthropic API compatible endpoints (future)
   - Support for streaming responses
   - Authentication via API keys

2. **Integration Interface:**
   - Unified abstraction layer for multiple providers
   - Prompt template management
   - Context window management
   - Token usage tracking

3. **Expected Capabilities:**
   - Text completion with high coherence
   - Context retention of at least 16K tokens
   - Support for system, assistant, and user roles
   - Response streaming

### Version Control Integration
1. **Git Integration Requirements:**
   - Local git operations (init, add, commit, branch)
   - Remote repository operations (optional)
   - Commit message generation
   - Diff visualization and processing

2. **Integration Interface:**
   - Command abstraction layer
   - Event-based change tracking
   - Automatic commit grouping
   - Conflict resolution strategies

### Development Tool Integration
1. **Package Manager Integration:**
   - Support for npm, pip, and other language-specific managers
   - Dependency resolution and installation
   - Version management
   - Security vulnerability checking

2. **Build Tool Integration:**
   - Support for language-specific build processes
   - Output parsing and analysis
   - Error handling and reporting

3. **Testing Framework Integration:**
   - Test discovery and execution
   - Result analysis and reporting
   - Coverage measurement
   - Failure diagnosis

### User Environment Integration
1. **File System Access:**
   - Sandbox directory for project files
   - Controlled access to user directories
   - File change monitoring
   - Atomic file operations

2. **Process Management:**
   - Background process execution
   - Health monitoring
   - Resource usage tracking
   - Graceful termination