/**
 * Architecture Module Index
 * 
 * This file exports all architecture-related modules for easy importing.
 */

// Design modules
const SystemDesigner = require('./design/systemDesigner');
const ComponentStructurer = require('./design/componentStructurer');

// Analysis modules
const RequirementsAnalyzer = require('./analysis/requirementsAnalyzer');
const ArchitectureReviewer = require('./analysis/architectureReviewer');

// Planning modules
const TaskPlanner = require('./planning/taskPlanner');

// Documentation modules
const ArchitectureDocumenter = require('./documentation/architectureDocumenter');

module.exports = {
  // Design modules
  SystemDesigner,
  ComponentStructurer,
  
  // Analysis modules
  RequirementsAnalyzer,
  ArchitectureReviewer,
  
  // Planning modules
  TaskPlanner,
  
  // Documentation modules
  ArchitectureDocumenter
};