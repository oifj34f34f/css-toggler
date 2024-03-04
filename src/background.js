// background.js
const disabledTabIds = [];

chrome.browserAction.onClicked.addListener((activeTab) => {
    toggleCss(activeTab);
});

chrome.tabs.onActivated.addListener((_activeInfo) => {
    updateIcon();
});

chrome.tabs.onRemoved.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

chrome.tabs.onReplaced.addListener((tabId) => {
    setTabCssDisabled(tabId, false);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        if (tabCssIsDisabled(tabId)) {
            chrome.tabs.sendMessage(tabId, {
                disableCss: true,
            }).catch(() => {});
        }
    }

    updateIcon();
});

chrome.windows.onFocusChanged.addListener((_windowId) => {
    updateIcon();
});


async function updateIcon() {
    const disabledIconPaths = {
        48: 'assets/css-disabled-48.png',
        96: 'assets/css-disabled-96.png',
    };

    const enabledIconPaths = {
        48: 'assets/css-enabled-48.png',
        96: 'assets/css-enabled-96.png',
    };

    const currentTab = await getCurrentTab();

    let iconTitle;
    let iconPath;
    if (disabledTabIds.includes(currentTab.id)) {
        iconPath = disabledIconPaths;
        iconTitle = 'Click to enable CSS';
    } else {
        iconPath = enabledIconPaths;
        iconTitle = 'Click to disable CSS';
    }

    chrome.browserAction.setIcon({
        path: iconPath,
        tabId: currentTab.id,
    });
    chrome.browserAction.setTitle({
        title: iconTitle,
        tabId: currentTab.id,
    });
}

async function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

// Call the function immediately
updateIcon();

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

    chrome.tabs.sendMessage(activeTab.id, {
        disableCss,
    }).catch(() => {});
}
