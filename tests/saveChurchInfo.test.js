/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup DOM
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch[1];

// Make _cachedMsgBox globally accessible so we can reset it across tests
scriptContent = scriptContent.replace(/let _cachedMsgBox = null;/g, 'window._cachedMsgBox = null;');
scriptContent = scriptContent.replace(/_cachedMsgBox/g, 'window._cachedMsgBox');

// Same for _activeScreen
scriptContent = scriptContent.replace(/let _activeScreen = null;/g, 'window._activeScreen = null;');
scriptContent = scriptContent.replace(/_activeScreen/g, 'window._activeScreen');

// Replace imports with global access. But to allow mocking after eval, we don't destructure.
// Instead of `const { setDoc } = window;`, we just let the script use `window.setDoc`
// Wait, the script has `setDoc(...)` not `window.setDoc(...)`.
// So we must redefine them as getters so they always fetch from window,
// or just use `window.setDoc` directly in the replace:

scriptContent = scriptContent.replace(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];/g, '');
// Now we need to prepend definitions that proxy to window so they are live-updated mocks:
scriptContent = `
  const setDoc = (...args) => window.mockSetDoc(...args);
  const doc = (...args) => window.mockDoc(...args);
  const withTimeout = (...args) => window.mockWithTimeout(...args);
  const getAuth = (...args) => window.mockGetAuth(...args);
  const initializeApp = (...args) => window.mockInitializeApp(...args);
  const getFirestore = (...args) => window.mockGetFirestore(...args);
  const getDoc = (...args) => window.mockGetDoc(...args);
  const onAuthStateChanged = (...args) => window.mockOnAuthStateChanged(...args);
  const signInWithEmailAndPassword = (...args) => window.mockSignInWithEmailAndPassword(...args);
  const createUserWithEmailAndPassword = (...args) => window.mockCreateUserWithEmailAndPassword(...args);
  const signInWithPopup = (...args) => window.mockSignInWithPopup(...args);
  const GoogleAuthProvider = (...args) => window.mockGoogleAuthProvider(...args);
  const sendPasswordResetEmail = (...args) => window.mockSendPasswordResetEmail(...args);
` + scriptContent;

// Initialize dummy DOM
document.body.innerHTML = `
  <div id="msgBox"></div>
  <div id="loader" style="display: none;"></div>
  <div class="screen active" id="loginScreen"></div>
  <div class="screen" id="churchScreen"></div>
  <input id="churchName" value="" />
  <input id="churchLoc" value="" />
  <input id="churchInsta" value="" />
  <input id="churchYT" value="" />
  <input id="churchWeb" value="" />
`;

window.mockSetDoc = jest.fn();
window.mockDoc = jest.fn((db, collection, id) => ({ collection, id }));
window.mockWithTimeout = jest.fn((promise) => promise);

window.mockInitializeApp = jest.fn();

const stableAuth = { currentUser: null };
window.mockGetAuth = jest.fn(() => stableAuth);

window.mockGetFirestore = jest.fn(() => ({}));
window.mockGetDoc = jest.fn();
window.mockOnAuthStateChanged = jest.fn();
window.mockSignInWithEmailAndPassword = jest.fn();
window.mockCreateUserWithEmailAndPassword = jest.fn();
window.mockSignInWithPopup = jest.fn();
window.mockGoogleAuthProvider = jest.fn();
window.mockSendPasswordResetEmail = jest.fn();

// Evaluate script ONCE
window.eval(scriptContent);

describe('saveChurchInfo', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="msgBox"></div>
      <div id="loader" style="display: none;"></div>
      <div class="screen active" id="loginScreen"></div>
      <div class="screen" id="churchScreen"></div>
      <input id="churchName" value="" />
      <input id="churchLoc" value="" />
      <input id="churchInsta" value="" />
      <input id="churchYT" value="" />
      <input id="churchWeb" value="" />
    `;

    // Clear the cached elements in index.html, since we replaced the DOM
    window._cachedMsgBox = null;
    window._activeScreen = null;

    // Reset mocks
    window.mockSetDoc.mockReset();
    window.mockDoc.mockClear();
    window.mockWithTimeout.mockImplementation((promise) => promise);

    // Reset mock auth state
    stableAuth.currentUser = null;

    // Ensure setTimeout runs synchronously for the msgBox timeout, or clear it
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should redirect to loginScreen if no currentUser', async () => {
    stableAuth.currentUser = null; // Ensure no user
    await window.saveChurchInfo();
    expect(document.getElementById('msgBox').textContent).toBe('⚠️ முதல்ல login பண்ணுங்க');
    expect(document.getElementById('loginScreen').classList.contains('active')).toBe(true);
  });

  it('should show error if churchName is empty', async () => {
    stableAuth.currentUser = { uid: '123' }; // Mock user
    document.getElementById('churchName').value = '   '; // Empty after trim
    await window.saveChurchInfo();
    expect(document.getElementById('msgBox').textContent).toBe('⚠️ Church Name தேவை');
  });

  it('should save church details on success', async () => {
    stableAuth.currentUser = { uid: '123', email: 'test@test.com' };
    document.getElementById('churchName').value = 'My Church';
    document.getElementById('churchLoc').value = 'My Location';
    document.getElementById('churchInsta').value = 'My Insta';
    document.getElementById('churchYT').value = 'My YT';
    document.getElementById('churchWeb').value = 'My Web';

    window.mockSetDoc.mockResolvedValueOnce(); // Success

    await window.saveChurchInfo();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('msgBox').textContent).toBe('✅ Church details save ஆனது! Welcome My Church');

    expect(window.mockDoc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
    expect(window.mockSetDoc).toHaveBeenCalledWith(
      { collection: 'users', id: '123' },
      {
        churchName: 'My Church',
        location: 'My Location',
        instagram: 'My Insta',
        youtube: 'My YT',
        website: 'My Web',
        email: 'test@test.com',
        updatedAt: expect.any(String)
      },
      { merge: true }
    );
    expect(window.mockWithTimeout).toHaveBeenCalled();
  });

  it('should show error if save fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    stableAuth.currentUser = { uid: '123' };
    document.getElementById('churchName').value = 'My Church';

    const error = new Error('Save failed');
    error.message = 'Save failed msg';
    error.code = 'error_code';
    window.mockSetDoc.mockRejectedValueOnce(error);

    await window.saveChurchInfo();

    expect(document.getElementById('loader').style.display).toBe('none');

    expect(consoleSpy).toHaveBeenCalledWith('Save error', error);
    expect(document.getElementById('msgBox').textContent).toBe('❌ Save தோல்வி. Please try again.');
  });
});
