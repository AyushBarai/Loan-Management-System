#!/usr/bin/env node
const semver = process.version.replace(/^v/, '');
const major = parseInt(semver.split('.')[0], 10);
const allowed = [20, 22];
if (!allowed.includes(major)) {
  console.error(`\nERROR: Unsupported Node.js version ${process.version}.\nThis project requires Node ${allowed.join(' or ')}. Use nvm or install a supported Node.js version and retry.\n`);
  process.exit(1);
}
process.exit(0);
