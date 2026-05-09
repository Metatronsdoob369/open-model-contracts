const fs = require('fs-extra');
const path = require('path');

function listSkillIds(sourceDir) {
  if (!fs.existsSync(sourceDir)) return [];
  return fs.readdirSync(sourceDir).filter(f => {
    return fs.statSync(path.join(sourceDir, f)).isDirectory() && !f.startsWith('.');
  });
}

function readSkill(sourceDir, skillId) {
  const manifestPath = path.join(sourceDir, skillId, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }
  return { id: skillId, name: skillId, description: '' };
}

function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function unique(arr) {
  return [...new Set(arr)];
}

module.exports = {
  listSkillIds,
  readSkill,
  tokenize,
  unique
};
