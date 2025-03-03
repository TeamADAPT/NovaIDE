/**
 * Agent Orchestrator
 * Version: 0.1.0
 * Date: 2025-03-03
 * Author: Forge, DevOps Lead
 * 
 * The Agent Orchestrator is responsible for managing multiple AI agents,
 * coordinating their actions, distributing tasks, and handling conflicts.
 * It serves as the central coordination point for all agent activities.
 */

'use strict';

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;

// Agent types
const AGENT_TYPES = {
  ARCHITECT: 'architect',     // High-level design and planning
  CODER: 'coder',             // Actual code implementation
  TESTER: 'tester',           // Testing and validation
  DOCUMENTER: 'documenter',   // Documentation generation
  REVIEWER: 'reviewer'        // Code review and optimization
};

class AgentOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = options;
    this.logger = options.logger;
    this.communicationHub = options.communicationHub;
    this.memoryManager = options.memoryManager;
    this.executionEnvironment = options.executionEnvironment;
    
    this.agentCount = options.agentCount || 5;
    this.agents = new Map();
    this.tasks = new Map();
    this.agentTaskAssignments = new Map();
    
    this.status = {
      initialized: false,
      activeAgents: 0,
      pendingTasks: 0,
      completedTasks: 0
    };
    
    this.logger.info('Agent Orchestrator created');
  }
  
  /**
   * Initialize the orchestrator and create agents
   */
  async initialize() {
    this.logger.info('Initializing Agent Orchestrator...');
    
    try {
      // Create agent directory if it doesn't exist
      const agentDir = path.join(__dirname, 'instances');
      await fs.mkdir(agentDir, { recursive: true });
      
      // Initialize agents
      await this._createAgents();
      
      // Subscribe to communication events
      this._setupCommunication();
      
      this.status.initialized = true;
      this.logger.info(`Agent Orchestrator initialized with ${this.agents.size} agents`);
      
      // Emit initialization event
      this.emit('initialized', { agentCount: this.agents.size });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }
  
  /**
   * Create the agent instances
   */
  async _createAgents() {
    this.logger.info(`Creating ${this.agentCount} agents...`);
    
    // Determine how many of each type to create
    const distribution = this._calculateAgentDistribution(this.agentCount);
    
    // Create each agent type according to distribution
    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        const agentId = `${type}-${i + 1}`;
        const agent = await this._createAgent(type, agentId);
        this.agents.set(agentId, agent);
      }
    }
    
    this.status.activeAgents = this.agents.size;
    this.logger.info(`Created ${this.agents.size} agents`);
  }
  
  /**
   * Calculate the distribution of agent types
   */
  _calculateAgentDistribution(totalCount) {
    // For MVP, we'll use a simple distribution
    if (totalCount <= 5) {
      return {
        [AGENT_TYPES.ARCHITECT]: 1,
        [AGENT_TYPES.CODER]: Math.max(1, Math.floor(totalCount * 0.4)),
        [AGENT_TYPES.TESTER]: Math.max(1, Math.floor(totalCount * 0.2)),
        [AGENT_TYPES.DOCUMENTER]: 1,
        [AGENT_TYPES.REVIEWER]: Math.max(1, totalCount - 4) // Remaining agents
      };
    } else {
      // More sophisticated distribution for larger agent pools
      return {
        [AGENT_TYPES.ARCHITECT]: Math.max(1, Math.floor(totalCount * 0.1)),
        [AGENT_TYPES.CODER]: Math.max(2, Math.floor(totalCount * 0.5)),
        [AGENT_TYPES.TESTER]: Math.max(1, Math.floor(totalCount * 0.2)),
        [AGENT_TYPES.DOCUMENTER]: Math.max(1, Math.floor(totalCount * 0.1)),
        [AGENT_TYPES.REVIEWER]: Math.max(1, Math.floor(totalCount * 0.1))
      };
    }
  }
  
  /**
   * Create a single agent instance
   */
  async _createAgent(type, id) {
    this.logger.info(`Creating agent ${id} of type ${type}`);
    
    // In a real implementation, this would dynamically import the agent class
    // For MVP, we'll create a simple agent object
    const agent = {
      id,
      type,
      status: 'idle',
      capabilities: this._getCapabilitiesForType(type),
      metadata: {
        createdAt: new Date().toISOString(),
        lastActive: null
      }
    };
    
    // Register agent with communication hub
    await this.communicationHub.registerAgent(id, type);
    
    // Initialize agent's memory context
    await this.memoryManager.initializeAgentContext(id, type);
    
    return agent;
  }
  
  /**
   * Get capabilities for a given agent type
   */
  _getCapabilitiesForType(type) {
    switch (type) {
      case AGENT_TYPES.ARCHITECT:
        return ['system_design', 'task_planning', 'requirements_analysis'];
      case AGENT_TYPES.CODER:
        return ['code_generation', 'debugging', 'refactoring'];
      case AGENT_TYPES.TESTER:
        return ['test_generation', 'validation', 'quality_assessment'];
      case AGENT_TYPES.DOCUMENTER:
        return ['documentation_generation', 'code_explanation', 'comment_generation'];
      case AGENT_TYPES.REVIEWER:
        return ['code_review', 'performance_optimization', 'security_analysis'];
      default:
        return ['general_assistance'];
    }
  }
  
  /**
   * Set up communication event handlers
   */
  _setupCommunication() {
    // Listen for task assignments
    this.communicationHub.on('task:new', this.handleNewTask.bind(this));
    
    // Listen for agent messages
    this.communicationHub.on('agent:message', this.handleAgentMessage.bind(this));
    
    // Listen for conflict resolution requests
    this.communicationHub.on('task:conflict', this.handleConflict.bind(this));
    
    // Listen for task completion
    this.communicationHub.on('task:complete', this.handleTaskCompletion.bind(this));
  }
  
  /**
   * Handle a new task assignment
   */
  async handleNewTask(taskData) {
    this.logger.info(`Received new task: ${taskData.id}`);
    
    try {
      // Store task info
      this.tasks.set(taskData.id, {
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        assignedAgents: []
      });
      
      this.status.pendingTasks++;
      
      // Plan the task execution
      const plan = await this._planTaskExecution(taskData);
      
      // Assign subtasks to agents
      await this._assignSubtasks(taskData.id, plan);
      
      this.logger.info(`Task ${taskData.id} planned and assigned`);
      
      // Update task status
      const task = this.tasks.get(taskData.id);
      task.status = 'in_progress';
      this.tasks.set(taskData.id, task);
      
      // Notify about task start
      this.emit('task:started', { taskId: taskData.id, plan });
      
    } catch (error) {
      this.logger.error(`Failed to process task ${taskData.id}:`, error);
      
      // Update task status to failed
      const task = this.tasks.get(taskData.id);
      task.status = 'failed';
      task.error = error.message;
      this.tasks.set(taskData.id, task);
      
      // Notify about task failure
      this.emit('task:failed', { taskId: taskData.id, error: error.message });
    }
  }
  
  /**
   * Plan how to execute a task using available agents
   */
  async _planTaskExecution(taskData) {
    // Find an architect agent to create the plan
    const architects = Array.from(this.agents.values())
      .filter(agent => agent.type === AGENT_TYPES.ARCHITECT && agent.status === 'idle');
    
    if (architects.length === 0) {
      throw new Error('No available architect agents to plan task execution');
    }
    
    // Select the first available architect
    const architect = architects[0];
    
    // Mark architect as busy
    architect.status = 'busy';
    architect.metadata.lastActive = new Date().toISOString();
    
    this.logger.info(`Agent ${architect.id} planning task ${taskData.id}`);
    
    // In a real implementation, the architect agent would analyze the task
    // and create a plan with subtasks. For the MVP, we'll create a simple plan.
    const plan = {
      taskId: taskData.id,
      creator: architect.id,
      createdAt: new Date().toISOString(),
      subtasks: [
        {
          id: `${taskData.id}-design`,
          type: 'design',
          description: 'Create high-level design',
          assignedTo: null,
          dependencies: [],
          status: 'pending'
        },
        {
          id: `${taskData.id}-implementation`,
          type: 'implementation',
          description: 'Implement solution',
          assignedTo: null,
          dependencies: [`${taskData.id}-design`],
          status: 'pending'
        },
        {
          id: `${taskData.id}-testing`,
          type: 'testing',
          description: 'Test implementation',
          assignedTo: null,
          dependencies: [`${taskData.id}-implementation`],
          status: 'pending'
        },
        {
          id: `${taskData.id}-documentation`,
          type: 'documentation',
          description: 'Document solution',
          assignedTo: null,
          dependencies: [`${taskData.id}-implementation`],
          status: 'pending'
        },
        {
          id: `${taskData.id}-review`,
          type: 'review',
          description: 'Review solution',
          assignedTo: null,
          dependencies: [`${taskData.id}-testing`, `${taskData.id}-documentation`],
          status: 'pending'
        }
      ]
    };
    
    // Mark architect as idle again
    architect.status = 'idle';
    
    // Store the plan in shared memory
    await this.memoryManager.storeTaskPlan(taskData.id, plan);
    
    return plan;
  }
  
  /**
   * Assign subtasks to appropriate agents
   */
  async _assignSubtasks(taskId, plan) {
    // Map subtask types to agent types
    const typeMap = {
      'design': AGENT_TYPES.ARCHITECT,
      'implementation': AGENT_TYPES.CODER,
      'testing': AGENT_TYPES.TESTER,
      'documentation': AGENT_TYPES.DOCUMENTER,
      'review': AGENT_TYPES.REVIEWER
    };
    
    // For each subtask, find an appropriate agent
    for (const subtask of plan.subtasks) {
      const agentType = typeMap[subtask.type] || AGENT_TYPES.CODER;
      
      // Find available agents of the required type
      const availableAgents = Array.from(this.agents.values())
        .filter(agent => agent.type === agentType && agent.status === 'idle');
      
      if (availableAgents.length === 0) {
        this.logger.warn(`No available ${agentType} agents for subtask ${subtask.id}`);
        continue;
      }
      
      // Select the first available agent of the required type
      const agent = availableAgents[0];
      
      // Assign the subtask to the agent
      subtask.assignedTo = agent.id;
      
      // Update agent status
      agent.status = 'assigned';
      agent.metadata.lastActive = new Date().toISOString();
      
      // Update agent-task assignments
      this.agentTaskAssignments.set(agent.id, {
        taskId,
        subtaskId: subtask.id
      });
      
      // Add agent to task's assigned agents
      const task = this.tasks.get(taskId);
      task.assignedAgents.push(agent.id);
      this.tasks.set(taskId, task);
      
      this.logger.info(`Assigned subtask ${subtask.id} to agent ${agent.id}`);
      
      // Notify the agent about its assignment
      await this.communicationHub.sendAgentMessage(agent.id, {
        type: 'subtask:assigned',
        data: {
          taskId,
          subtask
        }
      });
    }
    
    // Update the plan in shared memory
    await this.memoryManager.storeTaskPlan(taskId, plan);
  }
  
  /**
   * Handle messages from agents
   */
  async handleAgentMessage(message) {
    const { agentId, content } = message;
    this.logger.info(`Received message from agent ${agentId}: ${content.type}`);
    
    // Process message based on type
    switch (content.type) {
      case 'subtask:progress':
        // Update subtask progress
        await this._updateSubtaskProgress(agentId, content.data);
        break;
      
      case 'subtask:complete':
        // Handle subtask completion
        await this._handleSubtaskCompletion(agentId, content.data);
        break;
      
      case 'assistance:request':
        // Agent requesting assistance from other agents
        await this._handleAssistanceRequest(agentId, content.data);
        break;
      
      case 'resource:request':
        // Agent requesting access to resources
        await this._handleResourceRequest(agentId, content.data);
        break;
      
      default:
        this.logger.warn(`Unknown message type from agent ${agentId}: ${content.type}`);
    }
  }
  
  /**
   * Update progress of a subtask
   */
  async _updateSubtaskProgress(agentId, data) {
    const { taskId, subtaskId, progress, statusUpdate } = data;
    this.logger.info(`Updating progress for subtask ${subtaskId}: ${progress}%`);
    
    // Retrieve task plan
    const plan = await this.memoryManager.getTaskPlan(taskId);
    if (!plan) {
      this.logger.error(`Task plan not found for task ${taskId}`);
      return;
    }
    
    // Find and update the subtask
    const subtask = plan.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      this.logger.error(`Subtask ${subtaskId} not found in task ${taskId}`);
      return;
    }
    
    // Update progress information
    subtask.progress = progress;
    if (statusUpdate) {
      subtask.statusUpdate = statusUpdate;
    }
    
    // Store updated plan
    await this.memoryManager.storeTaskPlan(taskId, plan);
    
    // Broadcast progress update
    this.emit('subtask:progress', {
      taskId,
      subtaskId,
      agentId,
      progress,
      statusUpdate
    });
  }
  
  /**
   * Handle completion of a subtask
   */
  async _handleSubtaskCompletion(agentId, data) {
    const { taskId, subtaskId, result } = data;
    this.logger.info(`Subtask ${subtaskId} completed by agent ${agentId}`);
    
    // Retrieve task plan
    const plan = await this.memoryManager.getTaskPlan(taskId);
    if (!plan) {
      this.logger.error(`Task plan not found for task ${taskId}`);
      return;
    }
    
    // Find and update the subtask
    const subtask = plan.subtasks.find(st => st.id === subtaskId);
    if (!subtask) {
      this.logger.error(`Subtask ${subtaskId} not found in task ${taskId}`);
      return;
    }
    
    // Mark subtask as complete
    subtask.status = 'completed';
    subtask.completedAt = new Date().toISOString();
    subtask.result = result;
    
    // Store updated plan
    await this.memoryManager.storeTaskPlan(taskId, plan);
    
    // Update agent status
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'idle';
      this.agents.set(agentId, agent);
    }
    
    // Remove agent-task assignment
    this.agentTaskAssignments.delete(agentId);
    
    // Broadcast subtask completion
    this.emit('subtask:completed', {
      taskId,
      subtaskId,
      agentId,
      result
    });
    
    // Check if all subtasks are complete
    const allCompleted = plan.subtasks.every(st => st.status === 'completed');
    if (allCompleted) {
      await this._finalizeTask(taskId, plan);
    } else {
      // Check for subtasks that can now be started
      await this._checkDependenciesAndStartSubtasks(taskId, plan);
    }
  }
  
  /**
   * Check subtask dependencies and start those that are ready
   */
  async _checkDependenciesAndStartSubtasks(taskId, plan) {
    // Find subtasks that are pending but have all dependencies completed
    const readySubtasks = plan.subtasks.filter(subtask => {
      if (subtask.status !== 'pending') return false;
      
      // Check if all dependencies are completed
      return subtask.dependencies.every(depId => {
        const depSubtask = plan.subtasks.find(st => st.id === depId);
        return depSubtask && depSubtask.status === 'completed';
      });
    });
    
    // For each ready subtask, assign an agent
    for (const subtask of readySubtasks) {
      // Skip if already assigned
      if (subtask.assignedTo) continue;
      
      // Map subtask types to agent types
      const typeMap = {
        'design': AGENT_TYPES.ARCHITECT,
        'implementation': AGENT_TYPES.CODER,
        'testing': AGENT_TYPES.TESTER,
        'documentation': AGENT_TYPES.DOCUMENTER,
        'review': AGENT_TYPES.REVIEWER
      };
      
      const agentType = typeMap[subtask.type] || AGENT_TYPES.CODER;
      
      // Find available agents of the required type
      const availableAgents = Array.from(this.agents.values())
        .filter(agent => agent.type === agentType && agent.status === 'idle');
      
      if (availableAgents.length === 0) {
        this.logger.warn(`No available ${agentType} agents for subtask ${subtask.id}`);
        continue;
      }
      
      // Select the first available agent of the required type
      const agent = availableAgents[0];
      
      // Assign the subtask to the agent
      subtask.assignedTo = agent.id;
      subtask.status = 'in_progress';
      
      // Update agent status
      agent.status = 'assigned';
      agent.metadata.lastActive = new Date().toISOString();
      
      // Update agent-task assignments
      this.agentTaskAssignments.set(agent.id, {
        taskId,
        subtaskId: subtask.id
      });
      
      // Add agent to task's assigned agents if not already there
      const task = this.tasks.get(taskId);
      if (!task.assignedAgents.includes(agent.id)) {
        task.assignedAgents.push(agent.id);
        this.tasks.set(taskId, task);
      }
      
      this.logger.info(`Assigned subtask ${subtask.id} to agent ${agent.id}`);
      
      // Notify the agent about its assignment
      await this.communicationHub.sendAgentMessage(agent.id, {
        type: 'subtask:assigned',
        data: {
          taskId,
          subtask
        }
      });
    }
    
    // Update the plan in shared memory
    await this.memoryManager.storeTaskPlan(taskId, plan);
  }
  
  /**
   * Finalize a task once all subtasks are complete
   */
  async _finalizeTask(taskId, plan) {
    this.logger.info(`Finalizing task ${taskId} - all subtasks completed`);
    
    // Retrieve task info
    const task = this.tasks.get(taskId);
    if (!task) {
      this.logger.error(`Task ${taskId} not found for finalization`);
      return;
    }
    
    // Update task status
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    this.tasks.set(taskId, task);
    
    // Collect results from all subtasks
    const results = {};
    for (const subtask of plan.subtasks) {
      results[subtask.type] = subtask.result;
    }
    
    // Store final result in memory
    await this.memoryManager.storeTaskResult(taskId, results);
    
    // Update counters
    this.status.pendingTasks--;
    this.status.completedTasks++;
    
    // Broadcast task completion
    this.emit('task:completed', {
      taskId,
      results,
      timeTaken: new Date().getTime() - new Date(task.createdAt).getTime()
    });
  }
  
  /**
   * Handle a request for assistance from one agent to another
   */
  async _handleAssistanceRequest(agentId, data) {
    const { taskId, subtaskId, requestType, requestDetails } = data;
    this.logger.info(`Agent ${agentId} requesting assistance: ${requestType}`);
    
    // Find an agent that can assist
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => {
        // Don't select the requesting agent
        if (agent.id === agentId) return false;
        
        // Prefer idle agents with relevant capabilities
        return agent.status === 'idle' && 
               agent.capabilities.some(cap => requestDetails.requiredCapabilities.includes(cap));
      });
    
    if (availableAgents.length === 0) {
      this.logger.warn(`No available agents to assist ${agentId} with ${requestType}`);
      
      // Notify requesting agent that no assistance is available
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'assistance:unavailable',
        data: {
          requestId: data.requestId,
          reason: 'No suitable agents available'
        }
      });
      
      return;
    }
    
    // Select the most suitable agent (for MVP, just take the first one)
    const assistingAgent = availableAgents[0];
    
    // Update assisting agent status
    assistingAgent.status = 'assisting';
    assistingAgent.metadata.lastActive = new Date().toISOString();
    
    // Forward assistance request to the selected agent
    await this.communicationHub.sendAgentMessage(assistingAgent.id, {
      type: 'assistance:requested',
      data: {
        requestId: data.requestId,
        requestingAgentId: agentId,
        taskId,
        subtaskId,
        requestType,
        requestDetails
      }
    });
    
    // Notify requesting agent that assistance is coming
    await this.communicationHub.sendAgentMessage(agentId, {
      type: 'assistance:assigned',
      data: {
        requestId: data.requestId,
        assistingAgentId: assistingAgent.id
      }
    });
    
    this.logger.info(`Agent ${assistingAgent.id} assigned to assist ${agentId}`);
  }
  
  /**
   * Handle a request for resources from an agent
   */
  async _handleResourceRequest(agentId, data) {
    const { taskId, subtaskId, resourceType, resourceDetails } = data;
    this.logger.info(`Agent ${agentId} requesting resource: ${resourceType}`);
    
    // Process resource request based on type
    switch (resourceType) {
      case 'memory':
        // Agent wants to access shared memory
        await this._handleMemoryResourceRequest(agentId, data);
        break;
      
      case 'execution':
        // Agent wants to execute code
        await this._handleExecutionResourceRequest(agentId, data);
        break;
      
      case 'file':
        // Agent wants to access file system
        await this._handleFileResourceRequest(agentId, data);
        break;
      
      default:
        this.logger.warn(`Unknown resource type requested by agent ${agentId}: ${resourceType}`);
        
        // Notify agent that resource is unavailable
        await this.communicationHub.sendAgentMessage(agentId, {
          type: 'resource:unavailable',
          data: {
            requestId: data.requestId,
            reason: `Unknown resource type: ${resourceType}`
          }
        });
    }
  }
  
  /**
   * Handle a request for memory access
   */
  async _handleMemoryResourceRequest(agentId, data) {
    const { requestId, memoryType, memoryKey } = data.resourceDetails;
    
    try {
      let result;
      
      // Process based on memory type
      switch (memoryType) {
        case 'global':
          result = await this.memoryManager.getGlobalMemory(memoryKey);
          break;
        
        case 'task':
          result = await this.memoryManager.getTaskMemory(data.taskId, memoryKey);
          break;
        
        case 'agent':
          result = await this.memoryManager.getAgentMemory(data.resourceDetails.targetAgentId, memoryKey);
          break;
        
        default:
          throw new Error(`Unknown memory type: ${memoryType}`);
      }
      
      // Send resource to requesting agent
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:available',
        data: {
          requestId,
          resource: result
        }
      });
      
    } catch (error) {
      this.logger.error(`Error processing memory request from agent ${agentId}:`, error);
      
      // Notify agent of error
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:unavailable',
        data: {
          requestId,
          reason: error.message
        }
      });
    }
  }
  
  /**
   * Handle a request to execute code
   */
  async _handleExecutionResourceRequest(agentId, data) {
    const { requestId, code, language, inputs } = data.resourceDetails;
    
    try {
      // Execute code in isolated environment
      const result = await this.executionEnvironment.executeCode(code, language, inputs);
      
      // Send result to requesting agent
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:available',
        data: {
          requestId,
          resource: result
        }
      });
      
    } catch (error) {
      this.logger.error(`Error executing code for agent ${agentId}:`, error);
      
      // Notify agent of error
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:unavailable',
        data: {
          requestId,
          reason: error.message
        }
      });
    }
  }
  
  /**
   * Handle a request for file access
   */
  async _handleFileResourceRequest(agentId, data) {
    const { requestId, operation, path, content } = data.resourceDetails;
    
    try {
      let result;
      
      // Process based on operation
      switch (operation) {
        case 'read':
          result = await this.executionEnvironment.readFile(path);
          break;
        
        case 'write':
          result = await this.executionEnvironment.writeFile(path, content);
          break;
        
        case 'list':
          result = await this.executionEnvironment.listFiles(path);
          break;
        
        default:
          throw new Error(`Unknown file operation: ${operation}`);
      }
      
      // Send result to requesting agent
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:available',
        data: {
          requestId,
          resource: result
        }
      });
      
    } catch (error) {
      this.logger.error(`Error processing file request from agent ${agentId}:`, error);
      
      // Notify agent of error
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'resource:unavailable',
        data: {
          requestId,
          reason: error.message
        }
      });
    }
  }
  
  /**
   * Handle a conflict between agents
   */
  async handleConflict(conflictData) {
    const { taskId, agentIds, conflictType, conflictDetails } = conflictData;
    this.logger.info(`Handling conflict in task ${taskId} between agents: ${agentIds.join(', ')}`);
    
    // For MVP, we'll implement a simple resolution strategy
    // In a real system, this would be more sophisticated
    
    // Choose a resolution strategy based on conflict type
    switch (conflictType) {
      case 'resource_access':
        await this._resolveResourceConflict(taskId, agentIds, conflictDetails);
        break;
      
      case 'code_conflict':
        await this._resolveCodeConflict(taskId, agentIds, conflictDetails);
        break;
      
      case 'task_priority':
        await this._resolveTaskPriorityConflict(taskId, agentIds, conflictDetails);
        break;
      
      default:
        this.logger.warn(`Unknown conflict type: ${conflictType}`);
        
        // For unknown conflicts, notify agents to attempt self-resolution
        for (const agentId of agentIds) {
          await this.communicationHub.sendAgentMessage(agentId, {
            type: 'conflict:self_resolve',
            data: conflictData
          });
        }
    }
  }
  
  /**
   * Resolve a conflict over resource access
   */
  async _resolveResourceConflict(taskId, agentIds, conflictDetails) {
    // Simple strategy: prioritize by agent type
    const agentPriorities = {
      [AGENT_TYPES.ARCHITECT]: 5,
      [AGENT_TYPES.REVIEWER]: 4,
      [AGENT_TYPES.CODER]: 3,
      [AGENT_TYPES.TESTER]: 2,
      [AGENT_TYPES.DOCUMENTER]: 1
    };
    
    // Get agent objects
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean);
    
    // Sort by priority
    agents.sort((a, b) => agentPriorities[b.type] - agentPriorities[a.type]);
    
    // Highest priority agent gets access
    const priorityAgent = agents[0];
    const otherAgents = agents.slice(1);
    
    // Notify priority agent of access grant
    await this.communicationHub.sendAgentMessage(priorityAgent.id, {
      type: 'conflict:resolved',
      data: {
        taskId,
        resolution: 'access_granted',
        conflictDetails
      }
    });
    
    // Notify other agents of access delay
    for (const agent of otherAgents) {
      await this.communicationHub.sendAgentMessage(agent.id, {
        type: 'conflict:resolved',
        data: {
          taskId,
          resolution: 'access_delayed',
          conflictDetails,
          priorityAgentId: priorityAgent.id
        }
      });
    }
    
    this.logger.info(`Resource conflict resolved: ${priorityAgent.id} granted priority access`);
  }
  
  /**
   * Resolve a conflict over code changes
   */
  async _resolveCodeConflict(taskId, agentIds, conflictDetails) {
    // For MVP, we'll use a simple reviewer-based resolution
    
    // Find if a reviewer agent is involved
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean);
    const reviewerAgent = agents.find(agent => agent.type === AGENT_TYPES.REVIEWER);
    
    if (reviewerAgent) {
      // If a reviewer is involved, they decide
      for (const agent of agents) {
        await this.communicationHub.sendAgentMessage(agent.id, {
          type: 'conflict:resolved',
          data: {
            taskId,
            resolution: 'reviewer_decision',
            conflictDetails,
            decidingAgentId: reviewerAgent.id
          }
        });
      }
      
      this.logger.info(`Code conflict escalated to reviewer: ${reviewerAgent.id}`);
    } else {
      // Otherwise, find an available reviewer to decide
      const availableReviewers = Array.from(this.agents.values())
        .filter(agent => agent.type === AGENT_TYPES.REVIEWER && agent.status === 'idle');
      
      if (availableReviewers.length > 0) {
        const reviewer = availableReviewers[0];
        
        // Mark reviewer as busy
        reviewer.status = 'resolving_conflict';
        reviewer.metadata.lastActive = new Date().toISOString();
        
        // Notify reviewer of conflict to resolve
        await this.communicationHub.sendAgentMessage(reviewer.id, {
          type: 'conflict:resolution_requested',
          data: {
            taskId,
            conflictType: 'code_conflict',
            conflictDetails,
            agentIds
          }
        });
        
        // Notify conflicting agents that a reviewer is deciding
        for (const agent of agents) {
          await this.communicationHub.sendAgentMessage(agent.id, {
            type: 'conflict:under_review',
            data: {
              taskId,
              conflictDetails,
              reviewerAgentId: reviewer.id
            }
          });
        }
        
        this.logger.info(`Code conflict being resolved by external reviewer: ${reviewer.id}`);
      } else {
        // No reviewers available, use architect or fallback to simple voting
        const architect = Array.from(this.agents.values())
          .find(agent => agent.type === AGENT_TYPES.ARCHITECT && agent.status === 'idle');
        
        if (architect) {
          // Mark architect as busy
          architect.status = 'resolving_conflict';
          architect.metadata.lastActive = new Date().toISOString();
          
          // Notify architect of conflict to resolve
          await this.communicationHub.sendAgentMessage(architect.id, {
            type: 'conflict:resolution_requested',
            data: {
              taskId,
              conflictType: 'code_conflict',
              conflictDetails,
              agentIds
            }
          });
          
          // Notify conflicting agents that architect is deciding
          for (const agent of agents) {
            await this.communicationHub.sendAgentMessage(agent.id, {
              type: 'conflict:under_review',
              data: {
                taskId,
                conflictDetails,
                reviewerAgentId: architect.id
              }
            });
          }
          
          this.logger.info(`Code conflict being resolved by architect: ${architect.id}`);
        } else {
          // No suitable agents available, implement a simple voting mechanism
          this.logger.info('No suitable agents available for conflict resolution, using voting mechanism');
          
          // For MVP, just select one agent's solution
          const selectedAgent = agents[0];
          
          for (const agent of agents) {
            await this.communicationHub.sendAgentMessage(agent.id, {
              type: 'conflict:resolved',
              data: {
                taskId,
                resolution: 'automated_selection',
                conflictDetails,
                selectedAgentId: selectedAgent.id
              }
            });
          }
        }
      }
    }
  }
  
  /**
   * Resolve a conflict over task priorities
   */
  async _resolveTaskPriorityConflict(taskId, agentIds, conflictDetails) {
    // In a real system, this would consider task dependencies, deadlines, etc.
    // For MVP, we'll use a simple rule-based resolution
    
    // Notify all agents of the chosen priority order
    for (const agentId of agentIds) {
      await this.communicationHub.sendAgentMessage(agentId, {
        type: 'conflict:resolved',
        data: {
          taskId,
          resolution: 'priority_assigned',
          conflictDetails,
          priorityOrder: conflictDetails.proposedOrder
        }
      });
    }
    
    this.logger.info(`Task priority conflict resolved for task ${taskId}`);
  }
  
  /**
   * Handle task completion
   */
  async handleTaskCompletion(taskData) {
    const { taskId, result } = taskData;
    this.logger.info(`Task ${taskId} completed`);
    
    // Update task status
    const task = this.tasks.get(taskId);
    if (!task) {
      this.logger.error(`Task ${taskId} not found for completion`);
      return;
    }
    
    // Update task record
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.result = result;
    this.tasks.set(taskId, task);
    
    // Update counters
    this.status.pendingTasks--;
    this.status.completedTasks++;
    
    // Notify listeners
    this.emit('task:completed', {
      taskId,
      result,
      timeTaken: new Date().getTime() - new Date(task.createdAt).getTime()
    });
    
    // Reset assigned agents to idle
    for (const agentId of task.assignedAgents) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.status = 'idle';
        this.agents.set(agentId, agent);
      }
      
      // Remove agent-task assignment
      this.agentTaskAssignments.delete(agentId);
    }
  }
  
  /**
   * Get information about a specific task
   */
  getTaskInfo(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    return {
      ...task,
      assignedAgents: task.assignedAgents.map(agentId => {
        const agent = this.agents.get(agentId);
        return agent ? { id: agent.id, type: agent.type, status: agent.status } : { id: agentId };
      })
    };
  }
  
  /**
   * Get a list of all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.entries()).map(([id, task]) => ({
      id,
      status: task.status,
      description: task.description,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      agentCount: task.assignedAgents.length
    }));
  }
  
  /**
   * Get information about a specific agent
   */
  getAgentInfo(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;
    
    // Get agent's current assignment
    const assignment = this.agentTaskAssignments.get(agentId);
    
    return {
      ...agent,
      currentAssignment: assignment || null
    };
  }
  
  /**
   * Get a list of all agents
   */
  getAllAgents() {
    return Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      type: agent.type,
      status: agent.status,
      capabilities: agent.capabilities,
      lastActive: agent.metadata.lastActive
    }));
  }
  
  /**
   * Get a status summary of the orchestrator
   */
  getStatus() {
    return {
      ...this.status,
      activeAgentsByType: Array.from(this.agents.values()).reduce((acc, agent) => {
        acc[agent.type] = (acc[agent.type] || 0) + 1;
        return acc;
      }, {}),
      taskStatusCounts: Array.from(this.tasks.values()).reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {})
    };
  }
  
  /**
   * Shutdown the orchestrator
   */
  async shutdown() {
    this.logger.info('Shutting down Agent Orchestrator...');
    
    // Notify all agents to terminate
    for (const [agentId, agent] of this.agents.entries()) {
      try {
        await this.communicationHub.sendAgentMessage(agentId, {
          type: 'system:shutdown',
          data: {
            reason: 'Orchestrator shutting down'
          }
        });
      } catch (error) {
        this.logger.warn(`Failed to notify agent ${agentId} of shutdown:`, error);
      }
    }
    
    // Clear internal state
    this.agents.clear();
    this.tasks.clear();
    this.agentTaskAssignments.clear();
    
    // Update status
    this.status.initialized = false;
    
    this.logger.info('Agent Orchestrator shutdown complete');
    
    return true;
  }
}

module.exports = AgentOrchestrator;