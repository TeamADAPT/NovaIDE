/**
 * codeRefactorer.js
 * Code refactoring functionality for CoderAgent
 */

/**
 * CodeRefactorer class for analyzing and refactoring code
 */
class CodeRefactorer {
  /**
   * Create a new CodeRefactorer instance
   */
  constructor() {
    this.refactoringPatterns = {
      javascript: this._getJavaScriptRefactoringPatterns(),
      typescript: this._getTypeScriptRefactoringPatterns(),
      python: this._getPythonRefactoringPatterns()
    };
  }

  /**
   * Refactor code based on quality requirements
   * @param {string} code - Code to refactor
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Refactoring goals
   * @returns {Object} - Refactoring result
   */
  refactorCode(code, language, goals = ['readability', 'maintainability']) {
    language = language.toLowerCase();
    
    if (!this.refactoringPatterns[language]) {
      throw new Error(`Unsupported language for refactoring: ${language}`);
    }
    
    const refactoring = {
      original: code,
      refactored: '',
      language: language,
      goals: goals,
      improvements: [],
      metrics: {},
      timestamp: new Date()
    };
    
    // Analyze code for refactoring opportunities
    const refactoringOpportunities = this.analyzeCodeForRefactoring(code, language, goals);
    
    // Apply refactorings
    let refactoredCode = code;
    for (const opportunity of refactoringOpportunities) {
      refactoredCode = this.applyRefactoring(refactoredCode, opportunity);
      refactoring.improvements.push(opportunity);
    }
    
    refactoring.refactored = refactoredCode;
    
    // Calculate metrics
    refactoring.metrics = {
      originalComplexity: this._calculateComplexity(code),
      refactoredComplexity: this._calculateComplexity(refactoredCode),
      improvementCount: refactoringOpportunities.length
    };
    
    return refactoring;
  }

  /**
   * Analyze code for refactoring opportunities
   * @param {string} code - Code to analyze
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Refactoring goals
   * @returns {Array<Object>} - Refactoring opportunities
   */
  analyzeCodeForRefactoring(code, language, goals) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach with predefined patterns
    
    const opportunities = [];
    const patterns = this.refactoringPatterns[language] || [];
    
    for (const pattern of patterns) {
      if (goals.includes(pattern.goal) && pattern.regex.test(code)) {
        opportunities.push({
          type: pattern.type,
          description: pattern.description,
          original: pattern.original,
          suggested: pattern.suggested,
          priority: pattern.priority,
          goal: pattern.goal
        });
      }
    }
    
    return opportunities;
  }

  /**
   * Apply refactoring to code
   * @param {string} code - Code to refactor
   * @param {Object} refactoring - Refactoring to apply
   * @returns {string} - Refactored code
   */
  applyRefactoring(code, refactoring) {
    // This would be where LLM integration happens for more sophisticated transformations
    // For MVP, we'll use a simple approach with string replacement
    
    let refactoredCode = code;
    
    if (refactoring.original && refactoring.suggested) {
      // Simple replacement for demo purposes
      // In a real implementation, this would be more sophisticated
      refactoredCode = code.replace(refactoring.original, refactoring.suggested);
    }
    
    return refactoredCode;
  }

  /**
   * Calculate code complexity
   * @param {string} code - Code to analyze
   * @returns {number} - Complexity score
   * @private
   */
  _calculateComplexity(code) {
    // This is a very simplified complexity calculation
    // In a real implementation, this would be more sophisticated
    
    // Count control structures as a simple proxy for complexity
    const controlStructures = [
      /if\s*\(/g,
      /else\s*\{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /try\s*\{/g,
      /catch\s*\(/g
    ];
    
    let complexity = 0;
    
    for (const pattern of controlStructures) {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    // Count function declarations
    const functionMatches = code.match(/function\s+\w+\s*\(/g);
    if (functionMatches) {
      complexity += functionMatches.length;
    }
    
    return complexity;
  }

  /**
   * Get JavaScript refactoring patterns
   * @returns {Array<Object>} - Refactoring patterns
   * @private
   */
  _getJavaScriptRefactoringPatterns() {
    return [
      {
        type: 'extract-function',
        description: 'Extract repeated code into a function',
        original: '// Repeated code block',
        suggested: 'function extractedFunction() { /* repeated code */ }',
        regex: /(.{20,})\s*\n(?:.*\n)*?\s*\1/,
        priority: 'high',
        goal: 'maintainability'
      },
      {
        type: 'rename-variable',
        description: 'Rename unclear variable to more descriptive name',
        original: 'const x = ',
        suggested: 'const descriptiveName = ',
        regex: /const\s+([a-z]|[A-Z])\s*=/,
        priority: 'medium',
        goal: 'readability'
      },
      {
        type: 'simplify-conditional',
        description: 'Simplify complex conditional expression',
        original: 'if (condition1 && condition2 && condition3)',
        suggested: 'const isValid = condition1 && condition2 && condition3;\nif (isValid)',
        regex: /if\s*\(\s*\w+\s*&&\s*\w+\s*&&\s*\w+/,
        priority: 'medium',
        goal: 'readability'
      },
      {
        type: 'use-destructuring',
        description: 'Use object destructuring for cleaner code',
        original: 'const name = person.name; const age = person.age;',
        suggested: 'const { name, age } = person;',
        regex: /const\s+(\w+)\s*=\s*(\w+)\.(\w+);\s*const\s+(\w+)\s*=\s*\2\.\w+/,
        priority: 'low',
        goal: 'readability'
      },
      {
        type: 'use-template-literals',
        description: 'Use template literals instead of string concatenation',
        original: 'const message = "Hello, " + name + "!";',
        suggested: 'const message = `Hello, ${name}!`;',
        regex: /const\s+\w+\s*=\s*["'].*['"]\s*\+\s*\w+\s*\+\s*["'].*["']/,
        priority: 'low',
        goal: 'readability'
      }
    ];
  }

  /**
   * Get TypeScript refactoring patterns
   * @returns {Array<Object>} - Refactoring patterns
   * @private
   */
  _getTypeScriptRefactoringPatterns() {
    // TypeScript shares many patterns with JavaScript
    const jsPatterns = this._getJavaScriptRefactoringPatterns();
    
    // Add TypeScript-specific patterns
    return [
      ...jsPatterns,
      {
        type: 'add-interface',
        description: 'Extract interface from object structure',
        original: 'function process(obj: { name: string, age: number })',
        suggested: 'interface Person { name: string; age: number; }\nfunction process(obj: Person)',
        regex: /function\s+\w+\s*\(\s*\w+\s*:\s*\{\s*\w+\s*:\s*\w+\s*,\s*\w+\s*:\s*\w+\s*\}\s*\)/,
        priority: 'medium',
        goal: 'maintainability'
      },
      {
        type: 'use-type-alias',
        description: 'Use type alias for complex types',
        original: 'function process(handler: (item: string, index: number) => boolean)',
        suggested: 'type ItemHandler = (item: string, index: number) => boolean;\nfunction process(handler: ItemHandler)',
        regex: /function\s+\w+\s*\(\s*\w+\s*:\s*\(\s*\w+\s*:\s*\w+\s*,\s*\w+\s*:\s*\w+\s*\)\s*=>\s*\w+\s*\)/,
        priority: 'medium',
        goal: 'readability'
      }
    ];
  }

  /**
   * Get Python refactoring patterns
   * @returns {Array<Object>} - Refactoring patterns
   * @private
   */
  _getPythonRefactoringPatterns() {
    return [
      {
        type: 'extract-function',
        description: 'Extract repeated code into a function',
        original: '# Repeated code block',
        suggested: 'def extracted_function():\n    # repeated code',
        regex: /(.{20,})\s*\n(?:.*\n)*?\s*\1/,
        priority: 'high',
        goal: 'maintainability'
      },
      {
        type: 'rename-variable',
        description: 'Rename unclear variable to more descriptive name',
        original: 'x = ',
        suggested: 'descriptive_name = ',
        regex: /\b([a-z]|[A-Z])\s*=/,
        priority: 'medium',
        goal: 'readability'
      },
      {
        type: 'use-list-comprehension',
        description: 'Use list comprehension for cleaner code',
        original: 'result = []\nfor item in items:\n    result.append(item * 2)',
        suggested: 'result = [item * 2 for item in items]',
        regex: /(\w+)\s*=\s*\[\]\s*\n\s*for\s+(\w+)\s+in\s+(\w+):\s*\n\s*\1\.append\s*\(\s*\2/,
        priority: 'medium',
        goal: 'readability'
      },
      {
        type: 'use-f-strings',
        description: 'Use f-strings instead of string concatenation or format',
        original: 'message = "Hello, " + name + "!"',
        suggested: 'message = f"Hello, {name}!"',
        regex: /(\w+)\s*=\s*["'].*['"]\s*\+\s*\w+\s*\+\s*["'].*["']/,
        priority: 'low',
        goal: 'readability'
      },
      {
        type: 'use-with-statement',
        description: 'Use with statement for resource management',
        original: 'file = open(filename, "r")\n# file operations\nfile.close()',
        suggested: 'with open(filename, "r") as file:\n    # file operations',
        regex: /(\w+)\s*=\s*open\s*\(\s*(\w+)\s*,\s*["']r["']\s*\).*\n.*\n.*\1\.close\s*\(\s*\)/s,
        priority: 'high',
        goal: 'maintainability'
      }
    ];
  }
}

module.exports = CodeRefactorer;