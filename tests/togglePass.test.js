/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('window.togglePass', () => {
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
    let scriptContent = scriptMatch[1];

    // Evaluate global variables so they are present in the test environment
    const varsMatch = scriptContent.match(/let _loginEmailEl = null;\nlet _loginPassEl = null;/);
    if (varsMatch) {
      global._loginEmailEl = null;
      global._loginPassEl = null;
    }

    // Extract the window.togglePass function definition.
    const togglePassMatch = scriptContent.match(/window\.togglePass\s*=\s*function\(\)\{[\s\S]*?\n\};/);
    if (togglePassMatch) {
      eval('global._loginEmailEl = null; global._loginPassEl = null; ' + togglePassMatch[0]);
    } else {
      throw new Error("Could not find window.togglePass in index.html");
    }
  });

  beforeEach(() => {
    global._loginEmailEl = null;
    global._loginPassEl = null;
    document.body.innerHTML = `
      <input id="loginPass" type="password" />
      <button id="eyeBtn" aria-label="Show password" title="Show password">
        <div id="eyeIcon"></div>
      </button>
    `;
  });

  it('should toggle from password to text and change icon to closedEye', () => {
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');
    const btn = document.getElementById('eyeBtn');

    expect(p.type).toBe('password');

    window.togglePass();

    expect(p.type).toBe('text');
    expect(icon.innerHTML).toContain('M2 2l20 20'); // closedEye path
    expect(btn.getAttribute('aria-label')).toBe('Hide password');
    expect(btn.getAttribute('title')).toBe('Hide password');
  });

  it('should toggle from text to password and change icon to openEye', () => {
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');
    const btn = document.getElementById('eyeBtn');

    p.type = 'text';
    btn.setAttribute('aria-label', 'Hide password');
    btn.setAttribute('title', 'Hide password');

    window.togglePass();

    expect(p.type).toBe('password');
    expect(icon.innerHTML).toContain('M1 12s4-7'); // openEye path
    expect(btn.getAttribute('aria-label')).toBe('Show password');
    expect(btn.getAttribute('title')).toBe('Show password');
  });
});
