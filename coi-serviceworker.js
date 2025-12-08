/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener("message", (ev) => {
        if (!ev.data) return;
        if (ev.data.type === "deregister") {
            self.registration.unregister().then(() => self.clients.matchAll().then(clients => clients.forEach(client => client.navigate(client.url))));
        }
    });
    self.addEventListener("fetch", function (event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;
        if (event.request.mode === "no-cors" || event.request.mode === "navigate") { // First request to SW
            event.respondWith(fetch(event.request).then((response) => {
                if (response.status === 0) return response;
                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", coepCredentialless ? "credentialless" : "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
            }));
        }
    });
} else {
    (async function () {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register(window.document.currentScript.src).then((registration) => {
                console.log("COI Service Worker registered");
                registration.addEventListener("updatefound", () => { window.location.reload(); });
                if (registration.active && !navigator.serviceWorker.controller) window.location.reload();
            });
        }
    })();
}