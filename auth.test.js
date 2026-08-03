const fs = require('fs');

describe('window.emailSignIn', () => {
  let emailSignInFunc;
  let documentMock;
  let windowMock;

  beforeEach(() => {
    const html = fs.readFileSync('index.html', 'utf8');
    const scriptStart = html.indexOf('<script type="module">');
    const scriptEnd = html.indexOf('</script>', scriptStart);
    const scriptContent = html.substring(scriptStart + 22, scriptEnd);

    // Extract just the emailSignIn function text
    const funcMatch = scriptContent.match(/window\.emailSignIn = async function\(\){([\s\S]*?)};/);
    if (!funcMatch) throw new Error("Could not find window.emailSignIn");
    const funcBody = funcMatch[1];

    documentMock = {
      getElementById: jest.fn()
    };

    windowMock = {
      showMsg: jest.fn(),
      setLoading: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      auth: {}
    };

    // Dynamically evaluate the extracted function body against the mock dependencies.
    // The extracted body uses document, signInWithEmailAndPassword, showMsg, setLoading, auth.
    // By wrapping it in an async function and binding/passing what's needed, we test the real logic.
    emailSignInFunc = new Function(
      'document', 'showMsg', 'setLoading', 'signInWithEmailAndPassword', 'auth',
      `return async function() { ${funcBody} }`
    )(documentMock, windowMock.showMsg, windowMock.setLoading, windowMock.signInWithEmailAndPassword, windowMock.auth);
  });

  it('should be extracted', () => {
    expect(emailSignInFunc).toBeDefined();
  });

  it('should show error if email or password is empty', async () => {
    documentMock.getElementById.mockImplementation((id) => {
      if (id === 'loginEmail') return { value: '' };
      if (id === 'loginPass') return { value: 'pass' };
    });

    await emailSignInFunc();

    expect(windowMock.showMsg).toHaveBeenCalledWith('⚠️ Email மற்றும் Password போடுங்க');
    expect(windowMock.setLoading).not.toHaveBeenCalled();
  });

  it('should call signInWithEmailAndPassword and show loading on success', async () => {
    documentMock.getElementById.mockImplementation((id) => {
      if (id === 'loginEmail') return { value: 'test@example.com ' };
      if (id === 'loginPass') return { value: 'password123' };
    });

    windowMock.signInWithEmailAndPassword.mockResolvedValue({});

    await emailSignInFunc();

    expect(documentMock.getElementById).toHaveBeenCalledWith('loginEmail');
    expect(documentMock.getElementById).toHaveBeenCalledWith('loginPass');
    expect(windowMock.setLoading).toHaveBeenCalledWith(true);
    expect(windowMock.signInWithEmailAndPassword).toHaveBeenCalledWith(windowMock.auth, 'test@example.com', 'password123');
    expect(windowMock.showMsg).not.toHaveBeenCalled();
    expect(windowMock.setLoading).not.toHaveBeenCalledWith(false); // only called in catch
  });

  it('should handle invalid-credential error', async () => {
    documentMock.getElementById.mockImplementation((id) => {
      if (id === 'loginEmail') return { value: 'test@example.com' };
      if (id === 'loginPass') return { value: 'wrongpass' };
    });

    const error = new Error();
    error.code = 'auth/invalid-credential';
    windowMock.signInWithEmailAndPassword.mockRejectedValue(error);

    await emailSignInFunc();

    expect(windowMock.setLoading).toHaveBeenCalledWith(true);
    expect(windowMock.setLoading).toHaveBeenCalledWith(false);
    expect(windowMock.showMsg).toHaveBeenCalledWith('❌ இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.', 5000);
  });

  it('should handle general error', async () => {
    documentMock.getElementById.mockImplementation((id) => {
      if (id === 'loginEmail') return { value: 'test@example.com' };
      if (id === 'loginPass') return { value: 'wrongpass' };
    });

    const error = new Error('Some other error');
    error.code = 'auth/network-error';
    windowMock.signInWithEmailAndPassword.mockRejectedValue(error);

    await emailSignInFunc();

    expect(windowMock.setLoading).toHaveBeenCalledWith(true);
    expect(windowMock.setLoading).toHaveBeenCalledWith(false);
    expect(windowMock.showMsg).toHaveBeenCalledWith('❌ Some other error', 5000);
  });
});
