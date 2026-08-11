export async function emailSignInHandler(auth, signInFn, showMsg, setLoading) {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if(!email || !pass){ showMsg('⚠️ Email மற்றும் Password போடுங்க'); return; }
  setLoading(true);
  try{
    await signInFn(auth, email, pass);
  }catch(e){
    setLoading(false);
    let msg = e.message || e.code;
    if((e.code||'').includes('invalid-credential') || (e.code||'').includes('user-not-found') || (e.code||'').includes('wrong-password')){
      msg = 'இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.';
    }
    console.error('Login error', e); if (msg === e.message || msg === e.code) { msg = 'Login தோல்வி. Please try again.'; } showMsg('❌ ' + msg, 5000);
  }
}

export async function emailSignUpHandler(auth, signUpFn, showMsg, setLoading) {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if(!email || !pass){ showMsg('⚠️ Account create பண்ண Email + Password (6+ chars) போடுங்க'); return; }
  setLoading(true);
  try{
    await signUpFn(auth, email, pass);
    showMsg('✅ Account created!');
  }catch(e){
    setLoading(false);
    console.error('Sign up error', e); showMsg('❌ Sign up தோல்வி. Please try again.');
  }
}

export async function forgotPasswordHandler(auth, resetFn, showMsg) {
  const email = document.getElementById('loginEmail').value.trim();
  if(!email){ showMsg('⚠️ முதல்ல Email போடுங்க'); return; }
  try{
    await resetFn(auth, email);
    showMsg('📧 Password reset link email-க்கு அனுப்பப்பட்டது');
  }catch(e){
    console.error('Password reset error', e);
    if ((e.code || '').includes('user-not-found')) {
      // 🛡️ Sentinel: Fail securely - don't expose if user exists
      showMsg('📧 Password reset link email-க்கு அனுப்பப்பட்டது');
    } else {
      showMsg('❌ Password reset failed. Please try again.');
    }
  }
}
