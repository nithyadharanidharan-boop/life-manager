const fs = require('fs');
const path = require('path');

function createPersistedArray(filePath, initialValue = []) {
  const resolvedPath = path.resolve(filePath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let items = [];

  if (fs.existsSync(resolvedPath)) {
    try {
      const raw = fs.readFileSync(resolvedPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } catch (error) {
      console.warn(`Could not read persisted store ${resolvedPath}:`, error.message);
    }
  }

  if (items.length === 0 && Array.isArray(initialValue)) {
    items = initialValue;
  }

  const save = () => {
    fs.writeFileSync(resolvedPath, JSON.stringify(items, null, 2));
  };

  return new Proxy(items, {
    get(target, prop, receiver) {
      if (prop === 'save') return save;
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      if (prop !== 'save') {
        save();
      }
      return result;
    },
  });
}

module.exports = { createPersistedArray };
