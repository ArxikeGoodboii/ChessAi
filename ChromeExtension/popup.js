const enabled=document.getElementById("enabled");const status=document.getElementById("status");
chrome.storage.sync.get({enabled:true},({enabled:value})=>{enabled.checked=value;status.textContent=value?"Board reader is enabled.":"Board reader is paused.";});
enabled.addEventListener("change",()=>{chrome.storage.sync.set({enabled:enabled.checked});status.textContent=enabled.checked?"Board reader is enabled.":"Board reader is paused.";});
document.getElementById("open").addEventListener("click",()=>chrome.tabs.create({url:"https://www.chess.com/analysis"}));