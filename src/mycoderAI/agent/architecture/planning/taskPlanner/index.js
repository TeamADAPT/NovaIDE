/**
 * TaskPlanner Module
 * 
 * Responsible for breaking down tasks based on system design,
 * defining development phases, creating implementation tasks,
 * establishing task dependencies, and estimating effort and critical path.
 */

/**
 * TaskPlanner class for breaking down tasks based on system design
 */
class TaskPlanner {
  /**
   * Create a new TaskPlanner instance
   * @param {Object} config - Configuration options
   * @param {Object} services - Service dependencies
   */
  constructor(config = {}, services = {}) {
    this.config = config;
    this.services = services;
    this.memoryManager = services.memoryManager;
    
    // Default phase definitions
    this.defaultPhases = [
      {
        id: 'phase-1',
        name: 'Foundation',
        description: 'Set up project structure and core components',
        order: 1
      },
      {
        id: 'phase-2',
        name: 'Component Implementation',
        description: 'Implement individual components',
        order: 2
      },
      {
        id: 'phase-3',
        name: 'Integration',
        description: 'Integrate components and implement interfaces',
        order: 3
      },
      {
        id: 'phase-4',
        name: 'Testing',
        description: 'Test components and integrated system',
        order: 4
      },
      {
        id: 'phase-5',
        name: 'Documentation',
        description: 'Create documentation and finalize project',
        order: 5
      }
    ];
    
    // Default effort estimates
    this.defaultEffort = {
      setup: 1,
      implementation: 2,
      integration: 2,
      testing: 1,
      documentation: 2
    };
    
    console.log('TaskPlanner initialized');
  }
  
  /**
   * Break down tasks based on system design and component structure
   * @param {Object} design - System design
   * @param {Object} componentStructure - Component structure
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Task breakdown
   */
  async breakdownTasks(design, componentStructure, options = {}) {
    console.log('Breaking down tasks based on system design');
    
    if (!design) {
      throw new Error('No system design provided for task breakdown');
    }
    
    const taskBreakdown = {
      phases: options.phases || this.defaultPhases,
      tasks: [],
      dependencies: [],
      estimatedEffort: {},
      criticalPath: [],
      timestamp: new Date()
    };
    
    // Create foundation tasks
    const foundationTasks = await this.createFoundationTasks(design, componentStructure);
    taskBreakdown.tasks.push(...foundationTasks);
    
    // Create component implementation tasks
    const implementationTasks = await this.createImplementationTasks(design.components);
    taskBreakdown.tasks.push(...implementationTasks);
    
    // Create interface implementation tasks
    const interfaceTasks = await this.createInterfaceTasks(design.interfaces, design.components);
    taskBreakdown.tasks.push(...interfaceTasks);
    
    // Create integration task
    const integrationTasks = await this.createIntegrationTasks(design);
    taskBreakdown.tasks.push(...integrationTasks);
    
    // Create documentation tasks
    const documentationTasks = await this.createDocumentationTasks(design);
    taskBreakdown.tasks.push(...documentationTasks);
    
    // Establish dependencies
    taskBreakdown.dependencies = await this.establishDependencies(
      taskBreakdown.tasks, 
      design.components, 
      design.interfaces
    );
    
    // Estimate effort
    taskBreakdown.estimatedEffort = await this.estimateEffort(taskBreakdown.tasks, taskBreakdown.phases);
    
    // Determine critical path
    taskBreakdown.criticalPath = await this.determineCriticalPath(
      taskBreakdown.tasks, 
      taskBreakdown.dependencies
    );
    
    // Store in memory
    if (this.memoryManager) {
      await this.memoryManager.store('taskBreakdown', taskBreakdown);
    }
    
    return taskBreakdown;
  }
  
  /**
   * Create foundation tasks
   * @param {Object} design - System design
   * @param {Object} componentStructure - Component structure
   * @returns {Promise<Array>} - List of foundation tasks
   */
  async createFoundationTasks(design, componentStructure) {
    console.log('Creating foundation tasks');
    
    const tasks = [
      {
        id: 'task-setup-project',
        name: 'Set up project structure',
        description: 'Create directory structure and initial configuration files',
        phase: 'phase-1',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.setup,
        priority: 'high'
      },
      {
        id: 'task-setup-build',
        name: 'Set up build system',
        description: 'Configure build system and dependencies',
        phase: 'phase-1',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.setup,
        priority: 'high'
      }
    ];
    
    return tasks;
  }
  
  /**
   * Create component implementation tasks
   * @param {Array} components - List of components
   * @returns {Promise<Array>} - List of implementation tasks
   */
  async createImplementationTasks(components) {
    console.log('Creating component implementation tasks');
    
    const tasks = [];
    
    for (const component of components) {
      const componentId = component.name.toLowerCase().replace(/\s+/g, '-');
      
      tasks.push({
        id: `task-implement-${componentId}`,
        name: `Implement ${component.name}`,
        description: `Create implementation for ${component.name} component`,
        phase: 'phase-2',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.implementation,
        priority: 'medium',
        component: component.name
      });
      
      tasks.push({
        id: `task-test-${componentId}`,
        name: `Test ${component.name}`,
        description: `Create tests for ${component.name} component`,
        phase: 'phase-4',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.testing,
        priority: 'medium',
        component: component.name
      });
    }
    
    return tasks;
  }
  
  /**
   * Create interface implementation tasks
   * @param {Array} interfaces - List of interfaces
   * @param {Array} components - List of components
   * @returns {Promise<Array>} - List of interface tasks
   */
  async createInterfaceTasks(interfaces, components) {
    console.log('Creating interface implementation tasks');
    
    const tasks = [];
    
    for (const iface of interfaces) {
      const interfaceId = iface.name.toLowerCase().replace(/\s+/g, '-');
      
      tasks.push({
        id: `task-implement-interface-${interfaceId}`,
        name: `Implement ${iface.name} interface`,
        description: `Create implementation for ${iface.name} interface`,
        phase: 'phase-3',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.implementation,
        priority: 'medium',
        interface: iface.name
      });
    }
    
    return tasks;
  }
  
  /**
   * Create integration tasks
   * @param {Object} design - System design
   * @returns {Promise<Array>} - List of integration tasks
   */
  async createIntegrationTasks(design) {
    console.log('Creating integration tasks');
    
    const tasks = [
      {
        id: 'task-integrate-components',
        name: 'Integrate components',
        description: 'Integrate all components into a working system',
        phase: 'phase-3',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.integration,
        priority: 'high'
      },
      {
        id: 'task-integration-testing',
        name: 'Integration testing',
        description: 'Test the integrated system',
        phase: 'phase-4',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.testing,
        priority: 'high'
      }
    ];
    
    return tasks;
  }
  
  /**
   * Create documentation tasks
   * @param {Object} design - System design
   * @returns {Promise<Array>} - List of documentation tasks
   */
  async createDocumentationTasks(design) {
    console.log('Creating documentation tasks');
    
    const tasks = [
      {
        id: 'task-create-docs',
        name: 'Create documentation',
        description: 'Create system documentation',
        phase: 'phase-5',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.documentation,
        priority: 'medium'
      },
      {
        id: 'task-create-examples',
        name: 'Create examples',
        description: 'Create example usage scenarios',
        phase: 'phase-5',
        assignedTo: null,
        status: 'pending',
        effort: this.defaultEffort.documentation,
        priority: 'medium'
      }
    ];
    
    return tasks;
  }
  
  /**
   * Establish dependencies between tasks
   * @param {Array} tasks - List of tasks
   * @param {Array} components - List of components
   * @param {Array} interfaces - List of interfaces
   * @returns {Promise<Array>} - List of dependencies
   */
  async establishDependencies(tasks, components, interfaces) {
    console.log('Establishing dependencies between tasks');
    
    const dependencies = [];
    
    // Add dependency between setup and implementation
    const setupTask = tasks.find(t => t.id === 'task-setup-project');
    const buildTask = tasks.find(t => t.id === 'task-setup-build');
    
    if (setupTask && buildTask) {
      dependencies.push({
        source: setupTask.id,
        target: buildTask.id,
        type: 'finish-to-start'
      });
    }
    
    // Add dependencies between implementation and testing
    for (const component of components) {
      const componentId = component.name.toLowerCase().replace(/\s+/g, '-');
      const implementTask = tasks.find(t => t.id === `task-implement-${componentId}`);
      const testTask = tasks.find(t => t.id === `task-test-${componentId}`);
      
      if (implementTask && testTask) {
        dependencies.push({
          source: implementTask.id,
          target: testTask.id,
          type: 'finish-to-start'
        });
      }
      
      // Add dependency between setup and implementation
      if (setupTask && implementTask) {
        dependencies.push({
          source: setupTask.id,
          target: implementTask.id,
          type: 'finish-to-start'
        });
      }
      
      if (buildTask && implementTask) {
        dependencies.push({
          source: buildTask.id,
          target: implementTask.id,
          type: 'finish-to-start'
        });
      }
    }
    
    // Add dependencies for interface implementation
    for (const iface of interfaces) {
      const interfaceId = iface.name.toLowerCase().replace(/\s+/g, '-');
      const interfaceTask = tasks.find(t => t.id === `task-implement-interface-${interfaceId}`);
      
      if (interfaceTask) {
        // Find components that use this interface
        for (const component of components) {
          if (component.interfaces && component.interfaces.includes(iface.name)) {
            const componentId = component.name.toLowerCase().replace(/\s+/g, '-');
            const implementTask = tasks.find(t => t.id === `task-implement-${componentId}`);
            
            if (implementTask) {
              dependencies.push({
                source: implementTask.id,
                target: interfaceTask.id,
                type: 'finish-to-start'
              });
            }
          }
        }
      }
    }
    
    // Add dependencies for integration
    const integrateTask = tasks.find(t => t.id === 'task-integrate-components');
    const integrationTestingTask = tasks.find(t => t.id === 'task-integration-testing');
    
    if (integrateTask) {
      // Component implementation must finish before integration
      for (const component of components) {
        const componentId = component.name.toLowerCase().replace(/\s+/g, '-');
        const implementTask = tasks.find(t => t.id === `task-implement-${componentId}`);
        
        if (implementTask) {
          dependencies.push({
            source: implementTask.id,
            target: integrateTask.id,
            type: 'finish-to-start'
          });
        }
      }
      
      // Interface implementation must finish before integration
      for (const iface of interfaces) {
        const interfaceId = iface.name.toLowerCase().replace(/\s+/g, '-');
        const interfaceTask = tasks.find(t => t.id === `task-implement-interface-${interfaceId}`);
        
        if (interfaceTask) {
          dependencies.push({
            source: interfaceTask.id,
            target: integrateTask.id,
            type: 'finish-to-start'
          });
        }
      }
    }
    
    // Integration must finish before integration testing
    if (integrateTask && integrationTestingTask) {
      dependencies.push({
        source: integrateTask.id,
        target: integrationTestingTask.id,
        type: 'finish-to-start'
      });
    }
    
    // Add dependencies for documentation
    const docsTask = tasks.find(t => t.id === 'task-create-docs');
    const examplesTask = tasks.find(t => t.id === 'task-create-examples');
    
    if (docsTask && integrationTestingTask) {
      dependencies.push({
        source: integrationTestingTask.id,
        target: docsTask.id,
        type: 'finish-to-start'
      });
    }
    
    if (examplesTask && integrationTestingTask) {
      dependencies.push({
        source: integrationTestingTask.id,
        target: examplesTask.id,
        type: 'finish-to-start'
      });
    }
    
    return dependencies;
  }
  
  /**
   * Estimate effort for tasks
   * @param {Array} tasks - List of tasks
   * @param {Array} phases - List of phases
   * @returns {Promise<Object>} - Effort estimates
   */
  async estimateEffort(tasks, phases) {
    console.log('Estimating effort for tasks');
    
    let totalEffort = 0;
    const byPhase = {};
    
    // Initialize phase effort
    for (const phase of phases) {
      byPhase[phase.id] = 0;
    }
    
    // Calculate effort by phase
    for (const task of tasks) {
      totalEffort += task.effort;
      byPhase[task.phase] += task.effort;
    }
    
    return {
      total: totalEffort,
      byPhase
    };
  }
  
  /**
   * Determine critical path
   * @param {Array} tasks - List of tasks
   * @param {Array} dependencies - List of dependencies
   * @returns {Promise<Array>} - Critical path
   */
  async determineCriticalPath(tasks, dependencies) {
    console.log('Determining critical path');
    
    // This would be where a proper critical path algorithm would be implemented
    // For MVP, we'll use a simplified approach
    
    // Find start tasks (no incoming dependencies)
    const startTasks = tasks.filter(task => 
      !dependencies.some(dep => dep.target === task.id)
    );
    
    // Find end tasks (no outgoing dependencies)
    const endTasks = tasks.filter(task => 
      !dependencies.some(dep => dep.source === task.id)
    );
    
    // For simplicity, we'll just pick the longest path from a start task to an end task
    let longestPath = [];
    let maxLength = 0;
    
    for (const startTask of startTasks) {
      for (const endTask of endTasks) {
        const path = this._findLongestPath(startTask, endTask, tasks, dependencies);
        
        if (path.length > maxLength) {
          maxLength = path.length;
          longestPath = path;
        }
      }
    }
    
    return longestPath;
  }
  
  /**
   * Find longest path between two tasks
   * @param {Object} startTask - Start task
   * @param {Object} endTask - End task
   * @param {Array} tasks - List of tasks
   * @param {Array} dependencies - List of dependencies
   * @returns {Array} - Path
   * @private
   */
  _findLongestPath(startTask, endTask, tasks, dependencies) {
    // Simple DFS to find a path
    const visited = new Set();
    const path = [];
    
    const dfs = (currentTask) => {
      if (currentTask.id === endTask.id) {
        return true;
      }
      
      if (visited.has(currentTask.id)) {
        return false;
      }
      
      visited.add(currentTask.id);
      path.push(currentTask.id);
      
      // Find all tasks that depend on the current task
      const outgoingDeps = dependencies.filter(dep => dep.source === currentTask.id);
      
      for (const dep of outgoingDeps) {
        const nextTask = tasks.find(t => t.id === dep.target);
        
        if (nextTask && dfs(nextTask)) {
          return true;
        }
      }
      
      path.pop();
      return false;
    };
    
    dfs(startTask);
    return path;
  }
  
  /**
   * Get tasks by phase
   * @param {Array} tasks - List of tasks
   * @param {string} phaseId - Phase ID
   * @returns {Array} - Filtered tasks
   */
  getTasksByPhase(tasks, phaseId) {
    return tasks.filter(task => task.phase === phaseId);
  }
  
  /**
   * Get tasks by component
   * @param {Array} tasks - List of tasks
   * @param {string} componentName - Component name
   * @returns {Array} - Filtered tasks
   */
  getTasksByComponent(tasks, componentName) {
    return tasks.filter(task => task.component === componentName);
  }
  
  /**
   * Get tasks by priority
   * @param {Array} tasks - List of tasks
   * @param {string} priority - Priority level
   * @returns {Array} - Filtered tasks
   */
  getTasksByPriority(tasks, priority) {
    return tasks.filter(task => task.priority === priority);
  }
}

module.exports = TaskPlanner;