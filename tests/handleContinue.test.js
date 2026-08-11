/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('handleContinue in church-info.html', () => {
  let showMsgMock;

  beforeEach(() => {
    // Read the actual HTML file
    const html = fs.readFileSync(path.resolve(process.cwd(), 'church-info.html'), 'utf8');

    // Set up the DOM using the exact HTML content (excluding the script tag to prevent auto-execution before mocking)
    document.body.innerHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Reset global photo data
    window._churchPhotoDataUrl = undefined;

    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Extract and execute the script from the HTML to bind functions globally
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      let scriptContent = scriptMatch[1];

      // Explicitly attach the functions to global/window because eval inside a module (Jest) does not leak to global scope
      scriptContent = scriptContent.replace('function showMsg(', 'global.showMsg = function(');
      scriptContent = scriptContent.replace('function previewChurchPhoto(', 'global.previewChurchPhoto = function(');
      scriptContent = scriptContent.replace('function handleContinue(', 'global.handleContinue = function(');

      eval(scriptContent);
    } else {
      throw new Error("Could not find script block in church-info.html");
    }

    showMsgMock = jest.spyOn(global, 'showMsg').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show error message if churchName is empty', () => {
    global.handleContinue();
    expect(showMsgMock).toHaveBeenCalledWith('⚠️ Church Name தேவை');
  });

  it('should collect church info, log it, and show success message', () => {
    document.getElementById('churchName').value = 'My Church';
    document.getElementById('churchLoc').value = 'City';
    document.getElementById('churchInsta').value = 'insta';
    document.getElementById('churchYT').value = 'yt';
    document.getElementById('churchWeb').value = 'web';

    window._churchPhotoDataUrl = 'data:image/png;base64,123';

    global.handleContinue();

    expect(console.log).toHaveBeenCalledWith('Church Info collected:', {
      churchName: 'My Church',
      location: 'City',
      instagram: 'insta',
      youtube: 'yt',
      website: 'web',
      hasPhoto: true,
      photoDataUrl: 'data:image/png;base64,123'
    });

    expect(showMsgMock).toHaveBeenCalledWith('✅ Collected: My Church | City');
  });

  it('should show success message without location if location is empty', () => {
    document.getElementById('churchName').value = 'My Church';
    document.getElementById('churchLoc').value = '';

    global.handleContinue();

    expect(console.log).toHaveBeenCalledWith('Church Info collected:', expect.objectContaining({
      churchName: 'My Church',
      location: ''
    }));

    expect(showMsgMock).toHaveBeenCalledWith('✅ Collected: My Church');
  });
});
