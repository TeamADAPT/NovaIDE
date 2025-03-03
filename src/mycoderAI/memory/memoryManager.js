/**
 * Memory Manager
 * Version: 0.1.0
 * Date: 2025-03-03
 * Author: Forge, DevOps Lead
 * 
 * The Memory Manager provides the shared memory and context system for MyCoderAI.
 * It manages both short-term working memory and long-term persistent storage,
 * enabling agents to share information and maintain context across interactions.
 */

'use strict';

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const redis = require('redis');

// Memory scopes
const MEMORY_SCOPES = {
  GLOBAL: 'global',      // Accessible to all agents and components
  TASK: 'task',          // Specific to a particular task
  AGENT: 'agent',        // Private to a specific agent
  INTERACTION: 'interaction' // Related to specific interactions
};

// Memory types
const MEMORY_TYPES = {
  WORKING: 'working',    // Short-term, in-memory storage
  PERSISTENT: 'persistent', // Long-term, persisted storage
  SHARED: 'shared'       // Shared across multiple components
};

class MemoryManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = options;
    this.logger = options.logger;
    
    this.persistenceType = options.persistenceType || 'sqlite';
    this.persistencePath = options.persistencePath || './data';
    this.redisUrl = options.redisUrl || 'redis://localhost:6379';
    
    // In-memory storage
    this.workingMemory = {
      global: new Map(),
      tasks: new Map(),
      agents: new Map(),
      interactions: new Map()
    };
    
    // Database connections
    this.db = null;      // SQLite connection
    this.redisClient = null; // Redis connection (if enabled)
    
    this.status = {
      initialized: false,
      persistenceReady: false
    };
    
    this.logger.info('Memory Manager created');
  }
  
  /**
   * Initialize the memory manager
   */
  async initialize() {
    this.logger.info('Initializing Memory Manager...');
    
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.persistencePath, { recursive: true });
      
      // Initialize persistence based on configured type
      if (this.persistenceType === 'sqlite' || this.persistenceType === 'both') {
        await this._initializeSqlite();
      }
      
      if (this.persistenceType === 'redis' || this.persistenceType === 'both') {
        await this._initializeRedis();
      }
      
      this.status.initialized = true;
      this.status.persistenceReady = true;
      
      this.logger.info('Memory Manager initialized');
      
      // Emit initialization event
      this.emit('initialized', { 
        persistenceType: this.persistenceType,
        persistencePath: this.persistencePath
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Memory Manager:', error);
      throw error;
    }
  }
  
  /**
   * Initialize SQLite database
   */
  async _initializeSqlite() {
    const dbPath = path.join(this.persistencePath, 'memory.sqlite');
    this.logger.info(`Initializing SQLite database at ${dbPath}`);
    
    try {
      // Open database connection
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      // Create tables if they don't exist
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS global_memory (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS task_memory (
          task_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (task_id, key)
        );
        
        CREATE TABLE IF NOT EXISTS agent_memory (
          agent_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (agent_id, key)
        );
        
        CREATE TABLE IF NOT EXISTS interaction_memory (
          interaction_id TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (interaction_id, key)
        );
        
        CREATE TABLE IF NOT EXISTS task_plans (
          task_id TEXT PRIMARY KEY,
          plan TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS task_results (
          task_id TEXT PRIMARY KEY,
          result TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      
      this.logger.info('SQLite database initialized');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }
  
  /**
   * Initialize Redis connection
   */
  async _initializeRedis() {
    this.logger.info(`Initializing Redis connection to ${this.redisUrl}`);
    
    try {
      // Create Redis client
      this.redisClient = redis.createClient({
        url: this.redisUrl
      });
      
      // Handle Redis events
      this.redisClient.on('error', (error) => {
        this.logger.error('Redis error:', error);
      });
      
      this.redisClient.on('connect', () => {
        this.logger.info('Connected to Redis');
      });
      
      // Connect to Redis
      await this.redisClient.connect();
      
      this.logger.info('Redis connection initialized');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection:', error);
      throw error;
    }
  }
  
  /**
   * Initialize memory context for an agent
   */
  async initializeAgentContext(agentId, agentType) {
    this.logger.info(`Initializing memory context for agent ${agentId} (${agentType})`);
    
    // Create agent memory entry in working memory
    if (!this.workingMemory.agents.has(agentId)) {
      this.workingMemory.agents.set(agentId, new Map());
    }
    
    // Store agent metadata
    await this.storeAgentMemory(agentId, 'metadata', {
      id: agentId,
      type: agentType,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
    
    // Initialize agent-specific memory based on type
    const baseMemory = {
      type: agentType,
      context: {
        tasks: [],
        interactions: [],
        knowledge: {}
      }
    };
    
    // Store base memory
    await this.storeAgentMemory(agentId, 'base', baseMemory);
    
    return true;
  }
  
  /**
   * Store a value in global memory
   */
  async storeGlobalMemory(key, value) {
    this.logger.info(`Storing global memory: ${key}`);
    
    // Store in working memory
    this.workingMemory.global.set(key, value);
    
    // Persist if persistence is enabled
    if (this.status.persistenceReady) {
      const now = new Date().toISOString();
      const serializedValue = JSON.stringify(value);
      
      // Store in SQLite
      if (this.db) {
        try {
          await this.db.run(
            `INSERT INTO global_memory (key, value, created_at, updated_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET
             value = ?, updated_at = ?`,
            [key, serializedValue, now, now, serializedValue, now]
          );
        } catch (error) {
          this.logger.error(`Failed to persist global memory ${key} to SQLite:`, error);
        }
      }
      
      // Store in Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          await this.redisClient.set(`global:${key}`, serializedValue);
        } catch (error) {
          this.logger.error(`Failed to persist global memory ${key} to Redis:`, error);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a value from global memory
   */
  async getGlobalMemory(key) {
    this.logger.info(`Getting global memory: ${key}`);
    
    // Check working memory first
    if (this.workingMemory.global.has(key)) {
      return this.workingMemory.global.get(key);
    }
    
    // If not in working memory but persistence is ready, try to load from persistence
    if (this.status.persistenceReady) {
      // Try SQLite
      if (this.db) {
        try {
          const row = await this.db.get(
            'SELECT value FROM global_memory WHERE key = ?',
            [key]
          );
          
          if (row) {
            const value = JSON.parse(row.value);
            // Cache in working memory
            this.workingMemory.global.set(key, value);
            return value;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve global memory ${key} from SQLite:`, error);
        }
      }
      
      // Try Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          const value = await this.redisClient.get(`global:${key}`);
          if (value) {
            const parsedValue = JSON.parse(value);
            // Cache in working memory
            this.workingMemory.global.set(key, parsedValue);
            return parsedValue;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve global memory ${key} from Redis:`, error);
        }
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Store a value in task memory
   */
  async storeTaskMemory(taskId, key, value) {
    this.logger.info(`Storing task memory: ${taskId}/${key}`);
    
    // Ensure task memory exists
    if (!this.workingMemory.tasks.has(taskId)) {
      this.workingMemory.tasks.set(taskId, new Map());
    }
    
    // Store in working memory
    this.workingMemory.tasks.get(taskId).set(key, value);
    
    // Persist if persistence is enabled
    if (this.status.persistenceReady) {
      const now = new Date().toISOString();
      const serializedValue = JSON.stringify(value);
      
      // Store in SQLite
      if (this.db) {
        try {
          await this.db.run(
            `INSERT INTO task_memory (task_id, key, value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(task_id, key) DO UPDATE SET
             value = ?, updated_at = ?`,
            [taskId, key, serializedValue, now, now, serializedValue, now]
          );
        } catch (error) {
          this.logger.error(`Failed to persist task memory ${taskId}/${key} to SQLite:`, error);
        }
      }
      
      // Store in Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          await this.redisClient.set(`task:${taskId}:${key}`, serializedValue);
        } catch (error) {
          this.logger.error(`Failed to persist task memory ${taskId}/${key} to Redis:`, error);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a value from task memory
   */
  async getTaskMemory(taskId, key) {
    this.logger.info(`Getting task memory: ${taskId}/${key}`);
    
    // Check working memory first
    if (this.workingMemory.tasks.has(taskId) && 
        this.workingMemory.tasks.get(taskId).has(key)) {
      return this.workingMemory.tasks.get(taskId).get(key);
    }
    
    // If not in working memory but persistence is ready, try to load from persistence
    if (this.status.persistenceReady) {
      // Try SQLite
      if (this.db) {
        try {
          const row = await this.db.get(
            'SELECT value FROM task_memory WHERE task_id = ? AND key = ?',
            [taskId, key]
          );
          
          if (row) {
            const value = JSON.parse(row.value);
            
            // Ensure task memory exists
            if (!this.workingMemory.tasks.has(taskId)) {
              this.workingMemory.tasks.set(taskId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.tasks.get(taskId).set(key, value);
            
            return value;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve task memory ${taskId}/${key} from SQLite:`, error);
        }
      }
      
      // Try Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          const value = await this.redisClient.get(`task:${taskId}:${key}`);
          if (value) {
            const parsedValue = JSON.parse(value);
            
            // Ensure task memory exists
            if (!this.workingMemory.tasks.has(taskId)) {
              this.workingMemory.tasks.set(taskId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.tasks.get(taskId).set(key, parsedValue);
            
            return parsedValue;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve task memory ${taskId}/${key} from Redis:`, error);
        }
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Store a value in agent memory
   */
  async storeAgentMemory(agentId, key, value) {
    this.logger.info(`Storing agent memory: ${agentId}/${key}`);
    
    // Ensure agent memory exists
    if (!this.workingMemory.agents.has(agentId)) {
      this.workingMemory.agents.set(agentId, new Map());
    }
    
    // Store in working memory
    this.workingMemory.agents.get(agentId).set(key, value);
    
    // Persist if persistence is enabled
    if (this.status.persistenceReady) {
      const now = new Date().toISOString();
      const serializedValue = JSON.stringify(value);
      
      // Store in SQLite
      if (this.db) {
        try {
          await this.db.run(
            `INSERT INTO agent_memory (agent_id, key, value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(agent_id, key) DO UPDATE SET
             value = ?, updated_at = ?`,
            [agentId, key, serializedValue, now, now, serializedValue, now]
          );
        } catch (error) {
          this.logger.error(`Failed to persist agent memory ${agentId}/${key} to SQLite:`, error);
        }
      }
      
      // Store in Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          await this.redisClient.set(`agent:${agentId}:${key}`, serializedValue);
        } catch (error) {
          this.logger.error(`Failed to persist agent memory ${agentId}/${key} to Redis:`, error);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a value from agent memory
   */
  async getAgentMemory(agentId, key) {
    this.logger.info(`Getting agent memory: ${agentId}/${key}`);
    
    // Check working memory first
    if (this.workingMemory.agents.has(agentId) && 
        this.workingMemory.agents.get(agentId).has(key)) {
      return this.workingMemory.agents.get(agentId).get(key);
    }
    
    // If not in working memory but persistence is ready, try to load from persistence
    if (this.status.persistenceReady) {
      // Try SQLite
      if (this.db) {
        try {
          const row = await this.db.get(
            'SELECT value FROM agent_memory WHERE agent_id = ? AND key = ?',
            [agentId, key]
          );
          
          if (row) {
            const value = JSON.parse(row.value);
            
            // Ensure agent memory exists
            if (!this.workingMemory.agents.has(agentId)) {
              this.workingMemory.agents.set(agentId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.agents.get(agentId).set(key, value);
            
            return value;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve agent memory ${agentId}/${key} from SQLite:`, error);
        }
      }
      
      // Try Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          const value = await this.redisClient.get(`agent:${agentId}:${key}`);
          if (value) {
            const parsedValue = JSON.parse(value);
            
            // Ensure agent memory exists
            if (!this.workingMemory.agents.has(agentId)) {
              this.workingMemory.agents.set(agentId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.agents.get(agentId).set(key, parsedValue);
            
            return parsedValue;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve agent memory ${agentId}/${key} from Redis:`, error);
        }
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Store a value in interaction memory
   */
  async storeInteractionMemory(interactionId, key, value) {
    this.logger.info(`Storing interaction memory: ${interactionId}/${key}`);
    
    // Ensure interaction memory exists
    if (!this.workingMemory.interactions.has(interactionId)) {
      this.workingMemory.interactions.set(interactionId, new Map());
    }
    
    // Store in working memory
    this.workingMemory.interactions.get(interactionId).set(key, value);
    
    // Persist if persistence is enabled
    if (this.status.persistenceReady) {
      const now = new Date().toISOString();
      const serializedValue = JSON.stringify(value);
      
      // Store in SQLite
      if (this.db) {
        try {
          await this.db.run(
            `INSERT INTO interaction_memory (interaction_id, key, value, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(interaction_id, key) DO UPDATE SET
             value = ?, updated_at = ?`,
            [interactionId, key, serializedValue, now, now, serializedValue, now]
          );
        } catch (error) {
          this.logger.error(`Failed to persist interaction memory ${interactionId}/${key} to SQLite:`, error);
        }
      }
      
      // Store in Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          await this.redisClient.set(`interaction:${interactionId}:${key}`, serializedValue);
        } catch (error) {
          this.logger.error(`Failed to persist interaction memory ${interactionId}/${key} to Redis:`, error);
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a value from interaction memory
   */
  async getInteractionMemory(interactionId, key) {
    this.logger.info(`Getting interaction memory: ${interactionId}/${key}`);
    
    // Check working memory first
    if (this.workingMemory.interactions.has(interactionId) && 
        this.workingMemory.interactions.get(interactionId).has(key)) {
      return this.workingMemory.interactions.get(interactionId).get(key);
    }
    
    // If not in working memory but persistence is ready, try to load from persistence
    if (this.status.persistenceReady) {
      // Try SQLite
      if (this.db) {
        try {
          const row = await this.db.get(
            'SELECT value FROM interaction_memory WHERE interaction_id = ? AND key = ?',
            [interactionId, key]
          );
          
          if (row) {
            const value = JSON.parse(row.value);
            
            // Ensure interaction memory exists
            if (!this.workingMemory.interactions.has(interactionId)) {
              this.workingMemory.interactions.set(interactionId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.interactions.get(interactionId).set(key, value);
            
            return value;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve interaction memory ${interactionId}/${key} from SQLite:`, error);
        }
      }
      
      // Try Redis
      if (this.redisClient && this.redisClient.isReady) {
        try {
          const value = await this.redisClient.get(`interaction:${interactionId}:${key}`);
          if (value) {
            const parsedValue = JSON.parse(value);
            
            // Ensure interaction memory exists
            if (!this.workingMemory.interactions.has(interactionId)) {
              this.workingMemory.interactions.set(interactionId, new Map());
            }
            
            // Cache in working memory
            this.workingMemory.interactions.get(interactionId).set(key, parsedValue);
            
            return parsedValue;
          }
        } catch (error) {
          this.logger.error(`Failed to retrieve interaction memory ${interactionId}/${key} from Redis:`, error);
        }
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Store a task plan
   */
  async storeTaskPlan(taskId, plan) {
    this.logger.info(`Storing plan for task ${taskId}`);
    
    // Store in task memory
    await this.storeTaskMemory(taskId, 'plan', plan);
    
    // Persist in task_plans table specifically if SQLite is available
    if (this.status.persistenceReady && this.db) {
      const now = new Date().toISOString();
      const serializedPlan = JSON.stringify(plan);
      
      try {
        await this.db.run(
          `INSERT INTO task_plans (task_id, plan, created_at, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(task_id) DO UPDATE SET
           plan = ?, updated_at = ?`,
          [taskId, serializedPlan, now, now, serializedPlan, now]
        );
      } catch (error) {
        this.logger.error(`Failed to persist plan for task ${taskId} to SQLite:`, error);
      }
    }
    
    return true;
  }
  
  /**
   * Get a task plan
   */
  async getTaskPlan(taskId) {
    this.logger.info(`Getting plan for task ${taskId}`);
    
    // Try to get from task memory first
    const plan = await this.getTaskMemory(taskId, 'plan');
    if (plan) {
      return plan;
    }
    
    // If not in task memory but SQLite is available, try task_plans table
    if (this.status.persistenceReady && this.db) {
      try {
        const row = await this.db.get(
          'SELECT plan FROM task_plans WHERE task_id = ?',
          [taskId]
        );
        
        if (row) {
          const parsedPlan = JSON.parse(row.plan);
          
          // Cache in task memory
          await this.storeTaskMemory(taskId, 'plan', parsedPlan);
          
          return parsedPlan;
        }
      } catch (error) {
        this.logger.error(`Failed to retrieve plan for task ${taskId} from SQLite:`, error);
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Store a task result
   */
  async storeTaskResult(taskId, result) {
    this.logger.info(`Storing result for task ${taskId}`);
    
    // Store in task memory
    await this.storeTaskMemory(taskId, 'result', result);
    
    // Persist in task_results table specifically if SQLite is available
    if (this.status.persistenceReady && this.db) {
      const now = new Date().toISOString();
      const serializedResult = JSON.stringify(result);
      
      try {
        await this.db.run(
          `INSERT INTO task_results (task_id, result, created_at)
           VALUES (?, ?, ?)
           ON CONFLICT(task_id) DO UPDATE SET
           result = ?, created_at = ?`,
          [taskId, serializedResult, now, serializedResult, now]
        );
      } catch (error) {
        this.logger.error(`Failed to persist result for task ${taskId} to SQLite:`, error);
      }
    }
    
    return true;
  }
  
  /**
   * Get a task result
   */
  async getTaskResult(taskId) {
    this.logger.info(`Getting result for task ${taskId}`);
    
    // Try to get from task memory first
    const result = await this.getTaskMemory(taskId, 'result');
    if (result) {
      return result;
    }
    
    // If not in task memory but SQLite is available, try task_results table
    if (this.status.persistenceReady && this.db) {
      try {
        const row = await this.db.get(
          'SELECT result FROM task_results WHERE task_id = ?',
          [taskId]
        );
        
        if (row) {
          const parsedResult = JSON.parse(row.result);
          
          // Cache in task memory
          await this.storeTaskMemory(taskId, 'result', parsedResult);
          
          return parsedResult;
        }
      } catch (error) {
        this.logger.error(`Failed to retrieve result for task ${taskId} from SQLite:`, error);
      }
    }
    
    // Not found
    return null;
  }
  
  /**
   * Get all tasks with their plans and results
   */
  async getAllTasks() {
    this.logger.info('Getting all tasks');
    
    if (!this.status.persistenceReady || !this.db) {
      this.logger.warn('Cannot get all tasks: Persistence not ready or SQLite not available');
      return [];
    }
    
    try {
      // Join task_plans and task_results to get complete task info
      const rows = await this.db.all(`
        SELECT p.task_id, p.plan, p.created_at as plan_created_at, 
               r.result, r.created_at as result_created_at
        FROM task_plans p
        LEFT JOIN task_results r ON p.task_id = r.task_id
        ORDER BY p.created_at DESC
      `);
      
      // Parse JSON strings and format results
      return rows.map(row => ({
        taskId: row.task_id,
        plan: JSON.parse(row.plan),
        planCreatedAt: row.plan_created_at,
        result: row.result ? JSON.parse(row.result) : null,
        resultCreatedAt: row.result_created_at || null,
        completed: !!row.result
      }));
    } catch (error) {
      this.logger.error('Failed to retrieve all tasks from SQLite:', error);
      return [];
    }
  }
  
  /**
   * Clear working memory for a specific scope
   */
  clearWorkingMemory(scope, id = null) {
    this.logger.info(`Clearing working memory for scope: ${scope}${id ? `, ID: ${id}` : ''}`);
    
    switch (scope) {
      case MEMORY_SCOPES.GLOBAL:
        this.workingMemory.global.clear();
        break;
        
      case MEMORY_SCOPES.TASK:
        if (id) {
          this.workingMemory.tasks.delete(id);
        } else {
          this.workingMemory.tasks.clear();
        }
        break;
        
      case MEMORY_SCOPES.AGENT:
        if (id) {
          this.workingMemory.agents.delete(id);
        } else {
          this.workingMemory.agents.clear();
        }
        break;
        
      case MEMORY_SCOPES.INTERACTION:
        if (id) {
          this.workingMemory.interactions.delete(id);
        } else {
          this.workingMemory.interactions.clear();
        }
        break;
        
      default:
        // Clear all working memory
        this.workingMemory.global.clear();
        this.workingMemory.tasks.clear();
        this.workingMemory.agents.clear();
        this.workingMemory.interactions.clear();
        break;
    }
    
    return true;
  }
  
  /**
   * Export memory to a file
   */
  async exportMemory(filePath) {
    this.logger.info(`Exporting memory to ${filePath}`);
    
    try {
      // Collect all memory data
      const memoryData = {
        global: Object.fromEntries(this.workingMemory.global),
        tasks: Array.from(this.workingMemory.tasks.entries()).map(([taskId, taskMemory]) => ({
          taskId,
          memory: Object.fromEntries(taskMemory)
        })),
        agents: Array.from(this.workingMemory.agents.entries()).map(([agentId, agentMemory]) => ({
          agentId,
          memory: Object.fromEntries(agentMemory)
        })),
        interactions: Array.from(this.workingMemory.interactions.entries()).map(([interactionId, interactionMemory]) => ({
          interactionId,
          memory: Object.fromEntries(interactionMemory)
        })),
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '0.1.0'
        }
      };
      
      // Write to file
      await fs.writeFile(filePath, JSON.stringify(memoryData, null, 2));
      
      this.logger.info(`Memory exported to ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to export memory to ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Import memory from a file
   */
  async importMemory(filePath) {
    this.logger.info(`Importing memory from ${filePath}`);
    
    try {
      // Read file
      const fileContent = await fs.readFile(filePath, 'utf8');
      const memoryData = JSON.parse(fileContent);
      
      // Validate memory data format
      if (!memoryData.metadata || !memoryData.metadata.version) {
        throw new Error('Invalid memory data format: Missing metadata');
      }
      
      // Import global memory
      if (memoryData.global) {
        for (const [key, value] of Object.entries(memoryData.global)) {
          await this.storeGlobalMemory(key, value);
        }
      }
      
      // Import task memory
      if (memoryData.tasks && Array.isArray(memoryData.tasks)) {
        for (const task of memoryData.tasks) {
          if (task.taskId && task.memory) {
            for (const [key, value] of Object.entries(task.memory)) {
              await this.storeTaskMemory(task.taskId, key, value);
            }
          }
        }
      }
      
      // Import agent memory
      if (memoryData.agents && Array.isArray(memoryData.agents)) {
        for (const agent of memoryData.agents) {
          if (agent.agentId && agent.memory) {
            for (const [key, value] of Object.entries(agent.memory)) {
              await this.storeAgentMemory(agent.agentId, key, value);
            }
          }
        }
      }
      
      // Import interaction memory
      if (memoryData.interactions && Array.isArray(memoryData.interactions)) {
        for (const interaction of memoryData.interactions) {
          if (interaction.interactionId && interaction.memory) {
            for (const [key, value] of Object.entries(interaction.memory)) {
              await this.storeInteractionMemory(interaction.interactionId, key, value);
            }
          }
        }
      }
      
      this.logger.info(`Memory imported from ${filePath}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to import memory from ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Shutdown the memory manager
   */
  async shutdown() {
    this.logger.info('Shutting down Memory Manager...');
    
    // Close database connections
    if (this.db) {
      try {
        await this.db.close();
        this.logger.info('SQLite database connection closed');
      } catch (error) {
        this.logger.error('Error closing SQLite database connection:', error);
      }
    }
    
    if (this.redisClient && this.redisClient.isReady) {
      try {
        await this.redisClient.quit();
        this.logger.info('Redis connection closed');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error);
      }
    }
    
    // Clear working memory
    this.clearWorkingMemory();
    
    // Update status
    this.status.initialized = false;
    this.status.persistenceReady = false;
    
    this.logger.info('Memory Manager shutdown complete');
    
    return true;
  }
}

module.exports = MemoryManager;