/**
 * @jest-environment jsdom
 */

import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

describe('forgotPassword', () => {
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
    `;

    // Mock global dependencies exactly as in emailSignIn.test.js
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

  it('should show error if email is empty', async () => {
    document.getElementById('loginEmail').value = '';

    await window.forgotPassword();

    expect(document.getElementById('msgBox').textContent).toContain('முதல்ல Email போடுங்க');
  });

  it('should call sendPasswordResetEmail and show success msg', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    global.sendPasswordResetEmail.mockResolvedValueOnce({});

    await window.forgotPassword();

    expect(global.sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
    expect(document.getElementById('msgBox').textContent).toContain('Password reset link email-க்கு அனுப்பப்பட்டது');
  });

  it('should show success message on user-not-found to prevent user enumeration', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    const error = new Error('not found');
    error.code = 'auth/user-not-found';
    global.sendPasswordResetEmail.mockRejectedValueOnce(error);

    await window.forgotPassword();

    expect(document.getElementById('msgBox').textContent).toContain('Password reset link email-க்கு அனுப்பப்பட்டது');
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('should show error message for generic error', async () => {
    document.getElementById('loginEmail').value = 'test@example.com';
    const error = new Error('generic error');
    global.sendPasswordResetEmail.mockRejectedValueOnce(error);

    await window.forgotPassword();

    expect(document.getElementById('msgBox').textContent).toContain('Password reset failed. Please try again.');
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
