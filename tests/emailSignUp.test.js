/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

describe('emailSignUp', () => {
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
    global.withTimeout = jest.fn((promise) => promise);

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

    await window.emailSignUp();

    expect(document.getElementById('msgBox').textContent).toContain('Account create பண்ண Email + Password');
  });

  it('should call createUserWithEmailAndPassword and show success message', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    global.createUserWithEmailAndPassword.mockResolvedValueOnce({});

    await window.emailSignUp();

    expect(global.createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    expect(document.getElementById('msgBox').textContent).toContain('✅ Account created!');
  });

  it('should hide loading and show error message when sign up fails', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    document.getElementById('loginPass').value = 'password123';

    const error = new Error(); error.message = 'Sign up failed'; error.code = 'auth/generic-error';
    global.createUserWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignUp();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(consoleErrorMock).toHaveBeenCalledWith('Sign up error', error);
    expect(document.getElementById('msgBox').textContent).toContain('❌ Sign up தோல்வி');
  });
});
