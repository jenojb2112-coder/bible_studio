/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('togglePass', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="password" id="loginPass" />
      <span id="eyeIcon"></span>
    `;

    const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

    // Extract the inline module script
    const scriptRegex = /<script type="module">([\s\S]*?)<\/script>/g;
    let match = scriptRegex.exec(htmlContent);
    if (!match) {
      throw new Error('Could not find module script in index.html');
    }
    const scriptContent = match[1];

    const toggleMatch = scriptContent.match(/window\.togglePass = function\(\)\{([\s\S]*?)\};/);
    if(toggleMatch) {
        window.togglePass = new Function(toggleMatch[1]);
    } else {
        throw new Error('togglePass function not found in index.html');
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should toggle password visibility from password to text and update icon', () => {
    const passInput = document.getElementById('loginPass');
    const eyeIcon = document.getElementById('eyeIcon');

    expect(passInput.type).toBe('password');

    window.togglePass();

    expect(passInput.type).toBe('text');

    // JSDOM might close tags and change quote styles, so check content dynamically using a temp element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '<path d="M2 2l20 20"/><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.2 4.1M6.5 6.6C3.4 8.5 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 4.2-.9"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>';
    expect(eyeIcon.innerHTML).toContain('M2 2l20 20'); // simplified check that survives formatting
  });

  it('should toggle password visibility from text to password and update icon', () => {
    const passInput = document.getElementById('loginPass');
    const eyeIcon = document.getElementById('eyeIcon');

    passInput.type = 'text';
    eyeIcon.innerHTML = 'closed eye svg'; // dummy initial state

    window.togglePass();

    expect(passInput.type).toBe('password');
    expect(eyeIcon.innerHTML).toContain('circle cx="12" cy="12" r="3"'); // open eye path
  });

  it('should throw an error if loginPass element is missing', () => {
    document.getElementById('loginPass').remove();
    expect(() => window.togglePass()).toThrow(TypeError);
  });

  it('should throw an error if eyeIcon element is missing', () => {
    document.getElementById('eyeIcon').remove();
    expect(() => window.togglePass()).toThrow(TypeError);
  });
});
