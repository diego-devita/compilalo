let attiva = document.getElementById("attiva");

attiva.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
       target: { tabId: tab.id },
       files: ['compilalo.js'],
     });
});