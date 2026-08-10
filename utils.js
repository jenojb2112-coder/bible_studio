export function withTimeout(promise, ms, label){
  let timeoutId;
  const timeoutPromise = new Promise((_,reject)=> {
    timeoutId = setTimeout(()=> reject(new Error(label+' - Timeout (network/rules problem)')), ms);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}

export function previewChurchPhotoHandler(input, showMsgFn) {
  if (input.files && input.files[0]) {
    if (!input.files[0].type.startsWith('image/')) { showMsgFn('⚠️ Image file மட்டும் upload பண்ணுங்க'); return; }
    if (input.files[0].size > 2 * 1024 * 1024) { showMsgFn('⚠️ Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('churchPhotoPreview');
      if (img) {
        img.src = e.target.result;
        img.style.display = 'block';
      }
      window._churchPhotoDataUrl = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}
