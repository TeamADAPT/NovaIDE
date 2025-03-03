/**
 * testPlanner.js
 * Test planning module for MyCoderAI
 * 
 * This module is responsible for creating and managing test plans.
 */

/**
 * Test Planner module
 */
class TestPlanner {
  /**
   * Create a new Test Planner
   * @param {Object} testerAgent - The parent tester agent
   * @param {Object} services - Service dependencies
   */
  constructor(testerAgent, services) {
    this.testerAgent = testerAgent;
    this.services = services;
    this.currentTestPlan = null;
    this.testHistory = [];
    
    console.log('Test Planner module initialized');
  }
  
  /**
   * Handle test plan request message
   * @param {Object} data - Message data
   * @returns {Promise<void>}
   */
  async handleTestPlanRequest(data) {
    console.log('Test Planner handling test plan request');
    
    // Create a task for test plan creation
    const taskId = `testplan-${Date.now()}`;
    
    this.testerAgent.communicationHub.publish('task.created', {
      taskId,
      type: 'create.test.plan',
      data,
      agentId: this.testerAgent.id
    });
  }
  
  /**
   * Create a test plan for a component or system
   * @param {Object} taskData - Task data containing component or system to test
   * @returns {Promise<Object>} - The test plan
   */
  async createTestPlan(taskData) {
    console.log('Test Planner creating test plan');
    
    const { component, system, language } = taskData;
    const testTarget = component || system;
    
    if (!testTarget) {
      throw new Error('Test plan requires a component or system to test');
    }
    
    const testPlan = {
      target: testTarget.name,
      type: component ? 'component' : 'system',
      language: language || 'javascript',
      framework: this._getDefaultTestFramework(language || 'javascript'),
      testLevels: [],
      testCases: [],
      timestamp: new Date()
    };
    
    // Add test levels based on target type
    if (component) {
      testPlan.testLevels.push('unit');
      testPlan.testLevels.push('integration');
    } else {
      testPlan.testLevels.push('system');
      testPlan.testLevels.push('acceptance');
    }
    
    // Generate test cases
    testPlan.testCases = this._generateTestCases(testTarget, testPlan.type, testPlan.language);
    
    // Store the test plan
    this.currentTestPlan = testPlan;
    this.testHistory.push(testPlan);
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`testplan.${testTarget.name}`, testPlan);
    
    return testPlan;
  }
  
  /**
   * Generate test cases for a component or system
   * @param {Object} target - Component or system to test
   * @param {string} type - Type of target ('component' or 'system')
   * @param {string} language - Language of the code
   * @returns {Array<Object>} - Array of test cases
   * @private
   */
  _generateTestCases(target, type, language) {
    const testCases = [];
    
    if (type === 'component') {
      // Generate unit test cases for component
      testCases.push({
        id: `${target.name.toLowerCase()}-init-1`,
        name: `${target.name} initialization`,
        description: `Test that ${target.name} initializes correctly`,
        type: 'unit',
        priority: 'high',
        steps: [
          { step: 1, description: `Create a new instance of ${target.name}` },
          { step: 2, description: 'Verify the instance is created successfully' }
        ],
        expectedResult: `${target.name} instance is created successfully`,
        status: 'pending'
      });
      
      // Generate test cases for component methods
      if (target.methods) {
        target.methods.forEach((method, index) => {
          testCases.push({
            id: `${target.name.toLowerCase()}-method-${index + 1}`,
            name: `${target.name}.${method.name}`,
            description: `Test ${method.name} method of ${target.name}`,
            type: 'unit',
            priority: 'high',
            steps: [
              { step: 1, description: `Create a new instance of ${target.name}` },
              { step: 2, description: `Call ${method.name} method with valid parameters` },
              { step: 3, description: 'Verify the method returns expected result' }
            ],
            expectedResult: `${method.name} method returns expected result`,
            status: 'pending'
          });
        });
      }
      
      // Generate error handling test cases
      testCases.push({
        id: `${target.name.toLowerCase()}-error-1`,
        name: `${target.name} error handling`,
        description: `Test that ${target.name} handles errors correctly`,
        type: 'unit',
        priority: 'medium',
        steps: [
          { step: 1, description: `Create a new instance of ${target.name}` },
          { step: 2, description: 'Call methods with invalid parameters' },
          { step: 3, description: 'Verify errors are handled correctly' }
        ],
        expectedResult: `${target.name} handles errors correctly`,
        status: 'pending'
      });
    } else if (type === 'system') {
      // Generate system test cases
      testCases.push({
        id: `${target.name.toLowerCase()}-system-1`,
        name: `${target.name} initialization`,
        description: `Test that ${target.name} system initializes correctly`,
        type: 'system',
        priority: 'high',
        steps: [
          { step: 1, description: `Initialize ${target.name} system` },
          { step: 2, description: 'Verify all components are initialized' },
          { step: 3, description: 'Verify system is ready for operation' }
        ],
        expectedResult: `${target.name} system initializes correctly`,
        status: 'pending'
      });
      
      // Generate end-to-end test cases
      testCases.push({
        id: `${target.name.toLowerCase()}-e2e-1`,
        name: `${target.name} end-to-end`,
        description: `End-to-end test for ${target.name} system`,
        type: 'e2e',
        priority: 'high',
        steps: [
          { step: 1, description: `Initialize ${target.name} system` },
          { step: 2, description: 'Perform a complete workflow' },
          { step: 3, description: 'Verify expected outcome' }
        ],
        expectedResult: `${target.name} system works correctly end-to-end`,
        status: 'pending'
      });
    }
    
    return testCases;
  }
  
  /**
   * Get default test framework for a language
   * @param {string} language - Language
   * @returns {string} - Default test framework
   * @private
   */
  _getDefaultTestFramework(language) {
    const frameworks = {
      'javascript': 'jest',
      'typescript': 'jest',
      'python': 'pytest',
      'java': 'junit',
      'go': 'testing',
      'rust': 'cargo-test'
    };
    
    return frameworks[language] || 'jest';
  }
}

module.exports = TestPlanner;