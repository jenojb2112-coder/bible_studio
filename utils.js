export function withTimeout(promise, ms, label){
  let timeoutId;
  const timeoutPromise = new Promise((_,reject)=> {
    timeoutId = setTimeout(()=> reject(new Error(label+' - Timeout (network/rules problem)')), ms);
  });

  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}
