/**
 * codeDebugger.js
 * Code debugging functionality for CoderAgent
 */

/**
 * CodeDebugger class for analyzing and debugging code
 */
class CodeDebugger {
  /**
   * Create a new CodeDebugger instance
   */
  constructor() {
    this.debugPatterns = {
      javascript: this._getJavaScriptDebugPatterns(),
      typescript: this._getTypeScriptDebugPatterns(),
      python: this._getPythonDebugPatterns()
    };
  }

  /**
   * Debug code based on error information
   * @param {string} code - Code to debug
   * @param {string} language - Language of the code
   * @param {Object} errorInfo - Error information (optional)
   * @returns {Object} - Debugging result
   */
  debugCode(code, language, errorInfo = null) {
    language = language.toLowerCase();
    
    if (!this.debugPatterns[language]) {
      throw new Error(`Unsupported language for debugging: ${language}`);
    }
    
    const debugging = {
      original: code,
      debugged: '',
      language: language,
      issues: [],
      suggestions: [],
      timestamp: new Date()
    };
    
    // Analyze code for potential issues
    const issues = this.analyzeCodeForIssues(code, language, errorInfo);
    debugging.issues = issues;
    
    // Generate debugging suggestions
    const suggestions = this.generateDebuggingSuggestions(code, issues, language);
    debugging.suggestions = suggestions;
    
    // Apply fixes if possible
    let debuggedCode = code;
    for (const suggestion of suggestions) {
      if (suggestion.autoFix) {
        debuggedCode = this.applyDebugFix(debuggedCode, suggestion);
      }
    }
    
    debugging.debugged = debuggedCode;
    
    return debugging;
  }

  /**
   * Analyze code for potential issues
   * @param {string} code - Code to analyze
   * @param {string} language - Language of the code
   * @param {Object} errorInfo - Error information (optional)
   * @returns {Array<Object>} - Identified issues
   */
  analyzeCodeForIssues(code, language, errorInfo = null) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach with predefined patterns
    
    const issues = [];
    const patterns = this.debugPatterns[language] || [];
    
    // If we have specific error information, prioritize patterns related to that error
    if (errorInfo) {
      for (const pattern of patterns) {
        if (pattern.errorType === errorInfo.type && pattern.regex.test(code)) {
          issues.push({
            type: pattern.type,
            description: pattern.description,
            lineNumber: this._findLineNumber(code, pattern.regex),
            severity: pattern.severity,
            errorType: pattern.errorType,
            confidence: 'high'
          });
        }
      }
    }
    
    // General pattern matching for potential issues
    for (const pattern of patterns) {
      if (pattern.regex.test(code)) {
        // Avoid duplicates
        if (!issues.some(issue => issue.type === pattern.type)) {
          issues.push({
            type: pattern.type,
            description: pattern.description,
            lineNumber: this._findLineNumber(code, pattern.regex),
            severity: pattern.severity,
            errorType: pattern.errorType,
            confidence: errorInfo ? 'medium' : 'low'
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Generate debugging suggestions based on identified issues
   * @param {string} code - Original code
   * @param {Array<Object>} issues - Identified issues
   * @param {string} language - Language of the code
   * @returns {Array<Object>} - Debugging suggestions
   */
  generateDebuggingSuggestions(code, issues, language) {
    const suggestions = [];
    
    for (const issue of issues) {
      const pattern = this._findPatternByType(this.debugPatterns[language], issue.type);
      
      if (pattern) {
        suggestions.push({
          issueType: issue.type,
          description: `Fix ${issue.description}`,
          original: pattern.original,
          suggested: pattern.suggested,
          lineNumber: issue.lineNumber,
          autoFix: pattern.autoFix || false,
          confidence: issue.confidence
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Apply debugging fix to code
   * @param {string} code - Code to fix
   * @param {Object} suggestion - Debugging suggestion
   * @returns {string} - Fixed code
   */
  applyDebugFix(code, suggestion) {
    // This would be where LLM integration happens for more sophisticated fixes
    // For MVP, we'll use a simple approach with string replacement
    
    let fixedCode = code;
    
    if (suggestion.original && suggestion.suggested) {
      // Simple replacement for demo purposes
      // In a real implementation, this would be more sophisticated
      fixedCode = code.replace(suggestion.original, suggestion.suggested);
    }
    
    return fixedCode;
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
    return 0;
  }

  /**
   * Find pattern by type
   * @param {Array<Object>} patterns - Patterns to search
   * @param {string} type - Pattern type to find
   * @returns {Object|null} - Found pattern or null
   * @private
   */
  _findPatternByType(patterns, type) {
    return patterns.find(pattern => pattern.type === type) || null;
  }

  /**
   * Get JavaScript debugging patterns
   * @returns {Array<Object>} - Debugging patterns
   * @private
   */
  _getJavaScriptDebugPatterns() {
    return [
      {
        type: 'undefined-variable',
        description: 'reference to undefined variable',
        original: /\b(\w+)\b(?!\s*[:=])/,
        suggested: 'let $1',
        regex: /ReferenceError:\s+(\w+)\s+is\s+not\s+defined/,
        severity: 'error',
        errorType: 'ReferenceError',
        autoFix: false
      },
      {
        type: 'type-error',
        description: 'calling a non-function',
        original: /(\w+)\(\)/,
        suggested: '// Check if $1 is a function before calling it\nif (typeof $1 === "function") {\n  $1();\n}',
        regex: /TypeError:\s+(\w+)\s+is\s+not\s+a\s+function/,
        severity: 'error',
        errorType: 'TypeError',
        autoFix: false
      },
      {
        type: 'syntax-error',
        description: 'missing closing parenthesis',
        original: /\(\w+/,
        suggested: '($1)',
        regex: /SyntaxError:\s+.*\)/,
        severity: 'error',
        errorType: 'SyntaxError',
        autoFix: false
      },
      {
        type: 'null-undefined-access',
        description: 'accessing property of null or undefined',
        original: /(\w+)\.(\w+)/,
        suggested: '$1 && $1.$2',
        regex: /TypeError:\s+Cannot\s+read\s+propert.*of\s+(null|undefined)/,
        severity: 'error',
        errorType: 'TypeError',
        autoFix: true
      },
      {
        type: 'async-await-missing',
        description: 'missing await for async function',
        original: /(\w+)\(\)/,
        suggested: 'await $1()',
        regex: /(\w+)\(\).*Promise/,
        severity: 'warning',
        errorType: 'Promise',
        autoFix: true
      }
    ];
  }

  /**
   * Get TypeScript debugging patterns
   * @returns {Array<Object>} - Debugging patterns
   * @private
   */
  _getTypeScriptDebugPatterns() {
    // TypeScript shares many patterns with JavaScript
    const jsPatterns = this._getJavaScriptDebugPatterns();
    
    // Add TypeScript-specific patterns
    return [
      ...jsPatterns,
      {
        type: 'type-mismatch',
        description: 'type mismatch in assignment',
        original: /(\w+):\s*(\w+)\s*=\s*(\w+)/,
        suggested: '$1: $2 = $3 as $2',
        regex: /Type\s+'(\w+)'\s+is\s+not\s+assignable\s+to\s+type\s+'(\w+)'/,
        severity: 'error',
        errorType: 'TypeError',
        autoFix: true
      },
      {
        type: 'missing-property',
        description: 'accessing non-existent property',
        original: /(\w+)\.(\w+)/,
        suggested: '// Ensure $2 exists on $1\n($1 as any).$2',
        regex: /Property\s+'(\w+)'\s+does\s+not\s+exist\s+on\s+type\s+'(\w+)'/,
        severity: 'error',
        errorType: 'TypeError',
        autoFix: false
      }
    ];
  }

  /**
   * Get Python debugging patterns
   * @returns {Array<Object>} - Debugging patterns
   * @private
   */
  _getPythonDebugPatterns() {
    return [
      {
        type: 'name-error',
        description: 'reference to undefined variable',
        original: /\b(\w+)\b/,
        suggested: '# Define $1 before using it\n$1 = None',
        regex: /NameError:\s+name\s+'(\w+)'\s+is\s+not\s+defined/,
        severity: 'error',
        errorType: 'NameError',
        autoFix: false
      },
      {
        type: 'type-error',
        description: 'operation on incompatible types',
        original: /(\w+)\s*\+\s*(\w+)/,
        suggested: 'str($1) + str($2)  # Convert to same type',
        regex: /TypeError:\s+can't\s+concat\s+(\w+)\s+to\s+(\w+)/,
        severity: 'error',
        errorType: 'TypeError',
        autoFix: true
      },
      {
        type: 'index-error',
        description: 'index out of range',
        original: /(\w+)\[(\w+)\]/,
        suggested: 'if $2 < len($1):\n    $1[$2]',
        regex: /IndexError:\s+list\s+index\s+out\s+of\s+range/,
        severity: 'error',
        errorType: 'IndexError',
        autoFix: true
      },
      {
        type: 'key-error',
        description: 'accessing non-existent dictionary key',
        original: /(\w+)\[['"](\w+)['"]\]/,
        suggested: '$1.get("$2")  # Use get() to avoid KeyError',
        regex: /KeyError:\s+'(\w+)'/,
        severity: 'error',
        errorType: 'KeyError',
        autoFix: true
      },
      {
        type: 'indentation-error',
        description: 'inconsistent indentation',
        original: /^(\s+)(\w+)/m,
        suggested: '    $2  # Use consistent indentation',
        regex: /IndentationError:/,
        severity: 'error',
        errorType: 'IndentationError',
        autoFix: false
      }
    ];
  }
}

module.exports = CodeDebugger;