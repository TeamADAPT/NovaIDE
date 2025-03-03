/**
 * testerAgent.js
 * Core Tester Agent for MyCoderAI
 * 
 * This agent is responsible for coordinating testing activities
 * and delegating to specialized testing modules.
 */

const Agent = require('../agent');

/**
 * Tester Agent specializing in code testing
 */
class TesterAgent extends Agent {
  /**
   * Create a new Tester Agent
   * @param {Object} config - Agent configuration
   * @param {Object} services - Service dependencies
   */
  constructor(config, services) {
    // Set default capabilities for tester agent
    const testerCapabilities = {
      'test.planning': 0.95,
      'test.execution': 0.90,
      'test.reporting': 0.90,
      'test.automation': 0.85,
      'test.coverage': 0.85,
      'test.integration': 0.80,
      'test.performance': 0.75,
      'test.security': 0.70
    };
    
    // Merge with any provided capabilities
    const mergedConfig = {
      ...config,
      type: 'tester',
      capabilities: {
        ...testerCapabilities,
        ...(config.capabilities || {})
      }
    };
    
    super(mergedConfig, services);
    
    // Initialize testing modules
    this._initializeTestingModules(services);
    
    console.log(`Tester Agent ${this.name} initialized with specialized capabilities`);
  }
  
  /**
   * Initialize testing modules
   * @param {Object} services - Service dependencies
   * @private
   */
  _initializeTestingModules(services) {
    // Dynamically import testing modules
    try {
      // These will be lazy-loaded when needed
      this.testingModules = {
        planner: null,
        executor: null,
        reporter: null,
        coverage: null,
        integration: null,
        performance: null,
        security: null
      };
    } catch (error) {
      console.error(`Error initializing testing modules: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a testing module, loading it if necessary
   * @param {string} moduleName - Name of the module to get
   * @returns {Object} - The requested module
   * @private
   */
  async _getTestingModule(moduleName) {
    if (!this.testingModules[moduleName]) {
      try {
        // Dynamically load the module when first needed
        const ModuleClass = require(`./${moduleName}`);
        this.testingModules[moduleName] = new ModuleClass(this, this.services);
      } catch (error) {
        console.error(`Error loading testing module ${moduleName}: ${error.message}`);
        throw error;
      }
    }
    
    return this.testingModules[moduleName];
  }
  
  /**
   * Handle specialized messages specific to the Tester role
   * @param {Object} message - The message to handle
   * @override
   */
  async handleSpecializedMessage(message) {
    switch (message.type) {
      case 'test.plan':
        const planner = await this._getTestingModule('testPlanner');
        await planner.handleTestPlanRequest(message.data);
        break;
      case 'test.execute':
        const executor = await this._getTestingModule('testExecutor');
        await executor.handleTestExecutionRequest(message.data);
        break;
      case 'test.report':
        const reporter = await this._getTestingModule('testReporter');
        await reporter.handleTestReportRequest(message.data);
        break;
      case 'test.coverage':
        const coverage = await this._getTestingModule('coverageAnalyzer');
        await coverage.handleTestCoverageRequest(message.data);
        break;
      case 'test.integration':
        const integration = await this._getTestingModule('integrationTester');
        await integration.handleIntegrationTestRequest(message.data);
        break;
      case 'test.performance':
        const performance = await this._getTestingModule('performanceTester');
        await performance.handlePerformanceTestRequest(message.data);
        break;
      case 'test.security':
        const security = await this._getTestingModule('securityTester');
        await security.handleSecurityTestRequest(message.data);
        break;
      default:
        console.log(`Tester Agent ${this.name} received unhandled message: ${message.type}`);
    }
  }
  
  /**
   * Process a task - implementation for Tester Agent
   * @param {Object} taskData - Data for the task to process
   * @returns {Promise<Object>} - Promise resolving to the task result
   * @private
   * @override
   */
  async _processTask(taskData) {
    console.log(`Tester Agent ${this.name} processing task: ${taskData.type}`);
    
    switch (taskData.type) {
      case 'create.test.plan':
        const planner = await this._getTestingModule('testPlanner');
        return await planner.createTestPlan(taskData);
      case 'execute.tests':
        const executor = await this._getTestingModule('testExecutor');
        return await executor.executeTests(taskData);
      case 'generate.test.report':
        const reporter = await this._getTestingModule('testReporter');
        return await reporter.generateTestReport(taskData);
      case 'analyze.test.coverage':
        const coverage = await this._getTestingModule('coverageAnalyzer');
        return await coverage.analyzeTestCoverage(taskData);
      case 'create.integration.tests':
        const integration = await this._getTestingModule('integrationTester');
        return await integration.createIntegrationTests(taskData);
      case 'create.performance.tests':
        const performance = await this._getTestingModule('performanceTester');
        return await performance.createPerformanceTests(taskData);
      case 'create.security.tests':
        const security = await this._getTestingModule('securityTester');
        return await security.createSecurityTests(taskData);
      default:
        throw new Error(`Unsupported task type for Tester Agent: ${taskData.type}`);
    }
  }
  
  /**
   * Store memory for other agents to access
   * @param {string} key - Memory key
   * @param {Object} data - Memory data
   * @returns {Promise<void>}
   */
  async storeMemory(key, data) {
    if (this.services && this.services.memoryManager) {
      await this.services.memoryManager.store(`tester.${key}`, data);
    } else {
      console.warn(`Memory manager not available, couldn't store ${key}`);
    }
  }
  
  /**
   * Retrieve memory stored by other agents
   * @param {string} key - Memory key
   * @returns {Promise<Object>} - Retrieved memory data
   */
  async retrieveMemory(key) {
    if (this.services && this.services.memoryManager) {
      return await this.services.memoryManager.retrieve(`tester.${key}`);
    } else {
      console.warn(`Memory manager not available, couldn't retrieve ${key}`);
      return null;
    }
  }
}

module.exports = TesterAgent;