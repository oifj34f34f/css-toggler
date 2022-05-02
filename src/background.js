const disabledTabIds = [];

async function updateIcon() {
    const disabledIconPaths = {
        48: 'assets/css-disabled-48.png',
        96: 'assets/css-disabled-96.png',
    };

    const enabledIconPaths = {
        48: 'assets/css-enabled-48.png',
        96: 'assets/css-enabled-96.png',
    };

    const currentTab = (await browser.tabs.query({
        active: true,
        currentWindow: true,
    }))[0];

    let iconTitle;
    let iconPath;
    if (disabledTabIds.includes(currentTab.id)) {
        iconPath = disabledIconPaths;
        iconTitle = 'Click to enable CSS';
    } else {
        iconPath = enabledIconPaths;
        iconTitle = 'Click to disable CSS';
    }

    browser.browserAction.setIcon({
        path: iconPath,
        tabId: currentTab.id,
    });
    browser.browserAction.setTitle({
        title: iconTitle,
        tabId: currentTab.id,
    });
}

function tabCssIsDisabled(tabId) {
    return disabledTabIds.includes(tabId);
}

function setTabCssDisabled(tabId, disabled) {
    if (disabled) {
        if (!tabCssIsDisabled(tabId)) {
            disabledTabIds.push(tabId);
        }
    } else {
        let idx = disabledTabIds.indexOf(tabId);

        while (idx !== -1) {
            disabledTabIds.splice(idx, 1);
            idx = disabledTabIds.indexOf(tabId);
        }
    }
    updateIcon();
}

function toggleCss(activeTab) {
    if (!activeTab.id) {
        return;
    }

    const disableCss = !tabCssIsDisabled(activeTab.id);
    setTabCssDisabled(activeTab.id, disableCss);

    // Tell the content script to enable/disable CSS
    browser.tabs.sendMessage(activeTab.id, {
            disableCss,
        })
        .catch(() => {
            // Disabling the CSS can fail if the tab is not on a webpage
            // Ignore the error - when the tab loads a webpage, disable the
            // CSS at that time
        });
}

browser.browserAction.onClicked.addListener((activeTab) => {
    toggleCss(activeTab);
});

browser.tabs.onActivated.addListener((_activeInfo) => {
    updateIcon();
});

browser.tabs.onRemoved.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

browser.tabs.onReplaced.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    // If the tab finished loading and CSS is supposed to be disabled, tell the
    // tab to disable CSS
    if (changeInfo.status === 'complete') {
        if (tabCssIsDisabled(tabId)) {
            browser.tabs.sendMessage(tabId, {
                    disableCss: true,
                })
                .catch(() => {
                    // Disabling the CSS can fail if the tab is not on a webpage
                    // Ignore the error - when the tab loads a webpage, disable
                    // the CSS at that time
                });
        }
    }

    updateIcon();
});

browser.windows.onFocusChanged.addListener((_windowId) => {
    updateIcon();
});
