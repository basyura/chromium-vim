CommandExecuter = {
  commands: [],
  completers: {},
  add: function (label, description, cmd) {
    if (!Command.descriptions.some((v) => v[0] == label)) {
      Command.descriptions.push([label, description]);
    }
    this.commands.push(cmd);
    if (cmd.complete != null) {
      this.completers[label] = cmd.complete;
    }
  },
  execute: function (value, repeats, tab) {
    try {
      for (const [key, cmd] of Object.entries(this.commands)) {
        if (cmd.match(value)) {
          cmd.execute(value, repeats, tab);
        }
      }
    } catch (e) {
      alert(e.message);
    }
  },
};

CommandExecuter.add("help", "Shows the help page", {
  match: function (value) {
    return value == "help";
  },
  execute: function (value, repeats, tab) {
    tab.tabbed = true;
    RUNTIME("openLink", {
      tab: tab,
      url: chrome.extension.getURL("/pages/mappings.html"),
    });
  },
});

CommandExecuter.add("settings", "Open the options page for this extension", {
  match: function (value) {
    return value == "settings";
  },
  execute: function (value, repeats, tab) {
    tab.tabbed = true;
    RUNTIME("openLink", {
      tab: tab,
      url: chrome.extension.getURL("/pages/options.html"),
      repeats: repeats,
    });
  },
});

CommandExecuter.add("bookmarks", "Search through your bookmarks", {
  match: function (value) {
    return /^bookmarks +/.test(value) && !/^\S+\s*$/.test(value);
  },
  execute: function (value, repeats, tab) {
    if (/^\S+\s+\//.test(value)) {
      RUNTIME("openBookmarkFolder", {
        path: value.replace(/\S+\s+/, ""),
        noconvert: true,
      });
      return;
    }
    if (
      Command.completionResults.length &&
      !Command.completionResults.some(function (e) {
        return e[2] === value.replace(/^\S+\s*/, "");
      })
    ) {
      RUNTIME("openLink", {
        tab: tab,
        url: Command.completionResults[0][2],
        noconvert: true,
      });
      return;
    }
    RUNTIME("openLink", {
      tab: tab,
      url: value.replace(/^\S+\s+/, ""),
      noconvert: true,
    });
    return;
  },
  complete: function (value) {
    Command.completions = {};
    if (value[0] === "/") {
      return Marks.matchPath(value);
    }
    Marks.match(value, function (response) {
      Command.completions.bookmarks = response;
      Command.updateCompletions();
    });
    return true;
  },
});

CommandExecuter.add("buffer", "Select buffer from a list of current tabs", {
  match: function (value) {
    return /^buffer +/.test(value);
  },
  execute: function (value, repeats, tab) {
    let index = +value.replace(/^\S+\s+/, "") - 1;
    let selectedBuffer;
    if (Number.isNaN(index)) {
      selectedBuffer = Command.completionResults[0];
      if (selectedBuffer === void 0) {
        return;
      }
    } else {
      selectedBuffer = Command.completionResults.filter(function (e) {
        return e[1].indexOf((index + 1).toString()) === 0;
      })[0];
    }
    if (selectedBuffer !== void 0) {
      RUNTIME("goToTab", { id: selectedBuffer[3] });
    }
  },
});

CommandExecuter.add("tabnew", "Open a link in a new tab", {
  match: function (value) {
    return /^(tabnew|tabedit|tabe|to|tabopen|tabhistory)$/.test(
      value.replace(/ .*/, "")
    );
  },
  execute: function (value, repeats, tab) {
    tab.tabbed = true;
    RUNTIME("openLink", {
      tab: tab,
      url: Complete.convertToLink(value, tab.isURL, tab.isLink),
      repeats: repeats,
      noconvert: true,
    });
  },
});

CommandExecuter.add("history", "Search through your browser history", {
  match: function (value) {
    return /^history +/.test(value) && !/^\S+\s*$/.test(value);
  },
  execute: function (value, repeats, tab) {
    RUNTIME("openLink", {
      tab: tab,
      url: Complete.convertToLink(value),
      noconvert: true,
    });
    return;
  },
  complete: function (value) {
    if (value.trim() === "") {
      Command.hideData();
      return false;
    }
    Command.historyMode = true;
    PORT("searchHistory", { search: value, limit: settings.searchlimit });
    return true;
  },
});
/**
 *
 *
 */
Command.execute = function (value, repeats) {
  /*
  if (value.indexOf("@%") !== -1) {
    RUNTIME("getRootUrl", function (url) {
      Command.execute(value.split("@%").join(url), repeats);
    });
    return;
  }
  if (value.indexOf('@"') !== -1) {
    RUNTIME("getPaste", function (paste) {
      Command.execute(value.split('@"').join(paste), repeats);
    });
    return;
  }
  */

  commandMode = false;

  //var split = Utils.compressArray(value.split(/\s+/g));
  //if (this.customCommands.hasOwnProperty(split[0])) {
  //  this.execute(
  //    this.customCommands[split[0]] + " " + split.slice(1).join(" "),
  //    1
  //  );
  //  return;
  //}

  //value = this.expandCompletion(value);
  //value = value.replace(/@@[a-zA-Z_$][a-zA-Z0-9_$]*/g, function (e) {
  //  return settings.hasOwnProperty(e) ? settings[e] : e;
  //});

  // Match commands like ':tabnew*&! search' before
  // commands like ':tabnew search&*!'
  // e.g. :tabnew& google asdf* => opens a new pinned tab
  // ! == whether to open in a new tab or not
  // & == whether the tab will be active
  // * == whether the tab will be pinned
  // = == force cVim to treat text as a URL
  // ? == force cVim to tread text as a search
  // | == whether to open url in incognito mode (only works for new windows)
  var tab = {
    active: true,
    newWindow: false,
    isURL: false,
    isLink: false,
    pinned: false,
    tabbed: true,
    incognito: false,
  };

  /*
  (value.match(/^[^\s&$!*=?|]*([&$!*=?|]+)/) || [])
    .concat(value.match(/[&$!*=?|]*$/) || [])
    .join("")
    .split("")
    .forEach(function (e) {
      switch (e) {
        case "&":
          tab.active = false;
          break;
        case "$":
          tab.newWindow = true;
          break;
        case "!":
          tab.tabbed = true;
          break;
        case "*":
          tab.pinned = true;
          break;
        case "?":
          tab.isLink = true;
          tab.isURL = false;
          break;
        case "=":
          tab.isLink = false;
          tab.isURL = true;
          break;
        case "|":
          tab.incognito = true;
          tab.newWindow = true;
          break;
      }
    });
  */
  value = value.replace(/^([^\s&$*!=?|]*)[&$*!=?|]*\s/, "$1 ");
  value = value.replace(/[&$*!=?|]+$/, function (e) {
    return e.replace(/[^=?]/g, "");
  });

  if (Complete.engineEnabled(Utils.compressArray(value.split(/\s+/g))[1])) {
    value = value.replace(/[=?]+$/, "");
  }

  this.history.index = {};

  CommandExecuter.execute(value, repeats, tab);

  return;

  //for (const [key, cmd] of Object.entries(CommandExecuter)) {
  //  try {
  //    if (cmd.match(value)) {
  //      cmd.execute(value, repeats, tab);
  //    }
  //  } catch (e) {
  //    alert(e.message);
  //  }
  //}

  /*
  switch (value) {
    case "nohlsearch":
      Find.clear();
      HUD.hide();
      return;
    case "duplicate":
      RUNTIME("duplicateTab", { repeats: repeats });
      return;
    case "settings":
      tab.tabbed = true;
      RUNTIME("openLink", {
        tab: tab,
        url: chrome.extension.getURL("/pages/options.html"),
        repeats: repeats,
      });
      return;
    case "changelog":
      tab.tabbed = true;
      RUNTIME("openLink", {
        tab: tab,
        url: chrome.extension.getURL("/pages/changelog.html"),
        repeats: repeats,
      });
      return;
    case "help":
      tab.tabbed = true;
      RUNTIME("openLink", {
        tab: tab,
        url: chrome.extension.getURL("/pages/mappings.html"),
      });
      return;
    case "stop":
      window.stop();
      return;
    case "stopall":
      RUNTIME("cancelAllWebRequests");
      return;
    case "viewsource":
      PORT("viewSource", { tab: tab });
      return;
    case "pintab":
      RUNTIME("pinTab", { pinned: true });
      break;
    case "unpintab":
      RUNTIME("pinTab", { pinned: false });
      break;
    case "togglepin":
      RUNTIME("pinTab");
      return;
    case "undo":
      RUNTIME("openLast");
      return;
    case "tabnext":
    case "tabn":
      RUNTIME("nextTab");
      return;
    case "tabprevious":
    case "tabp":
    case "tabN":
      RUNTIME("previousTab");
      return;
    case "tabprevious":
      return;
    case "q":
    case "quit":
    case "exit":
      RUNTIME("closeTab", { repeats: repeats });
      return;
    case "qa":
    case "qall":
      RUNTIME("closeWindow");
      return;
  }
  */

  //if (/^chrome +/.test(value)) {
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url: value.replace(" ", "://"),
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^bookmarks +/.test(value) && !/^\S+\s*$/.test(value)) {
  //  if (/^\S+\s+\//.test(value)) {
  //    RUNTIME("openBookmarkFolder", {
  //      path: value.replace(/\S+\s+/, ""),
  //      noconvert: true,
  //    });
  //    return;
  //  }
  //  if (
  //    this.completionResults.length &&
  //    !this.completionResults.some(function (e) {
  //      return e[2] === value.replace(/^\S+\s*/, "");
  //    })
  //  ) {
  //    RUNTIME("openLink", {
  //      tab: tab,
  //      url: this.completionResults[0][2],
  //      noconvert: true,
  //    });
  //    return;
  //  }
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url: value.replace(/^\S+\s+/, ""),
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^history +/.test(value) && !/^\S+\s*$/.test(value)) {
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url: Complete.convertToLink(value),
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^taba(ttach)? +/.test(value) && !/^\S+\s*$/.test(value)) {
  //  var windowId;
  //  if (
  //    (windowId = this.completionResults[
  //      parseInt(value.replace(/^\S+ */, ""), 10)
  //    ])
  //  ) {
  //    RUNTIME("moveTab", {
  //      windowId: windowId[3],
  //    });
  //    return;
  //  }
  //}

  //if (/^tabd(etach)?/.test(value)) {
  //  RUNTIME("moveTab");
  //  return;
  //}

  //if (/^file +/.test(value)) {
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url:
  //      "file://" +
  //      value.replace(/\S+ +/, "").replace(/^~/, settings.homedirectory),
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^source/.test(value)) {
  //  var path = value.replace(/\S+ */, "");
  //  if (!path.length) {
  //    path = null;
  //  } else {
  //    path = "file://" + path;
  //    path = path.split("~").join(settings.homedirectory || "~");
  //  }
  //  RUNTIME("loadLocalConfig", { path: path }, function (res) {
  //    if (res.code === -1) {
  //      // TODO: Fix Status (status bar cannot be displayed after the command
  //      //       bar iframe exits
  //      Status.setMessage("config file could not be opened", 1, "error");
  //      console.error('cvim error: "%s" could not be opened for parsing', path);
  //    }
  //  });
  //  return;
  //}

  //if (/^(new|winopen|wo)$/.test(value.replace(/ .*/, ""))) {
  //  RUNTIME("openLinkWindow", {
  //    tab: tab,
  //    url: Complete.convertToLink(value, tab.isURL, tab.isLink),
  //    repeats: repeats,
  //    noconvert: true,
  //    incognito: tab.incognito,
  //  });
  //  return;
  //}

  //if (/^restore\s+/.test(value)) {
  //  var sessionId = value.replace(/^\S+\s+/, "");
  //  if (Number.isNaN(+sessionId) && this.completionResults.length)
  //    sessionId = this.completionResults[0][3];
  //  RUNTIME("restoreChromeSession", {
  //    sessionId: Utils.trim(sessionId),
  //  });
  //}

  //if (
  //  /^(tabnew|tabedit|tabe|to|tabopen|tabhistory)$/.test(
  //    value.replace(/ .*/, "")
  //  )
  //) {
  //  tab.tabbed = true;
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url: Complete.convertToLink(value, tab.isURL, tab.isLink),
  //    repeats: repeats,
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^(o|open)$/.test(value.replace(/ .*/, "")) && !/^\S+\s*$/.test(value)) {
  //  RUNTIME("openLink", {
  //    tab: tab,
  //    url: Complete.convertToLink(value, tab.isURL, tab.isLink),
  //    noconvert: true,
  //  });
  //  return;
  //}

  //if (/^buffer +/.test(value)) {
  //  var index = +value.replace(/^\S+\s+/, "") - 1,
  //    selectedBuffer;
  //  if (Number.isNaN(index)) {
  //    selectedBuffer = Command.completionResults[0];
  //    if (selectedBuffer === void 0) return;
  //  } else {
  //    selectedBuffer = Command.completionResults.filter(function (e) {
  //      return e[1].indexOf((index + 1).toString()) === 0;
  //    })[0];
  //  }
  //  if (selectedBuffer !== void 0)
  //    RUNTIME("goToTab", { id: selectedBuffer[3] });
  //  return;
  //}

  //if (/^execute +/.test(value)) {
  //  var command = value.replace(/^\S+/, "").trim();
  //  realKeys = "";
  //  repeats = "";
  //  Command.hide();
  //  Mappings.executeSequence(command);
  //  return;
  //}

  //if (/^delsession/.test(value)) {
  //  value = Utils.trim(value.replace(/^\S+(\s+)?/, ""));
  //  if (value === "") {
  //    Status.setMessage("argument required", 1, "error");
  //    return;
  //  }
  //  if (~sessions.indexOf(value)) {
  //    sessions.splice(sessions.indexOf(value), 1);
  //  }
  //  value.split(" ").forEach(function (v) {
  //    RUNTIME("deleteSession", { name: v });
  //  });
  //  PORT("getSessionNames");
  //  return;
  //}

  //if (/^mksession/.test(value)) {
  //  value = Utils.trim(value.replace(/^\S+(\s+)?/, ""));
  //  if (value === "") {
  //    Status.setMessage("session name required", 1, "error");
  //    return;
  //  }
  //  if (/[^a-zA-Z0-9_-]/.test(value)) {
  //    Status.setMessage(
  //      "only alphanumeric characters, dashes, " +
  //        "and underscores are allowed",
  //      1,
  //      "error"
  //    );
  //    return;
  //  }
  //  if (!~sessions.indexOf(value)) {
  //    sessions.push(value);
  //  }
  //  RUNTIME("createSession", { name: value }, function (response) {
  //    sessions = response;
  //  });
  //  return;
  //}

  //if (/^session/.test(value)) {
  //  value = Utils.trim(value.replace(/^\S+(\s+)?/, ""));
  //  if (value === "") {
  //    Status.setMessage("session name required", 1, "error");
  //    return;
  //  }
  //  RUNTIME(
  //    "openSession",
  //    { name: value, sameWindow: !tab.active },
  //    function () {
  //      Status.setMessage("session does not exist", 1, "error");
  //    }
  //  );
  //  return;
  //}

  //if (/^((i?(re)?map)|i?unmap(All)?)+/.test(value)) {
  //  settings.MAPPINGS += "\n" + value;
  //  Mappings.parseLine(value);
  //  PORT("syncSettings", { settings: settings });
  //  return;
  //}

  //if (/^set +/.test(value) && value !== "set") {
  //  value = value.replace(/^set +/, "").split(/[ =]+/);
  //  var isSet,
  //    swapVal,
  //    isQuery = /\?$/.test(value[0]);
  //  value[0] = value[0].replace(/\?$/, "");
  //  if (!settings.hasOwnProperty(value[0].replace(/^no|!$/g, ""))) {
  //    Status.setMessage("unknown option: " + value[0], 1, "error");
  //    return;
  //  }

  //  if (isQuery) {
  //    Status.setMessage(value + ": " + settings[value[0]], 1);
  //    return;
  //  }

  //  isSet = !/^no/.test(value[0]);
  //  swapVal = tab.tabbed;
  //  value[0] = value[0].replace(/^no|\?$/g, "");

  //  if (value.length === 1 && Boolean(settings[value]) === settings[value]) {
  //    if (value[0] === "hud" && !isSet) {
  //      HUD.hide(true);
  //    }
  //    if (swapVal) {
  //      settings[value[0]] = !settings[value[0]];
  //    } else {
  //      settings[value[0]] = isSet;
  //    }
  //    RUNTIME("syncSettings", { settings: settings });
  //  }
  //  return;
  //}

  //if (/^let +/.test(value) && value !== "let") {
  //  try {
  //    var added = RCParser.parse(value);
  //    delete added.MAPPINGS;
  //    Object.merge(settings, added);
  //    PORT("syncSettings", { settings: settings });
  //  } catch (e) {
  //    Command.hide();
  //  }
  //  return;
  //}

  //if (/^call +/.test(value)) {
  //  Mappings.parseLine(value);
  //  return;
  //}

  //if (/^script +/.test(value)) {
  //  RUNTIME("runScript", { code: value.slice(7) });
  //}
};

Command.getCompleter = function (command) {
  return CommandExecuter.completers[command];
};
