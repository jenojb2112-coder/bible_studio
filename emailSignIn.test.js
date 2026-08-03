const fs = require('fs');

describe('emailSignIn', () => {
    let emailSignIn;
    let mockShowMsg;
    let mockSetLoading;
    let mockSignInWithEmailAndPassword;
    let mockAuth;

    beforeAll(() => {
        const html = fs.readFileSync('index.html', 'utf-8');
        const match = html.match(/window\.emailSignIn = async function\(\)\{([\s\S]*?)\n\};/);
        if (!match) throw new Error("Could not find window.emailSignIn");

        // We will execute this function body inside our test environment
        // So we can define it directly in the global scope to match how it's executed
        global.emailSignIn = new Function(
            'return async function() {' + match[1] + '\n}'
        )();
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <input id="loginEmail" value="" />
            <input id="loginPass" value="" />
        `;

        mockShowMsg = jest.fn();
        global.showMsg = mockShowMsg;

        mockSetLoading = jest.fn();
        global.setLoading = mockSetLoading;

        mockSignInWithEmailAndPassword = jest.fn();
        global.signInWithEmailAndPassword = mockSignInWithEmailAndPassword;

        mockAuth = {};
        global.auth = mockAuth;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show error message if email is missing', async () => {
        document.getElementById('loginPass').value = 'password123';
        await global.emailSignIn();
        expect(mockShowMsg).toHaveBeenCalledWith('⚠️ Email மற்றும் Password போடுங்க');
        expect(mockSetLoading).not.toHaveBeenCalled();
    });

    it('should show error message if password is missing', async () => {
        document.getElementById('loginEmail').value = 'test@example.com';
        await global.emailSignIn();
        expect(mockShowMsg).toHaveBeenCalledWith('⚠️ Email மற்றும் Password போடுங்க');
        expect(mockSetLoading).not.toHaveBeenCalled();
    });

    it('should show error message if both are missing', async () => {
        await global.emailSignIn();
        expect(mockShowMsg).toHaveBeenCalledWith('⚠️ Email மற்றும் Password போடுங்க');
        expect(mockSetLoading).not.toHaveBeenCalled();
    });

    it('should trim the email before using it', async () => {
        document.getElementById('loginEmail').value = '  test@example.com  ';
        document.getElementById('loginPass').value = 'password123';
        mockSignInWithEmailAndPassword.mockResolvedValueOnce({});

        await global.emailSignIn();

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123');
    });

    it('should call signInWithEmailAndPassword and not show error on success', async () => {
        document.getElementById('loginEmail').value = 'test@example.com';
        document.getElementById('loginPass').value = 'password123';
        mockSignInWithEmailAndPassword.mockResolvedValueOnce({});

        await global.emailSignIn();

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123');
        expect(mockSetLoading).toHaveBeenCalledTimes(1); // doesn't call with false on success based on code
        expect(mockShowMsg).not.toHaveBeenCalled();
    });

    it('should handle invalid-credential error specifically', async () => {
        document.getElementById('loginEmail').value = 'test@example.com';
        document.getElementById('loginPass').value = 'password123';
        const error = new Error('Auth failed');
        error.code = 'auth/invalid-credential';
        mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

        await global.emailSignIn();

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockShowMsg).toHaveBeenCalledWith('❌ இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.', 5000);
    });

    it('should handle user-not-found error specifically', async () => {
        document.getElementById('loginEmail').value = 'test@example.com';
        document.getElementById('loginPass').value = 'password123';
        const error = new Error('Auth failed');
        error.code = 'auth/user-not-found';
        mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

        await global.emailSignIn();

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockShowMsg).toHaveBeenCalledWith('❌ இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.', 5000);
    });

    it('should handle generic error messages', async () => {
        document.getElementById('loginEmail').value = 'test@example.com';
        document.getElementById('loginPass').value = 'password123';
        const error = new Error('Network error');
        mockSignInWithEmailAndPassword.mockRejectedValueOnce(error);

        await global.emailSignIn();

        expect(mockSetLoading).toHaveBeenCalledWith(true);
        expect(mockSetLoading).toHaveBeenCalledWith(false);
        expect(mockShowMsg).toHaveBeenCalledWith('❌ Network error', 5000);
    });
});
