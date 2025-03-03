/**
 * languageManager.js
 * Manages language-specific code generation for CoderAgent
 */

const javascriptImplementation = require('./javascriptImplementation');
const typescriptImplementation = require('./typescriptImplementation');
const pythonImplementation = require('./pythonImplementation');

/**
 * Language Manager class for handling language-specific code generation
 */
class LanguageManager {
  /**
   * Create a new LanguageManager instance
   */
  constructor() {
    this.supportedLanguages = ['javascript', 'typescript', 'python'];
    this.implementations = {
      javascript: javascriptImplementation,
      typescript: typescriptImplementation,
      python: pythonImplementation
    };
  }

  /**
   * Check if a language is supported
   * @param {string} language - Language to check
   * @returns {boolean} - Whether the language is supported
   */
  isLanguageSupported(language) {
    return this.supportedLanguages.includes(language.toLowerCase());
  }

  /**
   * Generate component implementation in the specified language
   * @param {Object} component - Component data
   * @param {string} language - Target language
   * @returns {Array<Object>} - Array of file objects
   */
  generateComponentImplementation(component, language) {
    language = language.toLowerCase();
    
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    switch (language) {
      case 'javascript':
        return this.implementations.javascript.generateJavaScriptImplementation(component);
      case 'typescript':
        return this.implementations.typescript.generateTypeScriptImplementation(component);
      case 'python':
        return this.implementations.python.generatePythonImplementation(component);
      default:
        throw new Error(`Implementation not found for language: ${language}`);
    }
  }

  /**
   * Generate interface implementation in the specified language
   * @param {Object} iface - Interface data
   * @param {string} language - Target language
   * @returns {Array<Object>} - Array of file objects
   */
  generateInterfaceImplementation(iface, language) {
    language = language.toLowerCase();
    
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    switch (language) {
      case 'javascript':
        return this.implementations.javascript.generateJavaScriptInterface(iface);
      case 'typescript':
        return this.implementations.typescript.generateTypeScriptInterface(iface);
      case 'python':
        return this.implementations.python.generatePythonInterface(iface);
      default:
        throw new Error(`Implementation not found for language: ${language}`);
    }
  }

  /**
   * Get the default test framework for a language
   * @param {string} language - Target language
   * @returns {string} - Default test framework
   */
  getDefaultTestFramework(language) {
    language = language.toLowerCase();
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        return 'jest';
      case 'python':
        return 'pytest';
      default:
        return 'jest';
    }
  }
}

module.exports = LanguageManager;