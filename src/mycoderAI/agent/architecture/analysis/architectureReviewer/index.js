/**
 * ArchitectureReviewer Module
 * 
 * Responsible for reviewing architecture for quality and issues,
 * calculating quality metrics, identifying architectural issues,
 * and generating recommendations.
 */

/**
 * ArchitectureReviewer class for reviewing system architecture
 */
class ArchitectureReviewer {
  /**
   * Create a new ArchitectureReviewer instance
   * @param {Object} config - Configuration options
   * @param {Object} services - Service dependencies
   */
  constructor(config = {}, services = {}) {
    this.config = config;
    this.services = services;
    this.memoryManager = services.memoryManager;
    
    // Quality thresholds
    this.thresholds = {
      componentCohesion: config.thresholds?.componentCohesion || 0.7,
      componentCoupling: config.thresholds?.componentCoupling || 0.5,
      interfaceCompleteness: config.thresholds?.interfaceCompleteness || 0.8,
      designCompleteness: config.thresholds?.designCompleteness || 0.7
    };
    
    console.log('ArchitectureReviewer initialized');
  }
  
  /**
   * Review architecture for quality and issues
   * @param {Object} design - System design to review
   * @param {Object} options - Additional review options
   * @returns {Promise<Object>} - Review results
   */
  async reviewArchitecture(design, options = {}) {
    console.log('Reviewing architecture');
    
    if (!design) {
      throw new Error('No system design provided for architecture review');
    }
    
    const review = {
      design: design,
      qualityMetrics: {},
      issues: [],
      recommendations: [],
      timestamp: new Date()
    };
    
    // Calculate quality metrics
    review.qualityMetrics = await this.calculateQualityMetrics(design);
    
    // Identify issues
    review.issues = await this.identifyIssues(design, review.qualityMetrics);
    
    // Generate recommendations
    review.recommendations = await this.generateRecommendations(review.issues, review.qualityMetrics);
    
    // Store in memory
    if (this.memoryManager) {
      await this.memoryManager.store('architectureReview', review);
    }
    
    return review;
  }
  
  /**
   * Calculate quality metrics for a system design
   * @param {Object} design - System design
   * @returns {Promise<Object>} - Quality metrics
   */
  async calculateQualityMetrics(design) {
    console.log('Calculating quality metrics');
    
    const metrics = {
      componentCohesion: this._calculateComponentCohesion(design),
      componentCoupling: this._calculateComponentCoupling(design),
      interfaceCompleteness: this._calculateInterfaceCompleteness(design),
      designCompleteness: this._calculateDesignCompleteness(design)
    };
    
    return metrics;
  }
  
  /**
   * Identify issues in a system design
   * @param {Object} design - System design
   * @param {Object} metrics - Quality metrics
   * @returns {Promise<Array>} - List of issues
   */
  async identifyIssues(design, metrics) {
    console.log('Identifying issues in system design');
    
    const issues = [];
    
    // Check for components without interfaces
    for (const component of design.components) {
      if (!component.interfaces || component.interfaces.length === 0) {
        issues.push({
          type: 'component-isolation',
          severity: 'high',
          description: `Component ${component.name} has no interfaces`,
          component: component.name
        });
      }
    }
    
    // Check for interfaces without methods
    for (const iface of design.interfaces) {
      if (!iface.methods || iface.methods.length === 0) {
        issues.push({
          type: 'interface-incomplete',
          severity: 'medium',
          description: `Interface ${iface.name} has no methods defined`,
          interface: iface.name
        });
      }
    }
    
    // Check for circular dependencies
    const dataFlowGraph = {};
    for (const flow of design.dataFlows) {
      if (!dataFlowGraph[flow.source]) {
        dataFlowGraph[flow.source] = [];
      }
      dataFlowGraph[flow.source].push(flow.target);
    }
    
    // Simple cycle detection
    for (const source in dataFlowGraph) {
      for (const target of dataFlowGraph[source]) {
        if (dataFlowGraph[target] && dataFlowGraph[target].includes(source)) {
          issues.push({
            type: 'circular-dependency',
            severity: 'high',
            description: `Circular dependency between ${source} and ${target}`,
            components: [source, target]
          });
        }
      }
    }
    
    // Check for quality metric issues
    if (metrics.componentCohesion < this.thresholds.componentCohesion) {
      issues.push({
        type: 'low-cohesion',
        severity: 'medium',
        description: `Low component cohesion (${metrics.componentCohesion.toFixed(2)})`,
        metric: 'componentCohesion',
        value: metrics.componentCohesion,
        threshold: this.thresholds.componentCohesion
      });
    }
    
    if (metrics.componentCoupling > this.thresholds.componentCoupling) {
      issues.push({
        type: 'high-coupling',
        severity: 'medium',
        description: `High component coupling (${metrics.componentCoupling.toFixed(2)})`,
        metric: 'componentCoupling',
        value: metrics.componentCoupling,
        threshold: this.thresholds.componentCoupling
      });
    }
    
    if (metrics.interfaceCompleteness < this.thresholds.interfaceCompleteness) {
      issues.push({
        type: 'incomplete-interfaces',
        severity: 'medium',
        description: `Incomplete interfaces (${metrics.interfaceCompleteness.toFixed(2)})`,
        metric: 'interfaceCompleteness',
        value: metrics.interfaceCompleteness,
        threshold: this.thresholds.interfaceCompleteness
      });
    }
    
    if (metrics.designCompleteness < this.thresholds.designCompleteness) {
      issues.push({
        type: 'incomplete-design',
        severity: 'medium',
        description: `Incomplete design (${metrics.designCompleteness.toFixed(2)})`,
        metric: 'designCompleteness',
        value: metrics.designCompleteness,
        threshold: this.thresholds.designCompleteness
      });
    }
    
    return issues;
  }
  
  /**
   * Generate recommendations based on issues
   * @param {Array} issues - List of issues
   * @param {Object} metrics - Quality metrics
   * @returns {Promise<Array>} - List of recommendations
   */
  async generateRecommendations(issues, metrics) {
    console.log('Generating recommendations');
    
    const recommendations = [];
    
    for (const issue of issues) {
      switch (issue.type) {
        case 'component-isolation':
          recommendations.push({
            issue: issue.type,
            description: `Create interfaces for ${issue.component} to connect with other components`,
            priority: 'high'
          });
          break;
          
        case 'interface-incomplete':
          recommendations.push({
            issue: issue.type,
            description: `Define methods for interface ${issue.interface}`,
            priority: 'medium'
          });
          break;
          
        case 'circular-dependency':
          recommendations.push({
            issue: issue.type,
            description: `Resolve circular dependency between ${issue.components[0]} and ${issue.components[1]} by introducing an intermediary component or restructuring the design`,
            priority: 'high'
          });
          break;
          
        case 'low-cohesion':
          recommendations.push({
            issue: issue.type,
            description: 'Improve component cohesion by ensuring each component has a single, well-defined responsibility',
            priority: 'medium'
          });
          break;
          
        case 'high-coupling':
          recommendations.push({
            issue: issue.type,
            description: 'Reduce component coupling by introducing more abstraction through interfaces',
            priority: 'medium'
          });
          break;
          
        case 'incomplete-interfaces':
          recommendations.push({
            issue: issue.type,
            description: 'Complete interface definitions by adding methods with parameters and return types',
            priority: 'medium'
          });
          break;
          
        case 'incomplete-design':
          recommendations.push({
            issue: issue.type,
            description: 'Complete the design by adding missing components, interfaces, or data flows',
            priority: 'medium'
          });
          break;
      }
    }
    
    // Add general recommendations based on metrics
    if (Object.keys(metrics).length > 0) {
      // If all metrics are good, add a positive recommendation
      if (metrics.componentCohesion >= this.thresholds.componentCohesion &&
          metrics.componentCoupling <= this.thresholds.componentCoupling &&
          metrics.interfaceCompleteness >= this.thresholds.interfaceCompleteness &&
          metrics.designCompleteness >= this.thresholds.designCompleteness) {
        recommendations.push({
          issue: 'none',
          description: 'The architecture meets all quality thresholds. Consider adding more detailed documentation and examples.',
          priority: 'low'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Calculate component cohesion metric
   * @param {Object} design - System design
   * @returns {number} - Cohesion metric (0-1)
   * @private
   */
  _calculateComponentCohesion(design) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach
    let totalCohesion = 0;
    
    for (const component of design.components) {
      // Simple cohesion metric: ratio of responsibilities to interfaces
      const responsibilityCount = component.responsibilities ? component.responsibilities.length : 0;
      const interfaceCount = component.interfaces ? component.interfaces.length : 0;
      
      // A component with many responsibilities and few interfaces is less cohesive
      // A component with few responsibilities and appropriate interfaces is more cohesive
      const cohesion = responsibilityCount > 0 ? 
        Math.min(1, 1 / Math.max(1, responsibilityCount - interfaceCount)) : 0;
      
      totalCohesion += cohesion;
    }
    
    return design.components.length > 0 ? 
      totalCohesion / design.components.length : 0;
  }
  
  /**
   * Calculate component coupling metric
   * @param {Object} design - System design
   * @returns {number} - Coupling metric (0-1)
   * @private
   */
  _calculateComponentCoupling(design) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach
    
    // Count total possible connections between components
    const totalPossibleConnections = design.components.length * (design.components.length - 1);
    
    // Count actual connections (data flows)
    const actualConnections = design.dataFlows.length;
    
    // Coupling metric: ratio of actual connections to possible connections
    return totalPossibleConnections > 0 ? 
      actualConnections / totalPossibleConnections : 0;
  }
  
  /**
   * Calculate interface completeness metric
   * @param {Object} design - System design
   * @returns {number} - Interface completeness metric (0-1)
   * @private
   */
  _calculateInterfaceCompleteness(design) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach
    let totalCompleteness = 0;
    
    for (const iface of design.interfaces) {
      // Simple completeness metric: does the interface have methods defined?
      const hasMethodsDefined = iface.methods && iface.methods.length > 0;
      totalCompleteness += hasMethodsDefined ? 1 : 0;
    }
    
    return design.interfaces.length > 0 ? 
      totalCompleteness / design.interfaces.length : 0;
  }
  
  /**
   * Calculate design completeness metric
   * @param {Object} design - System design
   * @returns {number} - Design completeness metric (0-1)
   * @private
   */
  _calculateDesignCompleteness(design) {
    // This would be where LLM integration happens for more sophisticated analysis
    // For MVP, we'll use a simple approach
    
    // Check for required design elements
    const hasComponents = design.components && design.components.length > 0;
    const hasInterfaces = design.interfaces && design.interfaces.length > 0;
    const hasDataFlows = design.dataFlows && design.dataFlows.length > 0;
    const hasDesignDecisions = design.designDecisions && design.designDecisions.length > 0;
    
    // Calculate completeness as percentage of required elements present
    return (hasComponents + hasInterfaces + hasDataFlows + hasDesignDecisions) / 4;
  }
  
  /**
   * Assess design quality
   * @param {Object} design - System design
   * @returns {Promise<Object>} - Quality assessment
   */
  async assessDesignQuality(design) {
    const metrics = await this.calculateQualityMetrics(design);
    const issues = await this.identifyIssues(design, metrics);
    
    // Calculate overall quality score
    const qualityScore = (
      (metrics.componentCohesion / this.thresholds.componentCohesion) +
      (1 - (metrics.componentCoupling / this.thresholds.componentCoupling)) +
      (metrics.interfaceCompleteness / this.thresholds.interfaceCompleteness) +
      (metrics.designCompleteness / this.thresholds.designCompleteness)
    ) / 4;
    
    return {
      score: Math.min(1, Math.max(0, qualityScore)),
      metrics,
      issueCount: issues.length,
      highSeverityIssues: issues.filter(i => i.severity === 'high').length,
      mediumSeverityIssues: issues.filter(i => i.severity === 'medium').length,
      lowSeverityIssues: issues.filter(i => i.severity === 'low').length
    };
  }
}

module.exports = ArchitectureReviewer;