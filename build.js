const fs = require('fs');
const path = require('path');

// 1. Read .env file line by line if it exists
const env = { ...process.env };

function parseEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      // Ignore comments and empty lines
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const firstEquals = trimmed.indexOf('=');
      if (firstEquals !== -1) {
        const key = trimmed.substring(0, firstEquals).trim();
        let val = trimmed.substring(firstEquals + 1).trim();
        // Remove surrounding quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        // Only set if not already in process.env (process.env overrides .env file)
        if (process.env[key] === undefined) {
          env[key] = val;
        }
      }
    });
  }
}

// First parse .env.example for default values if any, then .env for local overrides
parseEnvFile(path.join(__dirname, '.env.example'));
parseEnvFile(path.join(__dirname, '.env'));

// 2. Define the mappings from placeholders to env keys
const mappings = {
  '__FIREBASE_API_KEY__': 'FIREBASE_API_KEY',
  '__FIREBASE_AUTH_DOMAIN__': 'FIREBASE_AUTH_DOMAIN',
  '__FIREBASE_PROJECT_ID__': 'FIREBASE_PROJECT_ID',
  '__FIREBASE_STORAGE_BUCKET__': 'FIREBASE_STORAGE_BUCKET',
  '__FIREBASE_MESSAGING_SENDER_ID__': 'FIREBASE_MESSAGING_SENDER_ID',
  '__FIREBASE_APP_ID__': 'FIREBASE_APP_ID',
  '__FIREBASE_MEASUREMENT_ID__': 'FIREBASE_MEASUREMENT_ID'
};

// 3. Read the template file
const templatePath = path.join(__dirname, 'index.template.html');
if (!fs.existsSync(templatePath)) {
  console.error(`Error: Template file not found at ${templatePath}`);
  process.exit(1);
}

let templateContent = fs.readFileSync(templatePath, 'utf8');

// 4. Perform replacements
for (const [placeholder, envKey] of Object.entries(mappings)) {
  const value = env[envKey];
  if (value === undefined) {
    console.warn(`Warning: Environment variable ${envKey} is not defined. Using empty string.`);
    templateContent = templateContent.replaceAll(placeholder, '');
  } else {
    templateContent = templateContent.replaceAll(placeholder, value);
  }
}

// 5. Write to index.html
const outputPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outputPath, templateContent, 'utf8');
console.log('Successfully generated index.html!');
