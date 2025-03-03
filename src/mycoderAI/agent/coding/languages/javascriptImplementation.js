/**
 * javascriptImplementation.js
 * JavaScript code generation for CoderAgent
 */

/**
 * Generate JavaScript implementation for a component
 * @param {Object} component - Component data
 * @returns {Array<Object>} - Array of file objects
 */
function generateJavaScriptImplementation(component) {
  const files = [];
  const componentName = component.name.replace(/\s+/g, '');
  const fileName = component.name.toLowerCase().replace(/\s+/g, '-');
  
  // Generate index.js
  files.push({
    path: `src/${fileName}/index.js`,
    content: `/**
 * ${component.name} Component
 * ${component.description || ''}
 */

const ${componentName} = require('./${fileName}');

module.exports = ${componentName};
`
  });
  
  // Generate main implementation file
  let interfaceImports = '';
  if (component.interfaces && component.interfaces.length > 0) {
    interfaceImports = component.interfaces.map(iface => {
      const interfaceName = iface.replace(/\s+/g, '');
      const interfaceFileName = iface.toLowerCase().replace(/\s+/g, '-');
      return `const ${interfaceName} = require('../interfaces/${interfaceFileName}');`;
    }).join('\n');
    interfaceImports += '\n\n';
  }
  
  files.push({
    path: `src/${fileName}/${fileName}.js`,
    content: `/**
 * ${component.name} Implementation
 * ${component.description || ''}
 */

${interfaceImports}/**
 * ${componentName} class implementing component functionality
 */
class ${componentName} {
  /**
   * Create a new ${componentName} instance
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.name = '${component.name}';
    this.config = config;
    this.initialized = false;
    ${component.responsibilities ? component.responsibilities.map(r => `// Responsible for: ${r}`).join('\n    ') : ''}
  }
  
  /**
   * Initialize the component
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    
    // Initialization logic here
    console.log(\`${componentName} initialized with config: \${JSON.stringify(this.config)}\`);
    
    this.initialized = true;
  }
  
  ${component.interfaces && component.interfaces.length > 0 ? 
    generateInterfaceMethods(component.interfaces) : 
    '// No interface methods implemented yet'}
  
  /**
   * Get component status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      name: this.name,
      initialized: this.initialized,
      timestamp: new Date()
    };
  }
}

module.exports = ${componentName};
`
  });
  
  // Generate test file
  files.push({
    path: `tests/${fileName}.test.js`,
    content: `/**
 * Tests for ${component.name} Component
 */

const ${componentName} = require('../src/${fileName}');

describe('${componentName}', () => {
  let component;
  
  beforeEach(() => {
    component = new ${componentName}();
  });
  
  test('should initialize correctly', async () => {
    await component.initialize();
    expect(component.initialized).toBe(true);
  });
  
  test('should return status', () => {
    const status = component.getStatus();
    expect(status).toBeDefined();
    expect(status.name).toBe('${component.name}');
    expect(status.initialized).toBeDefined();
    expect(status.timestamp).toBeInstanceOf(Date);
  });
  
  ${component.interfaces && component.interfaces.length > 0 ? 
    generateInterfaceTests(component.interfaces) : 
    '// Add more tests here'}
});
`
  });
  
  return files;
}

/**
 * Generate JavaScript interface
 * @param {Object} iface - Interface data
 * @returns {Array<Object>} - Array of file objects
 */
function generateJavaScriptInterface(iface) {
  const files = [];
  const interfaceName = iface.name.replace(/\s+/g, '');
  const fileName = iface.name.toLowerCase().replace(/\s+/g, '-');
  
  files.push({
    path: `src/interfaces/${fileName}.js`,
    content: `/**
 * ${iface.name} Interface
 * ${iface.description || ''}
 */

/**
 * ${interfaceName} interface definition
 */
class ${interfaceName} {
  ${iface.methods && iface.methods.length > 0 ? 
    iface.methods.map(method => {
      const params = method.parameters ? method.parameters.join(', ') : '';
      return `/**
   * ${method.name} method
   * ${params ? `@param {${method.parameters.map(() => 'any').join(', ')}} ${params}` : ''}
   * @returns {${method.returnType || 'any'}}
   */
  ${method.name}(${params}) {
    throw new Error('Method not implemented');
  }`;
    }).join('\n\n  ') : 
    `/**
   * Example method
   * @returns {Object}
   */
  getData() {
    throw new Error('Method not implemented');
  }`}
}

module.exports = ${interfaceName};
`
  });
  
  return files;
}

/**
 * Generate interface methods for JavaScript
 * @param {Array<string>} interfaces - List of interface names
 * @returns {string} - Generated methods
 */
function generateInterfaceMethods(interfaces) {
  return `/**
   * Get data from this component
   * @returns {Object} Component data
   */
  getData() {
    return {
      name: this.name,
      timestamp: new Date()
    };
  }`;
}

/**
 * Generate interface tests for JavaScript
 * @param {Array<string>} interfaces - List of interface names
 * @returns {string} - Generated tests
 */
function generateInterfaceTests(interfaces) {
  return `test('should implement getData method', () => {
    const data = component.getData();
    expect(data).toBeDefined();
    expect(data.name).toBe('${interfaces[0]}');
    expect(data.timestamp).toBeInstanceOf(Date);
  });`;
}

module.exports = {
  generateJavaScriptImplementation,
  generateJavaScriptInterface,
  generateInterfaceMethods,
  generateInterfaceTests
};