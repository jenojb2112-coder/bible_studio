/**
 * @jest-environment jsdom
 */
const fs = require('fs');

describe('togglePass', () => {
  // Using the actual rendered HTML after parsing as expected values since jsdom might auto-close tags
  let openEyeExpected;
  let closedEyeExpected;

  beforeAll(() => {
    const html = fs.readFileSync('index.html', 'utf8');
    const match = html.match(/window\.togglePass\s*=\s*function\(\)\s*\{([\s\S]*?)\};/);
    if (match) {
      eval(`window.togglePass = function() {${match[1]}};`);
    } else {
      throw new Error("Could not find togglePass in index.html");
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
    openEyeExpected = tempDiv.innerHTML;

    tempDiv.innerHTML = '<path d="M2 2l20 20"/><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.2 4.1M6.5 6.6C3.4 8.5 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 4.2-.9"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>';
    closedEyeExpected = tempDiv.innerHTML;
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="loginPass" type="password" />
      <span id="eyeIcon"></span>
    `;
  });

  test('toggles password to text and updates icon', () => {
    window.togglePass();
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');

    expect(p.type).toBe('text');
    expect(icon.innerHTML).toBe(closedEyeExpected);
  });

  test('toggles text back to password and updates icon', () => {
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');

    // Set to text first
    p.type = 'text';
    icon.innerHTML = closedEyeExpected;

    window.togglePass();

    expect(p.type).toBe('password');
    expect(icon.innerHTML).toBe(openEyeExpected);
  });

  test('handles missing loginPass element gracefully without throwing', () => {
    document.getElementById('loginPass').remove();
    // It should NOT throw an error now because we added edge case handling
    expect(() => window.togglePass()).not.toThrow();
  });

  test('handles missing eyeIcon element gracefully without throwing', () => {
    document.getElementById('eyeIcon').remove();
    // It should NOT throw an error now because we added edge case handling
    expect(() => window.togglePass()).not.toThrow();
  });
});
