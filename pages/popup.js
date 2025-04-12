(function () {
  const pause = document.getElementById("pause");
  const port = chrome.runtime.connect({ name: "popup" });
  let isEnabled = true;

  chrome.runtime.sendMessage({ action: "getActiveState" }, (response) => {
    isEnabled = response;
    pause.textContent = isEnabled ? "Disable cVim" : "Enable cVim";
    return true;
  });

  pause.addEventListener(
    "click",
    () => {
      isEnabled = !isEnabled;
      pause.textContent = isEnabled ? "Disable cVim" : "Enable cVim";
      port.postMessage({ action: "toggleEnabled", blacklisted: false });
    },
    false
  );

  const settings = document.getElementById("settings");
  settings.addEventListener(
    "click",
    () => {
      chrome.runtime.sendMessage({
        action: "openLinkTab",
        active: true,
        url: chrome.runtime.getURL("/pages/options.html"),
      });
    },
    false
  );
})();
