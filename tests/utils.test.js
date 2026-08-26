/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { withTimeout, previewChurchPhotoHandler } from '../utils.js';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve with the value if promise resolves before timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await withTimeout(promise, 1000, 'Test');
    expect(result).toBe('success');
    expect(jest.getTimerCount()).toBe(0);
  });

  it('should reject with the original error if promise rejects before timeout', async () => {
    const error = new Error('original error');
    const promise = Promise.reject(error);

    await expect(withTimeout(promise, 1000, 'Test')).rejects.toThrow('original error');
  });

  it('should reject with a timeout error if promise takes too long', async () => {
    // Create a promise that never resolves
    const pendingPromise = new Promise(() => {});

    // We don't await the withTimeout directly because it will block.
    // Instead we start it, then advance timers, then await it to check rejection.
    const timeoutPromise = withTimeout(pendingPromise, 1000, 'Network');

    // Advance timers by the timeout amount
    jest.advanceTimersByTime(1000);

    await expect(timeoutPromise).rejects.toThrow('Network - Timeout (network/rules problem)');
  });
  it('should resolve immediately if a non-promise value is passed', async () => {
    const result = await withTimeout('primitive', 1000, 'Test');
    expect(result).toBe('primitive');
  });
});

describe('previewChurchPhotoHandler', () => {
  let showMsgFn;
  let mockFileReader;

  beforeEach(() => {
    showMsgFn = jest.fn();
    mockFileReader = {
      readAsDataURL: jest.fn(function() {
        this.onload({ target: { result: 'data:image/png;base64,mock' } });
      })
    };
    global.FileReader = jest.fn(() => mockFileReader);

    document.body.innerHTML = '<img id="churchPhotoPreview" />';
    delete window._churchPhotoDataUrl;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should show error if file is not an image', () => {
    const input = { files: [{ type: 'application/pdf', size: 1024 }] };
    previewChurchPhotoHandler(input, showMsgFn);
    expect(showMsgFn).toHaveBeenCalledWith('⚠️ Image file மட்டும் upload பண்ணுங்க');
    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
  });

  it('should show error if image is larger than 2MB', () => {
    const input = { files: [{ type: 'image/png', size: 3 * 1024 * 1024 }] };
    previewChurchPhotoHandler(input, showMsgFn);
    expect(showMsgFn).toHaveBeenCalledWith('⚠️ Photo must be under 2MB');
    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
  });

  it('should preview valid image successfully', () => {
    const input = { files: [{ type: 'image/png', size: 1024 }] };
    previewChurchPhotoHandler(input, showMsgFn);

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(input.files[0]);
    const img = document.getElementById('churchPhotoPreview');
    expect(img.src).toContain('data:image/png;base64,mock');
    expect(img.style.display).toBe('block');
    expect(window._churchPhotoDataUrl).toBe('data:image/png;base64,mock');
  });

  it('should do nothing if no file is provided', () => {
    previewChurchPhotoHandler({ files: [] }, showMsgFn);
    expect(showMsgFn).not.toHaveBeenCalled();
    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();

    previewChurchPhotoHandler({}, showMsgFn);
    expect(showMsgFn).not.toHaveBeenCalled();
    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
  });
});
