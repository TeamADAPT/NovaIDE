/**
 * architectAgent.js
 * Specialized Architect Agent for MyCoderAI
 * 
 * This agent is responsible for high-level system design, architecture planning,
 * and coordinating the overall development strategy.
 */

const Agent = require('./agent');

// Import architecture modules
const SystemDesigner = require('./architecture/design/systemDesigner');
const ComponentStructurer = require('./architecture/design/componentStructurer');
const RequirementsAnalyzer = require('./architecture/analysis/requirementsAnalyzer');
const ArchitectureReviewer = require('./architecture/analysis/architectureReviewer');
const TaskPlanner = require('./architecture/planning/taskPlanner');
const ArchitectureDocumenter = require('./architecture/documentation/architectureDocumenter');

/**
 * Architect Agent specializing in system design and architecture planning
 */
class ArchitectAgent extends Agent {
  /**
   * Create a new Architect Agent
   * @param {Object} config - Agent configuration
   * @param {Object} services - Service dependencies
   */
  constructor(config, services) {
    // Set default capabilities for architect agent
    const architectCapabilities = {
      'system.design': 0.95,
      'architecture.planning': 0.95,
      'requirements.analysis': 0.90,
      'task.breakdown': 0.85,
      'dependency.management': 0.80,
      'technical.documentation': 0.85,
      'code.review': 0.70,
      'performance.optimization': 0.65
    };
    
    // Merge with any provided capabilities
    const mergedConfig = {
      ...config,
      type: 'architect',
      capabilities: {
        ...architectCapabilities,
        ...(config.capabilities || {})
      }
    };
    
    super(mergedConfig, services);
    
    // Architect-specific state
    this.currentDesign = null;
    this.designHistory = [];
    this.projectRequirements = [];
    this.systemComponents = [];
    
    // Initialize architecture modules
    this.modules = {
      systemDesigner: new SystemDesigner(config.systemDesigner || {}, services),
      componentStructurer: new ComponentStructurer(config.componentStructurer || {}, services),
      requirementsAnalyzer: new RequirementsAnalyzer(config.requirementsAnalyzer || {}, services),
      architectureReviewer: new ArchitectureReviewer(config.architectureReviewer || {}, services),
      taskPlanner: new TaskPlanner(config.taskPlanner || {}, services),
      architectureDocumenter: new ArchitectureDocumenter(config.architectureDocumenter || {}, services)
    };
    
    console.log(`Architect Agent ${this.name} initialized with specialized capabilities and modular architecture`);
  }
  
  /**
   * Handle specialized messages specific to the Architect role
   * @param {Object} message - The message to handle
   * @override
   */
  handleSpecializedMessage(message) {
    switch (message.type) {
      case 'design.create':
        this._handleDesignCreation(message.data);
        break;
      case 'design.review':
        this._handleDesignReview(message.data);
        break;
      case 'requirements.add':
        this._handleRequirementsAddition(message.data);
        break;
      case 'system.component.add':
        this._handleComponentAddition(message.data);
        break;
      case 'task.breakdown.request':
        this._handleTaskBreakdownRequest(message.data);
        break;
      default:
        console.log(`Architect Agent ${this.name} received unhandled message: ${message.type}`);
    }
  }
  
  /**
   * Process a task - implementation for Architect Agent
   * @param {Object} taskData - Data for the task to process
   * @returns {Promise<Object>} - Promise resolving to the task result
   * @private
   * @override
   */
  async _processTask(taskData) {
    console.log(`Architect Agent ${this.name} processing task: ${taskData.type}`);
    
    switch (taskData.type) {
      case 'design.system':
        return await this._designSystem(taskData);
      case 'analyze.requirements':
        return await this._analyzeRequirements(taskData);
      case 'create.component.structure':
        return await this._createComponentStructure(taskData);
      case 'breakdown.tasks':
        return await this._breakdownTasks(taskData);
      case 'review.architecture':
        return await this._reviewArchitecture(taskData);
      case 'document.architecture':
        return await this._documentArchitecture(taskData);
      default:
        throw new Error(`Unsupported task type for Architect Agent: ${taskData.type}`);
    }
  }
  
  /**
   * Design a system based on requirements
   * @param {Object} taskData - Task data containing requirements
   * @returns {Promise<Object>} - The system design
   * @private
   */
  async _designSystem(taskData) {
    console.log(`Architect Agent ${this.name} designing system using SystemDesigner module`);
    
    // Store requirements
    this.projectRequirements = taskData.requirements || [];
    
    // Use the SystemDesigner module to create the system design
    const systemDesign = await this.modules.systemDesigner.designSystem(
      this.projectRequirements,
      {
        name: taskData.name || 'Unnamed System',
        description: taskData.description || '',
        constraints: taskData.constraints || [],
        assumptions: taskData.assumptions || []
      }
    );
    
    // Store the design
    this.currentDesign = systemDesign;
    this.designHistory.push(systemDesign);
    this.systemComponents = systemDesign.components;
    
    // Store in memory for other agents to access
    await this.storeMemory('currentDesign', systemDesign);
    await this.storeMemory('systemComponents', systemDesign.components);
    
    return systemDesign;
  }
  
  /**
   * Analyze requirements for a system
   * @param {Object} taskData - Task data containing requirements to analyze
   * @returns {Promise<Object>} - Analysis results
   * @private
   */
  async _analyzeRequirements(taskData) {
    console.log(`Architect Agent ${this.name} analyzing requirements using RequirementsAnalyzer module`);
    
    const requirements = taskData.requirements || [];
    
    // Use the RequirementsAnalyzer module to analyze the requirements
    const analysis = await this.modules.requirementsAnalyzer.analyzeRequirements(
      requirements,
      taskData.options || {}
    );
    
    // Store the analysis in memory
    await this.storeMemory('requirementsAnalysis', analysis);
    
    return analysis;
  }
  
  /**
   * Create component structure based on system design
   * @param {Object} taskData - Task data containing design information
   * @returns {Promise<Object>} - Component structure
   * @private
   */
  async _createComponentStructure(taskData) {
    console.log(`Architect Agent ${this.name} creating component structure using ComponentStructurer module`);
    
    const design = taskData.design || this.currentDesign;
    if (!design) {
      throw new Error('No system design available for creating component structure');
    }
    
    // Use the ComponentStructurer module to create the component structure
    const componentStructure = await this.modules.componentStructurer.createComponentStructure(
      design,
      {
        buildSystemType: taskData.buildSystemType || 'npm'
      }
    );
    
    // Store the component structure in memory
    await this.storeMemory('componentStructure', componentStructure);
    
    return componentStructure;
  }
  
  /**
   * Break down tasks based on system design and component structure
   * @param {Object} taskData - Task data containing design and structure information
   * @returns {Promise<Object>} - Task breakdown
   * @private
   */
  async _breakdownTasks(taskData) {
    console.log(`Architect Agent ${this.name} breaking down tasks using TaskPlanner module`);
    
    const design = taskData.design || this.currentDesign;
    if (!design) {
      throw new Error('No system design available for task breakdown');
    }
    
    const componentStructure = taskData.componentStructure || 
      await this.retrieveMemory('componentStructure');
    
    if (!componentStructure) {
      throw new Error('No component structure available for task breakdown');
    }
    
    // Use the TaskPlanner module to break down tasks
    const taskBreakdown = await this.modules.taskPlanner.breakdownTasks(
      design,
      componentStructure,
      taskData.options || {}
    );
    
    // Store the task breakdown in memory
    await this.storeMemory('taskBreakdown', taskBreakdown);
    
    return taskBreakdown;
  }
  
  /**
   * Review architecture for quality and issues
   * @param {Object} taskData - Task data containing design to review
   * @returns {Promise<Object>} - Review results
   * @private
   */
  async _reviewArchitecture(taskData) {
    console.log(`Architect Agent ${this.name} reviewing architecture using ArchitectureReviewer module`);
    
    const design = taskData.design || this.currentDesign;
    if (!design) {
      throw new Error('No system design available for architecture review');
    }
    
    // Use the ArchitectureReviewer module to review the architecture
    const review = await this.modules.architectureReviewer.reviewArchitecture(
      design,
      taskData.options || {}
    );
    
    // Store the review in memory
    await this.storeMemory('architectureReview', review);
    
    return review;
  }
  
  /**
   * Document architecture based on system design
   * @param {Object} taskData - Task data containing design to document
   * @returns {Promise<Object>} - Documentation
   * @private
   */
  async _documentArchitecture(taskData) {
    console.log(`Architect Agent ${this.name} documenting architecture using ArchitectureDocumenter module`);
    
    const design = taskData.design || this.currentDesign;
    if (!design) {
      throw new Error('No system design available for architecture documentation');
    }
    
    // Use the ArchitectureDocumenter module to document the architecture
    const documentation = await this.modules.architectureDocumenter.documentArchitecture(
      design,
      taskData.options || {}
    );
    
    // Store the documentation in memory
    await this.storeMemory('architectureDocumentation', documentation);
    
    return documentation;
  }
  
  /**
   * Handle design creation message
   * @param {Object} data - Message data
   * @private
   */
  _handleDesignCreation(data) {
    // Create a task for design creation
    const taskId = `design-${Date.now()}`;
    
    this.communicationHub.publish('task.created', {
      taskId,
      type: 'design.system',
      data,
      agentId: this.id
    });
  }
  
  /**
   * Handle design review message
   * @param {Object} data - Message data
   * @private
   */
  _handleDesignReview(data) {
    // Create a task for design review
    const taskId = `review-${Date.now()}`;
    
    this.communicationHub.publish('task.created', {
      taskId,
      type: 'review.architecture',
      data,
      agentId: this.id
    });
  }
  
  /**
   * Handle requirements addition message
   * @param {Object} data - Message data
   * @private
   */
  _handleRequirementsAddition(data) {
    // Add requirements to the project
    this.projectRequirements = [
      ...this.projectRequirements,
      ...(data.requirements || [])
    ];
    
    // Notify that requirements have been added
    this.communicationHub.publish('requirements.added', {
      agentId: this.id,
      count: data.requirements ? data.requirements.length : 0
    });
    
    // Create a task for requirements analysis
    const taskId = `analyze-${Date.now()}`;
    
    this.communicationHub.publish('task.created', {
      taskId,
      type: 'analyze.requirements',
      data: {
        requirements: this.projectRequirements
      },
      agentId: this.id
    });
  }
  
  /**
   * Handle component addition message
   * @param {Object} data - Message data
   * @private
   */
  _handleComponentAddition(data) {
    // Add component to the system
    if (this.currentDesign) {
      this.currentDesign.components.push(data.component);
      this.systemComponents.push(data.component);
      
      // Notify that component has been added
      this.communicationHub.publish('system.component.added', {
        agentId: this.id,
        component: data.component.name
      });
    } else {
      // No current design, cannot add component
      this.communicationHub.publish('system.component.rejected', {
        agentId: this.id,
        reason: 'No current design available'
      });
    }
  }
  
  /**
   * Handle task breakdown request message
   * @param {Object} data - Message data
   * @private
   */
  _handleTaskBreakdownRequest(data) {
    // Create a task for task breakdown
    const taskId = `breakdown-${Date.now()}`;
    
    this.communicationHub.publish('task.created', {
      taskId,
      type: 'breakdown.tasks',
      data,
      agentId: this.id
    });
  }
}

module.exports = ArchitectAgent;