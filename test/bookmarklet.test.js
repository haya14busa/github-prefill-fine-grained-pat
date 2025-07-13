// Tests for bookmarklet functions
// Run with: npm test

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock DOM elements
let mockElements;

beforeEach(() => {
  // Reset mocks
  mockElements = {};
  
  // Mock document methods
  global.document = {
    getElementById: jest.fn((id) => mockElements[id]),
    querySelector: jest.fn((selector) => mockElements[selector]),
    querySelectorAll: jest.fn((selector) => mockElements[selector] || []),
  };
  
  // Mock window
  global.window = {
    ghPat: {}
  };
  
  // Mock console
  global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    table: jest.fn(),
  };
});

describe('Token Name Functions', () => {
  beforeEach(() => {
    // Load the setTokenName function
    window.ghPat.setTokenName = function(name) {
      const nameInput = document.getElementById('user_programmatic_access_name');
      if (!nameInput) {
        console.error('Token name input not found');
        return false;
      }
      
      // GitHub has a 40 character limit for token names
      if (name.length > 40) {
        console.warn(`Token name is too long (${name.length} chars). Maximum is 40 characters.`);
        console.warn(`Truncating to: ${name.substring(0, 40)}`);
        name = name.substring(0, 40);
      }
      
      nameInput.value = name;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`Set token name to: ${name}`);
      return true;
    };
  });

  it('should set token name successfully', () => {
    const mockInput = {
      value: '',
      dispatchEvent: jest.fn()
    };
    mockElements['user_programmatic_access_name'] = mockInput;
    
    const result = window.ghPat.setTokenName('Test Token');
    
    expect(result).toBe(true);
    expect(mockInput.value).toBe('Test Token');
    expect(mockInput.dispatchEvent).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith('Set token name to: Test Token');
  });

  it('should truncate names longer than 40 characters', () => {
    const mockInput = {
      value: '',
      dispatchEvent: jest.fn()
    };
    mockElements['user_programmatic_access_name'] = mockInput;
    
    const longName = 'This is a very long token name that exceeds the 40 character limit';
    const result = window.ghPat.setTokenName(longName);
    
    expect(result).toBe(true);
    expect(mockInput.value).toBe('This is a very long token name that exce');
    expect(mockInput.value.length).toBe(40);
    expect(console.warn).toHaveBeenCalledWith('Token name is too long (67 chars). Maximum is 40 characters.');
    expect(console.warn).toHaveBeenCalledWith('Truncating to: This is a very long token name that exce');
  });

  it('should handle missing input element', () => {
    const result = window.ghPat.setTokenName('Test Token');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Token name input not found');
  });

  it('should handle exactly 40 characters', () => {
    const mockInput = {
      value: '',
      dispatchEvent: jest.fn()
    };
    mockElements['user_programmatic_access_name'] = mockInput;
    
    const name40Chars = 'x'.repeat(40);
    const result = window.ghPat.setTokenName(name40Chars);
    
    expect(result).toBe(true);
    expect(mockInput.value).toBe(name40Chars);
    expect(mockInput.value.length).toBe(40);
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('Permission Functions', () => {
  beforeEach(() => {
    // Load the setPermission function
    window.ghPat.setPermission = function(resourceName, accessLevel) {
      const permissionRows = document.querySelectorAll('li.js-list-group-item');
      
      for (const row of permissionRows) {
        const resourceText = row.querySelector('div.col-9')?.textContent || '';
        
        if (resourceText.toLowerCase().includes(resourceName.toLowerCase())) {
          const button = row.querySelector('summary.btn');
          
          if (!button) {
            console.error(`Button not found for resource: ${resourceName}`);
            return false;
          }
          
          button.click();
          
          setTimeout(() => {
            const menuItems = row.querySelectorAll('.SelectMenu-item');
            
            for (const item of menuItems) {
              const label = item.textContent?.toLowerCase() || '';
              
              if (label.includes(accessLevel.toLowerCase())) {
                item.click();
                console.log(`Set ${resourceName} to ${accessLevel}`);
                return true;
              }
            }
            
            console.error(`Access level "${accessLevel}" not found for ${resourceName}`);
          }, 100);
          
          return true;
        }
      }
      
      console.error(`Resource "${resourceName}" not found`);
      return false;
    };
  });

  it('should find and click permission button', () => {
    const mockButton = { click: jest.fn() };
    const mockRow = {
      querySelector: jest.fn((selector) => {
        if (selector === 'div.col-9') {
          return { textContent: 'Contents' };
        }
        if (selector === 'summary.btn') {
          return mockButton;
        }
        return null;
      }),
      querySelectorAll: jest.fn(() => [])
    };
    
    mockElements['li.js-list-group-item'] = [mockRow];
    
    const result = window.ghPat.setPermission('contents', 'write');
    
    expect(result).toBe(true);
    expect(mockButton.click).toHaveBeenCalled();
  });

  it('should handle missing resource', () => {
    mockElements['li.js-list-group-item'] = [];
    
    const result = window.ghPat.setPermission('nonexistent', 'read');
    
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Resource "nonexistent" not found');
  });
});

// Add more test suites for other functions as needed