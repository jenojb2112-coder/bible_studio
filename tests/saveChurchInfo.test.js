/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

let mockAuth;
let mockSetDoc;
let mockDoc;
let mockWithTimeout;
let mockDb;

describe('window.saveChurchInfo', () => {
  beforeEach(() => {
    // Reset body
    document.body.innerHTML = `
      <div id="msgBox" style="display: none;"></div>
      <div id="loader" style="display: none;"></div>
      <div id="loginScreen" class="screen"></div>
      <div id="dashboardScreen" class="screen active"></div>

      <input id="churchName" value="" />
      <input id="churchLoc" value="" />
      <input id="churchInsta" value="" />
      <input id="churchYT" value="" />
      <input id="churchWeb" value="" />
    `;

    // Create mocks
    mockAuth = { currentUser: null };
    mockDb = {};
    mockSetDoc = jest.fn();
    mockDoc = jest.fn((db, coll, id) => ({ db, coll, id }));
    mockWithTimeout = jest.fn(async (promise) => await promise);

    global.initializeApp = jest.fn(() => ({}));
    global.getAuth = jest.fn(() => mockAuth);
    global.getFirestore = jest.fn(() => mockDb);
    global.doc = mockDoc;
    global.setDoc = mockSetDoc;
    global.onAuthStateChanged = jest.fn();
    global.signInWithEmailAndPassword = jest.fn();
    global.createUserWithEmailAndPassword = jest.fn();
    global.signInWithPopup = jest.fn();
    global.GoogleAuthProvider = jest.fn();
    global.sendPasswordResetEmail = jest.fn();
    global.getDoc = jest.fn();
    global.withTimeout = mockWithTimeout;

    const htmlPath = path.resolve('./index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
    let scriptContent = scriptMatch[1];

    // Replace imports
    scriptContent = scriptContent.replace(/import\s*{([^}]+)}\s*from\s*"[^"]+";/g, (match, imports) => {
      const cleaned = imports.replace(/\s+/g, ' ').trim();
      return `const { ${cleaned} } = global;`;
    });

    // Prevent DOMContentLoaded and other handlers from breaking tests when evaluated
    // scriptContent = scriptContent.replace(/window\.addEventListener\('DOMContentLoaded'/g, '//');

    // Evaluate script in the global context
    eval(scriptContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows warning and redirects to loginScreen if no user is logged in', async () => {
    mockAuth.currentUser = null;
    await window.saveChurchInfo();

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toBe('⚠️ முதல்ல login பண்ணுங்க');

    const loginScreen = document.getElementById('loginScreen');
    expect(loginScreen.classList.contains('active')).toBe(true);
  });

  it('shows warning if churchName is missing', async () => {
    mockAuth.currentUser = { uid: '123' };

    await window.saveChurchInfo();

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toBe('⚠️ Church Name தேவை');
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('saves church info successfully', async () => {
    mockAuth.currentUser = { uid: '123', email: 'test@example.com' };

    document.getElementById('churchName').value = 'My Church';
    document.getElementById('churchLoc').value = 'Chennai';
    document.getElementById('churchInsta').value = 'myinsta';
    document.getElementById('churchYT').value = 'myyt';
    document.getElementById('churchWeb').value = 'myweb.com';

    mockSetDoc.mockResolvedValueOnce();

    // Spy on loading
    const loader = document.getElementById('loader');

    await window.saveChurchInfo();

    expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', '123');
    expect(mockSetDoc).toHaveBeenCalledWith(
      { db: mockDb, coll: 'users', id: '123' },
      expect.objectContaining({
        churchName: 'My Church',
        location: 'Chennai',
        instagram: 'myinsta',
        youtube: 'myyt',
        website: 'myweb.com',
        email: 'test@example.com'
      }),
      { merge: true }
    );
    expect(mockWithTimeout).toHaveBeenCalled();

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.style.display).toBe('block');
    expect(msgBox.textContent).toBe('✅ Church details save ஆனது! Welcome My Church');
    expect(loader.style.display).toBe('none'); // Loading turns off
  });

  it('handles save error gracefully', async () => {
    mockAuth.currentUser = { uid: '123', email: 'test@example.com' };
    document.getElementById('churchName').value = 'My Church';

    const error = new Error('Permission denied');
    error.code = 'permission-denied';
    mockSetDoc.mockRejectedValueOnce(error);

    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await window.saveChurchInfo();

    const msgBox = document.getElementById('msgBox');
    expect(msgBox.style.display).toBe('block');
    // Code says: showMsg('❌ Save தோல்வி. Please try again.', 6000); or wait, checking the exact message.
    expect(msgBox.textContent).toContain('❌ Save தோல்வி');

    const loader = document.getElementById('loader');
    expect(loader.style.display).toBe('none'); // Loading turns off on error

    consoleSpy.mockRestore();
  });
});
