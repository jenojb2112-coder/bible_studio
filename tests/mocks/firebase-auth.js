export let getAuth = () => ({ currentUser: null });
export let signInWithEmailAndPassword = async () => {};
export let createUserWithEmailAndPassword = async () => {};
export let signInWithPopup = async () => {};
export class GoogleAuthProvider {}
export let sendPasswordResetEmail = async () => {};
export let onAuthStateChanged = () => {};

// Helper functions to override mocks in tests
export function mockSendPasswordResetEmail(fn) {
  sendPasswordResetEmail = fn;
}
export function mockGetAuth(fn) {
  getAuth = fn;
}
