/**
 * Communication Hub
 * Version: 0.1.0
 * Date: 2025-03-03
 * Author: Forge, DevOps Lead
 * 
 * The Communication Hub manages all message passing between agents, the system,
 * and external components. It provides a standardized protocol for transmitting
 * messages, handling events, and ensuring reliable delivery.
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// Message types
const MESSAGE_TYPES = {
  // System messages
  SYSTEM: 'system',
  
  // Agent communication
  AGENT: 'agent',
  
  // Task-related messages
  TASK: 'task',
  
  // User interactions
  USER: 'user',
  
  // Resource requests/responses
  RESOURCE: 'resource',
  
  // Conflicts and resolutions
  CONFLICT: 'conflict'
};

// Message priorities
const MESSAGE_PRIORITIES = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

class CommunicationHub extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = options;
    this.logger = options.logger;
    this.io = options.io; // Socket.IO instance for real-time communication
    
    // Registered agents
    this.agents = new Map();
    
    // Message history
    this.messageHistory = new Map();
    
    // Active channels
    this.channels = new Map();
    
    // Message queues
    this.messageQueues = new Map();
    
    // Active connections
    this.connections = new Set();
    
    this.status = {
      initialized: false,
      activeConnections: 0
    };
    
    this.logger.info('Communication Hub created');
  }
  
  /**
   * Initialize the communication hub
   */
  async initialize() {
    this.logger.info('Initializing Communication Hub...');
    
    try {
      // Set up socket.io event handlers if available
      if (this.io) {
        this._setupSocketIO();
      }
      
      // Create default channels
      this._createDefaultChannels();
      
      this.status.initialized = true;
      this.logger.info('Communication Hub initialized');
      
      // Emit initialization event
      this.emit('initialized', {
        socketIO: !!this.io
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Communication Hub:', error);
      throw error;
    }
  }
  
  /**
   * Set up Socket.IO event handlers
   */
  _setupSocketIO() {
    this.logger.info('Setting up Socket.IO event handlers');
    
    this.io.on('connection', (socket) => {
      this.logger.info(`New socket connection: ${socket.id}`);
      
      // Track connection
      this.connections.add(socket.id);
      this.status.activeConnections++;
      
      // Handle agent registration
      socket.on('agent:register', (data) => {
        this._handleAgentRegistration(socket.id, data);
      });
      
      // Handle agent messages
      socket.on('agent:message', (data) => {
        this._handleAgentMessage(socket.id, data);
      });
      
      // Handle user messages
      socket.on('user:message', (data) => {
        this._handleUserMessage(socket.id, data);
      });
      
      // Handle task events
      socket.on('task:event', (data) => {
        this._handleTaskEvent(socket.id, data);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.logger.info(`Socket disconnected: ${socket.id}`);
        
        // Remove from connections
        this.connections.delete(socket.id);
        this.status.activeConnections--;
        
        // Find and update agent if this was an agent connection
        for (const [agentId, agent] of this.agents.entries()) {
          if (agent.socketId === socket.id) {
            agent.connected = false;
            agent.lastDisconnect = new Date().toISOString();
            this.agents.set(agentId, agent);
            
            // Emit agent disconnection event
            this.emit('agent:disconnected', {
              agentId,
              socketId: socket.id,
              timestamp: agent.lastDisconnect
            });
            
            break;
          }
        }
      });
    });
  }
  
  /**
   * Create default communication channels
   */
  _createDefaultChannels() {
    this.logger.info('Creating default communication channels');
    
    // System channel (for system-wide announcements)
    this.channels.set('system', {
      name: 'System',
      description: 'System-wide announcements and events',
      subscribers: new Set(),
      messages: []
    });
    
    // Agents channel (for agent coordination)
    this.channels.set('agents', {
      name: 'Agents',
      description: 'Agent coordination and communication',
      subscribers: new Set(),
      messages: []
    });
    
    // Tasks channel (for task-related messages)
    this.channels.set('tasks', {
      name: 'Tasks',
      description: 'Task-related messages and events',
      subscribers: new Set(),
      messages: []
    });
    
    // User channel (for user interactions)
    this.channels.set('user', {
      name: 'User',
      description: 'User interactions and commands',
      subscribers: new Set(),
      messages: []
    });
  }
  
  /**
   * Handle agent registration
   */
  _handleAgentRegistration(socketId, data) {
    const { agentId, agentType, capabilities } = data;
    
    this.logger.info(`Agent registration: ${agentId} (${agentType})`);
    
    // Check if agent is already registered
    if (this.agents.has(agentId)) {
      const agent = this.agents.get(agentId);
      
      // Update existing agent
      agent.socketId = socketId;
      agent.connected = true;
      agent.lastConnect = new Date().toISOString();
      
      // Update capabilities if provided
      if (capabilities) {
        agent.capabilities = capabilities;
      }
      
      this.agents.set(agentId, agent);
      
      this.logger.info(`Agent reconnected: ${agentId}`);
    } else {
      // Register new agent
      this.agents.set(agentId, {
        id: agentId,
        type: agentType,
        socketId,
        capabilities: capabilities || [],
        connected: true,
        createdAt: new Date().toISOString(),
        lastConnect: new Date().toISOString(),
        lastDisconnect: null,
        messageQueue: []
      });
      
      this.logger.info(`New agent registered: ${agentId}`);
      
      // Create message queue for the agent
      this.messageQueues.set(agentId, []);
    }
    
    // Subscribe agent to relevant channels
    this._subscribeAgentToChannels(agentId, agentType);
    
    // Emit agent registration event
    this.emit('agent:registered', {
      agentId,
      agentType,
      socketId,
      capabilities: capabilities || []
    });
    
    // Send confirmation to the agent
    if (this.io) {
      this.io.to(socketId).emit('agent:registered', {
        agentId,
        status: 'registered',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Subscribe an agent to relevant channels based on its type
   */
  _subscribeAgentToChannels(agentId, agentType) {
    // All agents subscribe to the system and agents channels
    this.channels.get('system').subscribers.add(agentId);
    this.channels.get('agents').subscribers.add(agentId);
    
    // Subscribe to tasks channel for task-related agent types
    if (['architect', 'coder', 'tester', 'documenter', 'reviewer'].includes(agentType)) {
      this.channels.get('tasks').subscribers.add(agentId);
    }
    
    // Subscribe to user channel for user-facing agent types
    if (['assistant', 'ui'].includes(agentType)) {
      this.channels.get('user').subscribers.add(agentId);
    }
    
    this.logger.info(`Agent ${agentId} subscribed to channels`);
  }
  
  /**
   * Handle a message from an agent
   */
  _handleAgentMessage(socketId, data) {
    const { agentId, recipients, messageType, content, priority = 'normal' } = data;
    
    // Validate message
    if (!agentId || !messageType || !content) {
      this.logger.warn('Invalid agent message format', { socketId, data });
      return;
    }
    
    // Check if agent is registered
    if (!this.agents.has(agentId)) {
      this.logger.warn(`Message from unregistered agent: ${agentId}`);
      return;
    }
    
    // Check if socket ID matches the registered agent
    const agent = this.agents.get(agentId);
    if (agent.socketId !== socketId) {
      this.logger.warn(`Socket ID mismatch for agent ${agentId}`);
      return;
    }
    
    this.logger.info(`Message from agent ${agentId}: ${messageType}`);
    
    // Create message object
    const message = {
      id: this._generateMessageId(),
      sender: agentId,
      recipients: recipients || [],
      type: messageType,
      content,
      priority,
      timestamp: new Date().toISOString()
    };
    
    // Store message in history
    this._storeMessage(message);
    
    // Determine appropriate event based on message type
    let eventName;
    let eventData;
    
    switch (messageType.split(':')[0]) {
      case 'task':
        eventName = messageType; // Use full message type as event name
        eventData = {
          agentId,
          ...content
        };
        break;
        
      case 'agent':
        eventName = 'agent:message';
        eventData = {
          agentId,
          content
        };
        break;
        
      case 'conflict':
        eventName = 'task:conflict';
        eventData = {
          agentId,
          ...content
        };
        break;
        
      default:
        eventName = `${messageType}`;
        eventData = {
          agentId,
          content
        };
    }
    
    // Emit the appropriate event
    this.emit(eventName, eventData);
    
    // Forward message to recipients if specified
    if (recipients && recipients.length > 0) {
      this._deliverMessageToRecipients(message);
    }
    
    // Broadcast to appropriate channel if no specific recipients
    if (!recipients || recipients.length === 0) {
      this._broadcastToChannel(message);
    }
  }
  
  /**
   * Handle a message from a user
   */
  _handleUserMessage(socketId, data) {
    const { userId, messageType, content } = data;
    
    // Validate message
    if (!messageType || !content) {
      this.logger.warn('Invalid user message format', { socketId, data });
      return;
    }
    
    this.logger.info(`Message from user ${userId || 'anonymous'}: ${messageType}`);
    
    // Create message object
    const message = {
      id: this._generateMessageId(),
      sender: userId || 'user',
      recipients: [],
      type: messageType,
      content,
      priority: 'normal',
      timestamp: new Date().toISOString()
    };
    
    // Store message in history
    this._storeMessage(message);
    
    // Emit user message event
    this.emit('user:message', {
      userId: userId || 'anonymous',
      messageType,
      content
    });
    
    // Broadcast to user channel
    message.channel = 'user';
    this._broadcastToChannel(message);
  }
  
  /**
   * Handle a task-related event
   */
  _handleTaskEvent(socketId, data) {
    const { taskId, eventType, details } = data;
    
    // Validate event
    if (!taskId || !eventType) {
      this.logger.warn('Invalid task event format', { socketId, data });
      return;
    }
    
    this.logger.info(`Task event for ${taskId}: ${eventType}`);
    
    // Emit task event
    this.emit(`task:${eventType}`, {
      taskId,
      ...details
    });
    
    // Create message for broadcast
    const message = {
      id: this._generateMessageId(),
      sender: 'system',
      recipients: [],
      type: `task:${eventType}`,
      content: {
        taskId,
        ...details
      },
      priority: eventType === 'error' ? 'high' : 'normal',
      timestamp: new Date().toISOString(),
      channel: 'tasks'
    };
    
    // Store message in history
    this._storeMessage(message);
    
    // Broadcast to tasks channel
    this._broadcastToChannel(message);
  }
  
  /**
   * Generate a unique message ID
   */
  _generateMessageId() {
    return crypto.randomUUID();
  }
  
  /**
   * Store a message in the message history
   */
  _storeMessage(message) {
    // Store in overall message history
    this.messageHistory.set(message.id, message);
    
    // Trim history if it gets too large (keep last 1000 messages)
    if (this.messageHistory.size > 1000) {
      const oldestMessages = Array.from(this.messageHistory.entries())
        .sort(([, a], [, b]) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(0, this.messageHistory.size - 1000);
      
      for (const [id] of oldestMessages) {
        this.messageHistory.delete(id);
      }
    }
    
    // If message belongs to a channel, add to channel history
    if (message.channel && this.channels.has(message.channel)) {
      const channel = this.channels.get(message.channel);
      channel.messages.push(message);
      
      // Trim channel history (keep last 100 messages)
      if (channel.messages.length > 100) {
        channel.messages = channel.messages.slice(-100);
      }
    }
  }
  
  /**
   * Deliver a message to specific recipients
   */
  _deliverMessageToRecipients(message) {
    for (const recipientId of message.recipients) {
      // Skip if recipient is not a registered agent
      if (!this.agents.has(recipientId)) {
        this.logger.warn(`Cannot deliver message to unregistered agent: ${recipientId}`);
        continue;
      }
      
      const agent = this.agents.get(recipientId);
      
      // If agent is connected and using Socket.IO, send immediately
      if (agent.connected && agent.socketId && this.io) {
        this.io.to(agent.socketId).emit('message', message);
        
        this.logger.info(`Delivered message ${message.id} to agent ${recipientId}`);
      } else {
        // Otherwise, queue message for later delivery
        this.logger.info(`Queuing message ${message.id} for agent ${recipientId}`);
        
        // Get agent's message queue
        const queue = this.messageQueues.get(recipientId) || [];
        
        // Add message to queue
        queue.push(message);
        
        // Update queue
        this.messageQueues.set(recipientId, queue);
      }
    }
  }
  
  /**
   * Broadcast a message to a channel
   */
  _broadcastToChannel(message) {
    const channelName = message.channel || this._determineChannelForMessage(message);
    
    if (!this.channels.has(channelName)) {
      this.logger.warn(`Cannot broadcast to unknown channel: ${channelName}`);
      return;
    }
    
    const channel = this.channels.get(channelName);
    
    // Add message to channel history
    channel.messages.push(message);
    
    // Trim channel history (keep last 100 messages)
    if (channel.messages.length > 100) {
      channel.messages = channel.messages.slice(-100);
    }
    
    this.logger.info(`Broadcasting message ${message.id} to channel ${channelName}`);
    
    // Broadcast to all subscribers
    for (const subscriberId of channel.subscribers) {
      // Skip if subscriber is not a registered agent
      if (!this.agents.has(subscriberId)) {
        continue;
      }
      
      const agent = this.agents.get(subscriberId);
      
      // If agent is connected and using Socket.IO, send immediately
      if (agent.connected && agent.socketId && this.io) {
        this.io.to(agent.socketId).emit('message', {
          ...message,
          channel: channelName
        });
      } else {
        // Otherwise, queue message for later delivery
        const queue = this.messageQueues.get(subscriberId) || [];
        queue.push({
          ...message,
          channel: channelName
        });
        this.messageQueues.set(subscriberId, queue);
      }
    }
    
    // If using Socket.IO, also broadcast to clients subscribed to the channel
    if (this.io) {
      this.io.to(channelName).emit('channel:message', {
        ...message,
        channel: channelName
      });
    }
  }
  
  /**
   * Determine the appropriate channel for a message based on its type
   */
  _determineChannelForMessage(message) {
    const messagePrefix = message.type.split(':')[0];
    
    switch (messagePrefix) {
      case 'system':
        return 'system';
        
      case 'agent':
        return 'agents';
        
      case 'task':
      case 'conflict':
        return 'tasks';
        
      case 'user':
        return 'user';
        
      default:
        return 'system';
    }
  }
  
  /**
   * Register an agent with the communication hub
   */
  async registerAgent(agentId, agentType, capabilities = []) {
    this.logger.info(`Registering agent: ${agentId} (${agentType})`);
    
    // Create agent entry
    const agent = {
      id: agentId,
      type: agentType,
      socketId: null,
      capabilities,
      connected: false,
      createdAt: new Date().toISOString(),
      lastConnect: null,
      lastDisconnect: null
    };
    
    // Store agent
    this.agents.set(agentId, agent);
    
    // Create message queue
    this.messageQueues.set(agentId, []);
    
    // Subscribe to channels
    this._subscribeAgentToChannels(agentId, agentType);
    
    // Emit registration event
    this.emit('agent:registered', {
      agentId,
      agentType,
      capabilities
    });
    
    return true;
  }
  
  /**
   * Send a message to a specific agent
   */
  async sendAgentMessage(agentId, message) {
    this.logger.info(`Sending message to agent ${agentId}: ${message.type}`);
    
    // Check if agent is registered
    if (!this.agents.has(agentId)) {
      this.logger.warn(`Cannot send message to unregistered agent: ${agentId}`);
      return false;
    }
    
    const agent = this.agents.get(agentId);
    
    // Create full message object
    const fullMessage = {
      id: this._generateMessageId(),
      sender: 'system',
      recipients: [agentId],
      type: message.type,
      content: message.data || message,
      priority: message.priority || 'normal',
      timestamp: new Date().toISOString()
    };
    
    // Store message in history
    this._storeMessage(fullMessage);
    
    // If agent is connected and using Socket.IO, send immediately
    if (agent.connected && agent.socketId && this.io) {
      this.io.to(agent.socketId).emit('message', fullMessage);
      
      this.logger.info(`Delivered message ${fullMessage.id} to agent ${agentId}`);
      return true;
    } else {
      // Otherwise, queue message for later delivery
      this.logger.info(`Queuing message ${fullMessage.id} for agent ${agentId}`);
      
      // Get agent's message queue
      const queue = this.messageQueues.get(agentId) || [];
      
      // Add message to queue
      queue.push(fullMessage);
      
      // Update queue
      this.messageQueues.set(agentId, queue);
      
      return true;
    }
  }
  
  /**
   * Broadcast a system message to all agents
   */
  async broadcastSystemMessage(messageType, content, priority = 'normal') {
    this.logger.info(`Broadcasting system message: ${messageType}`);
    
    // Create message object
    const message = {
      id: this._generateMessageId(),
      sender: 'system',
      recipients: [],
      type: `system:${messageType}`,
      content,
      priority,
      timestamp: new Date().toISOString(),
      channel: 'system'
    };
    
    // Store message in history
    this._storeMessage(message);
    
    // Broadcast to system channel
    this._broadcastToChannel(message);
    
    return true;
  }
  
  /**
   * Create a new communication channel
   */
  createChannel(channelId, name, description = '') {
    this.logger.info(`Creating channel: ${channelId}`);
    
    // Check if channel already exists
    if (this.channels.has(channelId)) {
      this.logger.warn(`Channel already exists: ${channelId}`);
      return false;
    }
    
    // Create channel
    this.channels.set(channelId, {
      name: name || channelId,
      description,
      subscribers: new Set(),
      messages: []
    });
    
    this.logger.info(`Channel created: ${channelId}`);
    
    // Emit channel creation event
    this.emit('channel:created', {
      channelId,
      name: name || channelId,
      description
    });
    
    return true;
  }
  
  /**
   * Subscribe an agent to a channel
   */
  subscribeToChannel(agentId, channelId) {
    this.logger.info(`Subscribing agent ${agentId} to channel ${channelId}`);
    
    // Check if agent is registered
    if (!this.agents.has(agentId)) {
      this.logger.warn(`Cannot subscribe unregistered agent: ${agentId}`);
      return false;
    }
    
    // Check if channel exists
    if (!this.channels.has(channelId)) {
      this.logger.warn(`Cannot subscribe to unknown channel: ${channelId}`);
      return false;
    }
    
    // Add agent to channel subscribers
    this.channels.get(channelId).subscribers.add(agentId);
    
    // Emit subscription event
    this.emit('channel:subscribed', {
      agentId,
      channelId
    });
    
    return true;
  }
  
  /**
   * Unsubscribe an agent from a channel
   */
  unsubscribeFromChannel(agentId, channelId) {
    this.logger.info(`Unsubscribing agent ${agentId} from channel ${channelId}`);
    
    // Check if channel exists
    if (!this.channels.has(channelId)) {
      this.logger.warn(`Cannot unsubscribe from unknown channel: ${channelId}`);
      return false;
    }
    
    // Remove agent from channel subscribers
    this.channels.get(channelId).subscribers.delete(agentId);
    
    // Emit unsubscription event
    this.emit('channel:unsubscribed', {
      agentId,
      channelId
    });
    
    return true;
  }
  
  /**
   * Get a list of all registered agents
   */
  getAgents() {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      type: agent.type,
      connected: agent.connected,
      capabilities: agent.capabilities,
      createdAt: agent.createdAt,
      lastConnect: agent.lastConnect,
      lastDisconnect: agent.lastDisconnect,
      queuedMessages: (this.messageQueues.get(id) || []).length
    }));
  }
  
  /**
   * Get a list of all channels
   */
  getChannels() {
    return Array.from(this.channels.entries()).map(([id, channel]) => ({
      id,
      name: channel.name,
      description: channel.description,
      subscriberCount: channel.subscribers.size,
      messageCount: channel.messages.length
    }));
  }
  
  /**
   * Get channel message history
   */
  getChannelHistory(channelId, limit = 100) {
    // Check if channel exists
    if (!this.channels.has(channelId)) {
      this.logger.warn(`Cannot get history for unknown channel: ${channelId}`);
      return [];
    }
    
    const channel = this.channels.get(channelId);
    
    // Return recent messages up to limit
    return channel.messages.slice(-limit);
  }
  
  /**
   * Deliver queued messages to a connected agent
   */
  async deliverQueuedMessages(agentId) {
    this.logger.info(`Delivering queued messages to agent ${agentId}`);
    
    // Check if agent is registered
    if (!this.agents.has(agentId)) {
      this.logger.warn(`Cannot deliver to unregistered agent: ${agentId}`);
      return 0;
    }
    
    const agent = this.agents.get(agentId);
    
    // Check if agent is connected and using Socket.IO
    if (!agent.connected || !agent.socketId || !this.io) {
      this.logger.warn(`Agent ${agentId} is not connected or not using Socket.IO`);
      return 0;
    }
    
    // Get agent's message queue
    const queue = this.messageQueues.get(agentId) || [];
    
    if (queue.length === 0) {
      return 0;
    }
    
    this.logger.info(`Delivering ${queue.length} queued messages to agent ${agentId}`);
    
    // Send all queued messages
    for (const message of queue) {
      this.io.to(agent.socketId).emit('message', message);
    }
    
    // Clear the queue
    this.messageQueues.set(agentId, []);
    
    return queue.length;
  }
  
  /**
   * Shutdown the communication hub
   */
  async shutdown() {
    this.logger.info('Shutting down Communication Hub...');
    
    // Broadcast shutdown message
    await this.broadcastSystemMessage('shutdown', {
      reason: 'Hub shutting down',
      timestamp: new Date().toISOString()
    }, 'high');
    
    // Clear all message queues and channels
    this.messageQueues.clear();
    this.channels.clear();
    this.agents.clear();
    this.messageHistory.clear();
    
    // Clean up Socket.IO connections if available
    if (this.io) {
      // Disconnect all sockets in namespace
      const sockets = await this.io.fetchSockets();
      for (const socket of sockets) {
        socket.disconnect(true);
      }
    }
    
    // Update status
    this.status.initialized = false;
    this.status.activeConnections = 0;
    
    this.logger.info('Communication Hub shutdown complete');
    
    return true;
  }
}

module.exports = CommunicationHub;