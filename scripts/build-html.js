#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read the template HTML
const templatePath = path.join(__dirname, '../src/index.template.html');
let htmlContent;

// Check if template exists, otherwise use the current index.html
if (fs.existsSync(templatePath)) {
  htmlContent = fs.readFileSync(templatePath, 'utf8');
} else {
  // For now, copy the existing index.html
  htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
}

// Read the bookmarklet data
const bookmarkletData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../dist/bookmarklet.json'), 'utf8')
);

// Replace the bookmarklet URL placeholder in the HTML
htmlContent = htmlContent.replace(
  /<!--BOOKMARKLET_URL-->/g,
  bookmarkletData.url
);

// Save the built HTML
fs.writeFileSync(path.join(__dirname, '../dist/index.html'), htmlContent);

// Copy any assets (if we add CSS/images later)
// fs.cpSync(src, dest, {recursive: true});

console.log('✅ HTML built successfully!');