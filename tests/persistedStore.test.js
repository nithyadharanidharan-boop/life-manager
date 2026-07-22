const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createPersistedArray } = require('../models/persistedStore');

test('persists array changes to disk', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'life-manager-'));
  const filePath = path.join(dir, 'items.json');

  const items = createPersistedArray(filePath, [{ id: 1, name: 'first' }]);

  items.push({ id: 2, name: 'second' });
  items[0].name = 'updated';
  items.save();

  const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.equal(saved.length, 2);
  assert.equal(saved[0].name, 'updated');
  assert.equal(saved[1].name, 'second');
});
