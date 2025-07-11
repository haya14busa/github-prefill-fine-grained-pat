// Script to create the minified bookmarklet from the source file
const fs = require('fs');

// Read the source file
const sourceCode = fs.readFileSync('github-pat-bookmarklet.js', 'utf8');

// Create a wrapper for the bookmarklet
const bookmarkletCode = `javascript:(function(){${sourceCode.replace(/\n\s*/g, ' ').replace(/\/\/.*$/gm, '').trim()}})();`;

// Create a more readable version with the ghPat global
const readableBookmarklet = `javascript:(function(){
  // Make functions available globally as ghPat
  window.ghPat = {
    setPermission: ${sourceCode.match(/function setPermission\([\s\S]*?\n}/)[0].replace('function setPermission', 'function')},
    setMultiplePermissions: ${sourceCode.match(/function setMultiplePermissions\([\s\S]*?\n}/)[0].replace('function setMultiplePermissions', 'function')},
    listAvailablePermissions: ${sourceCode.match(/function listAvailablePermissions\([\s\S]*?\n}/)[0].replace('function listAvailablePermissions', 'function')},
    getCurrentPermissions: ${sourceCode.match(/function getCurrentPermissions\([\s\S]*?\n}/)[0].replace('function getCurrentPermissions', 'function')},
    setRepositoryAccess: ${sourceCode.match(/function setRepositoryAccess\([\s\S]*?\n}/)[0].replace('function setRepositoryAccess', 'function')},
    getRepositoryAccess: ${sourceCode.match(/function getRepositoryAccess\([\s\S]*?\n}/)[0].replace('function getRepositoryAccess', 'function')},
    waitForRepositoryPicker: ${sourceCode.match(/function waitForRepositoryPicker\([\s\S]*?\n}/)[0].replace('function waitForRepositoryPicker', 'function')},
    selectRepositories: ${sourceCode.match(/function selectRepositories\([\s\S]*?\n}/)[0].replace('function selectRepositories', 'function')},
    addRepository: ${sourceCode.match(/function addRepository\([\s\S]*?\n}/)[0].replace('function addRepository', 'function')},
    clearAllRepositories: ${sourceCode.match(/function clearAllRepositories\([\s\S]*?\n}/)[0].replace('function clearAllRepositories', 'function')},
    getSelectedRepositories: ${sourceCode.match(/function getSelectedRepositories\([\s\S]*?\n}/)[0].replace('function getSelectedRepositories', 'function')}
  };
  console.log('GitHub PAT Helper loaded! Use ghPat.functionName() to access functions.');
})();`;

// Note: For a production-ready minifier, use a proper tool like terser
console.log('To create a proper minified bookmarklet, run:');
console.log('npx terser github-pat-bookmarklet.js -c -m --toplevel -o bookmarklet.min.js');
console.log('\nThen wrap the output with: javascript:(function(){...})();');