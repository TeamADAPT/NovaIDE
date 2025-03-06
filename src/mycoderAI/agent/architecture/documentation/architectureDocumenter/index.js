/**
 * ArchitectureDocumenter Module
 * 
 * Responsible for generating architecture documentation, creating overview sections,
 * documenting components and interfaces, describing data flows, and recording design decisions.
 */

/**
 * ArchitectureDocumenter class for generating architecture documentation
 */
class ArchitectureDocumenter {
  /**
   * Create a new ArchitectureDocumenter instance
   * @param {Object} config - Configuration options
   * @param {Object} services - Service dependencies
   */
  constructor(config = {}, services = {}) {
    this.config = config;
    this.services = services;
    this.memoryManager = services.memoryManager;
    
    // Documentation format
    this.format = config.format || 'markdown';
    
    // Documentation templates
    this.templates = {
      overview: config.templates?.overview || this._defaultOverviewTemplate,
      component: config.templates?.component || this._defaultComponentTemplate,
      interface: config.templates?.interface || this._defaultInterfaceTemplate,
      dataFlow: config.templates?.dataFlow || this._defaultDataFlowTemplate,
      designDecision: config.templates?.designDecision || this._defaultDesignDecisionTemplate
    };
    
    console.log('ArchitectureDocumenter initialized');
  }
  
  /**
   * Document architecture based on system design
   * @param {Object} design - System design to document
   * @param {Object} options - Additional documentation options
   * @returns {Promise<Object>} - Documentation
   */
  async documentArchitecture(design, options = {}) {
    console.log('Documenting architecture');
    
    if (!design) {
      throw new Error('No system design provided for architecture documentation');
    }
    
    const documentation = {
      title: `${design.name} Architecture Documentation`,
      version: design.version,
      sections: [],
      diagrams: [],
      timestamp: new Date()
    };
    
    // Create overview section
    const overviewSection = await this.createOverviewSection(design);
    documentation.sections.push(overviewSection);
    
    // Document components
    const componentsSection = await this.documentComponents(design.components);
    documentation.sections.push(componentsSection);
    
    // Document interfaces
    const interfacesSection = await this.documentInterfaces(design.interfaces);
    documentation.sections.push(interfacesSection);
    
    // Document data flows
    const dataFlowsSection = await this.documentDataFlows(design.dataFlows);
    documentation.sections.push(dataFlowsSection);
    
    // Document design decisions
    const decisionsSection = await this.documentDesignDecisions(design.designDecisions);
    documentation.sections.push(decisionsSection);
    
    // Create diagrams (placeholders for real diagrams)
    documentation.diagrams = await this.createDiagrams(design);
    
    // Store in memory
    if (this.memoryManager) {
      await this.memoryManager.store('architectureDocumentation', documentation);
    }
    
    return documentation;
  }
  
  /**
   * Create overview section
   * @param {Object} design - System design
   * @returns {Promise<Object>} - Overview section
   */
  async createOverviewSection(design) {
    console.log('Creating overview section');
    
    const content = `
# ${design.name} Architecture Overview

${design.description}

## Purpose

This document describes the architecture of the ${design.name} system, including its components, interfaces, and data flows.

## Scope

This architecture documentation covers the entire ${design.name} system as designed in version ${design.version}.

## System Context

The ${design.name} system is designed to ${design.description.toLowerCase()}.

## Constraints

${design.constraints && design.constraints.length > 0 ? 
  design.constraints.map(c => `- ${c}`).join('\n') : 
  '- No constraints specified'}

## Assumptions

${design.assumptions && design.assumptions.length > 0 ? 
  design.assumptions.map(a => `- ${a}`).join('\n') : 
  '- No assumptions specified'}
`;
    
    return {
      title: 'Overview',
      content
    };
  }
  
  /**
   * Document components
   * @param {Array} components - List of components
   * @returns {Promise<Object>} - Components section
   */
  async documentComponents(components) {
    console.log('Documenting components');
    
    let content = `
# Components

This section describes the components of the system.
`;
    
    for (const component of components) {
      content += `
## ${component.name}

${component.description}

### Responsibilities
${component.responsibilities && component.responsibilities.length > 0 ? 
  component.responsibilities.map(r => `- ${r}`).join('\n') : 
  '- No responsibilities specified'}

### Interfaces
${component.interfaces && component.interfaces.length > 0 ? 
  component.interfaces.map(i => `- ${i}`).join('\n') : 
  '- No interfaces specified'}

### Dependencies
${component.dependencies && component.dependencies.length > 0 ? 
  component.dependencies.map(d => `- ${d}`).join('\n') : 
  '- No dependencies specified'}
`;
    }
    
    return {
      title: 'Components',
      content
    };
  }
  
  /**
   * Document interfaces
   * @param {Array} interfaces - List of interfaces
   * @returns {Promise<Object>} - Interfaces section
   */
  async documentInterfaces(interfaces) {
    console.log('Documenting interfaces');
    
    let content = `
# Interfaces

This section describes the interfaces between components in the system.
`;
    
    for (const iface of interfaces) {
      content += `
## ${iface.name}

${iface.description}

### Methods
${iface.methods && iface.methods.length > 0 ? 
  iface.methods.map(m => `- ${m.name}(${(m.parameters || []).join(', ')}): ${m.returnType}`).join('\n') : 
  '- No methods defined'}
`;
    }
    
    return {
      title: 'Interfaces',
      content
    };
  }
  
  /**
   * Document data flows
   * @param {Array} dataFlows - List of data flows
   * @returns {Promise<Object>} - Data flows section
   */
  async documentDataFlows(dataFlows) {
    console.log('Documenting data flows');
    
    let content = `
# Data Flows

This section describes the data flows between components in the system.
`;
    
    for (const flow of dataFlows) {
      content += `
## ${flow.source} → ${flow.target}

${flow.description}

- Data Type: ${flow.dataType}
`;
    }
    
    return {
      title: 'Data Flows',
      content
    };
  }
  
  /**
   * Document design decisions
   * @param {Array} designDecisions - List of design decisions
   * @returns {Promise<Object>} - Design decisions section
   */
  async documentDesignDecisions(designDecisions) {
    console.log('Documenting design decisions');
    
    let content = `
# Design Decisions

This section documents the key design decisions made during the architecture design process.
`;
    
    for (const decision of designDecisions) {
      content += `
## ${decision.decision}

- Rationale: ${decision.rationale}
- Date: ${decision.timestamp.toISOString().split('T')[0]}
${decision.alternatives && decision.alternatives.length > 0 ? 
  '- Alternatives Considered:\n' + decision.alternatives.map(a => `  - ${a}`).join('\n') : 
  ''}
`;
    }
    
    return {
      title: 'Design Decisions',
      content
    };
  }
  
  /**
   * Create diagrams
   * @param {Object} design - System design
   * @returns {Promise<Array>} - List of diagrams
   */
  async createDiagrams(design) {
    console.log('Creating diagrams');
    
    // In a real implementation, this would generate actual diagrams
    // For MVP, we'll create placeholders
    
    const diagrams = [
      {
        title: 'Component Diagram',
        type: 'component',
        format: 'svg',
        content: this._generateComponentDiagramPlaceholder(design)
      },
      {
        title: 'Data Flow Diagram',
        type: 'dataflow',
        format: 'svg',
        content: this._generateDataFlowDiagramPlaceholder(design)
      }
    ];
    
    return diagrams;
  }
  
  /**
   * Generate component diagram placeholder
   * @param {Object} design - System design
   * @returns {string} - Diagram content
   * @private
   */
  _generateComponentDiagramPlaceholder(design) {
    return `
<!-- Component Diagram -->
<!-- In a real implementation, this would be an actual SVG diagram -->
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f0f0f0" />
  <text x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle">
    Component Diagram Placeholder
  </text>
  <text x="300" y="230" font-family="Arial" font-size="16" text-anchor="middle">
    ${design.components.length} Components
  </text>
</svg>
`;
  }
  
  /**
   * Generate data flow diagram placeholder
   * @param {Object} design - System design
   * @returns {string} - Diagram content
   * @private
   */
  _generateDataFlowDiagramPlaceholder(design) {
    return `
<!-- Data Flow Diagram -->
<!-- In a real implementation, this would be an actual SVG diagram -->
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f0f0f0" />
  <text x="300" y="200" font-family="Arial" font-size="20" text-anchor="middle">
    Data Flow Diagram Placeholder
  </text>
  <text x="300" y="230" font-family="Arial" font-size="16" text-anchor="middle">
    ${design.dataFlows.length} Data Flows
  </text>
</svg>
`;
  }
  
  /**
   * Generate full documentation
   * @param {Object} documentation - Documentation object
   * @returns {Promise<string>} - Full documentation content
   */
  async generateFullDocumentation(documentation) {
    console.log('Generating full documentation');
    
    let content = `# ${documentation.title}\n\n`;
    content += `Version: ${documentation.version}\n\n`;
    content += `Generated: ${documentation.timestamp.toISOString().split('T')[0]}\n\n`;
    
    // Add table of contents
    content += `## Table of Contents\n\n`;
    for (const section of documentation.sections) {
      content += `- [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-')})\n`;
    }
    content += `- [Diagrams](#diagrams)\n\n`;
    
    // Add sections
    for (const section of documentation.sections) {
      content += `${section.content}\n\n`;
    }
    
    // Add diagrams
    content += `# Diagrams\n\n`;
    for (const diagram of documentation.diagrams) {
      content += `## ${diagram.title}\n\n`;
      content += `${diagram.content}\n\n`;
    }
    
    return content;
  }
  
  /**
   * Export documentation to file
   * @param {Object} documentation - Documentation object
   * @param {string} format - Export format
   * @returns {Promise<Object>} - Export result
   */
  async exportDocumentation(documentation, format = 'markdown') {
    console.log(`Exporting documentation to ${format}`);
    
    let content = '';
    let fileName = '';
    
    switch (format.toLowerCase()) {
      case 'markdown':
      case 'md':
        content = await this.generateFullDocumentation(documentation);
        fileName = `${documentation.title.toLowerCase().replace(/\s+/g, '-')}.md`;
        break;
        
      case 'html':
        content = await this._convertToHtml(await this.generateFullDocumentation(documentation));
        fileName = `${documentation.title.toLowerCase().replace(/\s+/g, '-')}.html`;
        break;
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
    
    return {
      content,
      fileName,
      format
    };
  }
  
  /**
   * Convert markdown to HTML
   * @param {string} markdown - Markdown content
   * @returns {string} - HTML content
   * @private
   */
  _convertToHtml(markdown) {
    // This would be where a proper markdown to HTML converter would be used
    // For MVP, we'll use a simple approach
    
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Architecture Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
    code { font-family: monospace; background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
  </style>
</head>
<body>
`;
    
    // Very simple markdown to HTML conversion
    // In a real implementation, use a proper markdown parser
    html += markdown
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    html += `
</body>
</html>`;
    
    return html;
  }
}

module.exports = ArchitectureDocumenter;