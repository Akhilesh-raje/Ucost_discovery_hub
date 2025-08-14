const path = require('path');
const fs = require('fs');

console.log('🔍 Testing path resolution...');

// Test the path that the backend uses
const pythonScriptPath = path.join(__dirname, '../../ocr-engine/debug_integration.py');
console.log('📁 Python Script Path:', pythonScriptPath);
console.log('📁 Script exists:', fs.existsSync(pythonScriptPath));

// Test alternative paths
const altPath1 = path.join(__dirname, '../../../ocr-engine/debug_integration.py');
console.log('📁 Alt Path 1:', altPath1);
console.log('📁 Alt Path 1 exists:', fs.existsSync(altPath1));

const altPath2 = path.join(__dirname, '../../../../ocr-engine/debug_integration.py');
console.log('📁 Alt Path 2:', altPath2);
console.log('📁 Alt Path 2 exists:', fs.existsSync(altPath2));

// List current directory
console.log('📁 Current directory:', __dirname);
console.log('📁 Parent directory:', path.dirname(__dirname)); 