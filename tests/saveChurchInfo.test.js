const fs = require('fs');
const path = require('path');

// Test suite for saveChurchInfo function
describe('saveChurchInfo', () => {
  beforeAll(() => {
    // 1. Read index.html and extract the saveChurchInfo and withTimeout functions
    const htmlPath = path.resolve(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const startMatch = htmlContent.match(/function withTimeout/);
    if (!startMatch) {
      throw new Error("Could not find withTimeout function start in index.html");
    }
    const startIndex = startMatch.index;

    const endMatch = htmlContent.match(/onAuthStateChanged\(auth, async\s*\(user\)/);
    if (!endMatch) {
      throw new Error("Could not find onAuthStateChanged to mark the end of saveChurchInfo in index.html");
    }
    const endIndex = endMatch.index;

    const codeToExecute = htmlContent.substring(startIndex, endIndex);

    // 2. Set up global/window dependencies that the script expects
    global.auth = { currentUser: null };
    global.db = {};
    global.doc = jest.fn((...args) => ({ _path: args.join('/') }));
    global.setDoc = jest.fn();
    global.showMsg = jest.fn();
    global.goTo = jest.fn();
    global.setLoading = jest.fn();

    // Setup DOM elements that are queried in the function
    document.body.innerHTML = `
      <div id="loader" style="display:none"></div>
      <div id="msgBox" style="display:none"></div>
      <input id="churchName" value="" />
      <input id="churchLoc" value="" />
      <input id="churchInsta" value="" />
      <input id="churchYT" value="" />
      <input id="churchWeb" value="" />
    `;

    // 3. Evaluate the extracted code within our test context
    // This will bind window.saveChurchInfo and make withTimeout available to it
    eval(codeToExecute);
  });

  beforeEach(() => {
    // Reset mock calls and DOM values before each test
    jest.clearAllMocks();
    global.auth.currentUser = null;

    document.getElementById('churchName').value = '';
    document.getElementById('churchLoc').value = '';
    document.getElementById('churchInsta').value = '';
    document.getElementById('churchYT').value = '';
    document.getElementById('churchWeb').value = '';
  });

  test('Scenario 1: should show warning and redirect to loginScreen when user is not logged in', async () => {
    // Setup
    global.auth.currentUser = null;

    // Execution
    await window.saveChurchInfo();

    // Assertions
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ முதல்ல login பண்ணுங்க');
    expect(global.goTo).toHaveBeenCalledWith('loginScreen');
    expect(global.setLoading).not.toHaveBeenCalled();
    expect(global.setDoc).not.toHaveBeenCalled();
  });

  test('Scenario 2: should show warning when churchName is missing', async () => {
    // Setup
    global.auth.currentUser = { uid: 'user_123', email: 'test@example.com' };
    document.getElementById('churchName').value = '   '; // Whitespace only

    // Execution
    await window.saveChurchInfo();

    // Assertions
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ Church Name தேவை');
    expect(global.setLoading).not.toHaveBeenCalled();
    expect(global.setDoc).not.toHaveBeenCalled();
  });

  test('Scenario 3: should successfully save church info when all requirements are met', async () => {
    // Setup
    global.auth.currentUser = { uid: 'user_123', email: 'test@example.com' };
    document.getElementById('churchName').value = 'Grace Church';
    document.getElementById('churchLoc').value = 'Chennai';
    document.getElementById('churchInsta').value = '@grace_church';
    document.getElementById('churchYT').value = 'GraceYT';
    document.getElementById('churchWeb').value = 'www.grace.org';

    // Mock successful setDoc resolution
    global.setDoc.mockResolvedValueOnce();

    // Execution
    await window.saveChurchInfo();

    // Assertions
    expect(global.setLoading).toHaveBeenNthCalledWith(1, true);
    expect(global.doc).toHaveBeenCalledWith(global.db, 'users', 'user_123');
    expect(global.setDoc).toHaveBeenCalledWith(
      expect.objectContaining({ _path: '[object Object]/users/user_123' }),
      expect.objectContaining({
        churchName: 'Grace Church',
        location: 'Chennai',
        instagram: '@grace_church',
        youtube: 'GraceYT',
        website: 'www.grace.org',
        email: 'test@example.com',
        updatedAt: expect.any(String)
      }),
      { merge: true }
    );
    expect(global.setLoading).toHaveBeenNthCalledWith(2, false);
    expect(global.showMsg).toHaveBeenCalledWith('✅ Church details save ஆனது! Welcome Grace Church');
  });

  test('Scenario 4: should handle Firestore save errors gracefully', async () => {
    // Setup
    global.auth.currentUser = { uid: 'user_123', email: 'test@example.com' };
    document.getElementById('churchName').value = 'Grace Church';

    // Mock setDoc rejection (error scenario)
    const errorMsg = 'Permission denied';
    global.setDoc.mockRejectedValueOnce(new Error(errorMsg));

    // Execution
    await window.saveChurchInfo();

    // Assertions
    expect(global.setLoading).toHaveBeenNthCalledWith(1, true);
    expect(global.setLoading).toHaveBeenNthCalledWith(2, false);
    expect(global.showMsg).toHaveBeenCalledWith('❌ Save தோல்வி: ' + errorMsg, 6000);
  });

  test('Scenario 5: should handle Firestore timeout gracefully', async () => {
    // Setup
    global.auth.currentUser = { uid: 'user_123', email: 'test@example.com' };
    document.getElementById('churchName').value = 'Grace Church';

    // Mock a very slow setDoc promise that will trigger withTimeout (which is set to 10000ms in source, but we can mock withTimeout or use fake timers)
    jest.useFakeTimers();

    // Create a promise that doesn't resolve
    const pendingPromise = new Promise(() => {});
    global.setDoc.mockReturnValueOnce(pendingPromise);

    // Start execution
    const runPromise = window.saveChurchInfo();

    // Fast-forward time
    jest.advanceTimersByTime(10000);

    // Wait for the promise to complete
    await runPromise;

    // Assertions
    expect(global.setLoading).toHaveBeenNthCalledWith(1, true);
    expect(global.setLoading).toHaveBeenNthCalledWith(2, false);
    expect(global.showMsg).toHaveBeenCalledWith('❌ Save தோல்வி: Save - Timeout (network/rules problem)', 6000);

    jest.useRealTimers();
  });
});
