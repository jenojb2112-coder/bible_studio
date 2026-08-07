/** @jest-environment jsdom */
import fs from 'fs';
import { jest } from '@jest/globals';

describe('saveChurchInfo', () => {
  let docMock;
  let setDocMock;
  let withTimeoutMock;
  let getAuthMock;
  let authMock;

  beforeEach(() => {
    // Clean up DOM and mocks
    jest.resetModules();
    jest.clearAllMocks();

    const html = fs.readFileSync('index.html', 'utf-8');

    // Set up DOM
    document.body.innerHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Initialize DOM elements properly
    const loader = document.createElement('div');
    loader.id = 'loader';
    document.body.appendChild(loader);

    const msgBox = document.createElement('div');
    msgBox.id = 'msgBox';
    document.body.appendChild(msgBox);

    // Add missing inputs
    document.body.innerHTML += `
      <div id="loginScreen" class="screen"></div>
      <input id="churchName" value="" />
      <input id="churchLoc" value="" />
      <input id="churchInsta" value="" />
      <input id="churchYT" value="" />
      <input id="churchWeb" value="" />
    `;

    authMock = { currentUser: null };

    // Setup globals for the script to use
    global.initializeApp = jest.fn();
    global.getAuth = jest.fn(() => authMock);
    global.getFirestore = jest.fn(() => ({}));

    docMock = jest.fn();
    global.doc = docMock;

    setDocMock = jest.fn();
    global.setDoc = setDocMock;

    withTimeoutMock = jest.fn((promise) => promise);
    global.withTimeout = withTimeoutMock;

    global.signInWithEmailAndPassword = jest.fn();
    global.createUserWithEmailAndPassword = jest.fn();
    global.signInWithPopup = jest.fn();
    global.GoogleAuthProvider = jest.fn();
    global.sendPasswordResetEmail = jest.fn();
    global.onAuthStateChanged = jest.fn();
    global.getDoc = jest.fn();

    // Extract script
    const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
    let scriptContent = scriptMatch[1];

    // Replace imports
    scriptContent = scriptContent.replace(/import\s+{([^}]+)}\s+from\s+['"][^'"]+['"];/g, (match, p1) => {
      return `const { ${p1} } = global;`;
    });

    window.global = global;

    // Execute script
    eval(scriptContent);
  });

  it('should redirect to login if no user is logged in', async () => {
    authMock.currentUser = null;

    await window.saveChurchInfo();

    expect(document.getElementById('msgBox').textContent).toBe('⚠️ முதல்ல login பண்ணுங்க');
    expect(document.getElementById('loginScreen').classList.contains('active')).toBe(true);
  });

  it('should show error if church name is missing', async () => {
    authMock.currentUser = { uid: '123', email: 'test@test.com' };

    await window.saveChurchInfo();

    expect(document.getElementById('msgBox').textContent).toBe('⚠️ Church Name தேவை');
  });

  it('should successfully save church details', async () => {
    authMock.currentUser = { uid: '123', email: 'test@test.com' };

    document.getElementById('churchName').value = 'Test Church';
    document.getElementById('churchLoc').value = 'Chennai';
    document.getElementById('churchInsta').value = '@test';
    document.getElementById('churchYT').value = 'testYT';
    document.getElementById('churchWeb').value = 'test.com';

    window._churchPhotoDataUrl = 'data:image/png;base64,test';

    await window.saveChurchInfo();

    expect(docMock).toHaveBeenCalledWith(expect.anything(), 'users', '123');
    expect(setDocMock).toHaveBeenCalledWith(
      undefined, // return of docMock
      expect.objectContaining({
        churchName: 'Test Church',
        location: 'Chennai',
        instagram: '@test',
        youtube: 'testYT',
        website: 'test.com',
        email: 'test@test.com',
        photoDataUrl: 'data:image/png;base64,test'
      }),
      { merge: true }
    );

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('msgBox').textContent).toBe('✅ Church details save ஆனது! Welcome Test Church');
  });

  it('should handle save errors', async () => {
    authMock.currentUser = { uid: '123', email: 'test@test.com' };
    document.getElementById('churchName').value = 'Test Church';

    // Mock console.error to avoid cluttering test output
    const originalConsoleError = console.error;
    console.error = jest.fn();

    withTimeoutMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    await window.saveChurchInfo();

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('msgBox').textContent).toBe('❌ Save தோல்வி. Please try again.');

    console.error = originalConsoleError;
  });
});
