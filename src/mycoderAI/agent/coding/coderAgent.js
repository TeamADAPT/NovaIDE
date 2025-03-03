/**
 * coderAgent.js
 * Refactored CoderAgent implementation with modular architecture
 */

const Agent = require('../agent');
const LanguageManager = require('./languages/languageManager');
const CodeOptimizer = require('./optimization/codeOptimizer');
const CodeRefactorer = require('./refactoring/codeRefactorer');
const CodeDebugger = require('./debugging/codeDebugger');
const CodeReviewer = require('./review/codeReviewer');

/**
 * CoderAgent class for code generation, optimization, refactoring, debugging, and review
 * @extends Agent
 */
class CoderAgent extends Agent {
  /**
   * Create a new CoderAgent instance
   * @param {Object} config - Agent configuration
   */
  constructor(config = {}) {
    super({
      ...config,
      type: 'coder',
      name: config.name || 'CoderAgent',
      description: 'Specialized agent for code generation and manipulation'
    });

    // Initialize sub-components
    this.languageManager = new LanguageManager();
    this.codeOptimizer = new CodeOptimizer();
    this.codeRefactorer = new CodeRefactorer();
    this.codeDebugger = new CodeDebugger();
    this.codeReviewer = new CodeReviewer();
    
    // Track current project context
    this.currentProject = null;
    this.currentLanguage = config.defaultLanguage || 'javascript';
    this.supportedLanguages = this.languageManager.supportedLanguages;
    
    // Register message handlers
    this.registerMessageHandlers();
  }

  /**
   * Register message handlers for CoderAgent
   */
  registerMessageHandlers() {
    // Code generation handlers
    this.registerHandler('generate_component', this.handleGenerateComponent.bind(this));
    this.registerHandler('generate_interface', this.handleGenerateInterface.bind(this));
    
    // Code optimization handlers
    this.registerHandler('optimize_code', this.handleOptimizeCode.bind(this));
    
    // Code refactoring handlers
    this.registerHandler('refactor_code', this.handleRefactorCode.bind(this));
    
    // Code debugging handlers
    this.registerHandler('debug_code', this.handleDebugCode.bind(this));
    
    // Code review handlers
    this.registerHandler('review_code', this.handleReviewCode.bind(this));
    
    // Project context handlers
    this.registerHandler('set_project_context', this.handleSetProjectContext.bind(this));
    this.registerHandler('set_language', this.handleSetLanguage.bind(this));
  }

  /**
   * Handle generate component message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleGenerateComponent(message) {
    try {
      const { component, language = this.currentLanguage } = message.data;
      
      if (!component) {
        return this.createErrorResponse(message, 'Component data is required');
      }
      
      if (!this.languageManager.isLanguageSupported(language)) {
        return this.createErrorResponse(message, `Unsupported language: ${language}`);
      }
      
      const files = this.languageManager.generateComponentImplementation(component, language);
      
      return this.createResponse(message, {
        success: true,
        files,
        language,
        component: component.name
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle generate interface message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleGenerateInterface(message) {
    try {
      const { interface: iface, language = this.currentLanguage } = message.data;
      
      if (!iface) {
        return this.createErrorResponse(message, 'Interface data is required');
      }
      
      if (!this.languageManager.isLanguageSupported(language)) {
        return this.createErrorResponse(message, `Unsupported language: ${language}`);
      }
      
      const files = this.languageManager.generateInterfaceImplementation(iface, language);
      
      return this.createResponse(message, {
        success: true,
        files,
        language,
        interface: iface.name
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle optimize code message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleOptimizeCode(message) {
    try {
      const { code, language = this.currentLanguage, goals } = message.data;
      
      if (!code) {
        return this.createErrorResponse(message, 'Code is required');
      }
      
      const optimization = this.codeOptimizer.optimizeCode(code, language, goals);
      
      return this.createResponse(message, {
        success: true,
        optimization
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle refactor code message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleRefactorCode(message) {
    try {
      const { code, language = this.currentLanguage, goals } = message.data;
      
      if (!code) {
        return this.createErrorResponse(message, 'Code is required');
      }
      
      const refactoring = this.codeRefactorer.refactorCode(code, language, goals);
      
      return this.createResponse(message, {
        success: true,
        refactoring
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle debug code message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleDebugCode(message) {
    try {
      const { code, language = this.currentLanguage, errorInfo } = message.data;
      
      if (!code) {
        return this.createErrorResponse(message, 'Code is required');
      }
      
      const debugging = this.codeDebugger.debugCode(code, language, errorInfo);
      
      return this.createResponse(message, {
        success: true,
        debugging
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle review code message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleReviewCode(message) {
    try {
      const { code, language = this.currentLanguage, categories } = message.data;
      
      if (!code) {
        return this.createErrorResponse(message, 'Code is required');
      }
      
      const review = this.codeReviewer.reviewCode(code, language, categories);
      
      return this.createResponse(message, {
        success: true,
        review
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle set project context message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleSetProjectContext(message) {
    try {
      const { project } = message.data;
      
      if (!project) {
        return this.createErrorResponse(message, 'Project data is required');
      }
      
      this.currentProject = project;
      
      // If project has a default language, set it
      if (project.language && this.languageManager.isLanguageSupported(project.language)) {
        this.currentLanguage = project.language;
      }
      
      return this.createResponse(message, {
        success: true,
        project: this.currentProject,
        language: this.currentLanguage
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Handle set language message
   * @param {Object} message - Message data
   * @returns {Promise<Object>} - Response message
   */
  async handleSetLanguage(message) {
    try {
      const { language } = message.data;
      
      if (!language) {
        return this.createErrorResponse(message, 'Language is required');
      }
      
      if (!this.languageManager.isLanguageSupported(language)) {
        return this.createErrorResponse(message, `Unsupported language: ${language}`);
      }
      
      this.currentLanguage = language;
      
      return this.createResponse(message, {
        success: true,
        language: this.currentLanguage
      });
    } catch (error) {
      return this.createErrorResponse(message, error.message);
    }
  }

  /**
   * Generate code for a component
   * @param {Object} component - Component data
   * @param {string} language - Target language
   * @returns {Promise<Array<Object>>} - Generated files
   */
  async generateCode(component, language = this.currentLanguage) {
    if (!this.languageManager.isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    return this.languageManager.generateComponentImplementation(component, language);
  }

  /**
   * Optimize code for performance
   * @param {string} code - Code to optimize
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Optimization goals
   * @returns {Promise<Object>} - Optimization result
   */
  async optimizeCode(code, language = this.currentLanguage, goals = ['performance', 'memory']) {
    return this.codeOptimizer.optimizeCode(code, language, goals);
  }

  /**
   * Refactor code for better quality
   * @param {string} code - Code to refactor
   * @param {string} language - Language of the code
   * @param {Array<string>} goals - Refactoring goals
   * @returns {Promise<Object>} - Refactoring result
   */
  async refactorCode(code, language = this.currentLanguage, goals = ['readability', 'maintainability']) {
    return this.codeRefactorer.refactorCode(code, language, goals);
  }

  /**
   * Debug code to find and fix issues
   * @param {string} code - Code to debug
   * @param {string} language - Language of the code
   * @param {Object} errorInfo - Error information (optional)
   * @returns {Promise<Object>} - Debugging result
   */
  async debugCode(code, language = this.currentLanguage, errorInfo = null) {
    return this.codeDebugger.debugCode(code, language, errorInfo);
  }

  /**
   * Review code for quality issues
   * @param {string} code - Code to review
   * @param {string} language - Language of the code
   * @param {Array<string>} categories - Review categories
   * @returns {Promise<Object>} - Review result
   */
  async reviewCode(code, language = this.currentLanguage, categories = null) {
    return this.codeReviewer.reviewCode(code, language, categories);
  }

  /**
   * Create error response message
   * @param {Object} originalMessage - Original message
   * @param {string} errorMessage - Error message
   * @returns {Object} - Error response message
   */
  createErrorResponse(originalMessage, errorMessage) {
    return {
      type: 'response',
      id: this.generateId(),
      replyTo: originalMessage.id,
      from: this.name,
      to: originalMessage.from,
      data: {
        success: false,
        error: errorMessage
      },
      timestamp: new Date()
    };
  }

  /**
   * Create response message
   * @param {Object} originalMessage - Original message
   * @param {Object} data - Response data
   * @returns {Object} - Response message
   */
  createResponse(originalMessage, data) {
    return {
      type: 'response',
      id: this.generateId(),
      replyTo: originalMessage.id,
      from: this.name,
      to: originalMessage.from,
      data,
      timestamp: new Date()
    };
  }
}

module.exports = CoderAgent;