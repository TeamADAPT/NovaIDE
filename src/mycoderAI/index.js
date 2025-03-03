/**
 * MyCoderAI - Entry Point
 * Version: 0.1.0
 * Date: 2025-03-03
 * Author: Forge, DevOps Lead
 * 
 * This is the main entry point for the MyCoderAI MVP application.
 * It initializes all core components and establishes the communication
 * framework between agents, memory systems, and the user interface.
 */

'use strict';

// Core dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');

// Internal modules
const AgentOrchestrator = require('./agent/orchestrator');
const MemoryManager = require('./memory/memoryManager');
const CommunicationHub = require('./communication/hub');
const ExecutionEnvironment = require('./execution/environment');
const UIServer = require('./ui/server');

// Configuration
const config = {
  port: process.env.PORT || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  agentCount: process.env.AGENT_COUNT || 5,
  memoryPersistence: process.env.MEMORY_PERSISTENCE || 'sqlite'
};

// Initialize logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'mycoderai' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Create system components
logger.info('Initializing MyCoderAI components...');

// Memory system
const memoryManager = new MemoryManager({
  persistenceType: config.memoryPersistence,
  logger
});

// Communication hub
const communicationHub = new CommunicationHub({
  io,
  logger
});

// Execution environment
const executionEnvironment = new ExecutionEnvironment({
  logger
});

// Agent orchestrator
const agentOrchestrator = new AgentOrchestrator({
  agentCount: config.agentCount,
  communicationHub,
  memoryManager,
  executionEnvironment,
  logger
});

// UI server
const uiServer = new UIServer({
  app,
  io,
  agentOrchestrator,
  memoryManager,
  logger
});

// Start the system
async function startSystem() {
  try {
    logger.info('Starting MyCoderAI MVP...');
    
    // Initialize subsystems
    await memoryManager.initialize();
    await communicationHub.initialize();
    await executionEnvironment.initialize();
    await agentOrchestrator.initialize();
    await uiServer.initialize();
    
    // Start the server
    server.listen(config.port, () => {
      logger.info(`MyCoderAI server running on port ${config.port}`);
      logger.info('System startup complete. MyCoderAI MVP is now operational.');
      
      // Log startup time for performance tracking
      logger.info(`Startup completed in ${process.uptime()} seconds`);
    });
    
    // Handle shutdown gracefully
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start MyCoderAI:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down MyCoderAI...');
  
  try {
    await agentOrchestrator.shutdown();
    await memoryManager.shutdown();
    await communicationHub.shutdown();
    await executionEnvironment.shutdown();
    
    server.close(() => {
      logger.info('Server stopped');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the system
startSystem();

module.exports = {
  app,
  server,
  io,
  agentOrchestrator,
  memoryManager,
  communicationHub,
  executionEnvironment,
  uiServer,
  config,
  logger
};