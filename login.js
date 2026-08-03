import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7IPJN4DIxSTtrclOXftvdAZ6AKgFkKRQ",
  authDomain: "bible-studio-8d5df.firebaseapp.com",
  projectId: "bible-studio-8d5df",
  storageBucket: "bible-studio-8d5df.firebasestorage.app",
  messagingSenderId: "620234131776",
  appId: "1:620234131776:web:64300139740961dcf852a5",
  measurementId: "G-N06JW2YQR4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function showMsg(text, ms=3000){
  const box = document.getElementById('msgBox');
  if (box) {
    box.textContent = text;
    box.style.display = 'block';
  }
  clearTimeout(window._msgTimer);
  window._msgTimer = setTimeout(()=>{
    if (box) box.style.display='none';
  }, ms);
}
function setLoading(on){
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = on ? 'flex' : 'none';
}
function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

window.goToLogin = ()=> goTo('loginScreen');

setTimeout(()=>{ goTo('loginScreen'); }, 2200);

window.previewChurchPhoto = function(input){
  if(input.files && input.files[0]){
    const reader = new FileReader();
    reader.onload = (e)=>{
      const img = document.getElementById('churchPhotoPreview');
      if (img) {
        img.src = e.target.result;
        img.style.display = 'block';
      }
      window._churchPhotoDataUrl = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.togglePass = function(){
  const p = document.getElementById('loginPass');
  const icon = document.getElementById('eyeIcon');
  const openEye = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
  const closedEye = '<path d="M2 2l20 20"/><path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c7 0 11 7 11 7a17.6 17.6 0 0 1-3.2 4.1M6.5 6.6C3.4 8.5 1 12 1 12s4 7 11 7a10.6 10.6 0 0 0 4.2-.9"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>';
  if (p && icon) {
    if(p.type === 'password'){ p.type = 'text'; icon.innerHTML = closedEye; }
    else { p.type = 'password'; icon.innerHTML = openEye; }
  }
};

window.emailSignIn = async function(){
  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPass');
  const email = emailEl ? emailEl.value.trim() : '';
  const pass  = passEl ? passEl.value : '';
  if(!email || !pass){ showMsg('⚠️ Email மற்றும் Password போடுங்க'); return; }
  setLoading(true);
  try{
    await signInWithEmailAndPassword(auth, email, pass);
  }catch(e){
    setLoading(false);
    let msg = e.message || e.code;
    if((e.code||'').includes('invalid-credential') || (e.code||'').includes('user-not-found') || (e.code||'').includes('wrong-password')){
      msg = 'இந்த Email/Password சரியில்ல, அல்லது இன்னும் Account create ஆகல. "Create Account" try பண்ணுங்க.';
    }
    showMsg('❌ ' + msg, 5000);
  }
};

window.emailSignUp = async function(){
  const emailEl = document.getElementById('loginEmail');
  const passEl  = document.getElementById('loginPass');
  const email = emailEl ? emailEl.value.trim() : '';
  const pass  = passEl ? passEl.value : '';
  if(!email || !pass){ showMsg('⚠️ Account create பண்ண Email + Password (6+ chars) போடுங்க'); return; }
  setLoading(true);
  try{
    await createUserWithEmailAndPassword(auth, email, pass);
    showMsg('✅ Account created!');
  }catch(e){
    setLoading(false);
    showMsg('❌ Sign up தோல்வி: ' + (e.message || e.code));
  }
};

window.googleSignIn = async function(){
  setLoading(true);
  try{
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }catch(e){
    setLoading(false);
    showMsg('❌ Google Login தோல்வி: ' + (e.message || e.code));
  }
};

window.forgotPassword = async function(){
  const emailEl = document.getElementById('loginEmail');
  const email = emailEl ? emailEl.value.trim() : '';
  if(!email){ showMsg('⚠️ முதல்ல Email போடுங்க'); return; }
  try{
    await sendPasswordResetEmail(auth, email);
    showMsg('📧 Password reset link email-க்கு அனுப்பப்பட்டது');
  }catch(e){
    showMsg('❌ ' + (e.message || e.code));
  }
};

function withTimeout(promise, ms, label){
  return Promise.race([
    promise,
    new Promise((_,reject)=> setTimeout(()=> reject(new Error(label+' - Timeout (network/rules problem)')), ms))
  ]);
}

window.saveChurchInfo = async function(){
  const user = auth.currentUser;
  if(!user){ showMsg('⚠️ முதல்ல login பண்ணுங்க'); goTo('loginScreen'); return; }
  const churchNameEl = document.getElementById('churchName');
  const locEl = document.getElementById('churchLoc');
  const instaEl = document.getElementById('churchInsta');
  const ytEl = document.getElementById('churchYT');
  const webEl = document.getElementById('churchWeb');
  const churchName = churchNameEl ? churchNameEl.value.trim() : '';
  const loc = locEl ? locEl.value.trim() : '';
  const insta = instaEl ? instaEl.value.trim() : '';
  const yt = ytEl ? ytEl.value.trim() : '';
  const web = webEl ? webEl.value.trim() : '';
  if(!churchName){ showMsg('⚠️ Church Name தேவை'); return; }
  setLoading(true);
  try{
    await withTimeout(setDoc(doc(db, 'users', user.uid), {
      churchName, location: loc, instagram: insta, youtube: yt, website: web,
      email: user.email || null,
      updatedAt: new Date().toISOString()
    }, { merge: true }), 10000, 'Save');
    setLoading(false);
    showMsg('✅ Church details save ஆனது! Welcome ' + churchName);
  }catch(e){
    setLoading(false);
    showMsg('❌ Save தோல்வி: ' + (e.message || e.code), 6000);
  }
};

onAuthStateChanged(auth, async (user)=>{
  setLoading(false);
  if(user){
    showMsg('✅ Login வெற்றி: ' + (user.email || user.phoneNumber || 'User'));
    try{
      const snap = await getDoc(doc(db, 'users', user.uid));
      if(snap.exists()){
        const d = snap.data();
        const churchNameEl = document.getElementById('churchName');
        const locEl = document.getElementById('churchLoc');
        const instaEl = document.getElementById('churchInsta');
        const ytEl = document.getElementById('churchYT');
        const webEl = document.getElementById('churchWeb');
        const photoPreviewEl = document.getElementById('churchPhotoPreview');
        if(d.churchName && churchNameEl) churchNameEl.value = d.churchName;
        if(d.location && locEl) locEl.value = d.location;
        if(d.instagram && instaEl) instaEl.value = d.instagram;
        if(d.youtube && ytEl) ytEl.value = d.youtube;
        if(d.website && webEl) webEl.value = d.website;
        if(d.photoDataUrl && photoPreviewEl){
          photoPreviewEl.src = d.photoDataUrl; photoPreviewEl.style.display='block';
        }
      }
    }catch(e){}
    goTo('churchScreen');
  }
});
