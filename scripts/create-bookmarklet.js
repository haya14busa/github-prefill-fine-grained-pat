#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read the minified JavaScript
const minifiedCode = fs.readFileSync(path.join(__dirname, '../dist/bookmarklet.min.js'), 'utf8');

// Wrap in IIFE and create bookmarklet
const bookmarkletCode = `(function(){${minifiedCode}})()`;

// Create the bookmarklet URL
const bookmarkletUrl = 'javascript:' + encodeURIComponent(bookmarkletCode);

// Save the bookmarklet URL to a file
fs.writeFileSync(path.join(__dirname, '../dist/bookmarklet-url.txt'), bookmarkletUrl);

// Also create a JSON file for easy integration
const bookmarkletData = {
  url: bookmarkletUrl,
  code: bookmarkletCode,
  minifiedLength: minifiedCode.length,
  bookmarkletLength: bookmarkletUrl.length
};

fs.writeFileSync(
  path.join(__dirname, '../dist/bookmarklet.json'), 
  JSON.stringify(bookmarkletData, null, 2)
);

console.log(`✅ Bookmarklet created!`);
console.log(`   Minified code: ${minifiedCode.length} chars`);
console.log(`   Bookmarklet URL: ${bookmarkletUrl.length} chars`);
console.log(`   Files saved to dist/`);