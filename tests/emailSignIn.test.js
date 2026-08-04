/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read HTML and extract script
const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch ? scriptMatch[1] : '';

// Convert imports to global destructuring, handling both named and default imports
scriptContent = scriptContent.replace(/import\s+([\s\S]*?)\s+from\s+['"].*?['"];?/g, (match, p1) => {
    if (p1.includes('{')) {
        return `const ${p1} = global;`;
    }
    return `const ${p1.trim()} = global;`;
});
// Remove any side-effect imports
scriptContent = scriptContent.replace(/import\s+['"].*?['"];?/g, '');

describe('window.emailSignIn', () => {
  let mockSignInWithEmailAndPassword;
  let authMock;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <input id="loginEmail" type="text" />
      <input id="loginPass" type="password" />
      <div id="msgBox" style="display:none"></div>
      <div id="loader" style="display:none"></div>
    `;

    // Clear window state
    window.emailSignIn = undefined;
    window._msgTimer = undefined;

    // Reset mocks
    mockSignInWithEmailAndPassword = jest.fn();
    authMock = { name: 'mockAuth' };

    // Provide mocks for all imported things that we destructured from global
    global.firebaseConfig = {};
    global.initializeApp = jest.fn();
    global.getAuth = jest.fn().mockReturnValue(authMock);
    global.getFirestore = jest.fn();
    global.signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
    global.createUserWithEmailAndPassword = jest.fn();
    global.signInWithPopup = jest.fn();
    global.GoogleAuthProvider = jest.fn();
    global.sendPasswordResetEmail = jest.fn();
    global.onAuthStateChanged = jest.fn();
    global.doc = jest.fn();
    global.setDoc = jest.fn();
    global.getDoc = jest.fn();
    global.withTimeout = jest.fn();

    // Mock global window
    global.window = window;

    // Evaluate script
    try {
      const evalCode = `
        (function() {
          ${scriptContent}
        })();
      `;
      eval(evalCode);
    } catch (e) {
      console.error('Failed to evaluate script', e);
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show message and return if email or pass is empty', async () => {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';

    await window.emailSignIn();

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.textContent).toBe('⚠️ Email மற்றும் Password போடுங்க');
    expect(msgBox.style.display).toBe('block');
    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('should call signInWithEmailAndPassword with correct args and show loader', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '123' } });

    await window.emailSignIn();

    const loader = document.getElementById('loader');
    expect(loader.style.display).toBe('flex');
    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      authMock,
      'test@example.com',
      'password123'
    );
  });

  it('should handle wrong password error specifically', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'wrongpass';

    const error = new Error('Invalid credentials');
    error.code = 'auth/invalid-credential';
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

    const originalConsoleError = console.error;
    console.error = jest.fn();

    await window.emailSignIn();

    const loader = document.getElementById('loader');
    expect(loader.style.display).toBe('none');

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.textContent).toBe('❌ இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.');
    expect(msgBox.style.display).toBe('block');

    console.error = originalConsoleError;
  });

  it('should handle generic errors', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'pass';

    const error = new Error('Network error');
    error.code = 'auth/network-request-failed';
    mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

    const originalConsoleError = console.error;
    console.error = jest.fn();

    await window.emailSignIn();

    const loader = document.getElementById('loader');
    expect(loader.style.display).toBe('none');

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.textContent).toBe('❌ Login தோல்வி. Please try again.');
    expect(msgBox.style.display).toBe('block');

    console.error = originalConsoleError;
  });
});
