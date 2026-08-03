export let getFirestore = () => ({});
export let doc = () => ({});
export let setDoc = async () => {};
export let getDoc = async () => ({
  exists: () => false,
  data: () => ({})
});

export function mockGetDoc(fn) {
  getDoc = fn;
}
export function mockSetDoc(fn) {
  setDoc = fn;
}
