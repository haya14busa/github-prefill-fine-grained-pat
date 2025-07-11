// GitHub Fine-grained PAT auto-configuration script
// Usage: setPermission('blocking', 'write')

function setPermission(resourceName, accessLevel) {
  // Find permission rows by resource name
  const permissionRows = document.querySelectorAll('li.js-list-group-item');
  
  for (const row of permissionRows) {
    // Look for buttons with data-resource attribute
    const buttons = row.querySelectorAll('button[data-resource]');
    
    for (const button of buttons) {
      if (button.getAttribute('data-resource') === resourceName) {
        // Found the matching resource
        
        // First, find the dropdown toggle button
        const dropdownButton = row.querySelector('.js-action-selection-list-menu-button');
        if (!dropdownButton) {
          console.error(`Dropdown button not found for ${resourceName}`);
          return false;
        }
        
        // Open the dropdown
        dropdownButton.click();
        
        // Wait a bit then click the specified access level button
        setTimeout(() => {
          const targetButton = row.querySelector(`button[data-resource="${resourceName}"][data-value="${accessLevel}"]`);
          if (targetButton) {
            targetButton.click();
            console.log(`Set ${resourceName} to ${accessLevel}`);
          } else {
            console.error(`Button not found for ${resourceName} with ${accessLevel} access`);
          }
        }, 100);
        
        return true;
      }
    }
  }
  
  console.error(`Permission ${resourceName} not found`);
  return false;
}

// Set multiple permissions at once
function setMultiplePermissions(permissions) {
  let delay = 0;
  for (const [resource, access] of Object.entries(permissions)) {
    setTimeout(() => {
      setPermission(resource, access);
    }, delay);
    delay += 200; // Add delay between operations
  }
}

// List all available permissions on the current page
function listAvailablePermissions() {
  const permissions = {};
  const permissionRows = document.querySelectorAll('li.js-list-group-item');
  
  permissionRows.forEach(row => {
    // Get the permission name from the title
    const titleElement = row.querySelector('strong');
    if (!titleElement) return;
    
    const permissionTitle = titleElement.textContent.trim();
    
    // Find the resource name from buttons with data-resource
    const resourceButton = row.querySelector('button[data-resource]');
    if (!resourceButton) return;
    
    const resourceName = resourceButton.getAttribute('data-resource');
    const resourceParent = resourceButton.getAttribute('data-resource-parent');
    
    // Get current access level
    const currentButton = row.querySelector('.js-action-selection-list-menu-button');
    let currentAccess = 'none';
    if (currentButton) {
      const buttonText = currentButton.textContent.trim();
      if (buttonText.includes('Read and write')) currentAccess = 'write';
      else if (buttonText.includes('Read-only')) currentAccess = 'read';
      else if (buttonText.includes('No access')) currentAccess = 'none';
    }
    
    // Get available access levels
    const availableLevels = [];
    row.querySelectorAll('button[data-value]').forEach(btn => {
      const value = btn.getAttribute('data-value');
      if (value) availableLevels.push(value);
    });
    
    permissions[resourceName] = {
      title: permissionTitle,
      parent: resourceParent,
      currentAccess: currentAccess,
      availableLevels: [...new Set(availableLevels)] // Remove duplicates
    };
  });
  
  console.log('Available permissions:');
  console.table(permissions);
  
  return permissions;
}

// Get current permission settings
function getCurrentPermissions() {
  const permissions = listAvailablePermissions();
  const current = {};
  
  for (const [resource, info] of Object.entries(permissions)) {
    if (info.currentAccess !== 'none') {
      current[resource] = info.currentAccess;
    }
  }
  
  console.log('Current non-zero permissions:');
  console.log(current);
  
  return current;
}

// Test: Set blocking permission to read-write
// setPermission('blocking', 'write');

// Example: Set multiple permissions
// setMultiplePermissions({
//   'blocking': 'write',
//   'contents': 'read',
//   'issues': 'write',
//   'pull_requests': 'write'
// });