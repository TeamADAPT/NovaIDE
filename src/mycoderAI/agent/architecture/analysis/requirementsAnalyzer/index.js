/**
 * RequirementsAnalyzer Module
 * 
 * Responsible for analyzing requirements for a system, categorizing requirements,
 * identifying dependencies between requirements, and assessing completeness and clarity.
 */

/**
 * RequirementsAnalyzer class for analyzing system requirements
 */
class RequirementsAnalyzer {
  /**
   * Create a new RequirementsAnalyzer instance
   * @param {Object} config - Configuration options
   * @param {Object} services - Service dependencies
   */
  constructor(config = {}, services = {}) {
    this.config = config;
    this.services = services;
    this.memoryManager = services.memoryManager;
    
    // Analysis thresholds
    this.thresholds = {
      completeness: config.thresholds?.completeness || 0.7,
      clarity: config.thresholds?.clarity || 0.6,
      dependencyProbability: config.thresholds?.dependencyProbability || 0.7
    };
    
    console.log('RequirementsAnalyzer initialized');
  }
  
  /**
   * Analyze requirements for a system
   * @param {Array} requirements - List of requirements to analyze
   * @param {Object} options - Additional analysis options
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeRequirements(requirements, options = {}) {
    console.log('Analyzing requirements');
    
    if (!requirements || !Array.isArray(requirements)) {
      throw new Error('Invalid requirements provided for analysis');
    }
    
    const analysis = {
      requirements: requirements,
      categorizedRequirements: {},
      dependencies: [],
      risks: [],
      completeness: 0,
      clarity: 0,
      timestamp: new Date()
    };
    
    // Categorize requirements
    analysis.categorizedRequirements = await this.categorizeRequirements(requirements);
    
    // Identify dependencies between requirements
    analysis.dependencies = await this.identifyDependencies(requirements);
    
    // Identify risks
    analysis.risks = await this.identifyRisks(requirements);
    
    // Assess completeness and clarity
    const completenessResult = await this.assessCompleteness(requirements);
    analysis.completeness = completenessResult.score;
    
    const clarityResult = await this.assessClarity(requirements);
    analysis.clarity = clarityResult.score;
    
    // Store in memory
    if (this.memoryManager) {
      await this.memoryManager.store('requirementsAnalysis', analysis);
    }
    
    return analysis;
  }
  
  /**
   * Categorize requirements
   * @param {Array} requirements - List of requirements
   * @returns {Promise<Object>} - Categorized requirements
   */
  async categorizeRequirements(requirements) {
    console.log('Categorizing requirements');
    
    const categorized = {};
    
    for (const req of requirements) {
      const category = req.category || 'uncategorized';
      
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      categorized[category].push(req);
    }
    
    return categorized;
  }
  
  /**
   * Identify dependencies between requirements
   * @param {Array} requirements - List of requirements
   * @returns {Promise<Array>} - List of dependencies
   */
  async identifyDependencies(requirements) {
    console.log('Identifying dependencies between requirements');
    
    const dependencies = [];
    
    // Identify dependencies between requirements
    for (let i = 0; i < requirements.length; i++) {
      const reqA = requirements[i];
      
      for (let j = 0; j < requirements.length; j++) {
        if (i === j) continue;
        
        const reqB = requirements[j];
        
        // This would be where LLM integration happens to identify dependencies
        // For MVP, we'll use a simple approach based on categories
        if (reqA.category === reqB.category && Math.random() > this.thresholds.dependencyProbability) {
          dependencies.push({
            source: reqA.name,
            target: reqB.name,
            type: 'related',
            description: `${reqA.name} may be related to ${reqB.name}`
          });
        }
      }
    }
    
    return dependencies;
  }
  
  /**
   * Identify risks in requirements
   * @param {Array} requirements - List of requirements
   * @returns {Promise<Array>} - List of risks
   */
  async identifyRisks(requirements) {
    console.log('Identifying risks in requirements');
    
    const risks = [];
    
    for (const req of requirements) {
      // Check for high priority requirements without acceptance criteria
      if (req.priority === 'high' && !req.acceptanceCriteria) {
        risks.push({
          requirement: req.name,
          risk: 'High priority requirement without acceptance criteria',
          severity: 'high',
          mitigation: 'Define clear acceptance criteria'
        });
      }
      
      // Check for requirements without description
      if (!req.description || req.description.trim() === '') {
        risks.push({
          requirement: req.name,
          risk: 'Requirement without description',
          severity: 'medium',
          mitigation: 'Add detailed description'
        });
      }
      
      // Check for requirements without priority
      if (!req.priority) {
        risks.push({
          requirement: req.name,
          risk: 'Requirement without priority',
          severity: 'low',
          mitigation: 'Assign priority level'
        });
      }
      
      // Check for vague requirements (simple heuristic)
      if (req.description && req.description.length < 20) {
        risks.push({
          requirement: req.name,
          risk: 'Potentially vague requirement (short description)',
          severity: 'medium',
          mitigation: 'Expand description with more details'
        });
      }
    }
    
    return risks;
  }
  
  /**
   * Assess completeness of requirements
   * @param {Array} requirements - List of requirements
   * @returns {Promise<Object>} - Completeness assessment
   */
  async assessCompleteness(requirements) {
    console.log('Assessing completeness of requirements');
    
    let completenessScore = 0;
    const assessmentDetails = [];
    
    for (const req of requirements) {
      const reqScore = {
        requirement: req.name,
        factors: [],
        score: 0
      };
      
      // Simple scoring based on presence of fields
      if (req.description) {
        reqScore.factors.push({ factor: 'Has description', value: 1 });
        reqScore.score += 1;
      } else {
        reqScore.factors.push({ factor: 'Missing description', value: 0 });
      }
      
      if (req.acceptanceCriteria) {
        reqScore.factors.push({ factor: 'Has acceptance criteria', value: 1 });
        reqScore.score += 1;
      } else {
        reqScore.factors.push({ factor: 'Missing acceptance criteria', value: 0 });
      }
      
      if (req.priority) {
        reqScore.factors.push({ factor: 'Has priority', value: 1 });
        reqScore.score += 1;
      } else {
        reqScore.factors.push({ factor: 'Missing priority', value: 0 });
      }
      
      // Normalize score
      reqScore.score = reqScore.score / 3;
      
      assessmentDetails.push(reqScore);
      completenessScore += reqScore.score;
    }
    
    // Calculate overall completeness
    const overallScore = requirements.length > 0 ? 
      completenessScore / requirements.length : 0;
    
    return {
      score: overallScore,
      details: assessmentDetails,
      threshold: this.thresholds.completeness,
      isSufficient: overallScore >= this.thresholds.completeness
    };
  }
  
  /**
   * Assess clarity of requirements
   * @param {Array} requirements - List of requirements
   * @returns {Promise<Object>} - Clarity assessment
   */
  async assessClarity(requirements) {
    console.log('Assessing clarity of requirements');
    
    let clarityScore = 0;
    const assessmentDetails = [];
    
    for (const req of requirements) {
      const reqScore = {
        requirement: req.name,
        factors: [],
        score: 0
      };
      
      // Simple scoring based on quality of fields
      if (req.description && req.description.length > 50) {
        reqScore.factors.push({ factor: 'Detailed description', value: 1 });
        reqScore.score += 1;
      } else if (req.description && req.description.length > 20) {
        reqScore.factors.push({ factor: 'Basic description', value: 0.5 });
        reqScore.score += 0.5;
      } else {
        reqScore.factors.push({ factor: 'Insufficient description', value: 0 });
      }
      
      if (req.acceptanceCriteria && req.acceptanceCriteria.length > 2) {
        reqScore.factors.push({ factor: 'Multiple acceptance criteria', value: 1 });
        reqScore.score += 1;
      } else if (req.acceptanceCriteria && req.acceptanceCriteria.length > 0) {
        reqScore.factors.push({ factor: 'Basic acceptance criteria', value: 0.5 });
        reqScore.score += 0.5;
      } else {
        reqScore.factors.push({ factor: 'No acceptance criteria', value: 0 });
      }
      
      // Normalize score
      reqScore.score = reqScore.score / 2;
      
      assessmentDetails.push(reqScore);
      clarityScore += reqScore.score;
    }
    
    // Calculate overall clarity
    const overallScore = requirements.length > 0 ? 
      clarityScore / requirements.length : 0;
    
    return {
      score: overallScore,
      details: assessmentDetails,
      threshold: this.thresholds.clarity,
      isSufficient: overallScore >= this.thresholds.clarity
    };
  }
  
  /**
   * Get requirement categories
   * @param {Array} requirements - List of requirements
   * @returns {Array} - List of categories
   */
  getCategories(requirements) {
    const categories = new Set();
    
    for (const req of requirements) {
      if (req.category) {
        categories.add(req.category);
      }
    }
    
    return Array.from(categories);
  }
  
  /**
   * Get requirements by category
   * @param {Array} requirements - List of requirements
   * @param {string} category - Category to filter by
   * @returns {Array} - Filtered requirements
   */
  getRequirementsByCategory(requirements, category) {
    return requirements.filter(req => req.category === category);
  }
}

module.exports = RequirementsAnalyzer;