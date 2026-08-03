import { jest } from '@jest/globals';

const mockEmailInput = { value: '' };
const mockMsgBox = { textContent: '', style: { display: 'none' } };
const mockLoader = { style: { display: 'none' } };

// Set up globals
global.window = global;
global._msgTimer = null;

global.document = {
  getElementById: jest.fn((id) => {
    if (id === 'loginEmail') return mockEmailInput;
    if (id === 'msgBox') return mockMsgBox;
    if (id === 'loader') return mockLoader;
    return null;
  }),
  querySelectorAll: jest.fn(() => []),
};

global.mockEmailInput = mockEmailInput;
global.mockMsgBox = mockMsgBox;
global.mockLoader = mockLoader;
