let cryptoAPI;

if (typeof window !== "undefined" && window.crypto) {
  cryptoAPI = window.crypto;
} else {
  const { webcrypto } = await import("node:crypto");
  cryptoAPI = webcrypto;
}






export function getCookie(name){
    let cname = name + "=";
    let dcookie = decodeURIComponent(document.cookie);
    let cookies = dcookie.split(";")
    for(let c of cookies){
        c = c.trim();
        if(c.indexOf(cname) === 0){
            return c.substring(cname.length, c.length);
        }
    }
    return null
}




export function generateLongString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  cryptoAPI.getRandomValues(bytes); 

  return Array.from(bytes, b => chars[b % chars.length]).join('');
}






