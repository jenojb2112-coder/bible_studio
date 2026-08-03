/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = htmlContent.match(/<script type="module">([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch[1];

// Extract just withTimeout and window.saveChurchInfo
const withTimeoutMatch = scriptContent.match(/(function withTimeout[\s\S]*?})\s*window\.saveChurchInfo/);
const saveChurchInfoMatch = scriptContent.match(/(window\.saveChurchInfo\s*=\s*async function\(\)\{[\s\S]*?catch\(e\)\{[\s\S]*?\}\s*\};)/);

const extractedCode = `
  ${withTimeoutMatch ? withTimeoutMatch[1] : ''}
  ${saveChurchInfoMatch ? saveChurchInfoMatch[1] : ''}
`;

describe('saveChurchInfo', () => {
  beforeEach(() => {
    // Setup minimal DOM
    document.body.innerHTML = `
      <div id="msgBox" style="display:none"></div>
      <div id="loader" style="display:none"></div>
      <input id="churchName" />
      <input id="churchLoc" />
      <input id="churchInsta" />
      <input id="churchYT" />
      <input id="churchWeb" />
    `;

    global.auth = { currentUser: null };
    global.db = {};
    global.doc = jest.fn((db, collection, id) => ({ collection, id }));
    global.setDoc = jest.fn();
    global.showMsg = jest.fn();
    global.setLoading = jest.fn();
    global.goTo = jest.fn();

    // Evaluate the extracted functions so they attach to global/window
    eval(extractedCode);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('setup runs correctly', () => {
    expect(typeof window.saveChurchInfo).toBe('function');
  });

  test('fails if no user is logged in', async () => {
    global.auth.currentUser = null;
    await window.saveChurchInfo();
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ முதல்ல login பண்ணுங்க');
    expect(global.goTo).toHaveBeenCalledWith('loginScreen');
    expect(global.setDoc).not.toHaveBeenCalled();
  });

  test('fails if churchName is missing', async () => {
    global.auth.currentUser = { uid: '123', email: 'test@example.com' };
    document.getElementById('churchName').value = '   ';
    await window.saveChurchInfo();
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ Church Name தேவை');
    expect(global.setDoc).not.toHaveBeenCalled();
  });

  test('saves successfully', async () => {
    global.auth.currentUser = { uid: '123', email: 'test@example.com' };
    document.getElementById('churchName').value = 'My Church';
    document.getElementById('churchLoc').value = 'My Loc';
    document.getElementById('churchInsta').value = 'My Insta';
    document.getElementById('churchYT').value = 'My YT';
    document.getElementById('churchWeb').value = 'My Web';

    global.setDoc.mockResolvedValueOnce();

    await window.saveChurchInfo();

    expect(global.setLoading).toHaveBeenCalledWith(true);
    expect(global.doc).toHaveBeenCalledWith(global.db, 'users', '123');
    expect(global.setDoc).toHaveBeenCalledWith(
      { collection: 'users', id: '123' },
      expect.objectContaining({
        churchName: 'My Church',
        location: 'My Loc',
        instagram: 'My Insta',
        youtube: 'My YT',
        website: 'My Web',
        email: 'test@example.com'
      }),
      { merge: true }
    );
    expect(global.setLoading).toHaveBeenCalledWith(false);
    expect(global.showMsg).toHaveBeenCalledWith('✅ Church details save ஆனது! Welcome My Church');
  });

  test('handles save failure', async () => {
    global.auth.currentUser = { uid: '123' };
    document.getElementById('churchName').value = 'My Church';

    global.setDoc.mockRejectedValueOnce(new Error('Network Error'));

    await window.saveChurchInfo();

    expect(global.setLoading).toHaveBeenCalledWith(true);
    expect(global.setDoc).toHaveBeenCalled();
    expect(global.setLoading).toHaveBeenCalledWith(false);
    expect(global.showMsg).toHaveBeenCalledWith('❌ Save தோல்வி: Network Error', 6000);
  });

  test('handles timeout', async () => {
    global.auth.currentUser = { uid: '123' };
    document.getElementById('churchName').value = 'My Church';

    jest.useFakeTimers();
    // make setDoc hang forever
    global.setDoc.mockImplementationOnce(() => new Promise(() => {}));

    const savePromise = window.saveChurchInfo();

    // Advance timers by more than 10000ms
    jest.advanceTimersByTime(11000);

    await savePromise;

    expect(global.setLoading).toHaveBeenCalledWith(true);
    expect(global.setLoading).toHaveBeenCalledWith(false);
    expect(global.showMsg).toHaveBeenCalledWith('❌ Save தோல்வி: Save - Timeout (network/rules problem)', 6000);

    jest.useRealTimers();
  });
});
