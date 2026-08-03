const fs = require('fs');
const path = require('path');

describe('googleSignIn function tests', () => {
  let authStateCallback = null;

  beforeEach(() => {
    // Reset JSDOM and globals
    document.body.innerHTML = '';
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup DOM elements from index.html
    const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.body.innerHTML = htmlContent;

    // Define Firebase mocks on global/window
    global.initializeApp = jest.fn(() => ({}));
    global.getAuth = jest.fn(() => ({}));
    global.getFirestore = jest.fn(() => ({}));
    global.signInWithEmailAndPassword = jest.fn();
    global.createUserWithEmailAndPassword = jest.fn();
    global.signInWithPopup = jest.fn();
    global.GoogleAuthProvider = jest.fn().mockImplementation(() => {
      return { providerId: 'google.com' };
    });
    global.sendPasswordResetEmail = jest.fn();
    global.onAuthStateChanged = jest.fn((auth, callback) => {
      authStateCallback = callback;
    });
    global.doc = jest.fn();
    global.setDoc = jest.fn();
    global.getDoc = jest.fn();

    // Extract script
    const scriptMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
      throw new Error("Could not find script block in index.html");
    }
    let scriptCode = scriptMatch[1];

    // Replace ESM imports with global destructuring assignments
    scriptCode = scriptCode.replace(
      /import\s+([\s\S]*?)\s+from\s+["'].*?["'];/g,
      'const $1 = global;'
    );

    // Evaluate the script code
    eval(scriptCode);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('googleSignIn should exist on window', () => {
    expect(window.googleSignIn).toBeDefined();
    expect(typeof window.googleSignIn).toBe('function');
  });

  test('googleSignIn happy path: should show loader and call signInWithPopup', async () => {
    // Setup mocks
    global.signInWithPopup.mockResolvedValue({
      user: { email: 'test@example.com', uid: 'testuid' }
    });

    const loader = document.getElementById('loader');
    expect(loader.style.display).not.toBe('flex'); // initially not loading

    // Call the function
    const signInPromise = window.googleSignIn();

    // Loader should be shown immediately
    expect(loader.style.display).toBe('flex');

    // Wait for the login process to complete
    await signInPromise;

    // Verify GoogleAuthProvider and signInWithPopup calls
    expect(global.GoogleAuthProvider).toHaveBeenCalled();
    expect(global.signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));

    // Note: Success state of loading is controlled by onAuthStateChanged in production.
    // In happy path, setLoading is not set to false inside googleSignIn, which is expected.
  });

  test('googleSignIn failure path: should hide loader and show error message on exception', async () => {
    // Setup mock error
    const mockError = { code: 'auth/popup-closed-by-user', message: 'The popup has been closed' };
    global.signInWithPopup.mockRejectedValue(mockError);

    const loader = document.getElementById('loader');
    const msgBox = document.getElementById('msgBox');

    // Call the function
    await window.googleSignIn();

    // Verify loader was hidden
    expect(loader.style.display).toBe('none');

    // Verify showMsg was called and error message is displayed
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('Google Login தோல்வி');
    expect(msgBox.textContent).toContain('The popup has been closed');
  });

  test('googleSignIn failure path: should use error.code if message is missing', async () => {
    // Setup mock error without message
    const mockError = { code: 'auth/popup-closed-by-user' };
    global.signInWithPopup.mockRejectedValue(mockError);

    const loader = document.getElementById('loader');
    const msgBox = document.getElementById('msgBox');

    // Call the function
    await window.googleSignIn();

    // Verify loader was hidden
    expect(loader.style.display).toBe('none');

    // Verify fallback to code
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('Google Login தோல்வி');
    expect(msgBox.textContent).toContain('auth/popup-closed-by-user');
  });

  test('googleSignIn failure path: should handle error with missing message/code gracefully', async () => {
    // Setup mock error without message or code
    global.signInWithPopup.mockRejectedValue({});

    const loader = document.getElementById('loader');
    const msgBox = document.getElementById('msgBox');

    // Call the function
    await window.googleSignIn();

    // Verify loader was hidden
    expect(loader.style.display).toBe('none');

    // Verify default or blank error display
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toContain('Google Login தோல்வி');
  });
});
