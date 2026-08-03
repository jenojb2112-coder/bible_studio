# HolyVerse Bible Studio

HolyVerse Bible Studio is a web application integrated with Firebase Firestore and Authentication.

## 🔒 Firebase Configuration & Environment Variables

To protect credentials, the Firebase API keys and configuration have been extracted from `index.html` and replaced with placeholders (`__FIREBASE_API_KEY__`, etc.). These values must be injected during the build or deployment process.

### Environment Variables Template

Create a `.env` file in the root directory based on `.env.example`:

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### 🔧 Injection During Build / Deployment

You can inject these environment variables into `index.html` using a simple script before serving or deploying.

#### Option 1: Using `envsubst` (Bash)

If you have `envsubst` installed, you can replace the placeholders in a deployment script:

```bash
# Export variables from .env
export $(grep -v '^#' .env | xargs)

# Replace placeholders in index.html and output to build/index.html
mkdir -p build
envsubst < index.html > build/index.html
```

#### Option 2: Using a Simple Node.js Script

Alternatively, you can run a simple Node.js script to replace the placeholders:

```javascript
const fs = require('fs');
require('dotenv').config(); // optional if utilizing dotenv package

let html = fs.readFileSync('index.html', 'utf8');

const vars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID'
];

vars.forEach(v => {
  const value = process.env[v] || '';
  html = html.replace(new RegExp(`__${v}__`, 'g'), value);
});

fs.writeFileSync('index.html', html);
```

This ensures that actual keys are never committed to your Git repository, keeping your application credentials secure.
