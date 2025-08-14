#!/usr/bin/env node

/**
 * UC Discovery Hub - Development Workflow Script
 * Logs development steps and updates documentation automatically
 */

const fs = require('fs');
const path = require('path');

// Development log entry template
function createLogEntry(action, status, details, files = []) {
  return {
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    action,
    status,
    details,
    files,
    phase: getCurrentPhase()
  };
}

// Get current development phase
function getCurrentPhase() {
  return 'API Integration';
}

// Add entry to development log
function addLogEntry(entry) {
  const logPath = path.join(__dirname, 'DEVELOPMENT_LOG.md');
  
  if (!fs.existsSync(logPath)) {
    console.error('DEVELOPMENT_LOG.md not found!');
    return;
  }

  let logContent = fs.readFileSync(logPath, 'utf8');
  
  // Find the log entries section
  const logEntriesSection = '## 📝 Development Log Entries';
  const logEntryTemplate = `

### Entry #${getNextEntryNumber(logContent)} - ${entry.action}
**Date**: ${entry.date}  
**Action**: ${entry.action}  
**Status**: ${entry.status}  
**Phase**: ${entry.phase}  
**Files Modified**: ${entry.files.length > 0 ? entry.files.join(', ') : 'None'}  
**Notes**: 
${entry.details.split('\n').map(line => `- ${line}`).join('\n')}
`;

  // Insert new entry after the section header
  const insertPoint = logContent.indexOf(logEntriesSection) + logEntriesSection.length;
  logContent = logContent.slice(0, insertPoint) + logEntryTemplate + logContent.slice(insertPoint);
  
  // Update last updated timestamp
  const lastUpdatedRegex = /\*\*Last Updated\*\*: .*?\n/;
  const newLastUpdated = `**Last Updated**: ${entry.date}\n`;
  logContent = logContent.replace(lastUpdatedRegex, newLastUpdated);
  
  fs.writeFileSync(logPath, logContent, 'utf8');
  console.log(`✅ Log entry added: ${entry.action}`);
}

// Get next entry number
function getNextEntryNumber(logContent) {
  const entryMatches = logContent.match(/### Entry #(\d+)/g);
  return entryMatches ? entryMatches.length + 1 : 1;
}

// Update project status
function updateProjectStatus(updates) {
  const statusPath = path.join(__dirname, 'update-readme.js');
  
  if (!fs.existsSync(statusPath)) {
    console.error('update-readme.js not found!');
    return;
  }

  let statusContent = fs.readFileSync(statusPath, 'utf8');
  
  // Update specific values
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`${key}:\\s*[^,]+`, 'g');
    statusContent = statusContent.replace(regex, `${key}: ${value}`);
  });
  
  fs.writeFileSync(statusPath, statusContent, 'utf8');
  console.log('✅ Project status updated');
}

// Development workflow commands
const commands = {
  // Start a new development task
  start: (task, description) => {
    const entry = createLogEntry(
      `Started: ${task}`,
      '🔄 In Progress',
      description,
      []
    );
    addLogEntry(entry);
    console.log(`🚀 Started: ${task}`);
  },

  // Complete a development task
  complete: (task, details, files = []) => {
    const entry = createLogEntry(
      `Completed: ${task}`,
      '✅ Complete',
      details,
      files
    );
    addLogEntry(entry);
    console.log(`✅ Completed: ${task}`);
  },

  // Update progress
  progress: (component, progress, details) => {
    const entry = createLogEntry(
      `Progress Update: ${component}`,
      `🔄 ${progress}% Complete`,
      details,
      []
    );
    addLogEntry(entry);
    console.log(`📊 Progress: ${component} - ${progress}%`);
  },

  // Log an issue or bug
  issue: (issue, details, files = []) => {
    const entry = createLogEntry(
      `Issue: ${issue}`,
      '❌ Issue',
      details,
      files
    );
    addLogEntry(entry);
    console.log(`🐛 Issue logged: ${issue}`);
  },

  // Log a decision
  decision: (decision, rationale) => {
    const entry = createLogEntry(
      `Decision: ${decision}`,
      '💡 Decision Made',
      rationale,
      []
    );
    addLogEntry(entry);
    console.log(`💡 Decision: ${decision}`);
  },

  // Update README
  updateReadme: () => {
    const { updateREADME } = require('./update-readme.js');
    updateREADME();
    console.log('📝 README updated');
  },

  // Show current status
  status: () => {
    console.log('\n📊 Current Project Status:');
    console.log('🔄 Phase: API Integration');
    console.log('📈 Progress: 75%');
    console.log('📅 Last Updated: Today');
    console.log('\nNext Steps:');
    console.log('1. Set up React Query');
    console.log('2. Connect ExhibitUpload to API');
    console.log('3. Implement authentication');
    console.log('4. Add error handling');
  }
};

// Command line interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const params = args.slice(1);

  if (!command || !commands[command]) {
    console.log('\n🛠️ UC Discovery Hub - Development Workflow');
    console.log('\nAvailable commands:');
    console.log('  start <task> <description>     - Start a new development task');
    console.log('  complete <task> <details>       - Complete a development task');
    console.log('  progress <component> <progress> <details> - Update progress');
    console.log('  issue <issue> <details>         - Log an issue');
    console.log('  decision <decision> <rationale> - Log a decision');
    console.log('  updateReadme                    - Update README with current status');
    console.log('  status                          - Show current project status');
    console.log('\nExamples:');
    console.log('  node dev-workflow.js start "API Integration" "Setting up React Query"');
    console.log('  node dev-workflow.js complete "ExhibitUpload API" "Connected to backend"');
    console.log('  node dev-workflow.js progress "ExhibitMap" 80 "Added data fetching"');
    return;
  }

  try {
    commands[command](...params);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { commands, createLogEntry, addLogEntry, updateProjectStatus }; 