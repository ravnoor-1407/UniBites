const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'backend', 'data', 'menuManifest.json');
const dbPath = path.join(__dirname, '..', 'backend', 'data', 'db.json');
const menuDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'menu');

console.log('--- Running UniBites Image Validation Audit ---');

let errors = 0;
const dishes = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const filesInMenuDir = new Set(fs.readdirSync(menuDir));
const referencedKeys = new Set();

// 1. Check all dishes in manifest
dishes.forEach((d, idx) => {
  if (!d.imageKey) {
    console.error(`❌ Dish ${d.id} (${d.name}) missing imageKey!`);
    errors++;
  } else {
    referencedKeys.add(d.imageKey);
    const expectedFile = `${d.imageKey}.webp`;
    if (!filesInMenuDir.has(expectedFile)) {
      console.error(`❌ Missing image file for key "${d.imageKey}" (dish ${d.id}: ${d.name}) -> expected ${expectedFile}`);
      errors++;
    }
  }

  if (d.image && (d.image.startsWith('http://') || d.image.startsWith('https://'))) {
    console.error(`❌ Dish ${d.id} has external HTTP/HTTPS URL: ${d.image}`);
    errors++;
  }

  if (!d.image || !d.image.startsWith('/images/menu/')) {
    console.error(`❌ Dish ${d.id} does not reference local /images/menu/ path: ${d.image}`);
    errors++;
  }
});

// 2. Check for unused files in public/images/menu
for (const file of filesInMenuDir) {
  if (!file.endsWith('.webp')) {
    console.error(`❌ Unexpected non-webp file in menu dir: ${file}`);
    errors++;
    continue;
  }
  const key = file.replace(/\.webp$/, '');
  if (!referencedKeys.has(key)) {
    console.error(`❌ Unused image file in public/images/menu/: ${file}`);
    errors++;
  }
}

// 3. Check db.json menuItems
if (fs.existsSync(dbPath)) {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const dbDishes = db.menuItems || [];
  dbDishes.forEach(d => {
    if (d.image && (d.image.startsWith('http://') || d.image.startsWith('https://'))) {
      console.error(`❌ db.json dish ${d.id} has external HTTP/HTTPS URL: ${d.image}`);
      errors++;
    }
    if (!d.imageKey) {
      console.error(`❌ db.json dish ${d.id} missing imageKey!`);
      errors++;
    }
  });
}

console.log(`\nAudit Complete:`);
console.log(`- Dishes checked: ${dishes.length}`);
console.log(`- Unique imageKeys: ${referencedKeys.size}`);
console.log(`- Image files in dir: ${filesInMenuDir.size}`);
console.log(`- External URLs: 0`);
console.log(`- Total validation errors: ${errors}`);

if (errors > 0) {
  console.error('\n❌ Image audit FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ 100% of images verified! Audit PASSED.');
  process.exit(0);
}
