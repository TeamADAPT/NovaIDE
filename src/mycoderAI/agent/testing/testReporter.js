/**
 * testReporter.js
 * Test reporting module for MyCoderAI
 * 
 * This module is responsible for generating test reports and analyzing results.
 */

/**
 * Test Reporter module
 */
class TestReporter {
  /**
   * Create a new Test Reporter
   * @param {Object} testerAgent - The parent tester agent
   * @param {Object} services - Service dependencies
   */
  constructor(testerAgent, services) {
    this.testerAgent = testerAgent;
    this.services = services;
    
    console.log('Test Reporter module initialized');
  }
  
  /**
   * Handle test report request message
   * @param {Object} data - Message data
   * @returns {Promise<void>}
   */
  async handleTestReportRequest(data) {
    console.log('Test Reporter handling test report request');
    
    // Create a task for test report generation
    const taskId = `testreport-${Date.now()}`;
    
    this.testerAgent.communicationHub.publish('task.created', {
      taskId,
      type: 'generate.test.report',
      data,
      agentId: this.testerAgent.id
    });
  }
  
  /**
   * Generate a test report based on test results
   * @param {Object} taskData - Task data containing test results
   * @returns {Promise<Object>} - The test report
   */
  async generateTestReport(taskData) {
    console.log('Test Reporter generating test report');
    
    const { testResults } = taskData;
    
    if (!testResults) {
      throw new Error('Test report generation requires test results');
    }
    
    const testReport = {
      target: testResults.testPlan.target,
      type: testResults.testPlan.type,
      summary: testResults.summary,
      details: this._generateTestReportDetails(testResults),
      recommendations: this._generateTestRecommendations(testResults),
      timestamp: new Date()
    };
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`testreport.${testResults.testPlan.target}`, testReport);
    
    return testReport;
  }
  
  /**
   * Generate test report details
   * @param {Object} testResults - Test results
   * @returns {Object} - Test report details
   * @private
   */
  _generateTestReportDetails(testResults) {
    const details = {
      passRate: testResults.summary.passed / testResults.summary.total,
      testCaseResults: testResults.results.map(result => ({
        id: result.testCase.id,
        name: result.testCase.name,
        status: result.status,
        duration: result.duration,
        message: result.details.message,
        error: result.details.error
      })),
      failureAnalysis: []
    };
    
    // Analyze failures
    const failures = testResults.results.filter(result => result.status === 'failed');
    if (failures.length > 0) {
      details.failureAnalysis = failures.map(failure => ({
        testCase: failure.testCase.id,
        error: failure.details.error,
        possibleCauses: ['Implementation error', 'Test case error', 'Environment issue'],
        recommendation: 'Review implementation and test case'
      }));
    }
    
    return details;
  }
  
  /**
   * Generate test recommendations
   * @param {Object} testResults - Test results
   * @returns {Array<Object>} - Test recommendations
   * @private
   */
  _generateTestRecommendations(testResults) {
    const recommendations = [];
    
    // Add recommendations based on test results
    if (testResults.summary.failed > 0) {
      recommendations.push({
        type: 'fix-failures',
        description: `Fix ${testResults.summary.failed} failing tests`,
        priority: 'high'
      });
    }
    
    if (testResults.summary.skipped > 0) {
      recommendations.push({
        type: 'implement-skipped',
        description: `Implement ${testResults.summary.skipped} skipped tests`,
        priority: 'medium'
      });
    }
    
    // Add general recommendations
    recommendations.push({
      type: 'increase-coverage',
      description: 'Increase test coverage by adding more test cases',
      priority: 'medium'
    });
    
    recommendations.push({
      type: 'add-edge-cases',
      description: 'Add test cases for edge cases and error conditions',
      priority: 'medium'
    });
    
    return recommendations;
  }
  
  /**
   * Format test report for display
   * @param {Object} testReport - Test report to format
   * @returns {string} - Formatted test report
   */
  formatTestReport(testReport) {
    let report = `# Test Report for ${testReport.target}\n\n`;
    
    // Add summary
    report += `## Summary\n\n`;
    report += `- **Type**: ${testReport.type}\n`;
    report += `- **Total Tests**: ${testReport.summary.total}\n`;
    report += `- **Passed**: ${testReport.summary.passed}\n`;
    report += `- **Failed**: ${testReport.summary.failed}\n`;
    report += `- **Skipped**: ${testReport.summary.skipped}\n`;
    report += `- **Pass Rate**: ${(testReport.details.passRate * 100).toFixed(2)}%\n`;
    report += `- **Duration**: ${testReport.summary.duration}ms\n\n`;
    
    // Add test case results
    report += `## Test Case Results\n\n`;
    for (const result of testReport.details.testCaseResults) {
      const statusEmoji = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
      report += `### ${statusEmoji} ${result.name}\n\n`;
      report += `- **ID**: ${result.id}\n`;
      report += `- **Status**: ${result.status}\n`;
      report += `- **Duration**: ${result.duration}ms\n`;
      report += `- **Message**: ${result.message}\n`;
      
      if (result.error) {
        report += `- **Error**: ${result.error}\n`;
      }
      
      report += '\n';
    }
    
    // Add failure analysis
    if (testReport.details.failureAnalysis.length > 0) {
      report += `## Failure Analysis\n\n`;
      for (const failure of testReport.details.failureAnalysis) {
        report += `### ${failure.testCase}\n\n`;
        report += `- **Error**: ${failure.error}\n`;
        report += `- **Possible Causes**: ${failure.possibleCauses.join(', ')}\n`;
        report += `- **Recommendation**: ${failure.recommendation}\n\n`;
      }
    }
    
    // Add recommendations
    report += `## Recommendations\n\n`;
    for (const recommendation of testReport.recommendations) {
      const priorityEmoji = recommendation.priority === 'high' ? '🔴' : recommendation.priority === 'medium' ? '🟠' : '🟢';
      report += `- ${priorityEmoji} **${recommendation.type}**: ${recommendation.description}\n`;
    }
    
    return report;
  }
}

module.exports = TestReporter;