/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract the script from index.html
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch ? scriptMatch[1] : '';

// Replace imports with global variables for testing in JSDOM
scriptContent = scriptContent.replace(/import\s+{([^}]+)}\s+from\s+["'][^"']+["'];/g, (match, imports) => {
    return `const {${imports}} = global;`;
});

// Since the script uses 'app', 'auth', 'db' variables at the top level module scope,
// we will just evaluate the modified script.
global.initializeApp = jest.fn();
global.getAuth = jest.fn(() => ({}));
global.getFirestore = jest.fn(() => ({}));
global.signInWithEmailAndPassword = jest.fn();
global.createUserWithEmailAndPassword = jest.fn();
global.signInWithPopup = jest.fn();
global.GoogleAuthProvider = jest.fn();
global.sendPasswordResetEmail = jest.fn();
global.onAuthStateChanged = jest.fn();
global.doc = jest.fn();
global.setDoc = jest.fn();
global.getDoc = jest.fn();
global.withTimeout = jest.fn();

// Add global setTimeout just in case
global.setTimeout = jest.fn((cb) => { if(typeof cb === 'function') return 1; });
global.clearTimeout = jest.fn();
global.window = global;

// Create DOM elements needed by the script
document.body.innerHTML = `
  <input id="loginEmail" type="text" />
  <input id="loginPass" type="password" />
  <div id="msgBox" style="display:none;"></div>
  <div id="loader" style="display:none;"></div>
  <div class="screen active" id="loginScreen"></div>
  <img id="churchPhotoPreview" />
  <svg id="eyeIcon"></svg>
`;

// Evaluate the script to register window.emailSignIn
eval(scriptContent);

describe('window.emailSignIn', () => {
  beforeEach(() => {
    // Reset inputs
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('msgBox').style.display = 'none';
    document.getElementById('msgBox').textContent = '';
    document.getElementById('loader').style.display = 'none';

    // Clear mock histories
    global.signInWithEmailAndPassword.mockClear();

    // Mock console.error to avoid noisy test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should be defined', () => {
    expect(typeof window.emailSignIn).toBe('function');
  });

  it('should show error message if email is missing', async () => {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = 'password123';

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toBe('⚠️ Email மற்றும் Password போடுங்க');
    expect(document.getElementById('msgBox').style.display).toBe('block');
    expect(global.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should show error message if password is missing', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = '';

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toBe('⚠️ Email மற்றும் Password போடுங்க');
    expect(document.getElementById('msgBox').style.display).toBe('block');
    expect(global.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should show loading, call signInWithEmailAndPassword and not show error on success', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    global.signInWithEmailAndPassword.mockResolvedValueOnce({}); // Success mock

    await window.emailSignIn();

    // Test that signInWithEmailAndPassword was called with right args
    // Since getAuth() returns an empty object {} in our mock, auth object is {}
    expect(global.signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');

    // Since we mock it successfully, loader shouldn't be disabled in the try block (only in catch)
    expect(document.getElementById('loader').style.display).toBe('flex');

    // No error msg shown
    expect(document.getElementById('msgBox').textContent).toBe('');
  });

  it('should handle invalid-credential error specifically', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'wrongpassword';

    const error = new Error('invalid-credential');
    error.code = 'auth/invalid-credential';
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('msgBox').textContent).toBe('❌ இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.');
    expect(document.getElementById('msgBox').style.display).toBe('block');
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle generic error', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error('Some generic network error');
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('msgBox').textContent).toBe('❌ Login தோல்வி. Please try again.');
    expect(document.getElementById('msgBox').style.display).toBe('block');
    expect(console.error).toHaveBeenCalled();
  });
});
