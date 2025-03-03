/**
 * UI Server
 * Version: 0.1.0
 * Date: 2025-03-03
 * Author: Forge, DevOps Lead
 * 
 * The UI Server provides the web interface for human users to observe
 * and interact with the autonomous development system. It handles
 * visualization of development progress, intervention points, and
 * system status monitoring.
 */

'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

class UIServer {
  constructor(options = {}) {
    this.options = options;
    this.app = options.app;
    this.io = options.io;
    this.logger = options.logger;
    this.agentOrchestrator = options.agentOrchestrator;
    this.memoryManager = options.memoryManager;
    
    this.staticPath = options.staticPath || path.join(__dirname, 'static');
    this.uiConfig = {
      refreshInterval: options.refreshInterval || 5000,
      maxTaskHistory: options.maxTaskHistory || 10,
      autoRefresh: options.autoRefresh !== false
    };
    
    this.status = {
      initialized: false,
      activeConnections: 0
    };
    
    this.logger.info('UI Server created');
  }
  
  /**
   * Initialize the UI server
   */
  async initialize() {
    this.logger.info('Initializing UI Server...');
    
    try {
      // Create static directory if it doesn't exist
      await fs.mkdir(this.staticPath, { recursive: true });
      
      // Set up Express middleware
      this._setupMiddleware();
      
      // Set up API routes
      this._setupRoutes();
      
      // Set up Socket.IO events if available
      if (this.io) {
        this._setupSocketIO();
      }
      
      // Create basic UI files if they don't exist
      await this._ensureUIFiles();
      
      this.status.initialized = true;
      this.logger.info('UI Server initialized');
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize UI Server:', error);
      throw error;
    }
  }
  
  /**
   * Set up Express middleware
   */
  _setupMiddleware() {
    // Enable CORS
    this.app.use(cors());
    
    // Parse JSON request bodies
    this.app.use(express.json());
    
    // Serve static files
    this.app.use(express.static(this.staticPath));
    
    // Add request logging
    this.app.use((req, res, next) => {
      this.logger.info(`${req.method} ${req.path}`);
      next();
    });
  }
  
  /**
   * Set up API routes
   */
  _setupRoutes() {
    const router = express.Router();
    
    // System status endpoint
    router.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        initialized: this.status.initialized,
        activeConnections: this.status.activeConnections,
        timestamp: new Date().toISOString()
      });
    });
    
    // UI configuration endpoint
    router.get('/api/config', (req, res) => {
      res.json(this.uiConfig);
    });
    
    // Update UI configuration endpoint
    router.post('/api/config', (req, res) => {
      const { refreshInterval, maxTaskHistory, autoRefresh } = req.body;
      
      // Update config if values are provided
      if (refreshInterval !== undefined) {
        this.uiConfig.refreshInterval = parseInt(refreshInterval, 10);
      }
      
      if (maxTaskHistory !== undefined) {
        this.uiConfig.maxTaskHistory = parseInt(maxTaskHistory, 10);
      }
      
      if (autoRefresh !== undefined) {
        this.uiConfig.autoRefresh = !!autoRefresh;
      }
      
      res.json(this.uiConfig);
    });
    
    // Agent information endpoint
    router.get('/api/agents', (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      res.json({
        agents: this.agentOrchestrator.getAllAgents(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Agent detail endpoint
    router.get('/api/agents/:agentId', (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      const agentId = req.params.agentId;
      const agentInfo = this.agentOrchestrator.getAgentInfo(agentId);
      
      if (!agentInfo) {
        return res.status(404).json({ error: `Agent ${agentId} not found` });
      }
      
      res.json({
        agent: agentInfo,
        timestamp: new Date().toISOString()
      });
    });
    
    // Task information endpoint
    router.get('/api/tasks', (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      res.json({
        tasks: this.agentOrchestrator.getAllTasks(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Task detail endpoint
    router.get('/api/tasks/:taskId', (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      const taskId = req.params.taskId;
      const taskInfo = this.agentOrchestrator.getTaskInfo(taskId);
      
      if (!taskInfo) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
      }
      
      res.json({
        task: taskInfo,
        timestamp: new Date().toISOString()
      });
    });
    
    // Create new task endpoint
    router.post('/api/tasks', async (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      const { description, inputs, priority } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: 'Task description is required' });
      }
      
      try {
        // Generate a task ID
        const taskId = `task-${Date.now()}`;
        
        // Create task data
        const taskData = {
          id: taskId,
          description,
          inputs: inputs || {},
          priority: priority || 'normal',
          createdAt: new Date().toISOString(),
          createdBy: 'user'
        };
        
        // Submit task to orchestrator
        this.agentOrchestrator.handleNewTask(taskData);
        
        res.status(201).json({
          task: taskData,
          message: 'Task created successfully'
        });
      } catch (error) {
        this.logger.error('Error creating task:', error);
        
        res.status(500).json({
          error: 'Failed to create task',
          message: error.message
        });
      }
    });
    
    // Stop task endpoint
    router.post('/api/tasks/:taskId/stop', async (req, res) => {
      if (!this.agentOrchestrator) {
        return res.status(503).json({ error: 'Agent Orchestrator not available' });
      }
      
      const taskId = req.params.taskId;
      const taskInfo = this.agentOrchestrator.getTaskInfo(taskId);
      
      if (!taskInfo) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
      }
      
      try {
        // Submit task stop request
        // In a real implementation, this would be more sophisticated
        // and handle graceful shutdown of the task
        const result = {
          taskId,
          status: 'stopping',
          message: 'Task stop request submitted'
        };
        
        // Emit event to stop the task
        if (this.io) {
          this.io.emit('task:stopping', { taskId });
        }
        
        res.json(result);
      } catch (error) {
        this.logger.error(`Error stopping task ${taskId}:`, error);
        
        res.status(500).json({
          error: 'Failed to stop task',
          message: error.message
        });
      }
    });
    
    // System metrics endpoint
    router.get('/api/metrics', (req, res) => {
      const metrics = {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      
      // Add orchestrator metrics if available
      if (this.agentOrchestrator) {
        metrics.orchestrator = this.agentOrchestrator.getStatus();
      }
      
      res.json(metrics);
    });
    
    // Register router
    this.app.use('/', router);
    
    // Fallback route for SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(this.staticPath, 'index.html'));
    });
  }
  
  /**
   * Set up Socket.IO event handlers
   */
  _setupSocketIO() {
    this.logger.info('Setting up Socket.IO event handlers');
    
    this.io.on('connection', (socket) => {
      this.logger.info(`New socket connection: ${socket.id}`);
      
      // Track connection
      this.status.activeConnections++;
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info(`Socket disconnected: ${socket.id}`);
        
        // Update connection count
        this.status.activeConnections--;
      });
      
      // Handle task creation
      socket.on('task:create', (data) => {
        if (!this.agentOrchestrator) {
          socket.emit('error', { message: 'Agent Orchestrator not available' });
          return;
        }
        
        const { description, inputs, priority } = data;
        
        if (!description) {
          socket.emit('error', { message: 'Task description is required' });
          return;
        }
        
        try {
          // Generate a task ID
          const taskId = `task-${Date.now()}`;
          
          // Create task data
          const taskData = {
            id: taskId,
            description,
            inputs: inputs || {},
            priority: priority || 'normal',
            createdAt: new Date().toISOString(),
            createdBy: 'user'
          };
          
          // Submit task to orchestrator
          this.agentOrchestrator.handleNewTask(taskData);
          
          socket.emit('task:created', { taskId, task: taskData });
        } catch (error) {
          this.logger.error('Error creating task:', error);
          
          socket.emit('error', {
            message: 'Failed to create task',
            error: error.message
          });
        }
      });
      
      // Handle agent intervention
      socket.on('agent:intervene', (data) => {
        if (!this.agentOrchestrator) {
          socket.emit('error', { message: 'Agent Orchestrator not available' });
          return;
        }
        
        const { agentId, action, parameters } = data;
        
        if (!agentId || !action) {
          socket.emit('error', { message: 'Agent ID and action are required' });
          return;
        }
        
        try {
          // In a real implementation, this would interact with the agent
          // For MVP, we'll just emit an event back
          socket.emit('agent:intervention', {
            agentId,
            action,
            status: 'received',
            timestamp: new Date().toISOString()
          });
          
          // Broadcast the intervention to all clients
          this.io.emit('agent:intervention', {
            agentId,
            action,
            initiatedBy: socket.id,
            timestamp: new Date().toISOString()
          });
          
          this.logger.info(`Intervention for agent ${agentId}: ${action}`);
        } catch (error) {
          this.logger.error(`Error intervening with agent ${agentId}:`, error);
          
          socket.emit('error', {
            message: 'Failed to intervene with agent',
            error: error.message
          });
        }
      });
      
      // Subscribe to task updates
      socket.on('task:subscribe', (data) => {
        const { taskId } = data;
        
        if (!taskId) {
          socket.emit('error', { message: 'Task ID is required' });
          return;
        }
        
        // Join the task's room
        socket.join(`task:${taskId}`);
        
        this.logger.info(`Socket ${socket.id} subscribed to task ${taskId}`);
        
        socket.emit('task:subscribed', {
          taskId,
          timestamp: new Date().toISOString()
        });
      });
      
      // Unsubscribe from task updates
      socket.on('task:unsubscribe', (data) => {
        const { taskId } = data;
        
        if (!taskId) {
          socket.emit('error', { message: 'Task ID is required' });
          return;
        }
        
        // Leave the task's room
        socket.leave(`task:${taskId}`);
        
        this.logger.info(`Socket ${socket.id} unsubscribed from task ${taskId}`);
        
        socket.emit('task:unsubscribed', {
          taskId,
          timestamp: new Date().toISOString()
        });
      });
    });
    
    // Forward orchestrator events to Socket.IO clients
    if (this.agentOrchestrator) {
      // Task events
      this.agentOrchestrator.on('task:started', (data) => {
        this.io.to(`task:${data.taskId}`).emit('task:started', data);
        this.io.emit('task:update', {
          type: 'started',
          taskId: data.taskId,
          timestamp: new Date().toISOString()
        });
      });
      
      this.agentOrchestrator.on('task:completed', (data) => {
        this.io.to(`task:${data.taskId}`).emit('task:completed', data);
        this.io.emit('task:update', {
          type: 'completed',
          taskId: data.taskId,
          timestamp: new Date().toISOString()
        });
      });
      
      this.agentOrchestrator.on('task:failed', (data) => {
        this.io.to(`task:${data.taskId}`).emit('task:failed', data);
        this.io.emit('task:update', {
          type: 'failed',
          taskId: data.taskId,
          timestamp: new Date().toISOString()
        });
      });
      
      // Subtask events
      this.agentOrchestrator.on('subtask:completed', (data) => {
        this.io.to(`task:${data.taskId}`).emit('subtask:completed', data);
      });
      
      this.agentOrchestrator.on('subtask:progress', (data) => {
        this.io.to(`task:${data.taskId}`).emit('subtask:progress', data);
      });
      
      // Agent events
      this.agentOrchestrator.on('agent:registered', (data) => {
        this.io.emit('agent:registered', data);
      });
      
      this.agentOrchestrator.on('agent:disconnected', (data) => {
        this.io.emit('agent:disconnected', data);
      });
    }
  }
  
  /**
   * Ensure UI files exist
   */
  async _ensureUIFiles() {
    this.logger.info('Ensuring UI files exist...');
    
    // HTML index file
    const indexPath = path.join(this.staticPath, 'index.html');
    try {
      await fs.access(indexPath);
      this.logger.info('index.html exists');
    } catch (error) {
      this.logger.info('Creating index.html...');
      
      // Simple HTML file with bootstrap and basic structure
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCoderAI - Autonomous Development System</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">MyCoderAI</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link active" href="#dashboard">Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#tasks">Tasks</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#agents">Agents</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#settings">Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container mt-4">
    <div id="app">
      <div class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading MyCoderAI interface...</p>
      </div>
    </div>
  </main>

  <footer class="footer mt-auto py-3 bg-light">
    <div class="container text-center">
      <span class="text-muted">MyCoderAI v0.1.0 - &copy; 2025</span>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>
  <script src="app.js"></script>
</body>
</html>
      `;
      
      await fs.writeFile(indexPath, html.trim());
    }
    
    // CSS file
    const cssPath = path.join(this.staticPath, 'styles.css');
    try {
      await fs.access(cssPath);
      this.logger.info('styles.css exists');
    } catch (error) {
      this.logger.info('Creating styles.css...');
      
      const css = `
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.task-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.task-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.agent-card {
  margin-bottom: 20px;
  border-left: 5px solid #007bff;
}

.agent-card.idle {
  border-left-color: #28a745;
}

.agent-card.busy {
  border-left-color: #dc3545;
}

.progress {
  height: 10px;
  margin-bottom: 10px;
}

.console-output {
  background-color: #212529;
  color: #f8f9fa;
  font-family: monospace;
  padding: 15px;
  border-radius: 5px;
  height: 300px;
  overflow-y: auto;
}

.log-entry {
  margin-bottom: 5px;
}

.log-entry.error {
  color: #dc3545;
}

.log-entry.warning {
  color: #ffc107;
}

.log-entry.success {
  color: #28a745;
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.metric-card {
  padding: 15px;
  border-radius: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.timeline {
  position: relative;
  padding-left: 40px;
  margin-bottom: 50px;
}

.timeline:before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #007bff;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: -34px;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
}

.settings-form label {
  font-weight: 600;
}

@media (max-width: 768px) {
  .metrics-container {
    grid-template-columns: 1fr;
  }
}
      `;
      
      await fs.writeFile(cssPath, css.trim());
    }
    
    // JavaScript file
    const jsPath = path.join(this.staticPath, 'app.js');
    try {
      await fs.access(jsPath);
      this.logger.info('app.js exists');
    } catch (error) {
      this.logger.info('Creating app.js...');
      
      const js = `
// MyCoderAI Frontend App
document.addEventListener('DOMContentLoaded', () => {
  const app = {
    socket: null,
    config: {
      refreshInterval: 5000,
      maxTaskHistory: 10,
      autoRefresh: true
    },
    data: {
      tasks: [],
      agents: [],
      metrics: {},
      currentView: 'dashboard',
      selectedTask: null,
      selectedAgent: null
    },
    
    // Initialize the application
    init: function() {
      // Set up socket connection
      this.socket = io();
      
      // Load configuration
      this.loadConfig();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      this.loadData();
      
      // Set up navigation
      this.setupNavigation();
      
      // Render initial view
      this.renderView('dashboard');
      
      console.log('MyCoderAI frontend initialized');
    },
    
    // Load configuration from server
    loadConfig: async function() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        this.config = { ...this.config, ...config };
        console.log('Configuration loaded:', this.config);
      } catch (error) {
        console.error('Failed to load configuration:', error);
      }
    },
    
    // Set up socket event listeners
    setupEventListeners: function() {
      // Socket connection events
      this.socket.on('connect', () => {
        console.log('Connected to server');
      });
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
      
      // Task events
      this.socket.on('task:update', (data) => {
        console.log('Task update:', data);
        this.refreshTasks();
      });
      
      this.socket.on('task:started', (data) => {
        console.log('Task started:', data);
        if (this.data.selectedTask === data.taskId) {
          this.loadTaskDetails(data.taskId);
        }
      });
      
      this.socket.on('task:completed', (data) => {
        console.log('Task completed:', data);
        if (this.data.selectedTask === data.taskId) {
          this.loadTaskDetails(data.taskId);
        }
      });
      
      this.socket.on('task:failed', (data) => {
        console.log('Task failed:', data);
        if (this.data.selectedTask === data.taskId) {
          this.loadTaskDetails(data.taskId);
        }
      });
      
      // Agent events
      this.socket.on('agent:registered', (data) => {
        console.log('Agent registered:', data);
        this.refreshAgents();
      });
      
      this.socket.on('agent:disconnected', (data) => {
        console.log('Agent disconnected:', data);
        this.refreshAgents();
      });
      
      // Error event
      this.socket.on('error', (data) => {
        console.error('Socket error:', data);
        alert(\`Error: \${data.message}\`);
      });
    },
    
    // Load initial data
    loadData: function() {
      this.refreshTasks();
      this.refreshAgents();
      this.refreshMetrics();
      
      // Set up auto-refresh if enabled
      if (this.config.autoRefresh) {
        setInterval(() => {
          if (this.data.currentView === 'dashboard' || this.data.currentView === 'tasks') {
            this.refreshTasks();
          }
          
          if (this.data.currentView === 'dashboard' || this.data.currentView === 'agents') {
            this.refreshAgents();
          }
          
          this.refreshMetrics();
        }, this.config.refreshInterval);
      }
    },
    
    // Set up navigation
    setupNavigation: function() {
      document.querySelectorAll('a.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();
          
          // Get the view from the href
          const href = event.target.getAttribute('href');
          const view = href.substring(1); // Remove the '#'
          
          // Update active link
          document.querySelectorAll('a.nav-link').forEach(l => l.classList.remove('active'));
          event.target.classList.add('active');
          
          // Render the view
          this.renderView(view);
        });
      });
    },
    
    // Render the current view
    renderView: function(view) {
      this.data.currentView = view;
      const appElement = document.getElementById('app');
      
      // Clear the app element
      appElement.innerHTML = '';
      
      // Render the appropriate view
      switch (view) {
        case 'dashboard':
          this.renderDashboard(appElement);
          break;
        case 'tasks':
          this.renderTasksView(appElement);
          break;
        case 'agents':
          this.renderAgentsView(appElement);
          break;
        case 'settings':
          this.renderSettingsView(appElement);
          break;
        default:
          appElement.innerHTML = '<div class="alert alert-danger">Unknown view</div>';
      }
    },
    
    // Render the dashboard view
    renderDashboard: function(element) {
      element.innerHTML = \`
        <h1 class="mb-4">Dashboard</h1>
        
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">System Status</h5>
              </div>
              <div class="card-body" id="system-metrics">
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Tasks</h5>
                <button class="btn btn-primary btn-sm" id="new-task-btn">New Task</button>
              </div>
              <div class="card-body" id="recent-tasks">
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Agent Activity</h5>
              </div>
              <div class="card-body" id="agent-activity">
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      \`;
      
      // Load dashboard data
      this.refreshMetrics();
      this.renderRecentTasks();
      this.renderAgentActivity();
      
      // Add new task button handler
      document.getElementById('new-task-btn').addEventListener('click', () => {
        this.showNewTaskModal();
      });
    },
    
    // Render the tasks view
    renderTasksView: function(element) {
      element.innerHTML = \`
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1>Tasks</h1>
          <button class="btn btn-primary" id="new-task-btn">New Task</button>
        </div>
        
        <div class="row">
          <div class="col-md-4">
            <div class="list-group" id="task-list">
              <div class="d-flex justify-content-center p-3">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Task Details</h5>
              </div>
              <div class="card-body" id="task-details">
                <p class="text-muted">Select a task to view details</p>
              </div>
            </div>
          </div>
        </div>
      \`;
      
      // Load tasks
      this.refreshTasks().then(() => {
        this.renderTaskList();
      });
      
      // Add new task button handler
      document.getElementById('new-task-btn').addEventListener('click', () => {
        this.showNewTaskModal();
      });
    },
    
    // Render the agents view
    renderAgentsView: function(element) {
      element.innerHTML = \`
        <h1 class="mb-4">Agents</h1>
        
        <div class="row">
          <div class="col-md-4">
            <div class="list-group" id="agent-list">
              <div class="d-flex justify-content-center p-3">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Agent Details</h5>
              </div>
              <div class="card-body" id="agent-details">
                <p class="text-muted">Select an agent to view details</p>
              </div>
            </div>
          </div>
        </div>
      \`;
      
      // Load agents
      this.refreshAgents().then(() => {
        this.renderAgentList();
      });
    },
    
    // Render the settings view
    renderSettingsView: function(element) {
      element.innerHTML = \`
        <h1 class="mb-4">Settings</h1>
        
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Interface Settings</h5>
          </div>
          <div class="card-body">
            <form id="settings-form">
              <div class="mb-3">
                <label for="refresh-interval" class="form-label">Refresh Interval (ms)</label>
                <input type="number" class="form-control" id="refresh-interval" value="\${this.config.refreshInterval}">
                <div class="form-text">How often to refresh data automatically (in milliseconds)</div>
              </div>
              
              <div class="mb-3">
                <label for="max-task-history" class="form-label">Max Task History</label>
                <input type="number" class="form-control" id="max-task-history" value="\${this.config.maxTaskHistory}">
                <div class="form-text">Maximum number of tasks to show in history</div>
              </div>
              
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="auto-refresh" \${this.config.autoRefresh ? 'checked' : ''}>
                <label class="form-check-label" for="auto-refresh">Auto-refresh</label>
                <div class="form-text">Automatically refresh data</div>
              </div>
              
              <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
          </div>
        </div>
      \`;
      
      // Add form submit handler
      document.getElementById('settings-form').addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Get form values
        const refreshInterval = parseInt(document.getElementById('refresh-interval').value, 10);
        const maxTaskHistory = parseInt(document.getElementById('max-task-history').value, 10);
        const autoRefresh = document.getElementById('auto-refresh').checked;
        
        // Update config
        this.config.refreshInterval = refreshInterval;
        this.config.maxTaskHistory = maxTaskHistory;
        this.config.autoRefresh = autoRefresh;
        
        // Save config to server
        fetch('/api/config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.config)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Settings saved:', data);
          alert('Settings saved successfully');
        })
        .catch(error => {
          console.error('Failed to save settings:', error);
          alert('Failed to save settings');
        });
      });
    },
    
    // Show modal for creating a new task
    showNewTaskModal: function() {
      // Create modal element
      const modalElement = document.createElement('div');
      modalElement.className = 'modal fade';
      modalElement.id = 'new-task-modal';
      modalElement.setAttribute('tabindex', '-1');
      
      modalElement.innerHTML = \`
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Create New Task</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="new-task-form">
                <div class="mb-3">
                  <label for="task-description" class="form-label">Description</label>
                  <textarea class="form-control" id="task-description" rows="3" required></textarea>
                </div>
                
                <div class="mb-3">
                  <label for="task-priority" class="form-label">Priority</label>
                  <select class="form-select" id="task-priority">
                    <option value="low">Low</option>
                    <option value="normal" selected>Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label for="task-inputs" class="form-label">Inputs (JSON)</label>
                  <textarea class="form-control" id="task-inputs" rows="5"></textarea>
                  <div class="form-text">Optional JSON inputs for the task</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="create-task-btn">Create Task</button>
            </div>
          </div>
        </div>
      \`;
      
      // Add modal to document
      document.body.appendChild(modalElement);
      
      // Initialize Bootstrap modal
      const modal = new bootstrap.Modal(modalElement);
      
      // Show modal
      modal.show();
      
      // Add create task button handler
      document.getElementById('create-task-btn').addEventListener('click', () => {
        const description = document.getElementById('task-description').value;
        const priority = document.getElementById('task-priority').value;
        let inputs = {};
        
        // Parse inputs if provided
        const inputsText = document.getElementById('task-inputs').value;
        if (inputsText) {
          try {
            inputs = JSON.parse(inputsText);
          } catch (error) {
            alert('Invalid JSON in inputs field');
            return;
          }
        }
        
        // Validate description
        if (!description) {
          alert('Description is required');
          return;
        }
        
        // Create task
        this.createTask(description, inputs, priority)
          .then(() => {
            // Close modal
            modal.hide();
            
            // Remove modal from document
            modalElement.remove();
          })
          .catch(error => {
            alert(\`Failed to create task: \${error.message}\`);
          });
      });
      
      // Clean up when modal is hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
      });
    },
    
    // Create a new task
    createTask: async function(description, inputs = {}, priority = 'normal') {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description,
            inputs,
            priority
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create task');
        }
        
        const result = await response.json();
        console.log('Task created:', result);
        
        // Refresh tasks
        this.refreshTasks();
        
        return result;
      } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
      }
    },
    
    // Refresh tasks data
    refreshTasks: async function() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        this.data.tasks = data.tasks;
        
        // Update UI if tasks list is rendered
        const taskListElement = document.getElementById('task-list');
        if (taskListElement) {
          this.renderTaskList();
        }
        
        // Update recent tasks if dashboard is shown
        const recentTasksElement = document.getElementById('recent-tasks');
        if (recentTasksElement) {
          this.renderRecentTasks();
        }
        
        return this.data.tasks;
      } catch (error) {
        console.error('Failed to refresh tasks:', error);
        return [];
      }
    },
    
    // Refresh agents data
    refreshAgents: async function() {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        this.data.agents = data.agents;
        
        // Update UI if agent list is rendered
        const agentListElement = document.getElementById('agent-list');
        if (agentListElement) {
          this.renderAgentList();
        }
        
        // Update agent activity if dashboard is shown
        const agentActivityElement = document.getElementById('agent-activity');
        if (agentActivityElement) {
          this.renderAgentActivity();
        }
        
        return this.data.agents;
      } catch (error) {
        console.error('Failed to refresh agents:', error);
        return [];
      }
    },
    
    // Refresh system metrics
    refreshMetrics: async function() {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        this.data.metrics = data;
        
        // Update UI if metrics are shown
        const metricsElement = document.getElementById('system-metrics');
        if (metricsElement) {
          this.renderMetrics();
        }
        
        return this.data.metrics;
      } catch (error) {
        console.error('Failed to refresh metrics:', error);
        return {};
      }
    },
    
    // Render the task list
    renderTaskList: function() {
      const taskListElement = document.getElementById('task-list');
      if (!taskListElement) return;
      
      if (this.data.tasks.length === 0) {
        taskListElement.innerHTML = '<div class="alert alert-info">No tasks found</div>';
        return;
      }
      
      // Sort tasks by creation date (newest first)
      const sortedTasks = [...this.data.tasks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Create HTML for task list
      let html = '';
      
      sortedTasks.forEach(task => {
        const isActive = task.id === this.data.selectedTask;
        const statusClass = this.getStatusClass(task.status);
        
        html += \`
          <a href="#" class="list-group-item list-group-item-action \${isActive ? 'active' : ''}" data-task-id="\${task.id}">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 text-truncate">\${task.id}</h5>
              <small class="badge bg-\${statusClass}">\${task.status}</small>
            </div>
            <p class="mb-1 text-truncate">\${task.description}</p>
            <small>\${new Date(task.createdAt).toLocaleString()}</small>
          </a>
        \`;
      });
      
      taskListElement.innerHTML = html;
      
      // Add click handlers
      taskListElement.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', (event) => {
          event.preventDefault();
          
          // Get task ID
          const taskId = item.getAttribute('data-task-id');
          
          // Update selected task
          this.data.selectedTask = taskId;
          
          // Update active item
          taskListElement.querySelectorAll('.list-group-item').forEach(i => {
            i.classList.remove('active');
          });
          item.classList.add('active');
          
          // Load task details
          this.loadTaskDetails(taskId);
        });
      });
    },
    
    // Load and render task details
    loadTaskDetails: async function(taskId) {
      try {
        const response = await fetch(\`/api/tasks/\${taskId}\`);
        const data = await response.json();
        
        // Get task details element
        const taskDetailsElement = document.getElementById('task-details');
        if (!taskDetailsElement) return;
        
        const task = data.task;
        const statusClass = this.getStatusClass(task.status);
        
        // Format assigned agents
        let agentsHtml = '<div class="alert alert-info">No agents assigned</div>';
        
        if (task.assignedAgents && task.assignedAgents.length > 0) {
          agentsHtml = '<ul class="list-group">';
          
          task.assignedAgents.forEach(agent => {
            agentsHtml += \`
              <li class="list-group-item d-flex justify-content-between align-items-center">
                \${agent.id || agent}
                <span class="badge bg-primary rounded-pill">\${agent.type || 'Unknown'}</span>
              </li>
            \`;
          });
          
          agentsHtml += '</ul>';
        }
        
        // Render task details
        taskDetailsElement.innerHTML = \`
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>\${task.id}</h3>
            <span class="badge bg-\${statusClass}">\${task.status}</span>
          </div>
          
          <div class="mb-3">
            <strong>Description:</strong>
            <p>\${task.description}</p>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-6">
              <strong>Created:</strong>
              <p>\${new Date(task.createdAt).toLocaleString()}</p>
            </div>
            
            <div class="col-md-6">
              <strong>Priority:</strong>
              <p>\${task.priority || 'normal'}</p>
            </div>
          </div>
          
          <div class="mb-3">
            <strong>Assigned Agents:</strong>
            \${agentsHtml}
          </div>
          
          <div class="mb-3">
            <strong>Progress:</strong>
            <div class="progress">
              <div class="progress-bar" role="progressbar" style="width: \${this.getTaskProgress(task)}%" aria-valuenow="\${this.getTaskProgress(task)}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <small class="text-muted">\${this.getTaskProgress(task)}% complete</small>
          </div>
          
          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-secondary me-md-2" id="refresh-task-btn">Refresh</button>
            \${task.status === 'in_progress' ? '<button class="btn btn-danger" id="stop-task-btn">Stop Task</button>' : ''}
          </div>
        \`;
        
        // Add refresh button handler
        document.getElementById('refresh-task-btn').addEventListener('click', () => {
          this.loadTaskDetails(taskId);
        });
        
        // Add stop button handler if present
        const stopBtn = document.getElementById('stop-task-btn');
        if (stopBtn) {
          stopBtn.addEventListener('click', () => {
            this.stopTask(taskId);
          });
        }
      } catch (error) {
        console.error(\`Failed to load task details for \${taskId}:\`, error);
        
        // Show error message
        const taskDetailsElement = document.getElementById('task-details');
        if (taskDetailsElement) {
          taskDetailsElement.innerHTML = \`
            <div class="alert alert-danger">
              Failed to load task details: \${error.message}
            </div>
          \`;
        }
      }
    },
    
    // Stop a task
    stopTask: async function(taskId) {
      try {
        const response = await fetch(\`/api/tasks/\${taskId}/stop\`, {
          method: 'POST'
        });
        
        const result = await response.json();
        console.log('Task stop result:', result);
        
        // Refresh task details
        this.loadTaskDetails(taskId);
        
        return result;
      } catch (error) {
        console.error(\`Failed to stop task \${taskId}:\`, error);
        alert(\`Failed to stop task: \${error.message}\`);
      }
    },
    
    // Render the agent list
    renderAgentList: function() {
      const agentListElement = document.getElementById('agent-list');
      if (!agentListElement) return;
      
      if (this.data.agents.length === 0) {
        agentListElement.innerHTML = '<div class="alert alert-info">No agents found</div>';
        return;
      }
      
      // Create HTML for agent list
      let html = '';
      
      this.data.agents.forEach(agent => {
        const isActive = agent.id === this.data.selectedAgent;
        const statusClass = agent.status === 'idle' ? 'success' : (agent.status === 'busy' ? 'danger' : 'warning');
        
        html += \`
          <a href="#" class="list-group-item list-group-item-action \${isActive ? 'active' : ''}" data-agent-id="\${agent.id}">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 text-truncate">\${agent.id}</h5>
              <small class="badge bg-\${statusClass}">\${agent.status}</small>
            </div>
            <p class="mb-1">\${agent.type}</p>
            <small>Last active: \${agent.lastActive ? new Date(agent.lastActive).toLocaleString() : 'Never'}</small>
          </a>
        \`;
      });
      
      agentListElement.innerHTML = html;
      
      // Add click handlers
      agentListElement.querySelectorAll('.list-group-item').forEach(item => {
        item.addEventListener('click', (event) => {
          event.preventDefault();
          
          // Get agent ID
          const agentId = item.getAttribute('data-agent-id');
          
          // Update selected agent
          this.data.selectedAgent = agentId;
          
          // Update active item
          agentListElement.querySelectorAll('.list-group-item').forEach(i => {
            i.classList.remove('active');
          });
          item.classList.add('active');
          
          // Load agent details
          this.loadAgentDetails(agentId);
        });
      });
    },
    
    // Load and render agent details
    loadAgentDetails: async function(agentId) {
      try {
        const response = await fetch(\`/api/agents/\${agentId}\`);
        const data = await response.json();
        
        // Get agent details element
        const agentDetailsElement = document.getElementById('agent-details');
        if (!agentDetailsElement) return;
        
        const agent = data.agent;
        const statusClass = agent.status === 'idle' ? 'success' : (agent.status === 'busy' ? 'danger' : 'warning');
        
        // Format capabilities
        let capabilitiesHtml = '<div class="alert alert-info">No capabilities</div>';
        
        if (agent.capabilities && agent.capabilities.length > 0) {
          capabilitiesHtml = '<div class="d-flex flex-wrap gap-2">';
          
          agent.capabilities.forEach(capability => {
            capabilitiesHtml += \`<span class="badge bg-info">\${capability}</span>\`;
          });
          
          capabilitiesHtml += '</div>';
        }
        
        // Format current assignment
        let assignmentHtml = '<div class="alert alert-info">No current assignment</div>';
        
        if (agent.currentAssignment) {
          assignmentHtml = \`
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Task: \${agent.currentAssignment.taskId}</h5>
                <h6 class="card-subtitle mb-2 text-muted">Subtask: \${agent.currentAssignment.subtaskId}</h6>
                <a href="#" class="btn btn-sm btn-primary view-task-btn" data-task-id="\${agent.currentAssignment.taskId}">View Task</a>
              </div>
            </div>
          \`;
        }
        
        // Render agent details
        agentDetailsElement.innerHTML = \`
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>\${agent.id}</h3>
            <span class="badge bg-\${statusClass}">\${agent.status}</span>
          </div>
          
          <div class="mb-3">
            <strong>Type:</strong>
            <p>\${agent.type}</p>
          </div>
          
          <div class="row mb-3">
            <div class="col-md-6">
              <strong>Created:</strong>
              <p>\${agent.createdAt ? new Date(agent.createdAt).toLocaleString() : 'Unknown'}</p>
            </div>
            
            <div class="col-md-6">
              <strong>Last Active:</strong>
              <p>\${agent.lastActive ? new Date(agent.lastActive).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          
          <div class="mb-3">
            <strong>Capabilities:</strong>
            \${capabilitiesHtml}
          </div>
          
          <div class="mb-3">
            <strong>Current Assignment:</strong>
            \${assignmentHtml}
          </div>
          
          <div class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-secondary me-md-2" id="refresh-agent-btn">Refresh</button>
            <button class="btn btn-primary" id="intervene-btn">Intervene</button>
          </div>
        \`;
        
        // Add refresh button handler
        document.getElementById('refresh-agent-btn').addEventListener('click', () => {
          this.loadAgentDetails(agentId);
        });
        
        // Add intervene button handler
        document.getElementById('intervene-btn').addEventListener('click', () => {
          this.showInterveneModal(agentId);
        });
        
        // Add view task button handler if present
        const viewTaskBtn = document.querySelector('.view-task-btn');
        if (viewTaskBtn) {
          viewTaskBtn.addEventListener('click', (event) => {
            event.preventDefault();
            
            const taskId = viewTaskBtn.getAttribute('data-task-id');
            
            // Switch to tasks view
            document.querySelector('a[href="#tasks"]').click();
            
            // Select the task
            this.data.selectedTask = taskId;
            
            // Render task list (will be done by the view switch)
            setTimeout(() => {
              // Load task details
              this.loadTaskDetails(taskId);
              
              // Highlight the task in the list
              const taskItem = document.querySelector(\`.list-group-item[data-task-id="\${taskId}"]\`);
              if (taskItem) {
                taskItem.classList.add('active');
              }
            }, 100); // Small delay to ensure the view has rendered
          });
        }
      } catch (error) {
        console.error(\`Failed to load agent details for \${agentId}:\`, error);
        
        // Show error message
        const agentDetailsElement = document.getElementById('agent-details');
        if (agentDetailsElement) {
          agentDetailsElement.innerHTML = \`
            <div class="alert alert-danger">
              Failed to load agent details: \${error.message}
            </div>
          \`;
        }
      }
    },
    
    // Show modal for agent intervention
    showInterveneModal: function(agentId) {
      // Create modal element
      const modalElement = document.createElement('div');
      modalElement.className = 'modal fade';
      modalElement.id = 'intervene-modal';
      modalElement.setAttribute('tabindex', '-1');
      
      modalElement.innerHTML = \`
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Intervene with Agent \${agentId}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="intervene-form">
                <div class="mb-3">
                  <label for="action-type" class="form-label">Action</label>
                  <select class="form-select" id="action-type">
                    <option value="pause">Pause</option>
                    <option value="resume">Resume</option>
                    <option value="modify">Modify Parameters</option>
                    <option value="reset">Reset</option>
                    <option value="message">Send Message</option>
                  </select>
                </div>
                
                <div class="mb-3" id="parameters-container">
                  <label for="parameters" class="form-label">Parameters (JSON)</label>
                  <textarea class="form-control" id="parameters" rows="5"></textarea>
                  <div class="form-text">Optional JSON parameters for the action</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="intervene-submit-btn">Submit</button>
            </div>
          </div>
        </div>
      \`;
      
      // Add modal to document
      document.body.appendChild(modalElement);
      
      // Initialize Bootstrap modal
      const modal = new bootstrap.Modal(modalElement);
      
      // Show modal
      modal.show();
      
      // Add action type change handler
      document.getElementById('action-type').addEventListener('change', (event) => {
        const actionType = event.target.value;
        const parametersContainer = document.getElementById('parameters-container');
        
        // Adjust parameters field based on action type
        if (actionType === 'message') {
          parametersContainer.innerHTML = \`
            <label for="message" class="form-label">Message</label>
            <textarea class="form-control" id="message" rows="5"></textarea>
            <div class="form-text">Message to send to the agent</div>
          \`;
        } else if (actionType === 'modify') {
          parametersContainer.innerHTML = \`
            <label for="parameters" class="form-label">Parameters (JSON)</label>
            <textarea class="form-control" id="parameters" rows="5"></textarea>
            <div class="form-text">JSON parameters to modify</div>
          \`;
        } else {
          parametersContainer.innerHTML = \`
            <label for="parameters" class="form-label">Parameters (JSON)</label>
            <textarea class="form-control" id="parameters" rows="5"></textarea>
            <div class="form-text">Optional JSON parameters for the action</div>
          \`;
        }
      });
      
      // Add intervene button handler
      document.getElementById('intervene-submit-btn').addEventListener('click', () => {
        const actionType = document.getElementById('action-type').value;
        let parameters = {};
        
        // Get parameters based on action type
        if (actionType === 'message') {
          const message = document.getElementById('message').value;
          parameters = { message };
        } else {
          // Parse parameters if provided
          const parametersElement = document.getElementById('parameters');
          if (parametersElement && parametersElement.value) {
            try {
              parameters = JSON.parse(parametersElement.value);
            } catch (error) {
              alert('Invalid JSON in parameters field');
              return;
            }
          }
        }
        
        // Submit intervention
        this.interveneWithAgent(agentId, actionType, parameters)
          .then(() => {
            // Close modal
            modal.hide();
            
            // Remove modal from document
            modalElement.remove();
          })
          .catch(error => {
            alert(\`Failed to intervene with agent: \${error.message}\`);
          });
      });
      
      // Clean up when modal is hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
      });
    },
    
    // Intervene with an agent
    interveneWithAgent: async function(agentId, action, parameters = {}) {
      try {
        // Use socket.io for real-time interaction
        this.socket.emit('agent:intervene', {
          agentId,
          action,
          parameters
        });
        
        console.log(\`Intervention submitted for agent \${agentId}: \${action}\`);
        
        return { success: true };
      } catch (error) {
        console.error(\`Failed to intervene with agent \${agentId}:\`, error);
        throw error;
      }
    },
    
    // Render recent tasks on dashboard
    renderRecentTasks: function() {
      const recentTasksElement = document.getElementById('recent-tasks');
      if (!recentTasksElement) return;
      
      if (this.data.tasks.length === 0) {
        recentTasksElement.innerHTML = '<div class="alert alert-info">No tasks found</div>';
        return;
      }
      
      // Sort tasks by creation date (newest first)
      const sortedTasks = [...this.data.tasks].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Take only the most recent tasks
      const recentTasks = sortedTasks.slice(0, this.config.maxTaskHistory);
      
      // Create HTML for recent tasks
      let html = '<div class="list-group">';
      
      recentTasks.forEach(task => {
        const statusClass = this.getStatusClass(task.status);
        
        html += \`
          <a href="#" class="list-group-item list-group-item-action task-item" data-task-id="\${task.id}">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 text-truncate">\${task.id}</h5>
              <small class="badge bg-\${statusClass}">\${task.status}</small>
            </div>
            <p class="mb-1 text-truncate">\${task.description}</p>
            <small>\${new Date(task.createdAt).toLocaleString()}</small>
          </a>
        \`;
      });
      
      html += '</div>';
      
      recentTasksElement.innerHTML = html;
      
      // Add click handlers
      recentTasksElement.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', (event) => {
          event.preventDefault();
          
          const taskId = item.getAttribute('data-task-id');
          
          // Switch to tasks view
          document.querySelector('a[href="#tasks"]').click();
          
          // Select the task
          this.data.selectedTask = taskId;
          
          // Render task list (will be done by the view switch)
          setTimeout(() => {
            // Load task details
            this.loadTaskDetails(taskId);
            
            // Highlight the task in the list
            const taskItem = document.querySelector(\`.list-group-item[data-task-id="\${taskId}"]\`);
            if (taskItem) {
              taskItem.classList.add('active');
            }
          }, 100); // Small delay to ensure the view has rendered
        });
      });
    },
    
    // Render agent activity on dashboard
    renderAgentActivity: function() {
      const agentActivityElement = document.getElementById('agent-activity');
      if (!agentActivityElement) return;
      
      if (this.data.agents.length === 0) {
        agentActivityElement.innerHTML = '<div class="alert alert-info">No agents found</div>';
        return;
      }
      
      // Group agents by type
      const agentsByType = {};
      
      this.data.agents.forEach(agent => {
        if (!agentsByType[agent.type]) {
          agentsByType[agent.type] = [];
        }
        
        agentsByType[agent.type].push(agent);
      });
      
      // Create HTML for agent activity
      let html = '<div class="row">';
      
      Object.entries(agentsByType).forEach(([type, agents]) => {
        html += \`
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">\${type} Agents</h5>
              </div>
              <div class="card-body">
                <p>Total: \${agents.length}</p>
                <div class="d-flex justify-content-between mb-2">
                  <span>Idle: \${agents.filter(a => a.status === 'idle').length}</span>
                  <span>Busy: \${agents.filter(a => a.status !== 'idle').length}</span>
                </div>
                <ul class="list-group">
        \`;
        
        agents.forEach(agent => {
          const statusClass = agent.status === 'idle' ? 'success' : (agent.status === 'busy' ? 'danger' : 'warning');
          
          html += \`
            <li class="list-group-item d-flex justify-content-between align-items-center agent-item" data-agent-id="\${agent.id}">
              \${agent.id}
              <span class="badge bg-\${statusClass}">\${agent.status}</span>
            </li>
          \`;
        });
        
        html += \`
                </ul>
              </div>
            </div>
          </div>
        \`;
      });
      
      html += '</div>';
      
      agentActivityElement.innerHTML = html;
      
      // Add click handlers
      agentActivityElement.querySelectorAll('.agent-item').forEach(item => {
        item.addEventListener('click', (event) => {
          const agentId = item.getAttribute('data-agent-id');
          
          // Switch to agents view
          document.querySelector('a[href="#agents"]').click();
          
          // Select the agent
          this.data.selectedAgent = agentId;
          
          // Render agent list (will be done by the view switch)
          setTimeout(() => {
            // Load agent details
            this.loadAgentDetails(agentId);
            
            // Highlight the agent in the list
            const agentItem = document.querySelector(\`.list-group-item[data-agent-id="\${agentId}"]\`);
            if (agentItem) {
              agentItem.classList.add('active');
            }
          }, 100); // Small delay to ensure the view has rendered
        });
      });
    },
    
    // Render system metrics
    renderMetrics: function() {
      const metricsElement = document.getElementById('system-metrics');
      if (!metricsElement) return;
      
      if (!this.data.metrics || Object.keys(this.data.metrics).length === 0) {
        metricsElement.innerHTML = '<div class="alert alert-info">No metrics available</div>';
        return;
      }
      
      const metrics = this.data.metrics;
      
      // Format memory usage
      const formatMemory = (bytes) => {
        if (bytes < 1024) return \`\${bytes} B\`;
        if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(2)} KB\`;
        if (bytes < 1024 * 1024 * 1024) return \`\${(bytes / 1024 / 1024).toFixed(2)} MB\`;
        return \`\${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB\`;
      };
      
      // Format uptime
      const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (days > 0) return \`\${days}d \${hours}h \${minutes}m\`;
        if (hours > 0) return \`\${hours}h \${minutes}m \${secs}s\`;
        if (minutes > 0) return \`\${minutes}m \${secs}s\`;
        return \`\${secs}s\`;
      };
      
      // Create HTML for metrics
      let html = '<div class="metrics-container">';
      
      // System metrics
      html += \`
        <div class="metric-card">
          <h5>System</h5>
          <div class="d-flex justify-content-between">
            <span>Uptime:</span>
            <span>\${formatUptime(metrics.uptime)}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>Memory (RSS):</span>
            <span>\${formatMemory(metrics.memory.rss)}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>Heap Total:</span>
            <span>\${formatMemory(metrics.memory.heapTotal)}</span>
          </div>
          <div class="d-flex justify-content-between">
            <span>Heap Used:</span>
            <span>\${formatMemory(metrics.memory.heapUsed)}</span>
          </div>
        </div>
      \`;
      
      // Orchestrator metrics
      if (metrics.orchestrator) {
        const orchestrator = metrics.orchestrator;
        
        html += \`
          <div class="metric-card">
            <h5>Orchestrator</h5>
            <div class="d-flex justify-content-between">
              <span>Active Agents:</span>
              <span>\${orchestrator.activeAgents || 0}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Pending Tasks:</span>
              <span>\${orchestrator.pendingTasks || 0}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Completed Tasks:</span>
              <span>\${orchestrator.completedTasks || 0}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Success Rate:</span>
              <span>\${orchestrator.successRate ? \`\${orchestrator.successRate.toFixed(2)}%\` : 'N/A'}</span>
            </div>
          </div>
        \`;
        
        // Agent metrics by type
        if (orchestrator.activeAgentsByType) {
          html += \`
            <div class="metric-card">
              <h5>Agents by Type</h5>
          \`;
          
          Object.entries(orchestrator.activeAgentsByType).forEach(([type, count]) => {
            html += \`
              <div class="d-flex justify-content-between">
                <span>\${type}:</span>
                <span>\${count}</span>
              </div>
            \`;
          });
          
          html += '</div>';
        }
      }
      
      html += '</div>';
      
      metricsElement.innerHTML = html;
    },
    
    // Get CSS class for task status
    getStatusClass: function(status) {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'in_progress':
          return 'primary';
        case 'completed':
          return 'success';
        case 'failed':
          return 'danger';
        default:
          return 'secondary';
      }
    },
    
    // Calculate task progress
    getTaskProgress: function(task) {
      if (task.status === 'completed') {
        return 100;
      }
      
      if (task.status === 'pending') {
        return 0;
      }
      
      // In a real app, this would be calculated based on subtask progress
      return 50;
    }
  };
  
  // Initialize app
  app.init();
});
      `;
      
      await fs.writeFile(jsPath, js.trim());
    }
    
    return true;
  }
}

module.exports = UIServer;