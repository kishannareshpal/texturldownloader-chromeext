// import * as $ from 'jquery';

const CONTEXT_MENU_DOWNOADS_ID = "tud_context_download"

chrome.runtime.onInstalled.addListener(function() {
    // When the app gets installed, set up the context menus
    setUpContextMenus();
});
function setUpContextMenus() {
    chrome.contextMenus.create( {
        title: 'Download "' + "%s" + '"',
        id: CONTEXT_MENU_DOWNOADS_ID,
        contexts: ['selection']
    });
}
chrome.contextMenus.onClicked.addListener(function(item) {
    if (item.menuItemId == CONTEXT_MENU_DOWNOADS_ID) {
        const URL_FROM_SELECTION = item.selectionText;
        const FROM_CONTEXT = "contextmenu"
        performDownload(URL_FROM_SELECTION, FROM_CONTEXT)
    }
});


// Listen for action
chrome.runtime.onMessage.addListener(gotMessage);
/**
 * Callback function used for {@func chrome.runtime.onMessage.addListener(listener)}
 * @param message an object containing these three attrs: "kind", "from", "content".
 *                E.g: for downloading: 
                    const message = {
                         kind: "download",
                         from: "button_click",
                         content: "url_to_be_downloaded"
                    }
 */
function gotMessage(message: any, sender: chrome.runtime.MessageSender) {
    if (message.kind == "download") {
        const URL_FROM_INPUT = message.content;
        const FROM_INPUT = message.from;
        performDownload(URL_FROM_INPUT, FROM_INPUT);
    }
}




/**
 * Performs the download and notifies back to where it was invoked.
 * @param url the text url to be downloaded
 * @param from "browser_action" or "contextmenu"
 */
function performDownload(url: string, from: string) {
    var response = {};
    
    chrome.downloads.download({
        url: url,
        saveAs: false
    }, function (downloadId) {
        /**
         * If there was an error starting the download, then callback will be called with downloadId=undefined and runtime.lastError 
         * will contain a descriptive string.
         *   - The error strings are not guaranteed to remain backwards compatible between releases. Extensions must not parse it.
         */
        let lasterror = chrome.runtime.lastError;
        const ERROR_MESSAGE = lasterror != null ? lasterror.message : "";

        response["kind"] = "downloadnotification"
        const downloadIsAvailable = downloadId != undefined;
        response["isDownloading"] = downloadIsAvailable;
        if (!downloadIsAvailable) {
            response["error"] = ERROR_MESSAGE;
            // Notify the context menu action
            let lenghtUntilTrim = 60;
            var trimmedURLtoBeDisplayed = (url.length > lenghtUntilTrim) ? url.substring(0, lenghtUntilTrim - 3) + "..." : url;
            if (from === "contextmenu") alert('Oh God! I cannot start a download with the selected text "' + trimmedURLtoBeDisplayed + '"\n\n' + ERROR_MESSAGE)
        }

        if (from === "browser_action") {
            // Notify the popup menu action
            chrome.runtime.sendMessage(response);
        }
    })
}




