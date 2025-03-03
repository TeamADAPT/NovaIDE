/**
 * securityTester.js
 * Security testing module for MyCoderAI
 * 
 * This module is responsible for creating and executing security tests.
 */

/**
 * Security Tester module
 */
class SecurityTester {
  /**
   * Create a new Security Tester
   * @param {Object} testerAgent - The parent tester agent
   * @param {Object} services - Service dependencies
   */
  constructor(testerAgent, services) {
    this.testerAgent = testerAgent;
    this.services = services;
    
    console.log('Security Tester module initialized');
  }
  
  /**
   * Handle security test request message
   * @param {Object} data - Message data
   * @returns {Promise<void>}
   */
  async handleSecurityTestRequest(data) {
    console.log('Security Tester handling security test request');
    
    // Create a task for security test creation
    const taskId = `securitytest-${Date.now()}`;
    
    this.testerAgent.communicationHub.publish('task.created', {
      taskId,
      type: 'create.security.tests',
      data,
      agentId: this.testerAgent.id
    });
  }
  
  /**
   * Create security tests for a component or system
   * @param {Object} taskData - Task data containing component or system to test
   * @returns {Promise<Object>} - The security tests
   */
  async createSecurityTests(taskData) {
    console.log('Security Tester creating security tests');
    
    const { component, system, language, securityRequirements } = taskData;
    const testTarget = component || system;
    
    if (!testTarget) {
      throw new Error('Security tests require a component or system to test');
    }
    
    const securityTests = {
      target: testTarget.name,
      type: component ? 'component' : 'system',
      language: language || 'javascript',
      framework: this._getSecurityTestFramework(language || 'javascript'),
      requirements: securityRequirements || this._generateDefaultSecurityRequirements(testTarget),
      testCases: [],
      files: [],
      timestamp: new Date()
    };
    
    // Generate security test cases
    securityTests.testCases = this._generateSecurityTestCases(
      testTarget, 
      securityTests.type, 
      securityTests.requirements
    );
    
    // Generate test files
    securityTests.files = this._generateSecurityTestFiles(
      testTarget, 
      securityTests.testCases, 
      securityTests.language, 
      securityTests.framework
    );
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`securitytests.${testTarget.name}`, securityTests);
    
    return securityTests;
  }
  
  /**
   * Generate security test cases
   * @param {Object} target - Component or system to test
   * @param {string} type - Type of target ('component' or 'system')
   * @param {Object} requirements - Security requirements
   * @returns {Array<Object>} - Security test cases
   * @private
   */
  _generateSecurityTestCases(target, type, requirements) {
    const testCases = [];
    
    // Generate input validation test case
    testCases.push({
      id: `${target.name.toLowerCase()}-sec-input-1`,
      name: `${target.name} input validation`,
      description: `Test ${target.name} input validation security`,
      type: 'security',
      subtype: 'input-validation',
      priority: 'high',
      vulnerabilities: ['injection', 'xss', 'overflow'],
      status: 'pending'
    });
    
    // Generate authentication test case
    if (requirements.authentication) {
      testCases.push({
        id: `${target.name.toLowerCase()}-sec-auth-1`,
        name: `${target.name} authentication`,
        description: `Test ${target.name} authentication security`,
        type: 'security',
        subtype: 'authentication',
        priority: 'high',
        vulnerabilities: ['weak-credentials', 'brute-force', 'session-fixation'],
        status: 'pending'
      });
    }
    
    // Generate authorization test case
    if (requirements.authorization) {
      testCases.push({
        id: `${target.name.toLowerCase()}-sec-authz-1`,
        name: `${target.name} authorization`,
        description: `Test ${target.name} authorization security`,
        type: 'security',
        subtype: 'authorization',
        priority: 'high',
        vulnerabilities: ['insecure-direct-object-reference', 'missing-access-control'],
        status: 'pending'
      });
    }
    
    // Generate data protection test case
    if (requirements.dataProtection) {
      testCases.push({
        id: `${target.name.toLowerCase()}-sec-data-1`,
        name: `${target.name} data protection`,
        description: `Test ${target.name} data protection security`,
        type: 'security',
        subtype: 'data-protection',
        priority: 'high',
        vulnerabilities: ['sensitive-data-exposure', 'insecure-storage'],
        status: 'pending'
      });
    }
    
    // Generate secure communication test case
    if (requirements.secureCommunication) {
      testCases.push({
        id: `${target.name.toLowerCase()}-sec-comm-1`,
        name: `${target.name} secure communication`,
        description: `Test ${target.name} secure communication`,
        type: 'security',
        subtype: 'secure-communication',
        priority: 'high',
        vulnerabilities: ['man-in-the-middle', 'insecure-transmission'],
        status: 'pending'
      });
    }
    
    // Generate error handling test case
    if (requirements.errorHandling) {
      testCases.push({
        id: `${target.name.toLowerCase()}-sec-error-1`,
        name: `${target.name} error handling`,
        description: `Test ${target.name} error handling security`,
        type: 'security',
        subtype: 'error-handling',
        priority: 'medium',
        vulnerabilities: ['information-disclosure', 'improper-error-handling'],
        status: 'pending'
      });
    }
    
    // Generate dependency security test case
    testCases.push({
      id: `${target.name.toLowerCase()}-sec-deps-1`,
      name: `${target.name} dependency security`,
      description: `Test ${target.name} dependency security`,
      type: 'security',
      subtype: 'dependency-security',
      priority: 'medium',
      vulnerabilities: ['vulnerable-dependencies', 'outdated-components'],
      status: 'pending'
    });
    
    return testCases;
  }
  
  /**
   * Generate security test files
   * @param {Object} target - Component or system to test
   * @param {Array<Object>} testCases - Test cases
   * @param {string} language - Language of the code
   * @param {string} framework - Test framework to use
   * @returns {Array<Object>} - Test files
   * @private
   */
  _generateSecurityTestFiles(target, testCases, language, framework) {
    const files = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Generate main security test file
      const fileExt = language === 'javascript' ? 'js' : 'ts';
      
      const testContent = `/**
 * Security tests for ${target.name}
 */

const ${target.name.replace(/\s+/g, '')} = require('../src/${target.name.toLowerCase().replace(/\s+/g, '-')}');

describe('${target.name} Security', () => {
  ${testCases.map(tc => {
    if (tc.subtype === 'input-validation') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
    });
    
    test('should reject SQL injection attempts', () => {
      // TODO: Implement SQL injection test
      const maliciousInput = "'; DROP TABLE users; --";
      
      // Example test - replace with actual implementation
      expect(() => {
        instance.processInput(maliciousInput);
      }).toThrow();
    });
    
    test('should sanitize XSS attempts', () => {
      // TODO: Implement XSS test
      const maliciousInput = "<script>alert('XSS')</script>";
      
      // Example test - replace with actual implementation
      const result = instance.processInput(maliciousInput);
      expect(result).not.toContain("<script>");
    });
    
    test('should handle buffer overflow attempts', () => {
      // TODO: Implement buffer overflow test
      const maliciousInput = "A".repeat(10000);
      
      // Example test - replace with actual implementation
      expect(() => {
        instance.processInput(maliciousInput);
      }).not.toThrow();
    });
  });`;
    } else if (tc.subtype === 'authentication') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
    });
    
    test('should reject weak credentials', () => {
      // TODO: Implement weak credentials test
      const weakPassword = "password123";
      
      // Example test - replace with actual implementation
      const result = instance.validatePassword(weakPassword);
      expect(result).toBe(false);
    });
    
    test('should prevent brute force attacks', () => {
      // TODO: Implement brute force prevention test
      
      // Example test - replace with actual implementation
      for (let i = 0; i < 10; i++) {
        instance.authenticate("user", "wrong" + i);
      }
      
      // Should be locked out after multiple attempts
      expect(() => {
        instance.authenticate("user", "correct");
      }).toThrow(/locked/);
    });
    
    test('should prevent session fixation', () => {
      // TODO: Implement session fixation test
      
      // Example test - replace with actual implementation
      const session1 = instance.createSession();
      instance.authenticate("user", "password");
      const session2 = instance.getSession();
      
      expect(session2).not.toBe(session1);
    });
  });`;
    } else if (tc.subtype === 'authorization') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
      instance.authenticate("user", "password");
    });
    
    test('should prevent insecure direct object references', () => {
      // TODO: Implement IDOR test
      
      // Example test - replace with actual implementation
      expect(() => {
        instance.getResource("resource_not_owned_by_user");
      }).toThrow(/unauthorized/);
    });
    
    test('should enforce access control', () => {
      // TODO: Implement access control test
      
      // Example test - replace with actual implementation
      instance.setRole("user");
      
      expect(() => {
        instance.adminFunction();
      }).toThrow(/unauthorized/);
    });
  });`;
    } else if (tc.subtype === 'data-protection') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
    });
    
    test('should protect sensitive data', () => {
      // TODO: Implement sensitive data protection test
      const sensitiveData = "credit-card-number";
      
      // Example test - replace with actual implementation
      const stored = instance.storeData(sensitiveData);
      expect(stored).not.toBe(sensitiveData);
    });
    
    test('should use secure storage', () => {
      // TODO: Implement secure storage test
      
      // Example test - replace with actual implementation
      const data = "sensitive-data";
      instance.storeData(data);
      
      // Check storage mechanism is secure
      // This is a placeholder - actual implementation would depend on the system
      expect(instance.isStorageSecure()).toBe(true);
    });
  });`;
    } else if (tc.subtype === 'secure-communication') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
    });
    
    test('should use secure protocols', () => {
      // TODO: Implement secure protocol test
      
      // Example test - replace with actual implementation
      expect(instance.getProtocol()).toBe('https');
    });
    
    test('should validate certificates', () => {
      // TODO: Implement certificate validation test
      
      // Example test - replace with actual implementation
      expect(instance.validateCertificate('invalid-cert')).toBe(false);
      expect(instance.validateCertificate('valid-cert')).toBe(true);
    });
  });`;
    } else if (tc.subtype === 'error-handling') {
      return `
  describe('${tc.name}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${target.name.replace(/\s+/g, '')}();
    });
    
    test('should not expose sensitive information in errors', () => {
      // TODO: Implement error information disclosure test
      
      // Example test - replace with actual implementation
      try {
        instance.throwError();
      } catch (error) {
        expect(error.message).not.toContain('password');
        expect(error.message).not.toContain('secret');
        expect(error.stack).toBeUndefined();
      }
    });
    
    test('should log errors securely', () => {
      // TODO: Implement secure error logging test
      
      // Example test - replace with actual implementation
      const spy = jest.spyOn(instance, 'logError');
      
      try {
        instance.throwError();
      } catch (error) {
        // Error should be logged
        expect(spy).toHaveBeenCalled();
        
        // Log should not contain sensitive information
        const logCall = spy.mock.calls[0][0];
        expect(logCall).not.toContain('password');
        expect(logCall).not.toContain('secret');
      }
    });
  });`;
    } else if (tc.subtype === 'dependency-security') {
      return `
  describe('${tc.name}', () => {
    test('should not have vulnerable dependencies', () => {
      // TODO: Implement dependency vulnerability test
      
      // This would typically be implemented as a separate process
      // using tools like npm audit, Snyk, or OWASP Dependency Check
      
      // Example test - replace with actual implementation
      // This is a placeholder that would be replaced with actual dependency scanning
      const vulnerablePackages = []; // This would be populated by a security scanning tool
      expect(vulnerablePackages.length).toBe(0);
    });
  });`;
    }
  }).join('\n  ')}
});
`;
      
      files.push({
        path: `tests/security/${target.name.toLowerCase().replace(/\s+/g, '-')}.security.${fileExt}`,
        content: testContent
      });
    } else if (language === 'python') {
      // Generate main security test file
      const testContent = `"""
Security tests for ${target.name}
"""

import pytest
from src.${target.name.toLowerCase().replace(/\s+/g, '_')} import ${target.name.replace(/\s+/g, '')}


${testCases.map(tc => {
  if (tc.subtype === 'input-validation') {
    return `class Test${target.name.replace(/\s+/g, '')}InputValidation:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${target.name.replace(/\s+/g, '')}()
    
    def test_sql_injection(self, instance):
        """Test SQL injection prevention"""
        # TODO: Implement SQL injection test
        malicious_input = "'; DROP TABLE users; --"
        
        # Example test - replace with actual implementation
        with pytest.raises(Exception):
            instance.process_input(malicious_input)
    
    def test_xss(self, instance):
        """Test XSS prevention"""
        # TODO: Implement XSS test
        malicious_input = "<script>alert('XSS')</script>"
        
        # Example test - replace with actual implementation
        result = instance.process_input(malicious_input)
        assert "<script>" not in result
    
    def test_buffer_overflow(self, instance):
        """Test buffer overflow prevention"""
        # TODO: Implement buffer overflow test
        malicious_input = "A" * 10000
        
        # Example test - replace with actual implementation
        try:
            instance.process_input(malicious_input)
        except Exception as e:
            pytest.fail(f"Buffer overflow not handled: {e}")`;
  } else if (tc.subtype === 'authentication') {
    return `class Test${target.name.replace(/\s+/g, '')}Authentication:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${target.name.replace(/\s+/g, '')}()
    
    def test_weak_credentials(self, instance):
        """Test weak credentials rejection"""
        # TODO: Implement weak credentials test
        weak_password = "password123"
        
        # Example test - replace with actual implementation
        result = instance.validate_password(weak_password)
        assert result is False
    
    def test_brute_force_prevention(self, instance):
        """Test brute force prevention"""
        # TODO: Implement brute force prevention test
        
        # Example test - replace with actual implementation
        for i in range(10):
            instance.authenticate("user", f"wrong{i}")
        
        # Should be locked out after multiple attempts
        with pytest.raises(Exception) as excinfo:
            instance.authenticate("user", "correct")
        assert "locked" in str(excinfo.value)
    
    def test_session_fixation(self, instance):
        """Test session fixation prevention"""
        # TODO: Implement session fixation test
        
        # Example test - replace with actual implementation
        session1 = instance.create_session()
        instance.authenticate("user", "password")
        session2 = instance.get_session()
        
        assert session2 != session1`;
  } else if (tc.subtype === 'authorization') {
    return `class Test${target.name.replace(/\s+/g, '')}Authorization:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create authenticated test instance"""
        instance = ${target.name.replace(/\s+/g, '')}()
        instance.authenticate("user", "password")
        return instance
    
    def test_insecure_direct_object_references(self, instance):
        """Test IDOR prevention"""
        # TODO: Implement IDOR test
        
        # Example test - replace with actual implementation
        with pytest.raises(Exception) as excinfo:
            instance.get_resource("resource_not_owned_by_user")
        assert "unauthorized" in str(excinfo.value)
    
    def test_access_control(self, instance):
        """Test access control enforcement"""
        # TODO: Implement access control test
        
        # Example test - replace with actual implementation
        instance.set_role("user")
        
        with pytest.raises(Exception) as excinfo:
            instance.admin_function()
        assert "unauthorized" in str(excinfo.value)`;
  } else if (tc.subtype === 'data-protection') {
    return `class Test${target.name.replace(/\s+/g, '')}DataProtection:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${target.name.replace(/\s+/g, '')}()
    
    def test_sensitive_data_protection(self, instance):
        """Test sensitive data protection"""
        # TODO: Implement sensitive data protection test
        sensitive_data = "credit-card-number"
        
        # Example test - replace with actual implementation
        stored = instance.store_data(sensitive_data)
        assert stored != sensitive_data
    
    def test_secure_storage(self, instance):
        """Test secure storage"""
        # TODO: Implement secure storage test
        
        # Example test - replace with actual implementation
        data = "sensitive-data"
        instance.store_data(data)
        
        # Check storage mechanism is secure
        # This is a placeholder - actual implementation would depend on the system
        assert instance.is_storage_secure() is True`;
  } else if (tc.subtype === 'secure-communication') {
    return `class Test${target.name.replace(/\s+/g, '')}SecureCommunication:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${target.name.replace(/\s+/g, '')}()
    
    def test_secure_protocols(self, instance):
        """Test secure protocol usage"""
        # TODO: Implement secure protocol test
        
        # Example test - replace with actual implementation
        assert instance.get_protocol() == 'https'
    
    def test_certificate_validation(self, instance):
        """Test certificate validation"""
        # TODO: Implement certificate validation test
        
        # Example test - replace with actual implementation
        assert instance.validate_certificate('invalid-cert') is False
        assert instance.validate_certificate('valid-cert') is True`;
  } else if (tc.subtype === 'error-handling') {
    return `class Test${target.name.replace(/\s+/g, '')}ErrorHandling:
    """Tests for ${tc.name}"""
    
    @pytest.fixture
    def instance(self):
        """Create test instance"""
        return ${target.name.replace(/\s+/g, '')}()
    
    def test_no_sensitive_information_in_errors(self, instance):
        """Test error information disclosure prevention"""
        # TODO: Implement error information disclosure test
        
        # Example test - replace with actual implementation
        try:
            instance.throw_error()
        except Exception as e:
            error_message = str(e)
            assert 'password' not in error_message
            assert 'secret' not in error_message
            # Stack trace should not be exposed to users
            # This would be checked in the actual application response
    
    def test_secure_error_logging(self, instance, monkeypatch):
        """Test secure error logging"""
        # TODO: Implement secure error logging test
        
        # Example test - replace with actual implementation
        log_messages = []
        
        def mock_log_error(message):
            log_messages.append(message)
        
        monkeypatch.setattr(instance, 'log_error', mock_log_error)
        
        try:
            instance.throw_error()
        except Exception:
            pass
        
        # Error should be logged
        assert len(log_messages) > 0
        
        # Log should not contain sensitive information
        for message in log_messages:
            assert 'password' not in message
            assert 'secret' not in message`;
  } else if (tc.subtype === 'dependency-security') {
    return `class Test${target.name.replace(/\s+/g, '')}DependencySecurity:
    """Tests for ${tc.name}"""
    
    def test_no_vulnerable_dependencies(self):
        """Test for vulnerable dependencies"""
        # TODO: Implement dependency vulnerability test
        
        # This would typically be implemented as a separate process
        # using tools like safety, Snyk, or OWASP Dependency Check
        
        # Example test - replace with actual implementation
        # This is a placeholder that would be replaced with actual dependency scanning
        vulnerable_packages = []  # This would be populated by a security scanning tool
        assert len(vulnerable_packages) == 0`;
  }
}).join('\n\n\n')}
`;
      
      files.push({
        path: `tests/security/test_${target.name.toLowerCase().replace(/\s+/g, '_')}_security.py`,
        content: testContent
      });
    }
    
    return files;
  }
  
  /**
   * Generate default security requirements
   * @param {Object} target - Component or system to test
   * @returns {Object} - Default security requirements
   * @private
   */
  _generateDefaultSecurityRequirements(testTarget) {
    return {
      authentication: true,
      authorization: true,
      dataProtection: true,
      secureCommunication: true,
      inputValidation: true,
      outputEncoding: true,
      secureLogging: true,
      errorHandling: true
    };
  }
  
  /**
   * Get security test framework for a language
   * @param {string} language - Language
   * @returns {string} - Security test framework
   * @private
   */
  _getSecurityTestFramework(language) {
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
  
  /**
   * Execute security tests
   * @param {Object} taskData - Task data containing security tests and target
   * @returns {Promise<Object>} - Security test results
   */
  async executeSecurityTests(taskData) {
    console.log('Security Tester executing security tests');
    
    const { securityTests, target } = taskData;
    
    if (!securityTests) {
      throw new Error('Security test execution requires security tests');
    }
    
    if (!target) {
      throw new Error('Security test execution requires a target');
    }
    
    // This would be implemented with actual test execution
    // For MVP, we'll simulate test execution
    
    const results = {
      target: securityTests.target,
      testCases: securityTests.testCases.map(tc => {
        const passed = Math.random() > 0.2; // 80% pass rate for simulation
        
        return {
          id: tc.id,
          name: tc.name,
          status: passed ? 'passed' : 'failed',
          vulnerabilities: tc.vulnerabilities,
          details: passed 
            ? { message: `No ${tc.vulnerabilities.join(', ')} vulnerabilities found` }
            : { 
                message: `${tc.vulnerabilities[Math.floor(Math.random() * tc.vulnerabilities.length)]} vulnerability found`,
                severity: Math.random() > 0.5 ? 'high' : 'medium',
                location: `${target.name.toLowerCase()}.js:${Math.floor(Math.random() * 100) + 1}`
              }
        };
      }),
      summary: {
        total: securityTests.testCases.length,
        passed: 0,
        failed: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0
      },
      timestamp: new Date()
    };
    
    // Update summary
    for (const result of results.testCases) {
      if (result.status === 'passed') {
        results.summary.passed++;
      } else {
        results.summary.failed++;
        
        if (result.details.severity === 'high') {
          results.summary.highSeverity++;
        } else if (result.details.severity === 'medium') {
          results.summary.mediumSeverity++;
        } else {
          results.summary.lowSeverity++;
        }
      }
    }
    
    // Store in memory for other agents to access
    await this.testerAgent.storeMemory(`securityresults.${securityTests.target}`, results);
    
    return results;
  }
  
  /**
   * Format security test results for display
   * @param {Object} results - Security test results
   * @returns {string} - Formatted security test results
   */
  formatSecurityResults(results) {
    let report = `# Security Test Results for ${results.target}\n\n`;
    
    // Add summary
    report += `## Summary\n\n`;
    report += `- **Total Tests**: ${results.summary.total}\n`;
    report += `- **Passed**: ${results.summary.passed}\n`;
    report += `- **Failed**: ${results.summary.failed}\n`;
    report += `- **High Severity Issues**: ${results.summary.highSeverity}\n`;
    report += `- **Medium Severity Issues**: ${results.summary.mediumSeverity}\n`;
    report += `- **Low Severity Issues**: ${results.summary.lowSeverity}\n\n`;
    
    // Add test case results
    report += `## Test Case Results\n\n`;
    for (const testCase of results.testCases) {
      const statusEmoji = testCase.status === 'passed' ? '✅' : '❌';
      report += `### ${statusEmoji} ${testCase.name}\n\n`;
      report += `- **ID**: ${testCase.id}\n`;
      report += `- **Status**: ${testCase.status}\n`;
      report += `- **Vulnerabilities Tested**: ${testCase.vulnerabilities.join(', ')}\n`;
      report += `- **Message**: ${testCase.details.message}\n`;
      
      if (testCase.status === 'failed') {
        const severityEmoji = testCase.details.severity === 'high' ? '🔴' : testCase.details.severity === 'medium' ? '🟠' : '🟡';
        report += `- **Severity**: ${severityEmoji} ${testCase.details.severity}\n`;
        report += `- **Location**: ${testCase.details.location}\n`;
      }
      
      report += '\n';
    }
    
    // Add recommendations
    if (results.summary.failed > 0) {
      report += `## Recommendations\n\n`;
      
      if (results.summary.highSeverity > 0) {
        report += `- 🔴 **Critical**: Address all high severity issues immediately\n`;
      }
      
      if (results.summary.mediumSeverity > 0) {
        report += `- 🟠 **Important**: Address medium severity issues in the next sprint\n`;
      }
      
      if (results.summary.lowSeverity > 0) {
        report += `- 🟡 **Consider**: Address low severity issues when time permits\n`;
      }
      
      report += `- 🔄 **Regular Testing**: Implement regular security testing as part of CI/CD\n`;
    }
    
    return report;
  }
}

module.exports = SecurityTester;