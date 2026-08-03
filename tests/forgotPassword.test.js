import './setup.js';
import { jest } from '@jest/globals';
import { mockSendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import '../login.js';

describe('forgotPassword tests (modular & robust)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockEmailInput.value = '';
    global.mockMsgBox.textContent = '';
    global.mockMsgBox.style.display = 'none';
    global.mockLoader.style.display = 'none';
  });

  test('should show warning message and not send reset email when email is empty', async () => {
    global.mockEmailInput.value = '';
    const mockSendReset = jest.fn();
    mockSendPasswordResetEmail(mockSendReset);

    await window.forgotPassword();

    expect(global.document.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(global.mockMsgBox.textContent).toBe('⚠️ முதல்ல Email போடுங்க');
    expect(mockSendReset).not.toHaveBeenCalled();
  });

  test('should show warning message and not send reset email when email is only whitespace', async () => {
    global.mockEmailInput.value = '   ';
    const mockSendReset = jest.fn();
    mockSendPasswordResetEmail(mockSendReset);

    await window.forgotPassword();

    expect(global.document.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(global.mockMsgBox.textContent).toBe('⚠️ முதல்ல Email போடுங்க');
    expect(mockSendReset).not.toHaveBeenCalled();
  });

  test('should call sendPasswordResetEmail and show success message when email is valid', async () => {
    global.mockEmailInput.value = 'user@example.com';
    const mockSendReset = jest.fn().mockResolvedValue();
    mockSendPasswordResetEmail(mockSendReset);

    await window.forgotPassword();

    expect(global.document.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(mockSendReset).toHaveBeenCalledWith(expect.any(Object), 'user@example.com');
    expect(global.mockMsgBox.textContent).toBe('📧 Password reset link email-க்கு அனுப்பப்பட்டது');
  });

  test('should show error message when sendPasswordResetEmail fails with message', async () => {
    global.mockEmailInput.value = 'user@example.com';
    const firebaseError = new Error('Firebase: Error (auth/user-not-found).');
    firebaseError.code = 'auth/user-not-found';

    const mockSendReset = jest.fn().mockRejectedValue(firebaseError);
    mockSendPasswordResetEmail(mockSendReset);

    await window.forgotPassword();

    expect(global.document.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(mockSendReset).toHaveBeenCalledWith(expect.any(Object), 'user@example.com');
    expect(global.mockMsgBox.textContent).toBe('❌ Firebase: Error (auth/user-not-found).');
  });

  test('should show error code when sendPasswordResetEmail fails without message', async () => {
    global.mockEmailInput.value = 'user@example.com';
    const firebaseError = { code: 'auth/invalid-email' };

    const mockSendReset = jest.fn().mockRejectedValue(firebaseError);
    mockSendPasswordResetEmail(mockSendReset);

    await window.forgotPassword();

    expect(global.document.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(mockSendReset).toHaveBeenCalledWith(expect.any(Object), 'user@example.com');
    expect(global.mockMsgBox.textContent).toBe('❌ auth/invalid-email');
  });
});
