// GitHub Fine-grained PAT auto-configuration script
// Usage: ghPat.setPermission('blocking', 'write')

// Create global object for bookmarklet
window.ghPat = window.ghPat || {};

// Set token name
window.ghPat.setTokenName = function(name) {
  const nameInput = document.getElementById('user_programmatic_access_name');
  if (!nameInput) {
    console.error('Token name input not found');
    return false;
  }
  
  nameInput.value = name;
  nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  nameInput.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Set token name to: ${name}`);
  return true;
}

// Get current token name
window.ghPat.getTokenName = function() {
  const nameInput = document.getElementById('user_programmatic_access_name');
  if (!nameInput) {
    console.error('Token name input not found');
    return null;
  }
  
  const name = nameInput.value;
  console.log(`Current token name: ${name || '(empty)'}`);
  return name;
}

// Set token description
window.ghPat.setTokenDescription = function(description) {
  const descriptionTextarea = document.getElementById('user_programmatic_access_description');
  if (!descriptionTextarea) {
    console.error('Token description textarea not found');
    return false;
  }
  
  descriptionTextarea.value = description;
  descriptionTextarea.dispatchEvent(new Event('input', { bubbles: true }));
  descriptionTextarea.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Set token description to: ${description}`);
  return true;
}

// Get current token description
window.ghPat.getTokenDescription = function() {
  const descriptionTextarea = document.getElementById('user_programmatic_access_description');
  if (!descriptionTextarea) {
    console.error('Token description textarea not found');
    return null;
  }
  
  const description = descriptionTextarea.value;
  console.log(`Current token description: ${description || '(empty)'}`);
  return description;
}

// Wait for permission elements to be available
window.ghPat.waitForPermissionElements = function(maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkElements = () => {
      const permissionRows = document.querySelectorAll('li.js-list-group-item');
      const hasPermissions = permissionRows.length > 0 && 
        Array.from(permissionRows).some(row => 
          row.querySelector('button[data-resource]') && 
          row.querySelector('.js-action-selection-list-menu-button')
        );
      
      if (hasPermissions) {
        resolve();
      } else {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error(`Permission elements not found after ${maxRetries} attempts`));
        } else {
          setTimeout(checkElements, 200);
        }
      }
    };
    
    checkElements();
  });
}

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

// Wait for repository access radio buttons to be available
window.ghPat.waitForRepositoryAccessElements = function(maxRetries = 30) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkElements = () => {
      const radioButtons = {
        'none': document.getElementById('install_target_none'),
        'all': document.getElementById('install_target_all'),
        'selected': document.getElementById('install_target_selected')
      };
      
      // Check if all radio buttons are available
      if (radioButtons.none && radioButtons.all && radioButtons.selected) {
        resolve(radioButtons);
      } else {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error(`Repository access elements not found after ${maxRetries} attempts`));
        } else {
          setTimeout(checkElements, 200);
        }
      }
    };
    
    checkElements();
  });
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

// Wait for repository to appear in selected list
window.ghPat.waitForRepositoryInList = function(repoName, maxRetries = 10) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkRepository = () => {
      const selectedRepos = document.querySelectorAll('.js-repository-picker-result .repo-and-owner');
      let found = false;
      
      for (const element of selectedRepos) {
        const fullName = element.textContent.trim();
        // Check if the repository name matches (handle both owner/repo and just repo)
        if (fullName.includes(repoName)) {
          found = true;
          break;
        }
      }
      
      if (found) {
        console.log(`Repository ${repoName} confirmed in selection list`);
        resolve();
      } else {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error(`Repository ${repoName} not found in selection list after ${maxRetries} attempts`));
        } else {
          setTimeout(checkRepository, 200);
        }
      }
    };
    
    // Start checking after a small delay
    setTimeout(checkRepository, 200);
  });
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
      // Extract owner and repo from the button text
      // Format is typically "owner/repo" or might have additional text
      const match = repoText.match(/^(.+?)\/(.+?)(?:\s|$)/);
      if (match) {
        const [, buttonOwner, buttonRepo] = match;
        // Check for exact match of repository name
        if (buttonRepo === repoName) {
          button.click();
          console.log(`Clicked repository: ${buttonOwner}/${buttonRepo}`);
          found = true;
          
          // Wait for the repository to appear in the selected list
          try {
            await window.ghPat.waitForRepositoryInList(repoName);
            return; // Success!
          } catch (error) {
            console.error(`Repository ${repoName} was clicked but didn't appear in list:`, error);
            // Continue to retry
            found = false;
          }
          break;
        }
      }
    }
    
    if (retryCount < maxRetries - 1 && !found) {
      console.log(`Repository ${repoName} not found yet, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 300));
    } else if (retryCount === maxRetries - 1 && !found) {
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
    const fullName = element.textContent.trim();
    // Extract just the repository name (remove owner prefix)
    const parts = fullName.split('/');
    const repoName = parts.length > 1 ? parts[parts.length - 1] : fullName;
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
      // Find the "Custom" option (might have additional text like "between 1 and 366 days")
      targetButton = Array.from(document.querySelectorAll('.js-new-default-token-expiration-item button'))
        .find(btn => btn.textContent.trim().startsWith('Custom'));
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
  return new Promise((resolve, reject) => {
    // Click the resource owner dropdown button
    const dropdownButton = document.getElementById('resource-owner-select-panel-button');
    if (!dropdownButton) {
      console.error('Resource owner dropdown button not found');
      reject(new Error('Resource owner dropdown button not found'));
      return;
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
          console.log(`Clicked resource owner: ${ownerName}`);
          found = true;
          
          // Wait and verify the owner was set
          window.ghPat.waitForResourceOwner(ownerName)
            .then(() => {
              console.log(`Resource owner successfully set to: ${ownerName}`);
              resolve(true);
            })
            .catch(reject);
          break;
        }
      }
      
      if (!found) {
        const error = `Resource owner not found: ${ownerName}`;
        console.error(error);
        console.log('Hint: Available owners can be listed with getAvailableResourceOwners()');
        reject(new Error(error));
      }
    }, 300);
  });
}

// Wait for resource owner to be set in the UI
window.ghPat.waitForResourceOwner = function(expectedOwner, maxRetries = 20) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkOwner = () => {
      const dropdownButton = document.getElementById('resource-owner-select-panel-button');
      if (!dropdownButton) {
        reject(new Error('Resource owner dropdown button not found'));
        return;
      }
      
      const buttonText = dropdownButton.textContent || '';
      if (buttonText.includes(expectedOwner)) {
        resolve();
      } else {
        retries++;
        if (retries >= maxRetries) {
          reject(new Error(`Resource owner not set after ${maxRetries} attempts. Expected: ${expectedOwner}, Current button text: ${buttonText}`));
        } else {
          setTimeout(checkOwner, 200);
        }
      }
    };
    
    // Start checking after a small delay
    setTimeout(checkOwner, 200);
  });
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
    // More specific selector: only buttons within the resource owner dialog
    const ownerDialog = document.getElementById('resource-owner-select-panel-dialog');
    if (!ownerDialog) {
      console.error('Resource owner dialog not found');
      return [];
    }
    
    // Get buttons specifically within the resource owner dialog
    const ownerButtons = ownerDialog.querySelectorAll('.ActionListItem button[data-value]');
    
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

// Parse URL parameters and apply configuration
window.ghPat.applyFromUrlParams = async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const config = {};
  let hasConfig = false;

  // Parse all supported parameters
  if (urlParams.has('name')) {
    config.name = urlParams.get('name');
    hasConfig = true;
  }
  
  if (urlParams.has('description')) {
    config.description = urlParams.get('description');
    hasConfig = true;
  }
  
  if (urlParams.has('owner')) {
    config.owner = urlParams.get('owner');
    hasConfig = true;
  }
  
  if (urlParams.has('expiration')) {
    config.expiration = urlParams.get('expiration');
    hasConfig = true;
  }
  
  if (urlParams.has('expiration_date')) {
    config.expirationDate = urlParams.get('expiration_date');
    hasConfig = true;
  }
  
  if (urlParams.has('repo_access')) {
    config.repoAccess = urlParams.get('repo_access');
    hasConfig = true;
  }
  
  if (urlParams.has('repos')) {
    // Parse repos and strip owner prefix if present (owner/repo -> repo)
    config.repos = urlParams.get('repos').split(',')
      .map(r => r.trim())
      .map(r => {
        // Handle owner/repo format by extracting just the repo name
        const parts = r.split('/');
        return parts.length > 1 ? parts[parts.length - 1] : r;
      })
      .filter(r => r);
    hasConfig = true;
  }
  
  // Parse permissions (format: permissions=contents:read,issues:write)
  if (urlParams.has('permissions')) {
    config.permissions = {};
    const permsString = urlParams.get('permissions');
    permsString.split(',').forEach(perm => {
      const [resource, level] = perm.split(':');
      if (resource && level) {
        config.permissions[resource.trim()] = level.trim();
      }
    });
    hasConfig = true;
  }

  if (!hasConfig) {
    console.log('No configuration found in URL parameters');
    return false;
  }

  console.log('Applying configuration from URL parameters:', config);

  // Apply configuration
  try {
    const promises = [];
    
    // Only name and description are independent of resource owner
    if (config.name) {
      promises.push(Promise.resolve(window.ghPat.setTokenName(config.name)));
    }
    
    if (config.description) {
      promises.push(Promise.resolve(window.ghPat.setTokenDescription(config.description)));
    }
    
    // Wait for independent operations to complete
    await Promise.all(promises);
    
    // Set resource owner first (repository access and permissions depend on this)
    if (config.owner) {
      await window.ghPat.setResourceOwner(config.owner);
      
      // Wait for page to reload and elements to be available
      const waitPromises = [];
      
      if (config.repoAccess || (config.repos && config.repos.length > 0)) {
        waitPromises.push(window.ghPat.waitForRepositoryAccessElements());
      }
      
      if (config.permissions && Object.keys(config.permissions).length > 0) {
        waitPromises.push(window.ghPat.waitForPermissionElements());
      }
      
      if (waitPromises.length > 0) {
        try {
          await Promise.all(waitPromises);
          console.log('Page elements loaded after owner change');
        } catch (error) {
          console.error('Failed to load page elements after owner change:', error);
          // Continue anyway - elements might still be accessible
        }
      }
    }
    
    // Set expiration after owner change (it gets reset)
    if (config.expiration) {
      if (config.expiration === 'custom' && config.expirationDate) {
        window.ghPat.setExpiration('custom', config.expirationDate);
      } else if (config.expiration === 'none') {
        window.ghPat.setExpiration('none');
      } else {
        // Convert string to number for numeric expiration days
        const expirationDays = parseInt(config.expiration, 10);
        if (!isNaN(expirationDays)) {
          // Check if it's a standard expiration option
          if ([7, 30, 60, 90].includes(expirationDays)) {
            window.ghPat.setExpiration(expirationDays);
          } else {
            // Non-standard days - calculate custom date
            const customDate = new Date();
            customDate.setDate(customDate.getDate() + expirationDays);
            // Format as YYYY-MM-DD in local timezone
            const year = customDate.getFullYear();
            const month = String(customDate.getMonth() + 1).padStart(2, '0');
            const day = String(customDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            console.log(`Non-standard expiration ${expirationDays} days, using custom date: ${dateStr}`);
            window.ghPat.setExpiration('custom', dateStr);
          }
        } else {
          console.error(`Invalid expiration value: ${config.expiration}`);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Repository access must be set before selecting repositories
    if (config.repoAccess) {
      // If owner wasn't set, still need to wait for elements
      if (!config.owner) {
        try {
          await window.ghPat.waitForRepositoryAccessElements();
        } catch (error) {
          console.error('Repository access elements not available:', error);
        }
      }
      
      window.ghPat.setRepositoryAccess(config.repoAccess);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Select repositories only after repo access is set
      if (config.repos && config.repos.length > 0 && config.repoAccess === 'selected') {
        await window.ghPat.selectRepositories(config.repos);
      }
    }
    
    // Set permissions
    if (config.permissions && Object.keys(config.permissions).length > 0) {
      // If owner wasn't set, still need to wait for elements
      if (!config.owner) {
        try {
          await window.ghPat.waitForPermissionElements();
        } catch (error) {
          console.error('Permission elements not available:', error);
        }
      }
      
      window.ghPat.setMultiplePermissions(config.permissions);
    }
    
    console.log('Configuration applied successfully!');
    return true;
  } catch (error) {
    console.error('Error applying configuration:', error);
    return false;
  }
}

// Generate URL with current configuration
window.ghPat.generateConfigUrl = function() {
  const params = new URLSearchParams();
  const baseUrl = window.location.origin + window.location.pathname;
  
  // Get current token name
  const name = window.ghPat.getTokenName();
  if (name) {
    params.set('name', name);
  }
  
  // Get current description
  const description = window.ghPat.getTokenDescription();
  if (description) {
    params.set('description', description);
  }
  
  // Get current owner
  const owner = window.ghPat.getResourceOwner();
  if (owner) {
    params.set('owner', owner);
  }
  
  // Get expiration
  const expiration = window.ghPat.getExpiration();
  if (expiration) {
    if (expiration.type === 'days') {
      params.set('expiration', expiration.days.toString());
    } else if (expiration.type === 'custom' && expiration.date) {
      params.set('expiration', 'custom');
      params.set('expiration_date', expiration.date);
    } else if (expiration.type === 'none') {
      params.set('expiration', 'none');
    }
  }
  
  // Get repository access
  const repoAccess = window.ghPat.getRepositoryAccess();
  if (repoAccess) {
    params.set('repo_access', repoAccess);
  }
  
  // Get selected repositories
  if (repoAccess === 'selected') {
    const repos = window.ghPat.getSelectedRepositories();
    if (repos && repos.length > 0) {
      params.set('repos', repos.join(','));
    }
  }
  
  // Get permissions
  const permissions = window.ghPat.getCurrentPermissions();
  if (permissions && Object.keys(permissions).length > 0) {
    const permsArray = Object.entries(permissions).map(([resource, level]) => `${resource}:${level}`);
    params.set('permissions', permsArray.join(','));
  }
  
  const configUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  console.log('Configuration URL:', configUrl);
  return configUrl;
}

// Copy configuration URL to clipboard
window.ghPat.copyConfigUrl = function() {
  const url = window.ghPat.generateConfigUrl();
  
  // Try using the modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => {
        console.log('Configuration URL copied to clipboard!');
        alert('Configuration URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
        fallbackCopyToClipboard(url);
      });
  } else {
    fallbackCopyToClipboard(url);
  }
  
  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        console.log('Configuration URL copied to clipboard!');
        alert('Configuration URL copied to clipboard!');
      } else {
        console.error('Failed to copy URL');
        prompt('Copy this URL:', text);
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', text);
    }
    
    document.body.removeChild(textArea);
  }
  
  return url;
}

// Open configuration URL in new tab
window.ghPat.openConfigUrl = function() {
  const url = window.ghPat.generateConfigUrl();
  window.open(url, '_blank');
  return url;
}

// Update current URL with configuration parameters
window.ghPat.updateUrlParams = function() {
  const params = new URLSearchParams();
  
  // Get current token name
  const name = window.ghPat.getTokenName();
  if (name) {
    params.set('name', name);
  }
  
  // Get current description
  const description = window.ghPat.getTokenDescription();
  if (description) {
    params.set('description', description);
  }
  
  // Get current owner
  const owner = window.ghPat.getResourceOwner();
  if (owner) {
    params.set('owner', owner);
  }
  
  // Get expiration
  const expiration = window.ghPat.getExpiration();
  if (expiration) {
    if (expiration.type === 'days') {
      params.set('expiration', expiration.days.toString());
    } else if (expiration.type === 'custom' && expiration.date) {
      params.set('expiration', 'custom');
      params.set('expiration_date', expiration.date);
    } else if (expiration.type === 'none') {
      params.set('expiration', 'none');
    }
  }
  
  // Get repository access
  const repoAccess = window.ghPat.getRepositoryAccess();
  if (repoAccess) {
    params.set('repo_access', repoAccess);
  }
  
  // Get selected repositories
  if (repoAccess === 'selected') {
    const repos = window.ghPat.getSelectedRepositories();
    if (repos && repos.length > 0) {
      params.set('repos', repos.join(','));
    }
  }
  
  // Get permissions
  const permissions = window.ghPat.getCurrentPermissions();
  if (permissions && Object.keys(permissions).length > 0) {
    const permsArray = Object.entries(permissions).map(([resource, level]) => `${resource}:${level}`);
    params.set('permissions', permsArray.join(','));
  }
  
  // Update URL without reloading the page
  const newUrl = params.toString() ? 
    `${window.location.pathname}?${params.toString()}` : 
    window.location.pathname;
  
  window.history.replaceState({}, '', newUrl);
  console.log('URL updated with current configuration');
  
  return window.location.href;
}

// Log initialization message
console.log('GitHub PAT Helper loaded! Available functions:');
console.log('- ghPat.setTokenName(name)');
console.log('- ghPat.getTokenName()');
console.log('- ghPat.setTokenDescription(description)');
console.log('- ghPat.getTokenDescription()');
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
console.log('- ghPat.setResourceOwner("owner-name") // Set resource owner (returns Promise)');
console.log('- ghPat.getResourceOwner()');
console.log('- ghPat.getAvailableResourceOwners()');
console.log('- ghPat.applyFromUrlParams() // Apply configuration from URL parameters');
console.log('- ghPat.generateConfigUrl() // Generate URL with current configuration');
console.log('- ghPat.copyConfigUrl() // Copy configuration URL to clipboard');
console.log('- ghPat.openConfigUrl() // Open configuration URL in new tab');
console.log('- ghPat.updateUrlParams() // Update current URL with configuration');

// Auto-detect whether to apply URL params or save current config
(async function() {
  const hasUrlParams = window.location.search;
  
  // Check if form has any values
  const hasFormValues = Boolean(
    window.ghPat.getTokenName() ||
    window.ghPat.getTokenDescription() ||
    window.ghPat.getCurrentPermissions() && Object.keys(window.ghPat.getCurrentPermissions()).length > 0
  );
  
  if (hasUrlParams && !hasFormValues) {
    // URL params exist and form is empty - apply params
    console.log('URL parameters detected and form is empty. Applying configuration...');
    await window.ghPat.applyFromUrlParams();
  } else if (hasFormValues) {
    // Form has values - save current configuration
    console.log('Form has values. Updating URL and copying configuration...');
    window.ghPat.updateUrlParams();
    window.ghPat.copyConfigUrl();
  } else {
    // No URL params and no form values
    console.log('Ready to use. Fill the form or visit a URL with parameters.');
  }
})();
