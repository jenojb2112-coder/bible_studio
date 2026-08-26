/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('showMsg in church-info.html', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Read the actual HTML file
    const htmlPath = path.resolve(process.cwd(), 'church-info.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    // Set up the DOM using the exact HTML content
    document.body.innerHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Reset global message timer
    window._msgTimer = undefined;

    // Extract and execute the script from the HTML to bind functions globally
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      let scriptContent = scriptMatch[1];
      scriptContent = scriptContent.replace('function showMsg(', 'global.showMsg = function(');
      eval(scriptContent);
    } else {
      throw new Error("Could not find script block in church-info.html");
    }
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should display the message and hide it after the specified timeout', () => {
    const box = document.getElementById('msgBox');

    global.showMsg('Test message', 2000);

    expect(box.textContent).toBe('Test message');
    expect(box.style.display).toBe('block');

    jest.advanceTimersByTime(2000);

    expect(box.style.display).toBe('none');
  });

  it('should use default timeout of 3000ms if not specified', () => {
    const box = document.getElementById('msgBox');

    global.showMsg('Default timeout message');

    expect(box.textContent).toBe('Default timeout message');
    expect(box.style.display).toBe('block');

    jest.advanceTimersByTime(2999);
    expect(box.style.display).toBe('block');

    jest.advanceTimersByTime(1);
    expect(box.style.display).toBe('none');
  });

  it('should clear previous timer if called multiple times', () => {
    const box = document.getElementById('msgBox');

    global.showMsg('First message', 2000);
    jest.advanceTimersByTime(1000);

    global.showMsg('Second message', 2000);
    expect(box.textContent).toBe('Second message');
    expect(box.style.display).toBe('block');

    jest.advanceTimersByTime(1000);
    expect(box.style.display).toBe('block'); // Still block because timer was reset

    jest.advanceTimersByTime(1000);
    expect(box.style.display).toBe('none');
  });
});
