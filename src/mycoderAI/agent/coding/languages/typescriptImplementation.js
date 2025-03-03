/**
 * typescriptImplementation.js
 * TypeScript code generation for CoderAgent
 */

/**
 * Generate TypeScript implementation for a component
 * @param {Object} component - Component data
 * @returns {Array<Object>} - Array of file objects
 */
function generateTypeScriptImplementation(component) {
  const files = [];
  const componentName = component.name.replace(/\s+/g, '');
  const fileName = component.name.toLowerCase().replace(/\s+/g, '-');
  
  // Generate index.ts
  files.push({
    path: `src/${fileName}/index.ts`,
    content: `/**
 * ${component.name} Component
 * ${component.description || ''}
 */

export * from './${fileName}';
export { default } from './${fileName}';
`
  });
  
  // Generate interfaces file if needed
  if (component.interfaces && component.interfaces.length > 0) {
    files.push({
      path: `src/${fileName}/types.ts`,
      content: `/**
 * Type definitions for ${component.name} Component
 */

${component.interfaces.map(iface => {
  const interfaceName = iface.replace(/\s+/g, '');
  return `export interface I${interfaceName} {
  // Interface methods
  getData(): any;
}`;
}).join('\n\n')}

/**
 * Configuration options for ${componentName}
 */
export interface ${componentName}Config {
  // Configuration properties
  [key: string]: any;
}
`
    });
  }
  
  // Generate main implementation file
  let interfaceImports = '';
  let interfaceImplements = '';
  
  if (component.interfaces && component.interfaces.length > 0) {
    interfaceImports = `import { ${component.interfaces.map(iface => {
      const interfaceName = iface.replace(/\s+/g, '');
      return `I${interfaceName}`;
    }).join(', ')}, ${componentName}Config } from './types';\n\n`;
    
    interfaceImplements = ` implements ${component.interfaces.map(iface => {
      const interfaceName = iface.replace(/\s+/g, '');
      return `I${interfaceName}`;
    }).join(', ')}`;
  } else {
    interfaceImports = `/**
 * Configuration options for ${componentName}
 */
interface ${componentName}Config {
  // Configuration properties
  [key: string]: any;
}\n\n`;
  }
  
  files.push({
    path: `src/${fileName}/${fileName}.ts`,
    content: `/**
 * ${component.name} Implementation
 * ${component.description || ''}
 */

${interfaceImports}/**
 * ${componentName} class implementing component functionality
 */
class ${componentName}${interfaceImplements} {
  private name: string;
  private config: ${componentName}Config;
  private initialized: boolean;
  
  /**
   * Create a new ${componentName} instance
   * @param config - Configuration options
   */
  constructor(config: ${componentName}Config = {}) {
    this.name = '${component.name}';
    this.config = config;
    this.initialized = false;
    ${component.responsibilities ? component.responsibilities.map(r => `// Responsible for: ${r}`).join('\n    ') : ''}
  }
  
  /**
   * Initialize the component
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    // Initialization logic here
    console.log(\`${componentName} initialized with config: \${JSON.stringify(this.config)}\`);
    
    this.initialized = true;
  }
  
  ${component.interfaces && component.interfaces.length > 0 ? 
    generateTypeScriptInterfaceMethods(component.interfaces) : 
    '// No interface methods implemented yet'}
  
  /**
   * Get component status
   * @returns Status information
   */
  getStatus(): {name: string; initialized: boolean; timestamp: Date} {
    return {
      name: this.name,
      initialized: this.initialized,
      timestamp: new Date()
    };
  }
}

export default ${componentName};
`
  });
  
  // Generate test file
  files.push({
    path: `tests/${fileName}.test.ts`,
    content: `/**
 * Tests for ${component.name} Component
 */

import ${componentName} from '../src/${fileName}';

describe('${componentName}', () => {
  let component: ${componentName};
  
  beforeEach(() => {
    component = new ${componentName}();
  });
  
  test('should initialize correctly', async () => {
    await component.initialize();
    expect(component.getStatus().initialized).toBe(true);
  });
  
  test('should return status', () => {
    const status = component.getStatus();
    expect(status).toBeDefined();
    expect(status.name).toBe('${component.name}');
    expect(status.initialized).toBeDefined();
    expect(status.timestamp).toBeInstanceOf(Date);
  });
  
  ${component.interfaces && component.interfaces.length > 0 ? 
    generateTypeScriptInterfaceTests(component.interfaces) : 
    '// Add more tests here'}
});
`
  });
  
  return files;
}

/**
 * Generate TypeScript interface
 * @param {Object} iface - Interface data
 * @returns {Array<Object>} - Array of file objects
 */
function generateTypeScriptInterface(iface) {
  const files = [];
  const interfaceName = iface.name.replace(/\s+/g, '');
  const fileName = iface.name.toLowerCase().replace(/\s+/g, '-');
  
  files.push({
    path: `src/interfaces/${fileName}.ts`,
    content: `/**
 * ${iface.name} Interface
 * ${iface.description || ''}
 */

/**
 * ${interfaceName} interface definition
 */
export interface ${interfaceName} {
  ${iface.methods && iface.methods.length > 0 ? 
    iface.methods.map(method => {
      const params = method.parameters ? 
        method.parameters.map(p => `${p}: any`).join(', ') : '';
      return `/**
   * ${method.name} method
   */
  ${method.name}(${params}): ${method.returnType || 'any'};`;
    }).join('\n\n  ') : 
    `/**
   * Example method
   */
  getData(): any;`}
}

/**
 * Abstract base class implementing ${interfaceName}
 */
export abstract class ${interfaceName}Base implements ${interfaceName} {
  ${iface.methods && iface.methods.length > 0 ? 
    iface.methods.map(method => {
      const params = method.parameters ? 
        method.parameters.map(p => `${p}: any`).join(', ') : '';
      return `/**
   * ${method.name} method
   */
  ${method.name}(${params}): ${method.returnType || 'any'} {
    throw new Error('Method not implemented');
  }`;
    }).join('\n\n  ') : 
    `/**
   * Example method
   */
  getData(): any {
    throw new Error('Method not implemented');
  }`}
}
`
  });
  
  return files;
}

/**
 * Generate interface methods for TypeScript
 * @param {Array<string>} interfaces - List of interface names
 * @returns {string} - Generated methods
 */
function generateTypeScriptInterfaceMethods(interfaces) {
  return `/**
   * Get data from this component
   * @returns Component data
   */
  getData(): {name: string; timestamp: Date} {
    return {
      name: this.name,
      timestamp: new Date()
    };
  }`;
}

/**
 * Generate interface tests for TypeScript
 * @param {Array<string>} interfaces - List of interface names
 * @returns {string} - Generated tests
 */
function generateTypeScriptInterfaceTests(interfaces) {
  return `test('should implement getData method', () => {
    const data = component.getData();
    expect(data).toBeDefined();
    expect(data.name).toBe('${interfaces[0]}');
    expect(data.timestamp).toBeInstanceOf(Date);
  });`;
}

module.exports = {
  generateTypeScriptImplementation,
  generateTypeScriptInterface,
  generateTypeScriptInterfaceMethods,
  generateTypeScriptInterfaceTests
};