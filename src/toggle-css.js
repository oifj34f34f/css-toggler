function toggleCss(request) {
    // eslint-disable-next-line no-restricted-syntax
    for (const s of document.styleSheets) {
        s.disabled = request.disableCss;
    }
}

browser.runtime.onMessage.addListener(toggleCss);
