function toggleCss(request) {
    for (const s of document.styleSheets) {
        s.disabled = request.disableCss;
    }

    if (request.disableCss) {
        document.querySelectorAll('[style]').forEach(el => {
            el.setAttribute('data-original-style', el.getAttribute('style'));
            el.removeAttribute('style');
        });
    } else {
        document.querySelectorAll('[data-original-style]').forEach(el => {
            el.setAttribute('style', el.getAttribute('data-original-style'));
            el.removeAttribute('data-original-style');
        });
    }
}

chrome.runtime.onMessage.addListener(toggleCss);
