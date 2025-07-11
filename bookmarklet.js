// GitHub Fine-grained PAT Bookmarklet
// This is the minified version that can be used as a bookmarklet

javascript:(function(){
  // Core functionality wrapped in IIFE
  window.ghPat = {
    setPermission: function(resourceName, accessLevel) {
      const permissionRows = document.querySelectorAll('li.js-list-group-item');
      for (const row of permissionRows) {
        const buttons = row.querySelectorAll('button[data-resource]');
        for (const button of buttons) {
          if (button.getAttribute('data-resource') === resourceName) {
            const dropdownButton = row.querySelector('.js-action-selection-list-menu-button');
            if (!dropdownButton) {
              console.error(`Dropdown button not found for ${resourceName}`);
              return false;
            }
            dropdownButton.click();
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
    },
    
    setMultiplePermissions: function(permissions) {
      let delay = 0;
      for (const [resource, access] of Object.entries(permissions)) {
        setTimeout(() => {
          this.setPermission(resource, access);
        }, delay);
        delay += 200;
      }
    },
    
    listAvailablePermissions: function() {
      const permissions = {};
      const permissionRows = document.querySelectorAll('li.js-list-group-item');
      permissionRows.forEach(row => {
        const titleElement = row.querySelector('strong');
        if (!titleElement) return;
        const permissionTitle = titleElement.textContent.trim();
        const resourceButton = row.querySelector('button[data-resource]');
        if (!resourceButton) return;
        const resourceName = resourceButton.getAttribute('data-resource');
        const resourceParent = resourceButton.getAttribute('data-resource-parent');
        const currentButton = row.querySelector('.js-action-selection-list-menu-button');
        let currentAccess = 'none';
        if (currentButton) {
          const buttonText = currentButton.textContent.trim();
          if (buttonText.includes('Read and write')) currentAccess = 'write';
          else if (buttonText.includes('Read-only')) currentAccess = 'read';
          else if (buttonText.includes('No access')) currentAccess = 'none';
        }
        const availableLevels = [];
        row.querySelectorAll('button[data-value]').forEach(btn => {
          const value = btn.getAttribute('data-value');
          if (value) availableLevels.push(value);
        });
        permissions[resourceName] = {
          title: permissionTitle,
          parent: resourceParent,
          currentAccess: currentAccess,
          availableLevels: [...new Set(availableLevels)]
        };
      });
      console.log('Available permissions:');
      console.table(permissions);
      return permissions;
    },
    
    getCurrentPermissions: function() {
      const permissions = this.listAvailablePermissions();
      const current = {};
      for (const [resource, info] of Object.entries(permissions)) {
        if (info.currentAccess !== 'none') {
          current[resource] = info.currentAccess;
        }
      }
      console.log('Current non-zero permissions:');
      console.log(current);
      return current;
    },
    
    setRepositoryAccess: function(accessType) {
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
      if (accessType === 'selected') {
        console.log('Note: You will need to select specific repositories manually or use selectRepositories() function');
      }
      return true;
    },
    
    getRepositoryAccess: function() {
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
    },
    
    waitForRepositoryPicker: function(callback, maxAttempts = 20) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        const repoSearchInput = document.querySelector('.js-integrations-install-repo-selection input[type="text"]');
        const repoList = document.querySelector('.js-integrations-install-repo-selection .js-repository-picker-results');
        if (repoSearchInput || repoList || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          if (attempts >= maxAttempts) {
            console.error('Repository picker did not load in time');
          } else {
            console.log('Repository picker loaded');
            if (callback) callback();
          }
        }
      }, 500);
    },
    
    selectRepositories: function(repoNames) {
      if (this.getRepositoryAccess() !== 'selected') {
        console.log('Setting repository access to "selected" first...');
        this.setRepositoryAccess('selected');
      }
      setTimeout(() => {
        const selectButton = document.querySelector('#repository-menu-list');
        if (!selectButton) {
          console.error('Repository picker button not found');
          return;
        }
        selectButton.click();
        console.log('Opening repository picker...');
        this.waitForRepositoryPicker(() => {
          this.clearAllRepositories();
          let delay = 500;
          repoNames.forEach((repoName, index) => {
            setTimeout(() => {
              this.addRepository(repoName);
            }, delay + (index * 300));
          });
        });
      }, 500);
    },
    
    addRepository: function(repoName) {
      const selectButton = document.querySelector('#repository-menu-list');
      if (!selectButton) {
        console.error('Repository select button not found');
        return;
      }
      selectButton.click();
      setTimeout(() => {
        const searchInput = document.querySelector('#repository-menu-list-filter');
        if (!searchInput) {
          console.error('Repository search input not found');
          return;
        }
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.value = repoName;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
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
          if (!found) {
            console.error(`Repository not found: ${repoName}`);
          }
          setTimeout(() => {
            const closeButton = document.querySelector('[data-close-dialog-id="repository-menu-list-dialog"]');
            if (closeButton) {
              closeButton.click();
            } else {
              document.body.click();
            }
          }, 100);
        }, 500);
      }, 200);
    },
    
    clearAllRepositories: function() {
      const removeButtons = document.querySelectorAll('.js-repository-picker-remove');
      removeButtons.forEach(button => {
        button.click();
      });
      console.log(`Cleared ${removeButtons.length} repositories`);
    },
    
    getSelectedRepositories: function() {
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
  };
  
  console.log('GitHub PAT Helper loaded! Available functions:');
  console.log('- ghPat.setPermission(resource, level)');
  console.log('- ghPat.setMultiplePermissions({resource: level, ...})');
  console.log('- ghPat.listAvailablePermissions()');
  console.log('- ghPat.getCurrentPermissions()');
  console.log('- ghPat.setRepositoryAccess(type)');
  console.log('- ghPat.getRepositoryAccess()');
  console.log('- ghPat.selectRepositories([repo1, repo2, ...])');
  console.log('- ghPat.addRepository(repoName)');
  console.log('- ghPat.clearAllRepositories()');
  console.log('- ghPat.getSelectedRepositories()');
})();