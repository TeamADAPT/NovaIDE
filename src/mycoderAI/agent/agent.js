/**
 * agent.js
 * Base Agent class for MyCoderAI
 * 
 * This is the base class for all specialized agents in the system.
 */

/**
 * Base Agent class
 */
class Agent {
  /**
   * Create a new Agent
   * @param {Object} config - Agent configuration
   * @param {Object} services - Service dependencies
   */
  constructor(config, services) {
    if (!config) {
      throw new Error('Agent configuration is required');
    }
    
    this.id = config.id || `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.name = config.name || `Agent-${this.id}`;
    this.type = config.type || 'generic';
    this.capabilities = config.capabilities || {};
    this.status = 'idle';
    this.services = services || {};
    this.communicationHub = services?.communicationHub;
    this.tasks = new Map();
    
    // Initialize agent
    this._initialize();
    
    console.log(`Agent ${this.name} (${this.type}) initialized with ID ${this.id}`);
  }
  
  /**
   * Initialize the agent
   * @private
   */
  _initialize() {
    // Set up communication handlers
    if (this.communicationHub) {
      this._setupCommunicationHandlers();
    } else {
      console.warn(`Agent ${this.name} initialized without communication hub`);
    }
  }
  
  /**
   * Set up communication handlers
   * @private
   */
  _setupCommunicationHandlers() {
    // Subscribe to task messages
    this.communicationHub.subscribe('task.created', this._handleTaskCreated.bind(this));
    this.communicationHub.subscribe('task.canceled', this._handleTaskCanceled.bind(this));
    
    // Subscribe to agent messages
    this.communicationHub.subscribe(`agent.${this.id}`, this._handleAgentMessage.bind(this));
    this.communicationHub.subscribe(`agent.${this.type}`, this._handleAgentTypeMessage.bind(this));
    this.communicationHub.subscribe('agent.all', this._handleBroadcastMessage.bind(this));
    
    console.log(`Agent ${this.name} subscribed to communication channels`);
  }
  
  /**
   * Handle task created message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleTaskCreated(message) {
    // Check if task is for this agent
    if (message.agentId === this.id) {
      console.log(`Agent ${this.name} received task ${message.taskId}`);
      
      // Add task to queue
      this.tasks.set(message.taskId, {
        id: message.taskId,
        type: message.type,
        data: message.data,
        status: 'pending',
        createdAt: new Date()
      });
      
      // Process task
      this._processNextTask();
    }
  }
  
  /**
   * Handle task canceled message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleTaskCanceled(message) {
    // Check if task is for this agent
    if (this.tasks.has(message.taskId)) {
      console.log(`Agent ${this.name} canceling task ${message.taskId}`);
      
      // Remove task from queue
      this.tasks.delete(message.taskId);
    }
  }
  
  /**
   * Handle agent message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleAgentMessage(message) {
    console.log(`Agent ${this.name} received direct message: ${message.type}`);
    
    // Handle message based on type
    switch (message.type) {
      case 'status.request':
        this._handleStatusRequest(message);
        break;
      case 'capabilities.request':
        this._handleCapabilitiesRequest(message);
        break;
      default:
        // Handle specialized messages
        this.handleSpecializedMessage(message);
    }
  }
  
  /**
   * Handle agent type message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleAgentTypeMessage(message) {
    console.log(`Agent ${this.name} received type message: ${message.type}`);
    
    // Handle message based on type
    switch (message.type) {
      case 'status.request':
        this._handleStatusRequest(message);
        break;
      case 'capabilities.request':
        this._handleCapabilitiesRequest(message);
        break;
      default:
        // Handle specialized messages
        this.handleSpecializedMessage(message);
    }
  }
  
  /**
   * Handle broadcast message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleBroadcastMessage(message) {
    console.log(`Agent ${this.name} received broadcast message: ${message.type}`);
    
    // Handle message based on type
    switch (message.type) {
      case 'status.request':
        this._handleStatusRequest(message);
        break;
      case 'system.shutdown':
        this._handleSystemShutdown(message);
        break;
      default:
        // Handle specialized messages
        this.handleSpecializedMessage(message);
    }
  }
  
  /**
   * Handle status request message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleStatusRequest(message) {
    // Publish status response
    this.communicationHub.publish(message.replyTo || 'agent.status', {
      agentId: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      taskCount: this.tasks.size,
      timestamp: new Date()
    });
  }
  
  /**
   * Handle capabilities request message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleCapabilitiesRequest(message) {
    // Publish capabilities response
    this.communicationHub.publish(message.replyTo || 'agent.capabilities', {
      agentId: this.id,
      name: this.name,
      type: this.type,
      capabilities: this.capabilities,
      timestamp: new Date()
    });
  }
  
  /**
   * Handle system shutdown message
   * @param {Object} message - The message to handle
   * @private
   */
  _handleSystemShutdown(message) {
    console.log(`Agent ${this.name} shutting down`);
    
    // Cancel all tasks
    this.tasks.clear();
    
    // Update status
    this.status = 'shutdown';
    
    // Unsubscribe from communication channels
    if (this.communicationHub) {
      this.communicationHub.unsubscribe('task.created', this._handleTaskCreated);
      this.communicationHub.unsubscribe('task.canceled', this._handleTaskCanceled);
      this.communicationHub.unsubscribe(`agent.${this.id}`, this._handleAgentMessage);
      this.communicationHub.unsubscribe(`agent.${this.type}`, this._handleAgentTypeMessage);
      this.communicationHub.unsubscribe('agent.all', this._handleBroadcastMessage);
    }
  }
  
  /**
   * Process next task in queue
   * @private
   */
  async _processNextTask() {
    // Check if agent is already processing a task
    if (this.status === 'busy') {
      return;
    }
    
    // Find next pending task
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => a.createdAt - b.createdAt);
    
    if (pendingTasks.length === 0) {
      return;
    }
    
    const task = pendingTasks[0];
    
    // Update task status
    task.status = 'processing';
    this.tasks.set(task.id, task);
    
    // Update agent status
    this.status = 'busy';
    
    // Publish task started event
    this.communicationHub.publish('task.started', {
      taskId: task.id,
      agentId: this.id,
      timestamp: new Date()
    });
    
    try {
      // Process task
      console.log(`Agent ${this.name} processing task ${task.id}`);
      const result = await this._processTask(task.data);
      
      // Update task status
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      this.tasks.set(task.id, task);
      
      // Publish task completed event
      this.communicationHub.publish('task.completed', {
        taskId: task.id,
        agentId: this.id,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`Agent ${this.name} failed to process task ${task.id}:`, error);
      
      // Update task status
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();
      this.tasks.set(task.id, task);
      
      // Publish task failed event
      this.communicationHub.publish('task.failed', {
        taskId: task.id,
        agentId: this.id,
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      // Update agent status
      this.status = 'idle';
      
      // Process next task
      this._processNextTask();
    }
  }
  
  /**
   * Process a task - to be implemented by subclasses
   * @param {Object} taskData - Data for the task to process
   * @returns {Promise<Object>} - Promise resolving to the task result
   * @private
   */
  async _processTask(taskData) {
    throw new Error('_processTask must be implemented by subclass');
  }
  
  /**
   * Handle specialized messages - to be implemented by subclasses
   * @param {Object} message - The message to handle
   */
  handleSpecializedMessage(message) {
    console.log(`Agent ${this.name} received unhandled specialized message: ${message.type}`);
  }
  
  /**
   * Get agent status
   * @returns {Object} - Agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      taskCount: this.tasks.size,
      capabilities: Object.keys(this.capabilities)
    };
  }
  
  /**
   * Check if agent has capability
   * @param {string} capability - Capability to check
   * @param {number} threshold - Minimum capability level (0-1)
   * @returns {boolean} - Whether agent has capability at specified level
   */
  hasCapability(capability, threshold = 0.5) {
    return (this.capabilities[capability] || 0) >= threshold;
  }
}

module.exports = Agent;