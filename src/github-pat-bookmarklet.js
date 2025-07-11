// GitHub Fine-grained PAT auto-configuration script
// Usage: ghPat.setPermission('blocking', 'write')

// Create global object for bookmarklet
window.ghPat = window.ghPat || {};

window.ghPat.setPermission = function(resourceName, accessLevel) {
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
window.ghPat.setMultiplePermissions = function(permissions) {
  let delay = 0;
  for (const [resource, access] of Object.entries(permissions)) {
    setTimeout(() => {
      window.ghPat.setPermission(resource, access);
    }, delay);
    delay += 200; // Add delay between operations
  }
}

// List all available permissions on the current page
window.ghPat.listAvailablePermissions = function() {
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
window.ghPat.getCurrentPermissions = function() {
  const permissions = window.ghPat.listAvailablePermissions();
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

// Set repository access type
window.ghPat.setRepositoryAccess = function(accessType) {
  // accessType can be: 'none' (public only), 'all', or 'selected'
  const radioButtons = {
    'none': document.getElementById('install_target_none'),
    'all': document.getElementById('install_target_all'),
    'selected': document.getElementById('install_target_selected')
  };
  
  const targetRadio = radioButtons[accessType];
  if (!targetRadio) {
    console.error(`Invalid repository access type: ${accessType}. Use 'none', 'all', or 'selected'`);
    return false;
  }
  
  targetRadio.click();
  console.log(`Set repository access to: ${accessType}`);
  
  // If 'selected' is chosen, we'll need to handle repository selection separately
  if (accessType === 'selected') {
    console.log('Note: You will need to select specific repositories manually or use selectRepositories() function');
  }
  
  return true;
}

// Get current repository access setting
window.ghPat.getRepositoryAccess = function() {
  const radioButtons = document.querySelectorAll('input[name="install_target"]');
  
  for (const radio of radioButtons) {
    if (radio.checked) {
      const value = radio.value;
      let description = '';
      
      switch(value) {
        case 'none':
          description = 'Public repositories only (read-only)';
          break;
        case 'all':
          description = 'All repositories (current and future)';
          break;
        case 'selected':
          description = 'Selected repositories only';
          break;
      }
      
      console.log(`Current repository access: ${value} - ${description}`);
      return value;
    }
  }
  
  console.log('No repository access type selected');
  return null;
}

// Helper function to wait for repository picker to load
window.ghPat.waitForRepositoryPicker = function(maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Look for the repository picker dialog
      const pickerDialog = document.querySelector('#repository-menu-list-dialog');
      const searchInput = document.querySelector('#repository-menu-list-filter');
      
      if ((pickerDialog && searchInput) || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        if (attempts >= maxAttempts) {
          reject(new Error('Repository picker did not load in time'));
        } else {
          console.log('Repository picker loaded');
          resolve();
        }
      }
    }, 500);
  });
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

// Select specific repositories (when repository access is set to 'selected')
window.ghPat.selectRepositories = async function(repoNames) {
  try {
    // First ensure 'selected' mode is active
    if (window.ghPat.getRepositoryAccess() !== 'selected') {
      console.log('Setting repository access to "selected" first...');
      window.ghPat.setRepositoryAccess('selected');
      // Wait for UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Open the repository picker by clicking the button
    const selectButton = document.querySelector('#repository-menu-list-button');
    if (!selectButton) {
      throw new Error('Repository picker button not found');
    }
    
    selectButton.click();
    console.log('Opening repository picker...');
    
    // Wait for repository picker to load
    await window.ghPat.waitForRepositoryPicker();
    
    // Clear any existing selections first
    window.ghPat.clearAllRepositories();
    
    // Wait a bit for UI to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add each repository sequentially
    for (const repoName of repoNames) {
      try {
        await window.ghPat.addRepository(repoName);
        // Small delay between selections
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to add repository ${repoName}:`, error.message);
      }
    }
    
    // Close the dialog after all repositories are added
    const closeButton = document.querySelector('[data-close-dialog-id="repository-menu-list-dialog"]');
    if (closeButton) {
      closeButton.click();
    } else {
      // Alternative: click outside or press Escape
      const dialog = document.querySelector('#repository-menu-list-dialog');
      if (dialog) {
        document.body.click();
      }
    }
    console.log('Repository selection completed');
  } catch (error) {
    console.error('Error in selectRepositories:', error.message);
  }
}

// Add a single repository to the selection
window.ghPat.addRepository = async function(repoName, maxRetries = 5) {
  // Find the search input (assumes picker is already open)
  const searchInput = document.querySelector('#repository-menu-list-filter');
  if (!searchInput) {
    throw new Error('Repository search input not found. Make sure the picker is open.');
  }
  
  // Clear and type the repository name
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Type the repository name
  searchInput.value = repoName;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait a bit for initial search
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retry logic for finding and clicking the repository
  for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
    // Find the repository in the list
    const repoButtons = document.querySelectorAll('button[role="option"]');
    let found = false;
    
    for (const button of repoButtons) {
      const repoText = button.textContent.trim();
      if (repoText.includes(repoName)) {
        button.click();
        console.log(`Selected repository: ${repoName}`);
        found = true;
        break;
      }
    }
    
    if (found) {
      return; // Success!
    }
    
    if (retryCount < maxRetries - 1) {
      console.log(`Repository ${repoName} not found yet, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      throw new Error(`Repository not found after ${maxRetries} attempts: ${repoName}`);
    }
  }
}

// Clear all selected repositories
window.ghPat.clearAllRepositories = function() {
  const removeButtons = document.querySelectorAll('.js-repository-picker-remove');
  removeButtons.forEach(button => {
    button.click();
  });
  console.log(`Cleared ${removeButtons.length} repositories`);
}

// Get currently selected repositories
window.ghPat.getSelectedRepositories = function() {
  const selectedRepos = [];
  const repoElements = document.querySelectorAll('.js-repository-picker-result .repo-and-owner');
  
  repoElements.forEach(element => {
    const repoName = element.textContent.trim();
    selectedRepos.push(repoName);
  });
  
  console.log('Currently selected repositories:');
  console.log(selectedRepos);
  
  return selectedRepos;
}

// Set token expiration
window.ghPat.setExpiration = function(days, customDate) {
  // days can be: 7, 30, 60, 90, 'custom', or 'none'
  // customDate: optional, used when days='custom', format: 'YYYY-MM-DD'
  
  // First, click the expiration dropdown button
  const dropdownButton = document.querySelector('.js-new-default-token-expiration-select button[popovertarget]');
  if (!dropdownButton) {
    console.error('Expiration dropdown button not found');
    return false;
  }
  
  dropdownButton.click();
  
  // Wait a bit for dropdown to open
  setTimeout(() => {
    let targetButton;
    
    if (days === 'none') {
      // Find the "No expiration" option
      targetButton = Array.from(document.querySelectorAll('.js-new-default-token-expiration-item button'))
        .find(btn => btn.textContent.includes('No expiration'));
    } else if (days === 'custom') {
      // Find the "Custom" option
      targetButton = Array.from(document.querySelectorAll('.js-new-default-token-expiration-item button'))
        .find(btn => btn.textContent.trim() === 'Custom');
    } else if (typeof days === 'number') {
      // Find the option with matching days
      targetButton = document.querySelector(`.js-new-default-token-expiration-item button[data-value="${days}"]`);
    }
    
    if (targetButton) {
      targetButton.click();
      console.log(`Set expiration to: ${days === 'none' ? 'No expiration' : days === 'custom' ? 'Custom' : `${days} days`}`);
      
      if (days === 'custom') {
        // Wait for the date input to appear
        setTimeout(() => {
          const dateInput = document.getElementById('user_programmatic_access_custom_expires_at');
          if (dateInput && customDate) {
            dateInput.value = customDate;
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set custom expiration date to: ${customDate}`);
          } else if (!customDate) {
            console.log('Note: Use setExpiration("custom", "YYYY-MM-DD") to set a specific date');
          } else {
            console.error('Custom date input not found');
          }
        }, 300);
      }
    } else {
      console.error(`Expiration option not found: ${days}`);
    }
  }, 300);
  
  return true;
}

// Get current expiration setting
window.ghPat.getExpiration = function() {
  const dropdownButton = document.querySelector('.js-new-default-token-expiration-select button[popovertarget]');
  if (!dropdownButton) {
    console.error('Expiration dropdown button not found');
    return null;
  }
  
  const buttonText = dropdownButton.textContent.trim();
  
  if (buttonText.includes('No expiration')) {
    console.log('Current expiration: No expiration');
    return { type: 'none' };
  } else if (buttonText.includes('Custom')) {
    // Check if there's a custom date set
    const dateInput = document.getElementById('user_programmatic_access_custom_expires_at');
    if (dateInput && dateInput.value) {
      console.log(`Current expiration: Custom (${dateInput.value})`);
      return { type: 'custom', date: dateInput.value };
    } else {
      console.log('Current expiration: Custom (no date set)');
      return { type: 'custom', date: null };
    }
  } else {
    // Extract days from text like "30 days (Aug 10, 2025)"
    const match = buttonText.match(/(\d+)\s+days/);
    if (match) {
      const days = parseInt(match[1]);
      console.log(`Current expiration: ${days} days`);
      return { type: 'days', days: days };
    }
  }
  
  console.log('Could not determine current expiration');
  return null;
}

// Helper function to set custom expiration date
window.ghPat.setCustomExpirationDate = function(date) {
  // date format: 'YYYY-MM-DD'
  const dateInput = document.getElementById('user_programmatic_access_custom_expires_at');
  if (!dateInput) {
    console.error('Custom date input not found. Make sure "custom" expiration is selected first.');
    return false;
  }
  
  dateInput.value = date;
  dateInput.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Set custom expiration date to: ${date}`);
  return true;
}

// Set resource owner (user or organization)
window.ghPat.setResourceOwner = function(ownerName) {
  // Click the resource owner dropdown button
  const dropdownButton = document.getElementById('resource-owner-select-panel-button');
  if (!dropdownButton) {
    console.error('Resource owner dropdown button not found');
    return false;
  }
  
  dropdownButton.click();
  
  // Wait for dropdown to open
  setTimeout(() => {
    // Find the owner in the list
    const ownerButtons = document.querySelectorAll('.ActionListItem button[data-value]');
    let found = false;
    
    for (const button of ownerButtons) {
      if (button.getAttribute('data-value') === ownerName) {
        button.click();
        console.log(`Set resource owner to: ${ownerName}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.error(`Resource owner not found: ${ownerName}`);
      console.log('Hint: Available owners can be listed with getAvailableResourceOwners()');
    }
  }, 300);
  
  return true;
}

// Get current resource owner
window.ghPat.getResourceOwner = function() {
  const dropdownButton = document.getElementById('resource-owner-select-panel-button');
  if (!dropdownButton) {
    console.error('Resource owner dropdown button not found');
    return null;
  }
  
  // Get the current value from the hidden input
  const hiddenInput = document.querySelector('input[name="target_name"]');
  if (hiddenInput) {
    const owner = hiddenInput.value;
    console.log(`Current resource owner: ${owner}`);
    return owner;
  }
  
  // Fallback: try to get from button text
  const buttonText = dropdownButton.textContent.trim();
  // Remove extra whitespace and extract the owner name
  const match = buttonText.match(/\s+([\w-]+)\s*$/);
  if (match) {
    const owner = match[1];
    console.log(`Current resource owner: ${owner}`);
    return owner;
  }
  
  console.log('Could not determine current resource owner');
  return null;
}

// Get list of available resource owners
window.ghPat.getAvailableResourceOwners = function() {
  // Click the dropdown to load the list
  const dropdownButton = document.getElementById('resource-owner-select-panel-button');
  if (!dropdownButton) {
    console.error('Resource owner dropdown button not found');
    return [];
  }
  
  dropdownButton.click();
  
  // Wait for dropdown to load and collect owners
  setTimeout(() => {
    const owners = [];
    const ownerButtons = document.querySelectorAll('.ActionListItem button[data-value]');
    
    ownerButtons.forEach(button => {
      const value = button.getAttribute('data-value');
      const isOrg = button.closest('li').getAttribute('data-actor-is-organization') === 'true';
      const fgLimit = button.closest('li').getAttribute('data-fg-limit');
      const fgLimitLabel = button.closest('li').getAttribute('data-fg-limit-label');
      
      owners.push({
        name: value,
        isOrganization: isOrg,
        limit: fgLimit ? parseInt(fgLimit) : null,
        limitLabel: fgLimitLabel || null
      });
    });
    
    console.log('Available resource owners:');
    console.table(owners);
    
    // Close the dropdown
    const closeButton = document.querySelector('[data-close-dialog-id="resource-owner-select-panel-dialog"]');
    if (closeButton) {
      closeButton.click();
    }
    
    return owners;
  }, 500);
}

// Example: Set repository access
// ghPat.setRepositoryAccess('all'); // All repos
// ghPat.setRepositoryAccess('selected'); // Selected repos only
// ghPat.setRepositoryAccess('none'); // Public repos only

// Example: Select specific repositories
// ghPat.selectRepositories(['myrepo', 'another-repo', 'third-repo']);

// Log initialization message
console.log('GitHub PAT Helper loaded! Available functions:');
console.log('- ghPat.setPermission(resource, level)');
console.log('- ghPat.setMultiplePermissions({resource: level, ...})');
console.log('- ghPat.listAvailablePermissions()');
console.log('- ghPat.getCurrentPermissions()');
console.log('- ghPat.setRepositoryAccess(type)');
console.log('- ghPat.getRepositoryAccess()');
console.log('- ghPat.selectRepositories([repo1, repo2, ...])');
console.log('- ghPat.clearAllRepositories()');
console.log('- ghPat.getSelectedRepositories()');
console.log('- ghPat.setExpiration(days) // 7, 30, 60, 90, "custom", or "none"');
console.log('- ghPat.setExpiration("custom", "2025-12-31") // Set custom date');
console.log('- ghPat.getExpiration()');
console.log('- ghPat.setCustomExpirationDate("YYYY-MM-DD") // After selecting custom');
console.log('- ghPat.setResourceOwner("owner-name") // Set resource owner');
console.log('- ghPat.getResourceOwner()');
console.log('- ghPat.getAvailableResourceOwners()');
