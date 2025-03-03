/**
 * performanceTester.js
 * Performance testing module for MyCoderAI
 * 
 * This module is responsible for creating and executing performance tests.
 */

/**
 * Performance Tester module
 */
class PerformanceTester {
  /**
   * Create a new Performance Tester
   * @param {Object} testerAgent - The parent tester agent
   * @param {Object} services - Service dependencies
   */
  constructor(testerAgent, services) {
    this.testerAgent = testerAgent;
    this.services = services;
    
    console.log('Performance Tester module initialized');
  }
  
  /**
   * Handle performance test request message
   * @param {Object} data - Message data
   * @returns {Promise<void>}
   */
  async handlePerformanceTestRequest(data) {
    console.log('Performance Tester handling performance test request');
    
    // Create a task for performance test creation
    const taskId = `performancetest-${Date.now()}`;
    
    this.testerAgent.communicationHub.publish('task.created', {
      taskId,
      type: 'create.performance.tests',
      data,
      agentId: this.testerAgent.id
    });
  }
  
  /**
   * Create performance tests for a component or system
   * @param {Object} taskData - Task data containing component or system to test
   * @returns {Promise<Object>} - The performance tests
   */
  async createPerformanceTests(taskData) {
    console.log('Performance Tester creating performance tests');
    
    const { component, system, language, performanceRequirements } = taskData;
    const testTarget = component || system;
    
    if (!testTarget) {
      throw new Error('Performance tests require a component or system to test');
    }
    
    const performanceTests = {
      target: testTarget.name,
      type: component ? 'component' : 'system',
      language: language || 'javascript',
      framework: this._getPerformanceTestFramework(language || 'javascript'),
      requirements: performanceRequirements || this._generateDefaultPerformanceRequirements(testTarget),
      testCases: [],
      files: [],
      timestamp: new Date()
    };
    
    // Generate performance test cases
    performanceTests.testCases = this._generatePerformanceTestCases(
      testTarget, 
      performanceTests.type, 
      performanceTests.requirements
    );
    
    // Generate test files
    performanceTests.files = this._generatePerformanceTestFiles(
      testTarget, 
      performanceTests.testCases, 
      performanceTests.language, 
      performanceTests.framework
    );
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`performancetests.${testTarget.name}`, performanceTests);
    
    return performanceTests;
  }
  
  /**
   * Generate performance test cases
   * @param {Object} target - Component or system to test
   * @param {string} type - Type of target ('component' or 'system')
   * @param {Object} requirements - Performance requirements
   * @returns {Array<Object>} - Performance test cases
   * @private
   */
  _generatePerformanceTestCases(target, type, requirements) {
    const testCases = [];
    
    // Generate load test case
    testCases.push({
      id: `${target.name.toLowerCase()}-perf-load-1`,
      name: `${target.name} load test`,
      description: `Test ${target.name} performance under load`,
      type: 'performance',
      subtype: 'load',
      priority: 'high',
      parameters: {
        users: requirements.load.users,
        duration: requirements.load.duration,
        rampUp: requirements.load.rampUp
      },
      thresholds: {
        responseTime: requirements.thresholds.responseTime,
        throughput: requirements.thresholds.throughput,
        errorRate: requirements.thresholds.errorRate
      },
      status: 'pending'
    });
    
    // Generate stress test case
    testCases.push({
      id: `${target.name.toLowerCase()}-perf-stress-1`,
      name: `${target.name} stress test`,
      description: `Test ${target.name} performance under stress`,
      type: 'performance',
      subtype: 'stress',
      priority: 'high',
      parameters: {
        users: requirements.stress.users,
        duration: requirements.stress.duration,
        rampUp: requirements.stress.rampUp
      },
      thresholds: {
        responseTime: requirements.thresholds.responseTime * 1.5,
        throughput: requirements.thresholds.throughput * 0.7,
        errorRate: requirements.thresholds.errorRate * 2
      },
      status: 'pending'
    });
    
    // Generate endurance test case
    testCases.push({
      id: `${target.name.toLowerCase()}-perf-endurance-1`,
      name: `${target.name} endurance test`,
      description: `Test ${target.name} performance over time`,
      type: 'performance',
      subtype: 'endurance',
      priority: 'medium',
      parameters: {
        users: requirements.endurance.users,
        duration: requirements.endurance.duration,
        rampUp: requirements.endurance.rampUp
      },
      thresholds: {
        responseTime: requirements.thresholds.responseTime,
        throughput: requirements.thresholds.throughput,
        errorRate: requirements.thresholds.errorRate,
        memoryLeak: requirements.thresholds.memoryLeak
      },
      status: 'pending'
    });
    
    // Generate spike test case
    testCases.push({
      id: `${target.name.toLowerCase()}-perf-spike-1`,
      name: `${target.name} spike test`,
      description: `Test ${target.name} performance under sudden load spikes`,
      type: 'performance',
      subtype: 'spike',
      priority: 'medium',
      parameters: {
        baseUsers: requirements.spike.baseUsers,
        peakUsers: requirements.spike.peakUsers,
        duration: requirements.spike.duration,
        spikeDuration: requirements.spike.spikeDuration
      },
      thresholds: {
        responseTime: requirements.thresholds.responseTime * 2,
        throughput: requirements.thresholds.throughput * 0.5,
        errorRate: requirements.thresholds.errorRate * 3,
        recoveryTime: requirements.thresholds.recoveryTime
      },
      status: 'pending'
    });
    
    return testCases;
  }
  
  /**
   * Generate performance test files
   * @param {Object} target - Component or system to test
   * @param {Array<Object>} testCases - Test cases
   * @param {string} language - Language of the code
   * @param {string} framework - Test framework to use
   * @returns {Array<Object>} - Test files
   * @private
   */
  _generatePerformanceTestFiles(target, testCases, language, framework) {
    const files = [];
    
    if (framework === 'k6') {
      // Generate k6 performance test file
      const testContent = `import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errors = new Counter('errors');
const requestDuration = new Trend('request_duration');
const successRate = new Rate('success_rate');

// Options for the test
export const options = {
  ${testCases.map(tc => `// ${tc.name}
  scenarios: {
    ${tc.subtype}: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '${tc.parameters.rampUp}s', target: ${tc.parameters.users || tc.parameters.peakUsers} },
        { duration: '${tc.parameters.duration}s', target: ${tc.parameters.users || tc.parameters.peakUsers} },
        { duration: '${tc.parameters.rampUp}s', target: 0 }
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    'request_duration': ['p(95)<${tc.thresholds.responseTime}'],
    'http_req_duration': ['p(95)<${tc.thresholds.responseTime}'],
    'success_rate': ['rate>${1 - tc.thresholds.errorRate}'],
    'http_req_failed': ['rate<${tc.thresholds.errorRate}'],
  },`).join('\n  ')}
};

// Test setup
export function setup() {
  console.log('Setting up performance test for ${target.name}');
  return {
    targetUrl: 'http://localhost:3000/${target.name.toLowerCase().replace(/\s+/g, '-')}'
  };
}

// Main test function
export default function(data) {
  const response = http.get(data.targetUrl);
  
  // Check if response is successful
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < ${testCases[0].thresholds.responseTime}ms': (r) => r.timings.duration < ${testCases[0].thresholds.responseTime},
  });
  
  // Record metrics
  if (!success) {
    errors.add(1);
  }
  
  successRate.add(success);
  requestDuration.add(response.timings.duration);
  
  sleep(1);
}

// Test teardown
export function teardown(data) {
  console.log('Tearing down performance test for ${target.name}');
}
`;
      
      files.push({
        path: `tests/performance/${target.name.toLowerCase().replace(/\s+/g, '-')}.performance.js`,
        content: testContent
      });
    } else if (framework === 'locust') {
      // Generate Locust performance test file
      const testContent = `"""
Performance tests for ${target.name}
"""

import time
from locust import HttpUser, task, between


class ${target.name.replace(/\s+/g, '')}User(HttpUser):
    """User class for ${target.name} performance testing"""
    
    wait_time = between(1, 3)
    
    def on_start(self):
        """Setup before starting tests"""
        print(f"Starting performance test for ${target.name}")
    
    ${testCases.map(tc => `@task
    def ${tc.subtype}_test(self):
        """${tc.description}"""
        start_time = time.time()
        
        with self.client.get(
            "/${target.name.toLowerCase().replace(/\s+/g, '-')}",
            name="${tc.name}",
            catch_response=True
        ) as response:
            duration = time.time() - start_time
            
            if response.status_code != 200:
                response.failure(f"Failed with status code: {response.status_code}")
            elif duration > ${tc.thresholds.responseTime / 1000}:
                response.failure(f"Response too slow: {duration:.2f}s")
            else:
                response.success()`).join('\n    \n    ')}
    
    def on_stop(self):
        """Teardown after tests complete"""
        print(f"Completed performance test for ${target.name}")
`;
      
      files.push({
        path: `tests/performance/test_${target.name.toLowerCase().replace(/\s+/g, '_')}_performance.py`,
        content: testContent
      });
    }
    
    return files;
  }
  
  /**
   * Generate default performance requirements
   * @param {Object} target - Component or system to test
   * @returns {Object} - Default performance requirements
   * @private
   */
  _generateDefaultPerformanceRequirements(testTarget) {
    return {
      load: {
        users: 50,
        duration: 60,
        rampUp: 30
      },
      stress: {
        users: 100,
        duration: 60,
        rampUp: 30
      },
      endurance: {
        users: 30,
        duration: 300,
        rampUp: 60
      },
      spike: {
        baseUsers: 20,
        peakUsers: 200,
        duration: 120,
        spikeDuration: 30
      },
      thresholds: {
        responseTime: 200, // ms
        throughput: 100, // requests per second
        errorRate: 0.01, // 1%
        memoryLeak: 0.05, // 5% memory growth
        recoveryTime: 5000 // ms
      }
    };
  }
  
  /**
   * Get performance test framework for a language
   * @param {string} language - Language
   * @returns {string} - Performance test framework
   * @private
   */
  _getPerformanceTestFramework(language) {
    const frameworks = {
      'javascript': 'k6',
      'typescript': 'k6',
      'python': 'locust',
      'java': 'jmeter',
      'go': 'vegeta',
      'rust': 'criterion'
    };
    
    return frameworks[language] || 'k6';
  }
  
  /**
   * Execute performance tests
   * @param {Object} taskData - Task data containing performance tests and target
   * @returns {Promise<Object>} - Performance test results
   */
  async executePerformanceTests(taskData) {
    console.log('Performance Tester executing performance tests');
    
    const { performanceTests, target } = taskData;
    
    if (!performanceTests) {
      throw new Error('Performance test execution requires performance tests');
    }
    
    if (!target) {
      throw new Error('Performance test execution requires a target');
    }
    
    // This would be implemented with actual test execution
    // For MVP, we'll simulate test execution
    
    const results = {
      target: performanceTests.target,
      testCases: performanceTests.testCases.map(tc => {
        const passed = Math.random() > 0.3; // 70% pass rate for simulation
        
        return {
          id: tc.id,
          name: tc.name,
          status: passed ? 'passed' : 'failed',
          duration: Math.floor(Math.random() * 10000) + 5000,
          metrics: {
            responseTime: {
              min: Math.floor(Math.random() * 50) + 10,
              max: Math.floor(Math.random() * 500) + 100,
              avg: Math.floor(Math.random() * 200) + 50,
              p95: Math.floor(Math.random() * 300) + 100
            },
            throughput: Math.floor(Math.random() * 100) + 50,
            errorRate: Math.random() * 0.05,
            memoryUsage: {
              start: Math.floor(Math.random() * 100) + 50,
              end: Math.floor(Math.random() * 150) + 100,
              growth: Math.random() * 0.1
            }
          },
          message: passed 
            ? `${tc.name} passed all thresholds` 
            : `${tc.name} failed: Response time exceeded threshold`
        };
      }),
      timestamp: new Date()
    };
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`performanceresults.${performanceTests.target}`, results);
    
    return results;
  }
  
  /**
   * Format performance test results for display
   * @param {Object} results - Performance test results
   * @returns {string} - Formatted performance test results
   */
  formatPerformanceResults(results) {
    let report = `# Performance Test Results for ${results.target}\n\n`;
    
    // Add summary
    const passedCount = results.testCases.filter(tc => tc.status === 'passed').length;
    const failedCount = results.testCases.length - passedCount;
    
    report += `## Summary\n\n`;
    report += `- **Total Tests**: ${results.testCases.length}\n`;
    report += `- **Passed**: ${passedCount}\n`;
    report += `- **Failed**: ${failedCount}\n`;
    report += `- **Pass Rate**: ${(passedCount / results.testCases.length * 100).toFixed(2)}%\n\n`;
    
    // Add test case results
    report += `## Test Case Results\n\n`;
    for (const testCase of results.testCases) {
      const statusEmoji = testCase.status === 'passed' ? '✅' : '❌';
      report += `### ${statusEmoji} ${testCase.name}\n\n`;
      report += `- **Duration**: ${testCase.duration}ms\n`;
      report += `- **Response Time**: min=${testCase.metrics.responseTime.min}ms, max=${testCase.metrics.responseTime.max}ms, avg=${testCase.metrics.responseTime.avg}ms, p95=${testCase.metrics.responseTime.p95}ms\n`;
      report += `- **Throughput**: ${testCase.metrics.throughput} req/s\n`;
      report += `- **Error Rate**: ${(testCase.metrics.errorRate * 100).toFixed(2)}%\n`;
      report += `- **Memory Growth**: ${(testCase.metrics.memoryUsage.growth * 100).toFixed(2)}%\n`;
      report += `- **Message**: ${testCase.message}\n\n`;
    }
    
    return report;
  }
}

module.exports = PerformanceTester;