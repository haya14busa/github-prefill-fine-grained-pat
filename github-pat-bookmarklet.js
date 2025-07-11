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

// Set repository access type
function setRepositoryAccess(accessType) {
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
function getRepositoryAccess() {
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
function waitForRepositoryPicker(maxAttempts = 20) {
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
async function selectRepositories(repoNames) {
  try {
    // First ensure 'selected' mode is active
    if (getRepositoryAccess() !== 'selected') {
      console.log('Setting repository access to "selected" first...');
      setRepositoryAccess('selected');
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
    await waitForRepositoryPicker();
    
    // Clear any existing selections first
    clearAllRepositories();
    
    // Wait a bit for UI to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add each repository sequentially
    for (const repoName of repoNames) {
      try {
        await addRepository(repoName);
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
async function addRepository(repoName, maxRetries = 5) {
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
function clearAllRepositories() {
  const removeButtons = document.querySelectorAll('.js-repository-picker-remove');
  removeButtons.forEach(button => {
    button.click();
  });
  console.log(`Cleared ${removeButtons.length} repositories`);
}

// Get currently selected repositories
function getSelectedRepositories() {
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

// Example: Set repository access
// setRepositoryAccess('all'); // All repos
// setRepositoryAccess('selected'); // Selected repos only
// setRepositoryAccess('none'); // Public repos only

// Example: Select specific repositories
// selectRepositories(['myrepo', 'another-repo', 'third-repo']);
