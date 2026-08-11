/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

describe('emailSignIn', () => {
  let originalScript = '';
  let consoleErrorMock;

  beforeAll(() => {
    const htmlPath = path.resolve(process.cwd(), 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    const scriptMatch = content.match(/<script type="module">([\s\S]*?)<\/script>/);
    let script = scriptMatch[1];

    // Replace imports with global access
    script = script.replace(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];/g, (match, imports) => {
      return `const { ${imports} } = global;`;
    });

    originalScript = script;
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="loader" id="loader" style="display: none;">⏳ Please wait...</div>
      <div class="msg-box" id="msgBox" style="display: none;"></div>
      <input id="loginEmail" type="email" value="">
      <input id="loginPass" type="password" value="">
    `;

    // Mock global dependencies
    global.initializeApp = jest.fn();
    global.getAuth = jest.fn(() => ({}));
    global.getFirestore = jest.fn();
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

    // Reset window variables that might interfere
    window._activeScreen = null;
    window._cachedMsgBox = null;

    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Evaluate the script
    eval(originalScript);
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('should show error if email or password is empty', async () => {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPass').value = '';

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toContain('Email மற்றும் Password போடுங்க');
    expect(document.getElementById('loader').style.display).toBe('none');
  });

  it('should show error if password is empty but email is provided', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = '';

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toContain('Email மற்றும் Password போடுங்க');
  });

  it('should call signInWithEmailAndPassword and show loading on success', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    global.signInWithEmailAndPassword.mockResolvedValueOnce({});

    await window.emailSignIn();

    expect(global.signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    // After success, it doesn't clear the loader by design in emailSignIn.
    // So we can assert loader was shown
    expect(document.getElementById('loader').style.display).toBe('flex');
  });

  it('should hide loading and show error message when login fails with generic error', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error();
    error.message = 'Generic error message';
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(consoleErrorMock).toHaveBeenCalledWith('Login error', error);
    expect(document.getElementById('msgBox').textContent).toContain('Login தோல்வி. Please try again.');
  });

  it('should show specific error message for invalid-credential error code', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error();
    error.code = 'auth/invalid-credential';
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது Account இன்னும் Create ஆகல');
  });

  it('should show specific error message for user-not-found error code', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error();
    error.code = 'auth/user-not-found';
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது Account இன்னும் Create ஆகல');
  });

  it('should show specific error message for wrong-password error code', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error();
    error.code = 'auth/wrong-password';
    global.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(document.getElementById('msgBox').textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது Account இன்னும் Create ஆகல');
  });
});
