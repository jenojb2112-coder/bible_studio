/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('window.previewChurchPhoto', () => {
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    let scriptContent = scriptMatch[1];

    // Extract previewChurchPhoto
    const match = scriptContent.match(/window\.previewChurchPhoto\s*=\s*function\(input\)\{[\s\S]*?\n\};/);
    if (match) {
      eval(match[0]);
    } else {
      throw new Error("Could not find window.previewChurchPhoto in index.html");
    }
  });

  beforeEach(() => {
    document.body.innerHTML = '<img id="churchPhotoPreview" style="display:none;" src="" />';
    global.showMsg = jest.fn();
    global.window._churchPhotoDataUrl = null;
  });

  it('should show error if file is not an image', () => {
    const input = {
      files: [{
        type: 'application/pdf',
        size: 1024
      }]
    };
    window.previewChurchPhoto(input);
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ Image file மட்டும் upload பண்ணுங்க');
  });

  it('should show error if file is larger than 2MB', () => {
    const input = {
      files: [{
        type: 'image/jpeg',
        size: 3 * 1024 * 1024 // 3MB
      }]
    };
    window.previewChurchPhoto(input);
    expect(global.showMsg).toHaveBeenCalledWith('⚠️ Photo must be under 2MB');
  });

  it('should read file and set preview if file is valid image under 2MB', (done) => {
    // Mock FileReader
    const dummyDataUrl = 'data:image/png;base64,dummydata';
    const originalFileReader = global.FileReader;

    global.FileReader = class {
      readAsDataURL(file) {
        // simulate async reading
        setTimeout(() => {
          this.onload({ target: { result: dummyDataUrl } });
        }, 10);
      }
    };

    const input = {
      files: [{
        type: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      }]
    };

    window.previewChurchPhoto(input);

    setTimeout(() => {
      const img = document.getElementById('churchPhotoPreview');
      expect(img.src).toBe(dummyDataUrl);
      expect(img.style.display).toBe('block');
      expect(window._churchPhotoDataUrl).toBe(dummyDataUrl);
      global.FileReader = originalFileReader; // restore
      done();
    }, 50);
  });
});
