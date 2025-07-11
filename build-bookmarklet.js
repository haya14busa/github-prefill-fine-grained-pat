// This script creates a properly minified bookmarklet
// Run: node build-bookmarklet.js

const fs = require('fs');

// Read the bookmarklet.js file
const code = fs.readFileSync('bookmarklet.js', 'utf8');

// Remove the outer IIFE wrapper and extract just the object assignment
const codeContent = code
  .replace(/^javascript:\(function\(\)\{/, '')
  .replace(/\}\)\(\);$/, '');

// Create the minified bookmarklet URL
const bookmarkletUrl = 'javascript:' + encodeURIComponent('(function(){' + codeContent + '})();');

console.log('Bookmarklet URL length:', bookmarkletUrl.length);
console.log('\nBookmarklet URL (copy this to update index.html):');
console.log(bookmarkletUrl);

// Also save to a file for easy copying
fs.writeFileSync('bookmarklet-url.txt', bookmarkletUrl);
console.log('\nBookmarklet URL saved to bookmarklet-url.txt');