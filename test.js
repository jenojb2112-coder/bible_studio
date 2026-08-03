const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  // 1. Run the build script to ensure index.html is generated
  console.log('Running build.js...');
  execSync('node build.js', { stdio: 'inherit' });

  // 2. Read the generated index.html
  const generatedHtml = fs.readFileSync('index.html', 'utf8');

  // 3. Define the placeholder mappings we want to check
  const placeholders = [
    '__FIREBASE_API_KEY__',
    '__FIREBASE_AUTH_DOMAIN__',
    '__FIREBASE_PROJECT_ID__',
    '__FIREBASE_STORAGE_BUCKET__',
    '__FIREBASE_MESSAGING_SENDER_ID__',
    '__FIREBASE_APP_ID__',
    '__FIREBASE_MEASUREMENT_ID__'
  ];

  // Check that NO placeholders remain in the generated file
  console.log('Checking that all placeholders were replaced...');
  for (const placeholder of placeholders) {
    if (generatedHtml.includes(placeholder)) {
      throw new Error(`Failure: Placeholder ${placeholder} was found in the generated index.html!`);
    }
  }
  console.log('✅ Success: All placeholders were successfully removed.');

  // 4. Load the local .env to make sure those specific values are indeed in index.html
  console.log('Verifying injected values match .env...');
  const env = {};
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const firstEquals = trimmed.indexOf('=');
      if (firstEquals !== -1) {
        const key = trimmed.substring(0, firstEquals).trim();
        let val = trimmed.substring(firstEquals + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        env[key] = val;
      }
    });
  }

  const expectedKeys = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
    'FIREBASE_MEASUREMENT_ID'
  ];

  for (const key of expectedKeys) {
    const expectedValue = env[key];
    if (expectedValue) {
      if (!generatedHtml.includes(expectedValue)) {
        throw new Error(`Failure: Expected value "${expectedValue}" for ${key} was not found in index.html!`);
      }
    }
  }
  console.log('✅ Success: Generated index.html contains the correct keys from .env!');

  console.log('🎉 All tests passed successfully!');
  process.exit(0);
} catch (err) {
  console.error('❌ Test failed:', err.message || err);
  process.exit(1);
}
