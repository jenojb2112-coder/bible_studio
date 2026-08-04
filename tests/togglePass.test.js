/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('window.togglePass', () => {
  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
    const scriptMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
    let scriptContent = scriptMatch[1];

    // Extract the window.togglePass function definition.
    const togglePassMatch = scriptContent.match(/window\.togglePass\s*=\s*function\(\)\{[\s\S]*?\n\};/);
    if (togglePassMatch) {
      eval(togglePassMatch[0]);
    } else {
      throw new Error("Could not find window.togglePass in index.html");
    }
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <input id="loginPass" type="password" />
      <div id="eyeIcon"></div>
    `;
  });

  it('should toggle from password to text and change icon to closedEye', () => {
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');

    expect(p.type).toBe('password');

    window.togglePass();

    expect(p.type).toBe('text');
    expect(icon.innerHTML).toContain('M2 2l20 20'); // closedEye path
  });

  it('should toggle from text to password and change icon to openEye', () => {
    const p = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');

    p.type = 'text';

    window.togglePass();

    expect(p.type).toBe('password');
    expect(icon.innerHTML).toContain('M1 12s4-7'); // openEye path
  });
});
