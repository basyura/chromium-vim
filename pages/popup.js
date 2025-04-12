console.log(new Date() + "Popup");
var pause = document.getElementById("pause");
var blacklist = document.getElementById("blacklist");
var settings = document.getElementById("settings");
var _isEnabled = true;
var isBlacklisted = false;

var port = chrome.runtime.connect({ name: "popup" });

/*
port.onMessage.addListener(function (data) {
  if (data === true) {
    blacklist.textContent = "Enable cVim on this domain";
    isBlacklisted = true;
  }
});
port.postMessage({ action: "getBlacklisted" });
*/

// port.onDisconnect.addListener(function () {
//   console.log(new Date() + "Disconnect Popup");
//   port = chrome.runtime.connect({ name: "popup" });
//   console.log(new Date() + "connect Popup");
// });

chrome.runtime.sendMessage({ action: "getActiveState" }, function (response) {
  _isEnabled = response;
  if (_isEnabled) {
    pause.textContent = "Disable cVim";
  } else {
    pause.textContent = "Enable cVim";
  }
  return true;
});

settings.addEventListener(
  "click",
  function () {
    chrome.runtime.sendMessage({
      action: "openLinkTab",
      active: true,
      url: chrome.runtime.getURL("/pages/options.html"),
    });
  },
  false
);

pause.addEventListener(
  "click",
  function () {
    _isEnabled = !_isEnabled;
    if (_isEnabled) {
      pause.textContent = "Disable cVim";
    } else {
      pause.textContent = "Enable cVim";
    }
    port.postMessage({ action: "toggleEnabled", blacklisted: isBlacklisted });
  },
  false
);

/*
blacklist.addEventListener(
  "click",
  function () {
    isBlacklisted = !isBlacklisted;
    if (blacklist.textContent === "Disable cVim on this domain") {
      blacklist.textContent = "Enable cVim on this domain";
    } else {
      blacklist.textContent = "Disable cVim on this domain";
    }
    port.postMessage({ action: "toggleBlacklisted" });
    if (_isEnabled) {
      port.postMessage({
        action: "toggleEnabled",
        singleTab: true,
        blacklisted: isBlacklisted,
      });
    }
  },
  false
);
*/

// async function runHeartbeat() {
//   await chrome.storage.local.set({
//     "last-heartbeat-popup": new Date().getTime(),
//   });
// }
// function startHeartbeat() {
//   runHeartbeat().then(() => {
//     setInterval(() => runHeartbeat(), 10 * 1000);
//   });
// }

// startHeartbeat();
