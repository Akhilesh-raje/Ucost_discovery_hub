#!/usr/bin/env node

/**
 * UC Discovery Hub - README Update Script
 * Automatically updates README.md with current project status
 */

const fs = require('fs');
const path = require('path');

// Project status data
const projectStatus = {
  lastUpdated: new Date().toISOString().split('T')[0],
  overallProgress: 75,
  currentPhase: 'API Integration',
  phases: {
    backend: { status: 'Complete', progress: 100 },
    frontend: { status: 'Complete', progress: 90 },
    apiIntegration: { status: 'In Progress', progress: 25 },
    testing: { status: 'Not Started', progress: 0 },
    documentation: { status: 'In Progress', progress: 50 }
  },
  features: {
    userOnboarding: { status: 'Complete', progress: 100 },
    exhibitManagement: { status: 'In Progress', progress: 70 },
    tourManagement: { status: 'In Progress', progress: 50 },
    analytics: { status: 'Not Started', progress: 0 }
  },
  components: {
    completed: [
      'WelcomeScreen.tsx',
      'OnboardingFlow.tsx',
      'ProfileStep1.tsx - ProfileStep4.tsx',
      'SmartRoadmap.tsx',
      'AdminLogin.tsx',
      'AdminPanel.tsx'
    ],
    inProgress: [
      'ExhibitUpload.tsx (90% - needs API integration)',
      'ExhibitMap.tsx (80% - needs data integration)',
      'ExhibitDetail.tsx (70% - needs API integration)',
      'MyTour.tsx (80% - needs API integration)'
    ],
    missing: [
      'Analytics Dashboard (0% - not implemented)'
    ]
  },
  apiEndpoints: {
    auth: ['POST /api/auth/login', 'GET /api/auth/me', 'POST /api/auth/admin', 'POST /api/auth/logout'],
    exhibits: ['GET /api/exhibits', 'GET /api/exhibits/:id', 'POST /api/exhibits', 'PUT /api/exhibits/:id', 'DELETE /api/exhibits/:id'],
    tours: ['POST /api/tours', 'GET /api/tours/:id', 'PUT /api/tours/:id', 'DELETE /api/tours/:id', 'POST /api/tours/:id/exhibits', 'DELETE /api/tours/:id/exhibits/:exhibitId'],
    users: ['POST /api/users/profile', 'GET /api/users/profile/:email', 'GET /api/users/:userId/tours'],
    analytics: ['POST /api/analytics/track', 'GET /api/analytics/visitors', 'GET /api/analytics/popular-exhibits', 'GET /api/analytics/page-stats', 'GET /api/analytics/daily-trends']
  }
};

// Generate status badges
function generateStatusBadge(status, progress) {
  const statusColors = {
    'Complete': 'brightgreen',
    'In Progress': 'orange',
    'Not Started': 'red'
  };
  return `![${status}](https://img.shields.io/badge/${status.replace(' ', '%20')}-${progress}%25-${statusColors[status]})`;
}

// Generate progress bar
function generateProgressBar(progress) {
  const filled = Math.round(progress / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
}

// Update README content
function updateREADME() {
  const readmePath = path.join(__dirname, 'README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.error('README.md not found!');
    return;
  }

  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Update project status section
  const statusSection = `
## 📊 Project Status

**Last Updated**: ${projectStatus.lastUpdated}  
**Overall Progress**: ${projectStatus.overallProgress}%  
**Current Phase**: ${projectStatus.currentPhase}

### Development Phases
${Object.entries(projectStatus.phases).map(([phase, data]) => 
  `- **${phase.charAt(0).toUpperCase() + phase.slice(1)}**: ${generateStatusBadge(data.status, data.progress)} ${generateProgressBar(data.progress)}`
).join('\n')}

### Feature Completeness
${Object.entries(projectStatus.features).map(([feature, data]) => 
  `- **${feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, ' $1')}**: ${generateStatusBadge(data.status, data.progress)} ${generateProgressBar(data.progress)}`
).join('\n')}

### Component Status
**✅ Completed Components (${projectStatus.components.completed.length}):**
${projectStatus.components.completed.map(comp => `- ${comp}`).join('\n')}

**🔄 In Progress Components (${projectStatus.components.inProgress.length}):**
${projectStatus.components.inProgress.map(comp => `- ${comp}`).join('\n')}

**❌ Missing Components (${projectStatus.components.missing.length}):**
${projectStatus.components.missing.map(comp => `- ${comp}`).join('\n')}

### API Endpoints Status
${Object.entries(projectStatus.apiEndpoints).map(([category, endpoints]) => 
  `**${category.charAt(0).toUpperCase() + category.slice(1)} (${endpoints.length} endpoints):**\n${endpoints.map(endpoint => `- \`${endpoint}\``).join('\n')}`
).join('\n\n')}
`;

  // Replace or add status section
  const statusRegex = /## 📊 Project Status[\s\S]*?(?=## |$)/;
  if (statusRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(statusRegex, statusSection);
  } else {
    // Add after overview section
    const overviewRegex = /## 🌟 Overview[\s\S]*?(?=## |$)/;
    if (overviewRegex.test(readmeContent)) {
      readmeContent = readmeContent.replace(overviewRegex, match => match + '\n' + statusSection);
    }
  }

  // Update last updated timestamp
  const timestampRegex = /Last Updated.*?\n/;
  const newTimestamp = `Last Updated: ${projectStatus.lastUpdated}\n`;
  if (timestampRegex.test(readmeContent)) {
    readmeContent = readmeContent.replace(timestampRegex, newTimestamp);
  }

  // Write updated README
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log('✅ README.md updated successfully!');
  console.log(`📅 Last Updated: ${projectStatus.lastUpdated}`);
  console.log(`📊 Overall Progress: ${projectStatus.overallProgress}%`);
}

// Run the update
if (require.main === module) {
  updateREADME();
}

module.exports = { updateREADME, projectStatus }; 