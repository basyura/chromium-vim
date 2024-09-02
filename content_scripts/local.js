/** local scripts  **/

/* sample
CommandExecuter.add("half", "half window", {
  match: function (value) {
    console.log("half!!!! match");
    return value == "half" || value == "ha" || value == "hal";
  },
  execute: function (value, repeats, tab) {
    console.log("half!!!! execute");
    const opt = {
      width: screen.availWidth / 2,
      height: screen.availHeight,
      top: screen.availTop,
      left: 0,
    };
    chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, opt);
  },
});
*/
