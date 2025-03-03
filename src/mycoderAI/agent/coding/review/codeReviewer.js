/**
 * codeReviewer.js
 * Code review functionality for CoderAgent
 */

/**
 * CodeReviewer class for analyzing and reviewing code
 */
class CodeReviewer {
  /**
   * Create a new CodeReviewer instance
   */
  constructor() {
    this.reviewPatterns = {
      javascript: this._getJavaScriptReviewPatterns(),
      typescript: this._getTypeScriptReviewPatterns(),
      python: this._getPythonReviewPatterns()
    };
    
    this.reviewCategories = [
      'security',
      'performance',
      'maintainability',
      'readability',
      'best-practices'
    ];
  }

  /**
   * Review code for quality issues
   * @param {string} code - Code to review
   * @param {string} language - Language of the code
   * @param {Array<string>} categories - Review categories to focus on
   * @returns {Object} - Review result
   */
  reviewCode(code, language, categories = null) {
    language = language.toLowerCase();
    
    if (!this.reviewPatterns[language]) {
      throw new Error(`Unsupported language for review: ${language}`);
    }
    
    // If no categories specified, use all
    categories = categories || this.reviewCategories;
    
    const review = {
      language: language,
      categories: categories,
      comments: [],
      summary: '',
      metrics: {},
      timestamp: new Date()
    };
    
    // Analyze code for review comments
    const comments = this.analyzeCodeForReview(code, language, categories);
    review.comments = comments;
    
    // Generate review summary
    review.summary = this.generateReviewSummary(comments, code);
    
    // Calculate metrics
    review.metrics = this.calculateReviewMetrics(comments, code);
    
    return review;
  }

  /**
   * Analyze code for review comments
   * @param {string} code - Code to analyze
   * @param {string} language - Language of the code
   * @param {Array<string>} categories - Review categories to focus on
   * @returns {Array<Object>} - Review comments
   */
  analyzeCodeForReview(code, language, categories) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach with predefined patterns
    
    const comments = [];
    const patterns = this.reviewPatterns[language] || [];
    
    // Split code into lines for line-specific comments
    const lines = code.split('\n');
    
    // Check each pattern against the code
    for (const pattern of patterns) {
      // Skip if category not in requested categories
      if (!categories.includes(pattern.category)) {
        continue;
      }
      
      // Check for pattern matches
      if (pattern.lineRegex) {
        // Line-specific patterns
        for (let i = 0; i < lines.length; i++) {
          if (pattern.lineRegex.test(lines[i])) {
            comments.push({
              type: pattern.type,
              message: pattern.message,
              category: pattern.category,
              severity: pattern.severity,
              line: i + 1,
              suggestion: pattern.suggestion
            });
          }
        }
      } else if (pattern.regex && pattern.regex.test(code)) {
        // Full code patterns
        comments.push({
          type: pattern.type,
          message: pattern.message,
          category: pattern.category,
          severity: pattern.severity,
          line: this._findLineNumber(code, pattern.regex),
          suggestion: pattern.suggestion
        });
      }
    }
    
    // Sort comments by line number
    comments.sort((a, b) => a.line - b.line);
    
    return comments;
  }

  /**
   * Generate review summary based on comments
   * @param {Array<Object>} comments - Review comments
   * @param {string} code - Original code
   * @returns {string} - Review summary
   */
  generateReviewSummary(comments, code) {
    // Count issues by severity
    const severityCounts = {
      critical: 0,
      major: 0,
      minor: 0,
      info: 0
    };
    
    for (const comment of comments) {
      severityCounts[comment.severity]++;
    }
    
    // Count issues by category
    const categoryCounts = {};
    for (const comment of comments) {
      categoryCounts[comment.category] = (categoryCounts[comment.category] || 0) + 1;
    }
    
    // Generate summary text
    let summary = `Code Review Summary:\n`;
    summary += `Total issues found: ${comments.length}\n`;
    
    if (comments.length > 0) {
      summary += `\nIssues by severity:\n`;
      for (const [severity, count] of Object.entries(severityCounts)) {
        if (count > 0) {
          summary += `- ${severity}: ${count}\n`;
        }
      }
      
      summary += `\nIssues by category:\n`;
      for (const [category, count] of Object.entries(categoryCounts)) {
        summary += `- ${category}: ${count}\n`;
      }
      
      // Add top issues
      const criticalAndMajor = comments.filter(c => 
        c.severity === 'critical' || c.severity === 'major'
      );
      
      if (criticalAndMajor.length > 0) {
        summary += `\nTop issues to address:\n`;
        for (let i = 0; i < Math.min(3, criticalAndMajor.length); i++) {
          const issue = criticalAndMajor[i];
          summary += `- Line ${issue.line}: ${issue.message}\n`;
        }
      }
    } else {
      summary += `\nNo issues found. Great job!`;
    }
    
    return summary;
  }

  /**
   * Calculate review metrics
   * @param {Array<Object>} comments - Review comments
   * @param {string} code - Original code
   * @returns {Object} - Review metrics
   */
  calculateReviewMetrics(comments, code) {
    const lines = code.split('\n');
    
    // Calculate issue density
    const issueDensity = comments.length / lines.length;
    
    // Calculate severity score (weighted sum of issues)
    const severityWeights = {
      critical: 10,
      major: 5,
      minor: 2,
      info: 1
    };
    
    let severityScore = 0;
    for (const comment of comments) {
      severityScore += severityWeights[comment.severity] || 0;
    }
    
    // Calculate category distribution
    const categoryDistribution = {};
    for (const comment of comments) {
      categoryDistribution[comment.category] = 
        (categoryDistribution[comment.category] || 0) + 1;
    }
    
    // Calculate overall quality score (0-100)
    // Higher is better, penalize based on severity score
    const qualityScore = Math.max(0, 100 - (severityScore / lines.length) * 10);
    
    return {
      lineCount: lines.length,
      issueCount: comments.length,
      issueDensity: issueDensity,
      severityScore: severityScore,
      categoryDistribution: categoryDistribution,
      qualityScore: Math.round(qualityScore)
    };
  }

  /**
   * Find line number for a regex match in code
   * @param {string} code - Code to search
   * @param {RegExp} regex - Regular expression to match
   * @returns {number} - Line number (1-based)
   * @private
   */
  _findLineNumber(code, regex) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        return i + 1;
      }
    }
    return 1; // Default to first line if not found
  }

  /**
   * Get JavaScript review patterns
   * @returns {Array<Object>} - Review patterns
   * @private
   */
  _getJavaScriptReviewPatterns() {
    return [
      // Security patterns
      {
        type: 'security-eval',
        message: 'Avoid using eval() as it can lead to code injection vulnerabilities',
        category: 'security',
        severity: 'critical',
        lineRegex: /eval\s*\(/,
        suggestion: 'Use safer alternatives like Function constructor or JSON.parse()'
      },
      {
        type: 'security-innerhtml',
        message: 'Using innerHTML with user input can lead to XSS vulnerabilities',
        category: 'security',
        severity: 'critical',
        lineRegex: /\.innerHTML\s*=/,
        suggestion: 'Use textContent or DOM methods like createElement() and appendChild()'
      },
      
      // Performance patterns
      {
        type: 'performance-loop',
        message: 'Accessing array length in each iteration of a loop is inefficient',
        category: 'performance',
        severity: 'minor',
        lineRegex: /for\s*\(\s*\w+\s*=\s*\d+\s*;\s*\w+\s*<\s*\w+\.length\s*;/,
        suggestion: 'Cache the array length before the loop: const len = array.length'
      },
      {
        type: 'performance-dom',
        message: 'Multiple DOM manipulations can cause reflows and hurt performance',
        category: 'performance',
        severity: 'major',
        regex: /document\.getElementById\([^)]+\).*\n.*document\.getElementById\([^)]+\)/s,
        suggestion: 'Batch DOM operations or use DocumentFragment'
      },
      
      // Maintainability patterns
      {
        type: 'maintainability-function-size',
        message: 'Function is too large and complex, consider breaking it down',
        category: 'maintainability',
        severity: 'major',
        regex: /function\s+\w+\s*\([^)]*\)\s*\{[^}]{500,}\}/s,
        suggestion: 'Break down large functions into smaller, focused functions'
      },
      {
        type: 'maintainability-magic-number',
        message: 'Avoid using magic numbers',
        category: 'maintainability',
        severity: 'minor',
        lineRegex: /[=<>!]\s*[0-9]{4,}/,
        suggestion: 'Define constants with meaningful names for numeric values'
      },
      
      // Readability patterns
      {
        type: 'readability-naming',
        message: 'Variable name is too short or not descriptive',
        category: 'readability',
        severity: 'minor',
        lineRegex: /\b(var|let|const)\s+([a-z]{1,2})\b(?!\s*=\s*\/)/,
        suggestion: 'Use descriptive variable names that explain their purpose'
      },
      {
        type: 'readability-comments',
        message: 'Complex code should have explanatory comments',
        category: 'readability',
        severity: 'info',
        regex: /(?:if|for|while|switch)\s*\([^)]{40,}\)\s*\{[^}]{100,}\}/s,
        suggestion: 'Add comments to explain complex logic or business rules'
      },
      
      // Best practices patterns
      {
        type: 'best-practices-strict',
        message: 'Consider adding "use strict" directive',
        category: 'best-practices',
        severity: 'info',
        regex: /^(?!['"]use strict['"]).*function/m,
        suggestion: 'Add "use strict" at the top of your file or function'
      },
      {
        type: 'best-practices-console',
        message: 'Console statements should be removed in production code',
        category: 'best-practices',
        severity: 'minor',
        lineRegex: /console\.(log|debug|info|warn|error)/,
        suggestion: 'Remove console statements or use a logging library'
      }
    ];
  }

  /**
   * Get TypeScript review patterns
   * @returns {Array<Object>} - Review patterns
   * @private
   */
  _getTypeScriptReviewPatterns() {
    // TypeScript shares many patterns with JavaScript
    const jsPatterns = this._getJavaScriptReviewPatterns();
    
    // Add TypeScript-specific patterns
    return [
      ...jsPatterns,
      {
        type: 'best-practices-any',
        message: 'Avoid using "any" type as it defeats TypeScript\'s type checking',
        category: 'best-practices',
        severity: 'major',
        lineRegex: /:\s*any\b/,
        suggestion: 'Use more specific types or create interfaces/type aliases'
      },
      {
        type: 'best-practices-non-null',
        message: 'Non-null assertion operator (!) should be used sparingly',
        category: 'best-practices',
        severity: 'minor',
        lineRegex: /\w+!/,
        suggestion: 'Use proper null checking or optional chaining instead'
      },
      {
        type: 'maintainability-type-definition',
        message: 'Complex inline type definitions should be extracted',
        category: 'maintainability',
        severity: 'minor',
        lineRegex: /:\s*\{\s*[^}]{50,}\}/,
        suggestion: 'Extract complex types into interfaces or type aliases'
      }
    ];
  }

  /**
   * Get Python review patterns
   * @returns {Array<Object>} - Review patterns
   * @private
   */
  _getPythonReviewPatterns() {
    return [
      // Security patterns
      {
        type: 'security-exec',
        message: 'Avoid using exec() as it can lead to code injection vulnerabilities',
        category: 'security',
        severity: 'critical',
        lineRegex: /exec\s*\(/,
        suggestion: 'Use safer alternatives like ast.literal_eval() for evaluating expressions'
      },
      {
        type: 'security-sql-injection',
        message: 'Potential SQL injection vulnerability',
        category: 'security',
        severity: 'critical',
        lineRegex: /execute\s*\(\s*["'].*\s*\+/,
        suggestion: 'Use parameterized queries with placeholders'
      },
      
      // Performance patterns
      {
        type: 'performance-list-comprehension',
        message: 'Using a for loop to build a list is less efficient than list comprehension',
        category: 'performance',
        severity: 'minor',
        regex: /(\w+)\s*=\s*\[\]\s*\n\s*for\s+\w+\s+in\s+\w+\s*:\s*\n\s*\1\.append/s,
        suggestion: 'Use list comprehension: result = [x for x in items]'
      },
      {
        type: 'performance-string-concat',
        message: 'String concatenation in loops is inefficient',
        category: 'performance',
        severity: 'major',
        regex: /(\w+)\s*=\s*["']\s*\n\s*for\s+\w+\s+in\s+\w+\s*:\s*\n\s*\1\s*\+=/s,
        suggestion: 'Use join() method: result = "".join(items)'
      },
      
      // Maintainability patterns
      {
        type: 'maintainability-function-size',
        message: 'Function is too large and complex, consider breaking it down',
        category: 'maintainability',
        severity: 'major',
        regex: /def\s+\w+\s*\([^)]*\)\s*:\s*\n(?:\s+[^\n]+\n){20,}/s,
        suggestion: 'Break down large functions into smaller, focused functions'
      },
      {
        type: 'maintainability-magic-number',
        message: 'Avoid using magic numbers',
        category: 'maintainability',
        severity: 'minor',
        lineRegex: /[=<>!]=?\s*[0-9]{4,}/,
        suggestion: 'Define constants with meaningful names for numeric values'
      },
      
      // Readability patterns
      {
        type: 'readability-naming',
        message: 'Variable name is too short or not descriptive',
        category: 'readability',
        severity: 'minor',
        lineRegex: /\b([a-z]{1,2})\s*=/,
        suggestion: 'Use descriptive variable names that explain their purpose'
      },
      {
        type: 'readability-comments',
        message: 'Complex code should have explanatory comments',
        category: 'readability',
        severity: 'info',
        regex: /(?:if|for|while)\s+[^:]{40,}:\s*\n(?:\s+[^\n]+\n){10,}/s,
        suggestion: 'Add comments to explain complex logic or business rules'
      },
      
      // Best practices patterns
      {
        type: 'best-practices-docstring',
        message: 'Function is missing a docstring',
        category: 'best-practices',
        severity: 'minor',
        regex: /def\s+\w+\s*\([^)]*\)\s*:\s*\n\s+(?!["'])/,
        suggestion: 'Add a docstring to describe the function purpose, parameters, and return value'
      },
      {
        type: 'best-practices-exception',
        message: 'Bare except clause should be avoided',
        category: 'best-practices',
        severity: 'major',
        lineRegex: /except\s*:/,
        suggestion: 'Specify the exceptions you want to catch: except ValueError:'
      }
    ];
  }
}

module.exports = CodeReviewer;