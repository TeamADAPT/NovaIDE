/**
 * codeOptimizer.js
 * Code optimization functionality for CoderAgent
 */

/**
 * CodeOptimizer class for analyzing and optimizing code
 */
class CodeOptimizer {
  /**
   * Create a new CodeOptimizer instance
   */
  constructor() {
    this.optimizationPatterns = {
      javascript: this._getJavaScriptOptimizationPatterns(),
      typescript: this._getTypeScriptOptimizationPatterns(),
      python: this._getPythonOptimizationPatterns()
    };
  }

  /**
   * Optimize code based on performance requirements
   * @param {string} code - Code to optimize
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Optimization goals
   * @returns {Object} - Optimization result
   */
  optimizeCode(code, language, goals = ['performance', 'memory']) {
    language = language.toLowerCase();
    
    if (!this.optimizationPatterns[language]) {
      throw new Error(`Unsupported language for optimization: ${language}`);
    }
    
    const optimization = {
      original: code,
      optimized: '',
      language: language,
      goals: goals,
      improvements: [],
      metrics: {},
      timestamp: new Date()
    };
    
    // Analyze code for optimization opportunities
    const optimizationOpportunities = this.analyzeCodeForOptimization(code, language, goals);
    
    // Apply optimizations
    let optimizedCode = code;
    for (const opportunity of optimizationOpportunities) {
      optimizedCode = this.applyOptimization(optimizedCode, opportunity);
      optimization.improvements.push(opportunity);
    }
    
    optimization.optimized = optimizedCode;
    
    // Calculate metrics
    optimization.metrics = {
      originalSize: code.length,
      optimizedSize: optimizedCode.length,
      sizeReduction: code.length - optimizedCode.length,
      improvementCount: optimizationOpportunities.length
    };
    
    return optimization;
  }

  /**
   * Analyze code for optimization opportunities
   * @param {string} code - Code to analyze
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Optimization goals
   * @returns {Array<Object>} - Optimization opportunities
   */
  analyzeCodeForOptimization(code, language, goals) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach with predefined patterns
    
    const opportunities = [];
    const patterns = this.optimizationPatterns[language] || [];
    
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
   * Apply optimization to code
   * @param {string} code - Code to optimize
   * @param {Object} optimization - Optimization to apply
   * @returns {string} - Optimized code
   */
  applyOptimization(code, optimization) {
    // This would be where LLM integration happens for more sophisticated transformations
    // For MVP, we'll use a simple approach with string replacement
    
    let optimizedCode = code;
    
    if (optimization.original && optimization.suggested) {
      // Simple replacement for demo purposes
      // In a real implementation, this would be more sophisticated
      optimizedCode = code.replace(optimization.original, optimization.suggested);
    }
    
    return optimizedCode;
  }

  /**
   * Get JavaScript optimization patterns
   * @returns {Array<Object>} - Optimization patterns
   * @private
   */
  _getJavaScriptOptimizationPatterns() {
    return [
      {
        type: 'loop-optimization',
        description: 'Replace traditional for loop with for...of loop for better readability and performance',
        original: 'for (let i = 0; i < array.length; i++)',
        suggested: 'for (const item of array)',
        regex: /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*array\.length\s*;\s*i\+\+\s*\)/,
        priority: 'medium',
        goal: 'performance'
      },
      {
        type: 'property-caching',
        description: 'Cache repeated property access in a local variable',
        original: 'obj.prop ... obj.prop',
        suggested: 'const prop = obj.prop; ... prop',
        regex: /(\w+)\.(\w+).*\1\.\2/s,
        priority: 'medium',
        goal: 'performance'
      },
      {
        type: 'string-concatenation',
        description: 'Use array join instead of string concatenation in loops',
        original: 'let str = ""; for (...) { str += item; }',
        suggested: 'const parts = []; for (...) { parts.push(item); } const str = parts.join("");',
        regex: /let\s+(\w+)\s*=\s*["'].*for\s*\(.*\)\s*\{\s*\1\s*\+=/s,
        priority: 'high',
        goal: 'performance'
      },
      {
        type: 'memory-leak',
        description: 'Potential memory leak with event listeners not being removed',
        original: 'element.addEventListener("click", handler)',
        suggested: 'element.addEventListener("click", handler); // Add: element.removeEventListener("click", handler) when done',
        regex: /addEventListener\s*\(\s*["'](\w+)["']\s*,\s*(\w+)/,
        priority: 'high',
        goal: 'memory'
      }
    ];
  }

  /**
   * Get TypeScript optimization patterns
   * @returns {Array<Object>} - Optimization patterns
   * @private
   */
  _getTypeScriptOptimizationPatterns() {
    // TypeScript shares many patterns with JavaScript
    const jsPatterns = this._getJavaScriptOptimizationPatterns();
    
    // Add TypeScript-specific patterns
    return [
      ...jsPatterns,
      {
        type: 'type-narrowing',
        description: 'Use type guards for better type narrowing',
        original: 'if (typeof obj === "string")',
        suggested: 'function isString(obj: any): obj is string { return typeof obj === "string"; } if (isString(obj))',
        regex: /if\s*\(\s*typeof\s+(\w+)\s*===\s*["'](\w+)["']\s*\)/,
        priority: 'medium',
        goal: 'performance'
      }
    ];
  }

  /**
   * Get Python optimization patterns
   * @returns {Array<Object>} - Optimization patterns
   * @private
   */
  _getPythonOptimizationPatterns() {
    return [
      {
        type: 'loop-optimization',
        description: 'Replace range(len()) loop with direct iteration',
        original: 'for i in range(len(array)): ... array[i]',
        suggested: 'for item in array: ... item',
        regex: /for\s+\w+\s+in\s+range\s*\(\s*len\s*\(\s*(\w+)\s*\)\s*\)\s*:/,
        priority: 'medium',
        goal: 'performance'
      },
      {
        type: 'property-caching',
        description: 'Cache repeated property access in a local variable',
        original: 'obj.prop ... obj.prop',
        suggested: 'prop = obj.prop; ... prop',
        regex: /(\w+)\.(\w+).*\1\.\2/s,
        priority: 'medium',
        goal: 'performance'
      },
      {
        type: 'string-concatenation',
        description: 'Use list comprehension and join instead of string concatenation in loops',
        original: 'result = ""; for item in items: result += item',
        suggested: 'result = "".join([item for item in items])',
        regex: /(\w+)\s*=\s*["'].*for\s+\w+\s+in\s+\w+\s*:\s*\1\s*\+=/s,
        priority: 'high',
        goal: 'performance'
      },
      {
        type: 'list-comprehension',
        description: 'Use list comprehension instead of for loop for list creation',
        original: 'result = []; for item in items: result.append(f(item))',
        suggested: 'result = [f(item) for item in items]',
        regex: /(\w+)\s*=\s*\[\]\s*;?\s*for\s+(\w+)\s+in\s+(\w+)\s*:\s*\1\.append\s*\(/s,
        priority: 'medium',
        goal: 'performance'
      }
    ];
  }
}

module.exports = CodeOptimizer;