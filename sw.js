self.addEventListener("install", (event) => {
    console.log("Service Worker installed.");
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
  });

  

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
      .then(() => console.log("Service Worker Registered"))
      .catch(error => console.log("Service Worker Failed:", error));
  }
  