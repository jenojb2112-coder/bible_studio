export function withTimeout(promise, ms, label){
  let timeoutId;
  const timeoutPromise = new Promise((_,reject)=> {
    timeoutId = setTimeout(()=> reject(new Error(label+' - Timeout (network/rules problem)')), ms);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}

let _cachedMsgBox = null;
export function showMsg(text, ms=3000){
  if(!_cachedMsgBox) _cachedMsgBox = document.getElementById('msgBox');
  if(!_cachedMsgBox) return; // fail safe
  _cachedMsgBox.textContent = text;
  _cachedMsgBox.style.display = 'block';
  clearTimeout(window._msgTimer);
  window._msgTimer = setTimeout(()=>{ _cachedMsgBox.style.display='none'; }, ms);
}
