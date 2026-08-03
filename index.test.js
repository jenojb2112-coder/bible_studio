const fs = require('fs');
const path = require('path');

// Set up global mocks for Firebase libraries
global.initializeApp = jest.fn(() => ({}));
global.getAuth = jest.fn(() => ({ currentUser: null }));
global.signInWithEmailAndPassword = jest.fn();
global.createUserWithEmailAndPassword = jest.fn();
global.signInWithPopup = jest.fn();
global.GoogleAuthProvider = jest.fn();
global.sendPasswordResetEmail = jest.fn();
global.onAuthStateChanged = jest.fn();
global.getFirestore = jest.fn();
global.doc = jest.fn();
global.setDoc = jest.fn();
global.getDoc = jest.fn();

// Load index.html and extract the script content
const htmlPath = path.resolve(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  throw new Error('Could not find script module in index.html');
}

let scriptCode = scriptMatch[1];

// Replace direct firebase CDN imports with destructured assignments from global
scriptCode = scriptCode.replace(
  /import\s+\{\s*initializeApp\s*\}\s+from\s+["']https:\/\/www.gstatic.com\/firebasejs\/12.13.0\/firebase-app.js["'];/,
  'const { initializeApp } = global;'
);

scriptCode = scriptCode.replace(
  /import\s+\{[\s\S]*?\}\s+from\s+["']https:\/\/www.gstatic.com\/firebasejs\/12.13.0\/firebase-auth.js["'];/,
  `const {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail,
    onAuthStateChanged
  } = global;`
);

scriptCode = scriptCode.replace(
  /import\s+\{[\s\S]*?\}\s+from\s+["']https:\/\/www.gstatic.com\/firebasejs\/12.13.0\/firebase-firestore.js["'];/,
  `const {
    getFirestore, doc, setDoc, getDoc
  } = global;`
);

describe('window.emailSignIn', () => {
  let emailInput, passInput, loader, msgBox;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Set DOM body from index.html
    document.documentElement.innerHTML = htmlContent;

    emailInput = document.getElementById('loginEmail');
    passInput = document.getElementById('loginPass');
    loader = document.getElementById('loader');
    msgBox = document.getElementById('msgBox');

    // Use fake timers to control timeouts in showMsg
    jest.useFakeTimers();

    // Evaluate the script code
    const runScript = new Function('global', scriptCode);
    runScript(global);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should show warning message and not attempt sign in when email is empty', async () => {
    emailInput.value = '';
    passInput.value = 'mypassword123';

    await window.emailSignIn();

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(msgBox.textContent).toBe('⚠️ Email மற்றும் Password போடுங்க');
    expect(msgBox.style.display).toBe('block');
  });

  test('should show warning message and not attempt sign in when password is empty', async () => {
    emailInput.value = 'test@example.com';
    passInput.value = '';

    await window.emailSignIn();

    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
    expect(msgBox.textContent).toBe('⚠️ Email மற்றும் Password போடுங்க');
    expect(msgBox.style.display).toBe('block');
  });

  test('should show loader and call signInWithEmailAndPassword with correct arguments on happy path', async () => {
    emailInput.value = 'test@example.com';
    passInput.value = 'password123';

    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { email: 'test@example.com' } });

    await window.emailSignIn();

    expect(loader.style.display).toBe('flex');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@example.com', 'password123');
  });

  test('should handle invalid-credential error, stop loader, and show descriptive Tamil error message', async () => {
    emailInput.value = 'test@example.com';
    passInput.value = 'wrongpassword';

    const error = new Error('Firebase: Error (auth/invalid-credential).');
    error.code = 'auth/invalid-credential';
    signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(loader.style.display).toBe('none');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல');
  });

  test('should handle user-not-found error, stop loader, and show descriptive Tamil error message', async () => {
    emailInput.value = 'notfound@example.com';
    passInput.value = 'somepass';

    const error = new Error('Firebase: Error (auth/user-not-found).');
    error.code = 'auth/user-not-found';
    signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(loader.style.display).toBe('none');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல');
  });

  test('should handle wrong-password error, stop loader, and show descriptive Tamil error message', async () => {
    emailInput.value = 'test@example.com';
    passInput.value = 'wrong';

    const error = new Error('Firebase: Error (auth/wrong-password).');
    error.code = 'auth/wrong-password';
    signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(loader.style.display).toBe('none');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல');
  });

  test('should handle generic firebase error, stop loader, and show raw error message', async () => {
    emailInput.value = 'test@example.com';
    passInput.value = 'password123';

    const error = new Error('Something went wrong');
    error.code = 'auth/network-request-failed';
    signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await window.emailSignIn();

    expect(loader.style.display).toBe('none');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toBe('❌ Something went wrong');
  });
});
