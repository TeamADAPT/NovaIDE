#!/bin/bash

echo "🚀 Starting Nova Development Environment"
echo "Version: 1.0.0"
echo "Created: 2025-03-02 05:04 MST"
echo "Author: Forge"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check service health
check_service_health() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service_name to be ready..."
    while ! nc -z localhost $port && [ $attempt -le $max_attempts ]; do
        printf "."
        sleep 1
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        echo "❌ $service_name failed to start"
        return 1
    else
        echo "✅ $service_name is ready"
        return 0
    fi
}

# Check Docker
check_docker

# Create data directories if they don't exist
mkdir -p data/{redis,mongodb,elasticsearch}

# Start services using docker-compose
echo "🔄 Starting memory services..."
docker-compose up -d

# Check services health
check_service_health "Redis" 6379
check_service_health "MongoDB" 27017
check_service_health "Elasticsearch" 9200

# Copy VSCodium settings if they don't exist
VSCODIUM_CONFIG_DIR="$HOME/.config/VSCodium/User"
mkdir -p "$VSCODIUM_CONFIG_DIR"

if [ ! -f "$VSCODIUM_CONFIG_DIR/settings.json" ]; then
    echo "📝 Setting up VSCodium configuration..."
    cp config/vscodium.settings.json "$VSCODIUM_CONFIG_DIR/settings.json"
fi

# Clone VSCodium if not already cloned
if [ ! -d "vscodium" ]; then
    echo "📦 Cloning VSCodium repository..."
    git clone https://github.com/VSCodium/vscodium.git
    cd vscodium
    git checkout -b feature/nova-integration
    cd ..
fi

# Set up development environment
echo "⚙️ Setting up development environment..."

# Install Node.js dependencies
cd vscodium
yarn install

# Create Nova development directories
mkdir -p src/vs/workbench/services/nova/{memory,context,extension}

echo "
🎉 Development environment is ready!

Services:
- Redis: localhost:6379
- MongoDB: localhost:27017
- Elasticsearch: localhost:9200
- Kibana: http://localhost:5601

Development:
1. cd vscodium
2. yarn watch
3. Launch VSCodium with Nova extensions

Memory Systems:
- Redis GUI: Use Redis Client extension
- MongoDB: Use MongoDB extension
- Elasticsearch: Use Elasticsearch extension

Documentation:
- Project docs: /docs
- API docs: /docs/api
- Development guide: /docs/development.md

Happy coding! 🚀"